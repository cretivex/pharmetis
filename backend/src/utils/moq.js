/** Extract first integer from MOQ string for filtering/sorting; null if unparseable. */
export function parseMoqNumeric(moq) {
  if (moq == null || moq === '') return null;
  const s = String(moq).toLowerCase();
  if (s.includes('contact')) return null;
  const m = s.match(/[\d][\d,]*/);
  if (!m) return null;
  const n = parseInt(m[0].replace(/,/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}
