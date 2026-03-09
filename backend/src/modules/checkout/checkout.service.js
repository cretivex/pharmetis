import prisma from '../../config/database.js'
import { ApiError } from '../../utils/ApiError.js'
import { logger } from '../../utils/logger.js'

export const createCheckoutOrderService = async (quotationId, buyerId, deliveryDetails) => {
  try {
    // Get quotation with RFQ and items
    const quotation = await prisma.rFQResponse.findFirst({
      where: {
        id: quotationId,
        rfq: {
          buyerId,
          deletedAt: null
        }
      },
      include: {
        rfq: {
          include: {
            buyer: true
          }
        },
        supplier: {
          select: {
            id: true,
            companyName: true
          }
        },
        items: true
      }
    })

    if (!quotation) {
      throw new ApiError(404, 'Quotation not found or you do not have access')
    }

    // Verify quotation is accepted by buyer
    if (quotation.status !== 'BUYER_ACCEPTED' && quotation.status !== 'SENT_TO_BUYER') {
      throw new ApiError(400, `Cannot checkout. Quotation status must be BUYER_ACCEPTED. Current status: ${quotation.status}`)
    }

    // Orders have been removed from the system. Accepting a quotation only updates status to BUYER_ACCEPTED.
    // Return quotation/rfq info for payment flow without creating an order.
    logger.info(`Checkout validated for quotation ${quotationId} by buyer ${buyerId} (orders disabled)`)

    return {
      orderId: null,
      orderNumber: null,
      order: null,
      quotationId: quotation.id,
      rfqId: quotation.rfqId
    }
  } catch (error) {
    logger.error('Create checkout order service error:', error)
    throw error
  }
}

export const getCheckoutQuotationService = async (quotationId, buyerId) => {
  try {
    const quotation = await prisma.rFQResponse.findFirst({
      where: {
        id: quotationId,
        rfq: {
          buyerId,
          deletedAt: null
        }
      },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            buyerId: true
          }
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            country: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true
              }
            }
          }
        }
      }
    })

    if (!quotation) {
      throw new ApiError(404, 'Quotation not found or you do not have access')
    }

    // Only allow checkout if quotation is SENT_TO_BUYER or BUYER_ACCEPTED
    if (!['SENT_TO_BUYER', 'BUYER_ACCEPTED'].includes(quotation.status)) {
      throw new ApiError(400, `Cannot checkout. Quotation status must be SENT_TO_BUYER or BUYER_ACCEPTED. Current status: ${quotation.status}`)
    }

    return quotation
  } catch (error) {
    logger.error('Get checkout quotation service error:', error)
    throw error
  }
}
