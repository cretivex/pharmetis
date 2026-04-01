/**
 * Renders a country flag image (ISO 3166-1 alpha-2).
 * Uses flagcdn for consistent cross-browser rendering.
 */
export function CountryFlag({ code, label, className = '' }) {
  const iso = code.toLowerCase()
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
