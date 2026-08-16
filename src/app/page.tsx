import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignIn } from "@/components/auth-components"

export default async function LandingPage() {
  const session = await auth()
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-screen">
      <div className="max-w-3xl space-y-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-fog font-sans leading-tight">
          The scan that catches what <span className="text-scanline inline-block">vibe coding</span> leaves behind.
        </h1>
        
        <p className="text-xl text-mist max-w-2xl mx-auto leading-relaxed">
          Scanline continuously checks apps built with AI coding tools for the specific mistakes those tools tend to make, and explains every risk in plain English with a fix you can paste straight back into your coding agent.
        </p>

        <div className="pt-8">
          <SignIn className="h-14 px-8 text-lg bg-fog text-ink hover:bg-fog/90 shadow-lg transition-transform hover:scale-105" />
          <p className="mt-4 text-sm text-mist/60">
            Scanline can only read your code. It can never write to your repo.
          </p>
        </div>
      </div>
      
      {/* Mock scan sweep animation for hero */}
      <div className="w-full max-w-2xl mt-24 border border-mist/20 rounded-lg bg-panel p-6 shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-scanline shadow-[0_0_15px_3px_#5EEAD4] opacity-50 translate-y-12" />
        <div className="font-mono text-sm text-mist space-y-4">
          <div className="flex justify-between"><span className="text-fog">src/app/api/auth/route.ts</span><span className="text-caution">Missing rate limit</span></div>
          <div className="flex justify-between"><span className="text-fog">src/lib/db.ts</span><span className="text-alert">Exposed database key</span></div>
          <div className="flex justify-between opacity-50"><span className="text-fog">package.json</span><span className="text-clear">Dependencies clean</span></div>
        </div>
      </div>
    </main>
  )
}
