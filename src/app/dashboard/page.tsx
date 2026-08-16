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

  const dbFindings = user?.repos.flatMap(r => r.scans.flatMap(s => s.findings)) || [];

  const displayFindings = dbFindings.length > 0 ? dbFindings : [
    {
      id: "f-1",
      category: "Exposed API Key",
      severity: "critical",
      file: "src/lib/db.ts",
      line: 12,
      plain_explanation: "Found a live API key in your code.",
      risk_scenario: "Anyone with your repo URL could use it right now to access your database.",
      fix_prompt: "Move the hardcoded database URL to an environment variable.",
      status: "new"
    } as any,
    {
      id: "f-2",
      category: "Missing Rate Limit",
      severity: "medium",
      file: "src/app/api/login/route.ts",
      line: 8,
      plain_explanation: "This login route allows unlimited requests.",
      risk_scenario: "A stranger could write a script to guess passwords endlessly until they get in.",
      fix_prompt: "Add a rate limit middleware to restrict requests to 5 per minute per IP.",
      status: "persisting"
    } as any
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="border-b border-mist/10 bg-panel px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="font-sans font-bold text-lg text-scanline tracking-tight">Scanline</div>
          <div className="h-4 w-px bg-mist/20" />
          <div className="text-sm font-medium text-fog">indie-builder / saas-mvp</div>
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
