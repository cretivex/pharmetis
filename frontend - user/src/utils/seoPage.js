const DEFAULT_TITLE = 'Pharmetis — Global Pharma Marketplace'
const DEFAULT_DESCRIPTION =
  'Global Pharma Export Marketplace + Execution OS. Connect verified buyers with qualified pharmaceutical manufacturers worldwide.'

/**
 * Sets document title and meta description for SEO (SPA). Call from useEffect.
 * @param {{ title: string, description: string }} opts
 * @returns {() => void} cleanup to restore defaults on unmount
 */
export function setPageSeo({ title, description }) {
  const prevTitle = document.title
  document.title = title

  const meta = document.querySelector('meta[name="description"]')
  const prevContent = meta?.getAttribute('content') ?? ''
  if (meta && description) {
    meta.setAttribute('content', description)
  }

  return () => {
    document.title = prevTitle || DEFAULT_TITLE
    if (meta) {
      meta.setAttribute('content', prevContent || DEFAULT_DESCRIPTION)
    }
  }
}
