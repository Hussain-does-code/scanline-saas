import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-black text-white hover:bg-zinc-900 border-2 border-black shadow-comic-white hover:shadow-comic-white-hover font-semibold": variant === "default",
            "border-2 border-black bg-panel text-fog hover:bg-black hover:text-white shadow-comic-white hover:shadow-comic-white-hover": variant === "outline",
            "hover:bg-black/10 text-fog": variant === "ghost",
            "bg-rose-600 text-white hover:bg-rose-700 border-2 border-black shadow-comic-white hover:shadow-comic-white-hover": variant === "danger",
            "h-9 px-4 py-2 text-sm": size === "default",
            "h-8 rounded px-3 text-xs": size === "sm",
            "h-11 rounded px-8 text-base": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
