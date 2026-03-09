import { createCheckoutOrderService, getCheckoutQuotationService } from './checkout.service.js'
import { ApiError } from '../../utils/ApiError.js'
import { logger } from '../../utils/logger.js'

export const getCheckoutQuotation = async (req, res, next) => {
  try {
    if (req.user.role !== 'BUYER') {
      throw new ApiError(403, 'Only buyers can access checkout')
    }

    const { quotationId } = req.params
    const quotation = await getCheckoutQuotationService(quotationId, req.user.id)

    res.status(200).json({
      success: true,
      message: 'Quotation retrieved successfully',
      data: quotation
    })
  } catch (error) {
    logger.error('Get checkout quotation error:', error)
    next(error)
  }
}

export const createCheckoutOrder = async (req, res, next) => {
  try {
    if (req.user.role !== 'BUYER') {
      throw new ApiError(403, 'Only buyers can create orders')
    }

    const { quotationId } = req.params
    const deliveryDetails = req.body

    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'email', 'addressLine1', 'city', 'state', 'postalCode', 'country']
    const missingFields = requiredFields.filter(field => !deliveryDetails[field] || !deliveryDetails[field].trim())

    if (missingFields.length > 0) {
      throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(deliveryDetails.email)) {
      throw new ApiError(400, 'Invalid email format')
    }

    const result = await createCheckoutOrderService(quotationId, req.user.id, deliveryDetails)

    res.status(201).json({
      success: true,
      message: 'Checkout validated. Proceed to payment.',
      data: result
    })
  } catch (error) {
    logger.error('Create checkout order error:', error)
    next(error)
  }
}
