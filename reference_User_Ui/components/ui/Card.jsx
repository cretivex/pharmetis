export function Card({ children, className = '', glow = false, hover = true }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.1)] ring-1 ring-white/80 backdrop-blur-sm ${
        glow ? 'shadow-[0_0_40px_-8px_rgba(0,102,255,0.2)]' : ''
      } ${
        hover
          ? 'transition duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-[0_20px_40px_-12px_rgba(0,102,255,0.15)]'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
