import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

/** List payments for the authenticated buyer (newest first). */
export const listPaymentsForBuyerService = async (buyerId, { page = 1, limit = 50 } = {}) => {
  const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            rfqNumber: true,
            status: true,
          },
        },
        quotation: {
          select: {
            id: true,
            supplier: {
              select: { id: true, companyName: true },
            },
          },
        },
      },
    }),
    prisma.payment.count({ where: { buyerId } }),
  ]);

  return {
    items,
    total,
    page: Math.max(Number(page) || 1, 1),
    limit: take,
  };
};

export const createPaymentService = async (rfqId, buyerId, data) => {
  try {
    const { paymentType, amount } = data;

    const rfq = await prisma.rFQ.findFirst({
      where: {
        id: rfqId,
        buyerId,
        deletedAt: null
      },
      include: {
        selectedQuotation: true
      }
    });

    if (!rfq) {
      throw new ApiError(404, 'RFQ not found');
    }

    // No RFQ status check - only check for ACCEPTED response

    // Check for existing payment with same paymentType and PENDING status
    const existingPayment = await prisma.payment.findFirst({
      where: {
        rfqId,
        paymentType,
        status: { in: ['PENDING', 'PAID'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (existingPayment && existingPayment.status === 'PAID') {
      throw new ApiError(400, 'Payment already completed');
    }

    const acceptedResponse = await prisma.rFQResponse.findFirst({
      where: {
        rfqId: rfq.id,
        status: { in: ['BUYER_ACCEPTED', 'CONFIRMED', 'SENT_TO_BUYER'] }
      }
    });

    if (!acceptedResponse) {
      throw new ApiError(400, 'No accepted quotation found. The quotation must be sent to buyer and accepted before payment can be created.');
    }

    const totalAmount = parseFloat(acceptedResponse.totalAmount) || parseFloat(rfq.totalAmount) || 0;
    let paymentAmount = totalAmount;

    if (paymentType === 'ADVANCE') {
      paymentAmount = parseFloat(amount) || (totalAmount * 0.3);
      if (paymentAmount <= 0 || paymentAmount > totalAmount) {
        throw new ApiError(400, 'Invalid advance payment amount');
      }
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Use create or update based on existing payment
    let payment;
    if (existingPayment && existingPayment.status === 'PENDING') {
      // Update existing pending payment
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount: paymentAmount,
          paymentType,
          status: 'PENDING',
          transactionId,
          updatedAt: new Date()
        },
        include: {
          rfq: {
            select: {
              id: true,
              title: true,
              totalAmount: true
            }
          },
          quotation: {
            select: {
              id: true,
              supplier: {
                select: {
                  companyName: true
                }
              }
            }
          }
        }
      });
    } else {
      // Create new payment
      payment = await prisma.payment.create({
        data: {
          rfqId,
          quotationId: acceptedResponse.id,
          buyerId,
          amount: paymentAmount,
          currency: acceptedResponse.currency || 'USD',
          paymentType,
          status: 'PENDING',
          transactionId
        },
        include: {
          rfq: {
            select: {
              id: true,
              title: true,
              totalAmount: true
            }
          },
          quotation: {
            select: {
              id: true,
              supplier: {
                select: {
                  companyName: true
                }
              }
            }
          }
        }
      });
    }

    logger.info(`Payment created for RFQ ${rfqId} by buyer ${buyerId}`);
    return payment;
  } catch (error) {
    logger.error('Create payment service error:', error);
    throw error;
  }
};

export const confirmPaymentService = async (paymentId, buyerId, data) => {
  try {
    const { transactionId, gateway, gatewayResponse } = data;

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        buyerId
      },
      include: {
        rfq: {
          include: {
            selectedQuotation: true
          }
        }
      }
    });

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    if (payment.status === 'PAID') {
      throw new ApiError(400, 'Payment already confirmed');
    }

    const rfq = payment.rfq;
    const totalAmount = parseFloat(rfq.totalAmount) || 0;
    const currentPaid = parseFloat(rfq.paidAmount) || 0;
    const paymentAmount = parseFloat(payment.amount) || 0;
    const newPaidAmount = currentPaid + paymentAmount;
    const newRemainingAmount = totalAmount - newPaidAmount;

    let newPaymentStatus = payment.paymentType === 'FULL' ? 'PAID' : 'PARTIAL';
    let newRFQStatus = payment.paymentType === 'FULL' ? 'COMPLETED' : 'IN_PROGRESS';
    // Quotation status should remain CONFIRMED after payment, not change to ACCEPTED (which doesn't exist)
    let newQuotationStatus = 'CONFIRMED';

    if (newRemainingAmount <= 0) {
      newPaymentStatus = 'PAID';
    }

    const quotation = rfq.selectedQuotation;

    if (!quotation) {
      throw new ApiError(400, 'No quotation selected for this RFQ. Cannot confirm payment.');
    }

    const supplierIdForInvoice = quotation.supplierId;
    const invoiceNumber = `INV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

    const existingInvoice = await prisma.invoice.findFirst({
      where: { paymentId }
    });

    const transactionOperations = [
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'PAID',
          transactionId: transactionId || payment.transactionId,
          gateway: gateway || 'MANUAL',
          gatewayResponse: gatewayResponse || {},
          confirmedAt: new Date()
        }
      }),
      prisma.rFQ.update({
        where: { id: rfq.id },
        data: {
          status: newRFQStatus,
          paymentStatus: newPaymentStatus,
          paymentType: payment.paymentType,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount > 0 ? newRemainingAmount : 0
        }
      }),
      prisma.rFQResponse.update({
        where: { id: payment.quotationId },
        data: {
          status: newQuotationStatus
        }
      }),
      prisma.paymentTransaction.create({
        data: {
          rfqId: rfq.id,
          userId: buyerId,
          amount: paymentAmount,
          currency: payment.currency,
          paymentType: payment.paymentType,
          status: 'PAID',
          transactionId: transactionId || payment.transactionId,
          gateway: gateway || 'MANUAL',
          gatewayResponse: gatewayResponse || {}
        }
      }),
      ...(existingInvoice
        ? []
        : [
            prisma.invoice.create({
              data: {
                rfqId: rfq.id,
                paymentId,
                buyerId,
                supplierId: supplierIdForInvoice,
                invoiceNumber,
                amount: payment.amount,
                currency: payment.currency || 'USD',
                status: 'ISSUED'
              }
            })
          ])
    ];

    await prisma.$transaction(transactionOperations);

    logger.info(`Payment ${paymentId} confirmed for RFQ ${rfq.id} by buyer ${buyerId}`);

    return {
      payment: await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          rfq: true,
          quotation: true
        }
      })
    };
  } catch (error) {
    logger.error('Confirm payment service error:', error);
    throw error;
  }
};
