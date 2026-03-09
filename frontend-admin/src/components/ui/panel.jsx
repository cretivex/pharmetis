import { cn } from '@/lib/utils'

export function Panel({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'bg-slate-900/50 border border-slate-800 rounded-lg',
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
    <div
      className={cn('px-4 py-3 border-b border-slate-800', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelContent({ children, className, ...props }) {
  return (
    <div
      className={cn('px-4 py-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function PanelTitle({ children, className, ...props }) {
  return (
    <h3
      className={cn('text-sm font-semibold uppercase tracking-wider text-muted-foreground', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function Section({ children, className, ...props }) {
  return (
    <div
      className={cn('mb-6', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children, className, ...props }) {
  return (
    <h2
      className={cn('text-2xl font-bold mb-1', className)}
      {...props}
    >
      {children}
    </h2>
  )
}

export function SectionSubtitle({ children, className, ...props }) {
  return (
    <p
      className={cn('text-sm text-muted-foreground mb-4', className)}
      {...props}
    >
      {children}
    </p>
  )
}
