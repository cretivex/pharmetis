/**
 * GET /exchange-rates
 * Returns rates from USD. Used for display-only currency conversion (e.g. show INR for Indian users).
 * Does not modify database values.
 */
export async function getExchangeRates(req, res, next) {
  try {
    // Base is USD. Rates can be moved to config or DB later.
    const data = {
      base: 'USD',
      rates: {
        USD: 1,
        INR: 83.12,
        EUR: 0.92,
        GBP: 0.79
      },
      updatedAt: new Date().toISOString()
    };
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
}
