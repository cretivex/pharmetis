/**
 * Renders a country flag image (ISO 3166-1 alpha-2).
 */
export function CountryFlag({ code, label, className = '' }) {
  const iso = String(code || '').toLowerCase()
  if (!iso || iso.length !== 2) {
    return (
      <span
        className={`flex h-full w-full items-center justify-center bg-slate-100 text-[10px] font-bold text-slate-500 ${className}`}
        title={label}
      >
        —
      </span>
    )
  }
  return (
    <img
      src={`https://flagcdn.com/w80/${iso}.png`}
      srcSet={`https://flagcdn.com/w160/${iso}.png 2x`}
      width={40}
      height={30}
      alt={label ?? ''}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover object-center ${className}`}
    />
  )
}
