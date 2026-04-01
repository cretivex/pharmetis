import { cn } from '@/lib/utils'

/** Operational status for platform / API rows */
export function StatusDot({ ok, label, detail, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs',
        className
      )}
    >
      <span
        className={cn(
          'h-2 w-2 shrink-0 rounded-full',
          ok === true && 'bg-emerald-500 shadow-[0_0_8px_hsl(152_60%_42%_/_0.6)]',
          ok === false && 'bg-destructive',
          ok === null && 'bg-muted-foreground/50'
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <span className="font-medium text-foreground">{label}</span>
        {detail ? <span className="ml-1.5 text-muted-foreground">{detail}</span> : null}
      </div>
    </div>
  )
}
