import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default:
      "bg-primary text-primary-foreground shadow-sm hover:bg-primary/92 hover:shadow-md active:scale-[0.98] dark:shadow-none",
    destructive:
      "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
    outline:
      "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-sm active:scale-[0.98]",
    secondary:
      "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]",
    ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
    link: "text-primary underline-offset-4 hover:underline",
  }

  const sizes = {
    default: "h-10 px-4 py-2 rounded-xl",
    sm: "h-9 rounded-lg px-3 text-xs",
    lg: "h-11 rounded-xl px-8 text-base",
    icon: "h-10 w-10 rounded-xl",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center text-sm font-medium ring-offset-background transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button }
