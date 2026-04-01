/**
 * Display-only currency formatting. Stored amounts stay in their source currency (API: USD for products).
 * Chooses display currency from: user profile country → browser locale region → timezone hints.
 *
 * @param {number|string|null|undefined} amount - Amount in source currency
 * @param {string} [currency='USD'] - ISO 4217 source currency of the amount
 * @param {{ exchangeRates?: Record<string, number>, userCountry?: string|null }} [options]
 * @returns {string} Formatted price for the user's locale/currency
 */
export function formatPrice(amount, currency = 'USD', options = {}) {
  const num = amount == null || amount === '' ? NaN : parseFloat(amount)
  if (isNaN(num)) return '—'

  const sourceCurrency = (currency || 'USD').toUpperCase()
  const rates = options.exchangeRates || {}
  const { userCountry = null } = options

  const displayCurrency = resolveDisplayCurrencyCode(userCountry, rates)
  const locale = pickFormatLocale(displayCurrency)

  const displayAmount = convertToDisplayAmount(num, sourceCurrency, displayCurrency, rates)

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: displayCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayAmount)
}

/** @returns {string} BCP 47 locale for Intl */
function pickFormatLocale(displayCurrency) {
  if (typeof navigator === 'undefined') {
    return displayCurrency === 'INR' ? 'en-IN' : 'en-US'
  }
  const nav = navigator.language || 'en-US'
  if (displayCurrency === 'INR') return 'en-IN'
  if (displayCurrency === 'GBP') return 'en-GB'
  if (displayCurrency === 'EUR') {
    if (nav.startsWith('de')) return 'de-DE'
    if (nav.startsWith('fr')) return 'fr-FR'
    if (nav.startsWith('es')) return 'es-ES'
    if (nav.startsWith('it')) return 'it-IT'
    return 'en-IE'
  }
  return nav
}

/**
 * Rates are USD→currency multipliers (GET /exchange-rates): usd * rates.INR = INR.
 * For non-USD source: rate[X] means 1 USD = rate[X] units of X, so amount in X → USD = amount / rate[X].
 */
function convertToDisplayAmount(amount, source, target, rates) {
  let usd = amount
  if (source !== 'USD') {
    const r = rates[source]
    usd = r != null ? amount / Number(r) : amount
  }

  if (target === 'USD') return usd

  const mult = rates[target]
  if (mult != null) return usd * Number(mult)

  return usd
}

const COUNTRY_HINT = {
  india: 'INR',
  in: 'INR',
  'united states': 'USD',
  usa: 'USD',
  us: 'USD',
  'united kingdom': 'GBP',
  uk: 'GBP',
  gb: 'GBP',
  england: 'GBP',
  scotland: 'GBP',
  wales: 'GBP',
  germany: 'EUR',
  france: 'EUR',
  italy: 'EUR',
  spain: 'EUR',
  netherlands: 'EUR',
  belgium: 'EUR',
  austria: 'EUR',
  portugal: 'EUR',
  ireland: 'EUR',
  finland: 'EUR',
  greece: 'EUR',
  luxembourg: 'EUR',
  slovenia: 'EUR',
  slovakia: 'EUR',
  estonia: 'EUR',
  latvia: 'EUR',
  lithuania: 'EUR',
  malta: 'EUR',
  cyprus: 'EUR',
}

const EUR_REGIONS = new Set([
  'AT',
  'BE',
  'CY',
  'DE',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PT',
  'SI',
  'SK',
  'AD',
  'MC',
  'SM',
  'VA',
])

function countryStringToCurrency(country) {
  if (!country) return null
  const key = String(country).trim().toLowerCase()
  if (COUNTRY_HINT[key]) return COUNTRY_HINT[key]
  if (key.includes('india')) return 'INR'
  if (key.includes('united kingdom') || key.includes('britain')) return 'GBP'
  if (key.includes('united states')) return 'USD'
  return COUNTRY_HINT[key] || null
}

function getNavigatorRegion() {
  if (typeof navigator === 'undefined') return 'US'
  const lang = navigator.language || 'en-US'
  const parts = lang.split('-')
  return parts.length >= 2 ? parts[parts.length - 1].toUpperCase() : 'US'
}

/** Strong location hints when language is generic (e.g. en-US user in India). */
function getRegionFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!tz) return null
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'IN'
    if (tz === 'Europe/London') return 'GB'
    if (tz.startsWith('Europe/')) {
      const euroZones = new Set([
        'Berlin',
        'Paris',
        'Rome',
        'Madrid',
        'Amsterdam',
        'Brussels',
        'Vienna',
        'Warsaw',
        'Stockholm',
        'Athens',
        'Dublin',
        'Lisbon',
        'Prague',
        'Copenhagen',
        'Helsinki',
        'Bucharest',
        'Budapest',
        'Sofia',
        'Zurich',
        'Oslo',
      ])
      const city = tz.split('/')[1] || ''
      if (euroZones.has(city)) return 'DE'
    }
  } catch (_) {}
  return null
}

function regionToCurrency(region) {
  const r = (region || 'US').toUpperCase()
  if (r === 'IN') return 'INR'
  if (r === 'GB') return 'GBP'
  if (EUR_REGIONS.has(r)) return 'EUR'
  return 'USD'
}

/**
 * Pick ISO 4217 code for display. Product prices are stored in USD; we convert using `rates` when needed.
 */
function resolveDisplayCurrencyCode(userCountry, rates) {
  const fromProfile = countryStringToCurrency(userCountry)
  if (fromProfile && hasRateOrUsd(fromProfile, rates)) return fromProfile

  const tzRegion = getRegionFromTimezone()
  if (tzRegion) {
    const c = regionToCurrency(tzRegion)
    if (c && hasRateOrUsd(c, rates)) return c
  }

  const navRegion = getNavigatorRegion()
  const c = regionToCurrency(navRegion)
  if (hasRateOrUsd(c, rates)) return c

  return 'USD'
}

function hasRateOrUsd(code, rates) {
  if (code === 'USD') return true
  return rates[code] != null && !Number.isNaN(Number(rates[code]))
}
