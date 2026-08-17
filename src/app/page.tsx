import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignIn } from "@/components/auth-components"
import { Heart } from "lucide-react"

export default async function LandingPage() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center min-h-screen bg-ink relative">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-950 font-serif leading-tight">
          The scan that catches what <span className="text-white italic underline decoration-zinc-950 decoration-2 inline-block">vibe coding</span> leaves behind.
        </h1>
        
        <p className="text-xl text-zinc-950/85 max-w-2xl mx-auto leading-relaxed font-serif">
          Scanline continuously checks apps built with AI coding tools for the specific mistakes those tools tend to make, and explains every risk in plain English with a fix you can paste straight back into your coding agent.
        </p>

        <div className="pt-6 flex flex-col items-center space-y-6 relative z-10">
          <div className="flex flex-col items-center space-y-4">
            <SignIn className="h-14 px-8 text-lg font-bold bg-black text-white hover:bg-zinc-900 border-2 border-black shadow-comic-white hover:shadow-comic-white-hover transition-all duration-200 cursor-pointer font-serif" />
            <p className="text-sm text-zinc-950/70 font-serif">
              Scanline can only read your code. It can never write to your repo.
            </p>
          </div>
          
          <a 
            href="https://sanitanoli.gumroad.com/l/qioky" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center space-x-2 text-sm font-bold text-white transition-all bg-black hover:bg-zinc-900 px-5 py-2.5 rounded border-2 border-black shadow-comic-white hover:shadow-comic-white-hover font-serif"
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Support this project</span>
          </a>
        </div>
      </div>
      
      {/* Clean Minimal Preview Box */}
      <div className="w-full max-w-2xl mt-16 border-2 border-black rounded-lg bg-panel p-6 shadow-comic text-left z-10 font-mono text-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-fog">src/app/api/auth/route.ts</span>
          <span className="text-[#FBBF24] font-medium">Missing rate limit</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-fog">src/lib/db.ts</span>
          <span className="text-[#F87171] font-medium">Exposed database key</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-fog">package.json</span>
          <span className="text-[#34D399] font-medium">Dependencies clean</span>
        </div>
      </div>
    </main>
  )
}
