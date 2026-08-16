import { signIn, signOut } from "@/auth"
import { Button } from "./ui/button"

export function SignIn({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("github", { redirectTo: "/dashboard" })
      }}
    >
      <Button type="submit" className={className}>
        Connect GitHub
      </Button>
    </form>
  )
}

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut({ redirectTo: "/" })
      }}
    >
      <Button variant="ghost" size="sm" type="submit">
        Sign Out
      </Button>
    </form>
  )
}
