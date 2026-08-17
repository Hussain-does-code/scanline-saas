import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignIn } from "@/components/auth-components"
import { Heart, ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react"

export default async function LandingPage() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center min-h-screen bg-halftone relative">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-fog font-sans leading-tight">
          The scan that catches what <span className="text-scanline inline-block">vibe coding</span> leaves behind.
        </h1>
        
        <p className="text-xl text-mist max-w-2xl mx-auto leading-relaxed">
          Scanline continuously checks apps built with AI coding tools for the specific mistakes those tools tend to make, and explains every risk in plain English with a fix you can paste straight back into your coding agent.
        </p>

        <div className="pt-6 flex flex-col items-center space-y-6 relative z-10">
          <div className="flex flex-col items-center space-y-4">
            <SignIn className="h-14 px-8 text-lg font-bold bg-scanline text-ink hover:bg-scanline/90 shadow-comic hover:shadow-comic-hover transition-all duration-200 cursor-pointer" />
            <p className="text-sm text-mist/60">
              Scanline can only read your code. It can never write to your repo.
            </p>
          </div>
          
          <a 
            href="https://sanitanoli.gumroad.com/l/qioky" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center space-x-2 text-sm font-bold text-scanline hover:text-ink transition-all bg-panel hover:bg-scanline px-5 py-2.5 rounded shadow-comic hover:shadow-comic-hover border border-scanline"
          >
            <Heart className="w-4 h-4" />
            <span>Support this project</span>
          </a>
        </div>
      </div>
      
      {/* Sleek, Professional Code Scan Preview */}
      <div className="w-full max-w-2xl mt-16 border-2 border-mist/20 rounded-lg bg-panel shadow-comic overflow-hidden text-left z-10">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-ink/70 border-b border-mist/10">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="text-xs font-mono text-mist/70 pl-2">scanline audit --latest</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-mono text-mist/60">
            <ShieldCheck className="w-3.5 h-3.5 text-scanline" />
            <span>Automated Analysis</span>
          </div>
        </div>

        {/* Scan Rows with Solid Professional Color Badges */}
        <div className="p-4 divide-y divide-mist/10 font-mono text-sm">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3 text-fog">
              <span className="text-mist/50 text-xs">01</span>
              <span>src/app/api/auth/route.ts</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Missing Rate Limit</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3 text-fog">
              <span className="text-mist/50 text-xs">02</span>
              <span>src/lib/db.ts</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Exposed Database Key</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 text-mist/70">
            <div className="flex items-center space-x-3">
              <span className="text-mist/40 text-xs">03</span>
              <span>package.json</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Dependencies Clean</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
