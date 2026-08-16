import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-scanline focus:ring-offset-2",
        {
          "bg-panel border-mist/20 text-fog": variant === "default",
          "bg-clear/10 text-clear border border-clear/20": variant === "success",
          "bg-caution/10 text-caution border border-caution/20": variant === "warning",
          "bg-alert/10 text-alert border border-alert/20": variant === "danger",
          "text-fog border border-mist/30": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
