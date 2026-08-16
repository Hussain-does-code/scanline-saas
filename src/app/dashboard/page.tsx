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

  // Query real database for user's findings
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      repos: {
        include: {
          scans: {
            include: { findings: true }
          }
        }
      }
    }
  });

  const dbFindings: Finding[] = [];
  user?.repos.forEach(repo => {
    repo.scans.forEach(scan => {
      scan.findings.forEach(f => {
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
    });
  });

  // Removed mock data fallback; we now show Zero State in DashboardClient if dbFindings is empty
  const displayFindings = dbFindings;

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="border-b border-mist/10 bg-panel px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="font-sans font-bold text-lg text-scanline tracking-tight">Scanline</div>
          <div className="h-4 w-px bg-mist/20" />
          {session.user?.image && (
            <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full border border-mist/20" />
          )}
          <div className="text-sm font-medium text-fog">
            {session.user?.name || session.user?.email || 'Hacker'} / workspace
          </div>
        </div>
        <div className="flex items-center space-x-4 pr-24">
          <a 
            href="https://sanitanoli.gumroad.com/l/qioky" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center space-x-2 text-sm font-medium text-scanline hover:text-white transition-colors bg-scanline/10 hover:bg-scanline/20 px-3 py-1.5 rounded-md border border-scanline/20"
          >
            <Heart className="w-4 h-4" />
            <span>Support this project</span>
          </a>
          {/* Rescan button is in client component */}
          <SignOut />
        </div>
      </header>

      <DashboardClient initialFindings={displayFindings} />
    </div>
  )
}
