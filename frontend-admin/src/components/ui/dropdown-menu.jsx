import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children, ...props }) => {
  return <div className="relative" {...props}>{children}</div>
}

const DropdownMenuTrigger = React.forwardRef(({ className, asChild, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "glass-card z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
