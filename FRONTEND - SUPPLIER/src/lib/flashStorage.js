/** Session flash for full-page redirects (e.g. 401) where router state is lost. */
export const SUPPLIER_FLASH_KEY = 'supplierPortalFlash'

export function setSupplierFlash(variant, message) {
  try {
    sessionStorage.setItem(SUPPLIER_FLASH_KEY, JSON.stringify({ variant, message }))
  } catch {
    /* ignore */
  }
}
