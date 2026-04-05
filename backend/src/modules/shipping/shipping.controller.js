/**
 * Static shipping tiers + price hint for product pages (MVP — replace with carrier APIs later).
 */
export const getShippingEstimate = async (req, res, next) => {
  try {
    const country = (req.query.destinationCountry || req.query.country || 'US').toString().toUpperCase().slice(0, 2)
    const orderValueUsd = Math.max(0, parseFloat(req.query.orderValueUsd) || 0)

    const coldChain = req.query.coldChain === 'true' || req.query.coldChain === '1'

    const tiers = [
      {
        id: 'economy',
        label: 'Economy (ocean)',
        minDays: coldChain ? 14 : 21,
        maxDays: coldChain ? 28 : 45,
        description: 'Best for non-urgent bulk; customs may add time.',
      },
      {
        id: 'standard',
        label: 'Standard (air)',
        minDays: coldChain ? 5 : 7,
        maxDays: coldChain ? 10 : 14,
        description: 'Balanced speed and cost for most pharmaceutical cargo.',
      },
      {
        id: 'express',
        label: 'Express (air priority)',
        minDays: coldChain ? 2 : 3,
        maxDays: coldChain ? 5 : 7,
        description: 'Time-sensitive or temperature-controlled shipments.',
      },
    ]

    const regionMultiplier = ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'IN'].includes(country) ? 1 : 1.15
    const basePct = 0.035
    const shippingHintUsd = orderValueUsd > 0 ? +(orderValueUsd * basePct * regionMultiplier).toFixed(2) : null

    res.status(200).json({
      success: true,
      data: {
        destinationCountry: country,
        orderValueUsd,
        coldChain,
        tiers,
        shippingCostHintUsd: shippingHintUsd,
        disclaimer:
          'Estimates only. Final freight, duties, and cold-chain surcharges depend on Incoterms, HS codes, and carrier quotes.',
      },
    })
  } catch (e) {
    next(e)
  }
}
