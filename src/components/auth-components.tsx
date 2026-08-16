"use client"
import { signIn, signOut } from "next-auth/react"
import { Button } from "./ui/button"

export function SignIn({ className }: { className?: string }) {
  return (
    <Button 
      className={className} 
      onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
    >
      Connect GitHub
    </Button>
  )
}

export function SignOut() {
  return (
    <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign Out
    </Button>
  )
}
