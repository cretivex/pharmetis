import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Super Admin — primary KPI tile. Token-driven; works on 2–6 column grids.
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  index = 0,
  accent = 'primary',
  className,
}) {
  const accents = {
    primary: 'bg-primary/12 text-primary ring-1 ring-primary/20',
    emerald: 'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-500/20',
    amber: 'bg-amber-500/12 text-amber-400 ring-1 ring-amber-500/20',
    rose: 'bg-rose-500/12 text-rose-400 ring-1 ring-rose-500/20',
    violet: 'bg-violet-500/12 text-violet-400 ring-1 ring-violet-500/20',
    cyan: 'bg-cyan-500/12 text-cyan-400 ring-1 ring-cyan-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group relative flex min-h-[var(--dash-kpi-min-h)] flex-col justify-between overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-primary/25 hover:bg-card/80',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            accents[accent] || accents.primary
          )}
        >
          {Icon ? <Icon className="h-5 w-5" strokeWidth={2} aria-hidden /> : null}
        </div>
      </div>
      <div className="mt-4 min-w-0">
        <p className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl">
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </motion.div>
  )
}
