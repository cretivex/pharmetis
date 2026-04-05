/**
 * Lightweight analytics hook — wire to GA4, Plausible, or backend when keys are configured.
 */
export function trackEvent(name, payload = {}) {
  if (import.meta.env.DEV) {
    console.debug('[analytics]', name, payload)
  }
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, payload)
  }
}

export function trackPageView(path) {
  trackEvent('page_view', { path })
}
