/**
 * Buyer profile completion check.
 * Required fields: phone, company name, business type, GST/tax id, address (with country, city).
 *
 * @param {Object} user - Merged profile + company + addresses.
 *   Can have: phone, companyName, businessType, gstTaxId, addresses (array of { addressLine1, country, city })
 * @returns {{ complete: boolean, missingFields: string[], percentage: number }}
 */
export function checkBuyerProfileCompletion(user) {
  const missingFields = [];

  if (!user) {
    return {
      complete: false,
      missingFields: ['phone', 'companyName', 'businessType', 'gstTaxId', 'address', 'country', 'city'],
      percentage: 0
    };
  }

  const hasPhone = !!String(user.phone || '').trim();
  if (!hasPhone) missingFields.push('phone');

  const hasCompanyName = !!String(user.companyName || '').trim();
  if (!hasCompanyName) missingFields.push('company name');

  const hasBusinessType = !!String(user.businessType || '').trim();
  if (!hasBusinessType) missingFields.push('business type');

  const hasGstTaxId = !!String(user.gstTaxId || '').trim();
  if (!hasGstTaxId) missingFields.push('GST / tax ID');

  const addresses = Array.isArray(user.addresses) ? user.addresses : [];
  const hasAddress = addresses.some(
    (addr) => !!String(addr?.addressLine1 || '').trim()
  );
  if (!hasAddress) missingFields.push('address');

  const hasCountry = addresses.some(
    (addr) => !!String(addr?.country || '').trim()
  );
  if (!hasCountry) missingFields.push('country');

  const hasCity = addresses.some(
    (addr) => !!String(addr?.city || '').trim()
  );
  if (!hasCity) missingFields.push('city');

  const requiredCount = 7;
  const filledCount = requiredCount - missingFields.length;
  const percentage = Math.round((filledCount / requiredCount) * 100);

  return {
    complete: missingFields.length === 0,
    missingFields,
    percentage: Math.min(100, Math.max(0, percentage))
  };
}
