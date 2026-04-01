import { cn } from '@/lib/utils'

export default function ResponsiveTable({ children, className, ...rest }) {
  return (
    <div
      className={cn(
        'w-full min-w-0 overflow-x-auto rounded-lg border border-border/50 [-webkit-overflow-scrolling:touch]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
