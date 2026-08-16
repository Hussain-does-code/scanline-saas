import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import * as tar from "tar";
import { tmpdir } from "os";
import path from "path";
import fs from "fs/promises";
import { runScan } from "@/lib/scanner";
import { translateFinding } from "@/lib/translator";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" }
    });
    
    if (!account?.access_token) return new NextResponse("No GitHub token found", { status: 403 });

    // 1. Fetch latest repo
    const reposRes = await fetch("https://api.github.com/user/repos?sort=updated&per_page=1", {
      headers: { 
        Authorization: `Bearer ${account.access_token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });
    
    if (!reposRes.ok) throw new Error("Failed to fetch repos from GitHub");
    
    const repos = await reposRes.json();
    if (!repos || repos.length === 0) return new NextResponse("No repos found", { status: 404 });
    const targetRepo = repos[0];

    // 2. Download tarball
    const tarballUrl = targetRepo.url + "/tarball/" + targetRepo.default_branch;
    const tarRes = await fetch(tarballUrl, {
      headers: { Authorization: `Bearer ${account.access_token}` }
    });
    
    if (!tarRes.ok) throw new Error("Failed to download repository");

    const tmpDir = await fs.mkdtemp(path.join(tmpdir(), "scanline-"));
    const tarPath = path.join(tmpDir, "repo.tar.gz");
    
    const arrayBuffer = await tarRes.arrayBuffer();
    await fs.writeFile(tarPath, Buffer.from(arrayBuffer));
    
    // 3. Extract tarball
    await tar.x({
      file: tarPath,
      cwd: tmpDir,
    });

    const extractedDirs = await fs.readdir(tmpDir);
    const repoDirName = extractedDirs.find(d => d !== "repo.tar.gz");
    const scanTargetDir = path.join(tmpDir, repoDirName || "");

    // 4. Run Scan
    const rawFindings = await runScan(scanTargetDir);
    
    // 5. Translate Findings via Gemini
    const translatedFindings = [];
    for (const f of rawFindings) {
      try {
        const translation = await translateFinding(f);
        translatedFindings.push(translation);
      } catch (e) {
        console.error("Failed to translate finding", f, e);
      }
    }

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
    
    const scan = await prisma.scan.create({
      data: {
        repoId: dbRepo.id,
        status: "completed",
        score: Math.max(0, 100 - (translatedFindings.length * 5)),
      }
    });
    
    for (const t of translatedFindings) {
      await prisma.finding.create({
        data: {
          scanId: scan.id,
          category: t.category,
          severity: t.severity,
          file: t.file,
          line: t.line,
          rawOutput: t.raw_output || "",
          plainExplanation: t.plain_explanation,
          riskScenario: t.risk_scenario,
          fixPrompt: t.fix_prompt,
        }
      });
    }

    const finalFindings = await prisma.finding.findMany({
      where: { scanId: scan.id },
      include: { scan: { include: { repo: true } } }
    });
    
    const mapped = finalFindings.map(f => ({
      id: f.id,
      category: f.category,
      severity: f.severity,
      file: f.file,
      line: f.line,
      plain_explanation: f.plainExplanation || "",
      risk_scenario: f.riskScenario || "",
      fix_prompt: f.fixPrompt || "",
      raw_output: f.rawOutput || "",
      repoName: f.scan.repo.name,
      status: f.status
    }));

    // Clean up
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(console.error);

    return NextResponse.json({ findings: mapped });

  } catch (error) {
    console.error("Scan API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
