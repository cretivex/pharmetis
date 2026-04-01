import * as React from "react"
import { cn } from "@/lib/utils"

// Create context for tabs
const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {}
})

const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const currentValue = value !== undefined ? value : internalValue
  
  const handleChange = React.useCallback((newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(newValue)
    }
  }, [value, onValueChange])

  const contextValue = React.useMemo(() => ({
    value: currentValue,
    onValueChange: handleChange
  }), [currentValue, handleChange])

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { value: currentValue, onValueChange } = React.useContext(TabsContext)
  const isActive = currentValue === value
  
  const handleClick = React.useCallback(() => {
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(value)
    }
  }, [onValueChange, value])

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive ? "bg-background text-foreground shadow-sm" : "",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const { value: currentValue } = React.useContext(TabsContext)
  
  // Only render content if this tab is active
  if (currentValue !== value) {
    return null
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
