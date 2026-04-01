import { cn } from '@/lib/utils'

/** Horizontal scroll wrapper for raw <table> or table UI primitives. */
export default function ResponsiveTable({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-x-auto rounded-md border border-border/40 bg-card/30 [-webkit-overflow-scrolling:touch]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
