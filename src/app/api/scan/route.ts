import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as tar from "tar";
import { tmpdir } from "os";
import path from "path";
import fs from "fs/promises";
import { runScan } from "@/lib/scanner";
import { translateFinding } from "@/lib/translator";

export async function POST(_req: Request) {
  let tmpDir: string | null = null;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" }
    });
    
    if (!account?.access_token) {
      return new NextResponse(JSON.stringify({ error: "No GitHub token found. Please reconnect GitHub." }), { 
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Fetch latest repo from GitHub
    const reposRes = await fetch("https://api.github.com/user/repos?sort=updated&per_page=1&type=all", {
      headers: { 
        Authorization: `Bearer ${account.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Scanline-App"
      }
    });
    
    if (!reposRes.ok) {
      const errText = await reposRes.text();
      console.error("GitHub repos fetch error:", reposRes.status, errText);
      return new NextResponse(JSON.stringify({ error: `GitHub API error: ${reposRes.statusText}` }), { 
        status: reposRes.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const repos = await reposRes.json();
    if (!repos || repos.length === 0) {
      return new NextResponse(JSON.stringify({ error: "No repositories found for this account." }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const targetRepo = repos[0];
    const defaultBranch = targetRepo.default_branch || "main";

    // 2. Download tarball
    const tarballUrl = `https://api.github.com/repos/${targetRepo.full_name}/tarball/${defaultBranch}`;
    const tarRes = await fetch(tarballUrl, {
      headers: { 
        Authorization: `Bearer ${account.access_token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Scanline-App"
      }
    });
    
    if (!tarRes.ok) {
      const errText = await tarRes.text();
      console.error("GitHub tarball download error:", tarRes.status, errText);
      return new NextResponse(JSON.stringify({ error: `Failed to download repo: ${tarRes.statusText}` }), { 
        status: tarRes.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    tmpDir = await fs.mkdtemp(path.join(tmpdir(), "scanline-"));
    const tarPath = path.join(tmpDir, "repo.tar.gz");
    
    const arrayBuffer = await tarRes.arrayBuffer();
    await fs.writeFile(tarPath, Buffer.from(arrayBuffer));
    
    // 3. Extract tarball
    await tar.x({
      file: tarPath,
      cwd: tmpDir,
    });

    const extractedDirs = await fs.readdir(/*turbopackIgnore: true*/ tmpDir);
    const repoDirName = extractedDirs.find(d => d !== "repo.tar.gz");
    const scanTargetDir = path.join(/*turbopackIgnore: true*/ tmpDir, repoDirName || "");

    // 4. Run Security Scan
    const rawFindings = await runScan(scanTargetDir);
    
    // 5. Translate Findings via Gemini in Parallel
    const translationPromises = rawFindings.map(f => translateFinding(f));
    const settled = await Promise.allSettled(translationPromises);
    const translatedFindings = settled.map((res, index) => {
      if (res.status === "fulfilled") {
        return res.value;
      } else {
        const f = rawFindings[index];
        return {
          ...f,
          plain_explanation: `Detected ${f.category} in ${f.file}:${f.line}.`,
          risk_scenario: `Potential security exposure in ${f.file}.`,
          urgency: "fix this week" as const,
          fix_prompt: `Review and resolve the ${f.category} in ${f.file} at line ${f.line}.`,
          status: "new" as const
        };
      }
    });

    // 6. Save to DB
    let dbRepo = await prisma.repo.findFirst({ where: { githubRepoId: String(targetRepo.id) }});
    if (!dbRepo) {
      dbRepo = await prisma.repo.create({
        data: {
          userId: session.user.id,
          githubRepoId: String(targetRepo.id),
          name: targetRepo.full_name
        }
      });
    }
    
    const computedScore = Math.max(0, 100 - (translatedFindings.length * 5));

    const scan = await prisma.scan.create({
      data: {
        repoId: dbRepo.id,
        status: "completed",
        score: computedScore,
      }
    });
    
    if (translatedFindings.length > 0) {
      await prisma.finding.createMany({
        data: translatedFindings.map(t => ({
          scanId: scan.id,
          category: t.category,
          severity: t.severity,
          file: t.file,
          line: t.line,
          rawOutput: t.raw_output || "",
          plainExplanation: t.plain_explanation,
          riskScenario: t.risk_scenario,
          fixPrompt: t.fix_prompt,
          status: "new",
        }))
      });
    }

    const finalFindings = await prisma.finding.findMany({
      where: { scanId: scan.id },
      include: { scan: { include: { repo: true } } }
    });
    
    const mapped = finalFindings.map(f => ({
      id: f.id,
      category: f.category,
      severity: f.severity as "critical" | "high" | "medium" | "low",
      file: f.file,
      line: f.line,
      plain_explanation: f.plainExplanation || "",
      risk_scenario: f.riskScenario || "",
      fix_prompt: f.fixPrompt || "",
      raw_output: f.rawOutput || "",
      repoName: f.scan.repo.name,
      status: f.status as "new" | "persisting" | "fixed" | "accepted"
    }));

    return NextResponse.json({ 
      findings: mapped,
      score: computedScore,
      repoName: targetRepo.full_name
    });

  } catch (error: any) {
    console.error("Scan API Error:", error);
    return new NextResponse(JSON.stringify({ error: error?.message || "Internal Server Error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } finally {
    if (tmpDir) {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(console.error);
    }
  }
}
