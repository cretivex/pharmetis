/** Deterministic display rating / reviews when API has no review fields (listing polish). */
export function stableRatingFromId(id) {
  const s = String(id)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return (4.3 + (Math.abs(h) % 7) / 10).toFixed(1)
}

export function stableReviewsFromId(id) {
  const s = String(id)
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return 50 + (Math.abs(h) % 400)
}

const COUNTRY_FLAGS = {
  india: '🇮🇳',
  germany: '🇩🇪',
  'united kingdom': '🇬🇧',
  uk: '🇬🇧',
  'united states': '🇺🇸',
  usa: '🇺🇸',
  china: '🇨🇳',
  norway: '🇳🇴',
  netherlands: '🇳🇱',
  singapore: '🇸🇬',
  france: '🇫🇷',
  switzerland: '🇨🇭',
  japan: '🇯🇵',
  canada: '🇨🇦',
  australia: '🇦🇺',
  brazil: '🇧🇷',
  mexico: '🇲🇽',
  spain: '🇪🇸',
  italy: '🇮🇹',
}

export function countryToFlagEmoji(country) {
  if (!country || typeof country !== 'string') return '🌍'
  const key = country.trim().toLowerCase()
  return COUNTRY_FLAGS[key] || '🌍'
}
