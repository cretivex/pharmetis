import { cn } from '@/lib/utils'

export function Panel({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelHeader({ children, className, ...props }) {
  return (
    <div className={cn('border-b border-border/50 px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function PanelContent({ children, className, ...props }) {
  return (
    <div className={cn('px-5 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export function PanelTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('text-sm font-semibold tracking-tight text-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function Section({ children, className, ...props }) {
  return (
    <div className={cn('mb-8', className)} {...props}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, className, ...props }) {
  return (
    <h2 className={cn('text-2xl font-semibold tracking-tight text-foreground', className)} {...props}>
      {children}
    </h2>
  )
}

export function SectionSubtitle({ children, className, ...props }) {
  return (
    <p className={cn('mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground', className)} {...props}>
      {children}
    </p>
  )
}
