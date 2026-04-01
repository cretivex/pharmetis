export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 ring-slate-200/80',
    brand: 'bg-brand/10 text-brand ring-brand/20',
    success: 'bg-emerald-500/15 text-emerald-800 ring-emerald-500/25',
    outline: 'bg-white/80 text-slate-600 ring-slate-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
    </span>
  )
}
