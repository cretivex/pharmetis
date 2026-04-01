import { Link } from 'react-router-dom'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 motion-safe:active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const variants = {
  primary:
    'bg-brand text-white shadow-lg shadow-brand/30 ring-1 ring-white/10 hover:bg-brand-hover hover:shadow-brand/40',
  secondary:
    'border-2 border-brand bg-white text-brand hover:bg-brand/5',
  outline:
    'border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50',
  glass:
    'border border-white/35 bg-white/10 text-white backdrop-blur-md hover:bg-white/15',
  ghostDark:
    'border-2 border-white/40 bg-transparent text-white hover:border-white/60 hover:bg-white/10',
  white:
    'bg-white text-slate-900 shadow-xl shadow-black/20 ring-1 ring-white/50 hover:bg-slate-100',
  /** Landing header — outline pill (Login) */
  headerOutline:
    '!rounded-full border border-white bg-transparent text-white shadow-none ring-0 hover:bg-white/10 !font-medium',
  /** Landing header — primary pill + glow (Send RFQ) */
  headerPrimary:
    '!rounded-full bg-brand text-white shadow-[0_0_15px_rgba(37,99,235,0.45)] ring-0 hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(37,99,235,0.55)] !font-medium',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-sm',
  /** Pairs with headerOutline / headerPrimary */
  nav: 'px-6 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  to,
  children,
  ...props
}) {
  const cls = `${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...props}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  )
}
