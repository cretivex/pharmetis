export function Card({ children, className = '', glow = false, hover = true }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/95 shadow-soft-lg ring-1 ring-slate-100/90 backdrop-blur-sm ${
        glow ? 'shadow-[0_0_40px_-8px_rgba(0,102,255,0.18)]' : ''
      } ${
        hover
          ? 'transition duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-soft-xl'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
