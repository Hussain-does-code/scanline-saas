import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignOut } from "@/components/auth-components"
import { Finding } from "@/components/ui/finding-row"
import { DashboardClient } from "./client"
import { Heart } from "lucide-react"
import { prisma } from "@/lib/db"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/")
  }

  // Query real database for user's latest repo scan findings
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      repos: {
        include: {
          scans: {
            orderBy: { startedAt: "desc" },
            take: 1,
            include: { findings: true }
          }
        }
      }
    }
  });

  const dbFindings: Finding[] = [];
  let latestScore = 100;

  user?.repos.forEach(repo => {
    const latestScan = repo.scans[0];
    if (latestScan) {
      latestScore = latestScan.score;
      latestScan.findings.forEach(f => {
        dbFindings.push({
          id: f.id,
          category: f.category,
          severity: f.severity as Finding["severity"],
          file: f.file,
          line: f.line,
          plain_explanation: f.plainExplanation || "",
          risk_scenario: f.riskScenario || "",
          fix_prompt: f.fixPrompt || "",
          raw_output: f.rawOutput || "",
          repoName: repo.name,
          status: f.status as Finding["status"]
        });
      });
    }
  });

  return (
    <div className="min-h-screen flex flex-col relative bg-ink">
      <header className="border-b-2 border-black bg-panel px-6 py-4 flex items-center justify-between relative z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="font-serif font-bold text-xl text-white tracking-tight">Scanline</div>
          <div className="h-4 w-px bg-mist/20" />
          {session.user?.image && (
            <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-mist/30" />
          )}
          <div className="text-sm font-medium text-fog font-serif">
            {session.user?.name || session.user?.email || 'Hacker'} / workspace
          </div>
        </div>
        <div className="flex items-center space-x-4 pr-24">
          <a 
            href="https://sanitanoli.gumroad.com/l/qioky" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-2 text-sm font-medium text-white transition-colors bg-black hover:bg-zinc-900 px-3 py-1.5 rounded border-2 border-black shadow-comic hover:shadow-comic-hover font-serif"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Support this project</span>
          </a>
          <SignOut />
        </div>
      </header>

      <DashboardClient initialFindings={dbFindings} initialScore={latestScore} />
    </div>
  )
}
