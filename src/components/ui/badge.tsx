import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded px-2.5 py-0.5 text-xs font-mono font-medium transition-colors",
        {
          "bg-zinc-800/80 border border-zinc-700/60 text-zinc-300": variant === "default",
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25": variant === "success",
          "bg-amber-500/10 text-amber-400 border border-amber-500/25": variant === "warning",
          "bg-rose-500/10 text-rose-400 border border-rose-500/25": variant === "danger",
          "bg-zinc-900/60 text-zinc-400 border border-zinc-700/40": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
