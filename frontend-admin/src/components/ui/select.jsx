import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ className, children, value, onChange, ...props }, ref) => {
  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = "Select"

export { Select }
