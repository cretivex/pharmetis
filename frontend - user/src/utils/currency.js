/**
 * Localized currency display. Does NOT change stored/database values.
 * Uses Intl.NumberFormat with navigator.language; default currency USD.
 * If user country is India, converts amount to INR for display using exchange rates.
 *
 * @param {number|string|null|undefined} amount - Price amount (in source currency)
 * @param {string} [currency='USD'] - Source currency of the amount
 * @param {{ exchangeRates?: Record<string, number>, userCountry?: string|null }} [options] - From CurrencyContext
 * @returns {string} Formatted price string for display
 */
export function formatPrice(amount, currency = 'USD', options = {}) {
  const { exchangeRates = {}, userCountry = null } = options;

  const num = amount == null || amount === '' ? NaN : parseFloat(amount);
  if (isNaN(num)) return '—';

  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const sourceCurrency = (currency || 'USD').toUpperCase();

  // If user country is India, convert to INR for display
  const isIndia =
    userCountry &&
    (String(userCountry).toLowerCase() === 'india' ||
     String(userCountry).toLowerCase() === 'in');
  const rateINR = exchangeRates.INR != null ? Number(exchangeRates.INR) : 83.12;

  let displayCurrency = sourceCurrency;
  let displayAmount = num;

  if (isIndia && sourceCurrency === 'USD') {
    displayCurrency = 'INR';
    displayAmount = num * rateINR;
  } else if (isIndia && sourceCurrency !== 'INR' && exchangeRates[sourceCurrency] != null && exchangeRates.INR != null) {
    // Convert other currency -> USD -> INR if we have rates
    const toUsd = 1 / Number(exchangeRates[sourceCurrency]);
    displayCurrency = 'INR';
    displayAmount = num * toUsd * rateINR;
  } else if (isIndia && sourceCurrency === 'INR') {
    displayCurrency = 'INR';
    displayAmount = num;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: displayCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(displayAmount);
}
