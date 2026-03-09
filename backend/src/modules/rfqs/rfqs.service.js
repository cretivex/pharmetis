import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { createRFQHistoryEntry } from './rfq-history.service.js';
import { createAdminNotifications } from '../notifications/notifications.service.js';

export const createRFQService = async (buyerId, data) => {
  const { title, notes, expiresAt, items } = data;

  // Generate title if not provided
  const rfqTitle = title || `RFQ - ${items?.length || 0} product(s)`;

  // Determine status: DRAFT if no items or items incomplete, OPEN if complete (for buyer flow)
  const hasValidItems = items && items.length > 0 && items.every(item => 
    item.productName && item.quantity
  );
  const rfqStatus = hasValidItems ? (data.status || 'OPEN') : 'DRAFT';

  // Create RFQ first
  const rfq = await prisma.rFQ.create({
    data: {
      buyerId,
      title: rfqTitle,
      notes: notes || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
      status: rfqStatus,
    },
  });

  // Create RFQ items separately
  if (items && items.length > 0) {
    await prisma.rFQItem.createMany({
      data: items.map(item => ({
        rfqId: rfq.id,
        productId: item.productId || null,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit || 'units',
        notes: item.notes || null
      }))
    });
  }

  // Fetch the complete RFQ with items
  const completeRFQ = await prisma.rFQ.findUnique({
    where: { id: rfq.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });
  // RFQ_CREATED history
  await createRFQHistoryEntry({
    rfqId: rfq.id,
    actorRole: 'BUYER',
    actorId: buyerId,
    action: 'RFQ_CREATED',
    note: notes || null
  });

  await createAdminNotifications({
    title: 'New RFQ created',
    message: `RFQ "${rfqTitle}" has been created.`,
    link: `/rfq/${rfq.id}`,
    type: 'RFQ_CREATED'
  });

  return completeRFQ;
};

export const getRFQsService = async (buyerId, filters = {}) => {
  const {
    status,
    page = 1,
    limit = 20
  } = filters;

  const where = {
    deletedAt: null
  };

  // Only filter by buyerId if provided (for non-admin users)
  if (buyerId) {
    where.buyerId = buyerId;
  }

  if (status) {
    where.status = status;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;
  const take = limitNum;

  const [rfqs, total] = await Promise.all([
    prisma.rFQ.findMany({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true
              }
            }
          }
        },
        _count: {
          select: {
            responses: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    }),
    prisma.rFQ.count({ where })
  ]);

  return {
    rfqs,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    }
  };
};

export const checkSupplierAssignedToRFQ = async (supplierId, rfqId) => {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: {
      items: true,
      assignedSuppliers: { where: { supplierId }, select: { id: true } },
      _count: { select: { assignedSuppliers: true } }
    }
  });

  if (!rfq || rfq.deletedAt) {
    return false;
  }

  if (rfq.status !== 'SENT') {
    return false;
  }

  const now = new Date();
  if (rfq.expiresAt && new Date(rfq.expiresAt) < now) {
    return false;
  }

  // Explicitly sent to this supplier (rfq_suppliers)
  const isExplicitlyAssigned = rfq.assignedSuppliers?.length > 0;
  // Legacy global: no assignments and supplier existed before RFQ was sent
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { createdAt: true }
  });
  const isLegacyGlobal =
    !isExplicitlyAssigned &&
    rfq._count.assignedSuppliers === 0 &&
    supplier &&
    rfq.updatedAt > supplier.createdAt;

  if (!isExplicitlyAssigned && !isLegacyGlobal) {
    return false;
  }

  const existingResponse = await prisma.rFQResponse.findFirst({
    where: { rfqId, supplierId }
  });

  return !existingResponse;
};

export const getRFQByIdService = async (id, buyerId, user = null) => {
  if (!id) {
    throw new ApiError(400, 'RFQ ID is required');
  }

  const where = {
    id,
    deletedAt: null
  };
  
  // Only filter by buyerId if provided (for buyers)
  if (buyerId) {
    where.buyerId = buyerId;
  }
  
  const rfq = await prisma.rFQ.findUnique({
    where: {
      id
    },
    include: {
      assignedSuppliers: {
        select: { supplierId: true }
      },
      buyer: {
        select: {
          id: true,
          email: true,
          fullName: true,
          companyName: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true
            }
          }
        }
      },
      responses: {
        include: {
          supplier: {
            select: {
              id: true,
              companyName: true,
              country: true,
              slug: true
            }
          },
          items: true
        }
      },
      selectedQuotation: {
        include: {
          supplier: {
            select: {
              id: true,
              companyName: true,
              country: true,
              city: true,
              slug: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  if (rfq.deletedAt) {
    throw new ApiError(404, 'RFQ not found');
  }

  // For buyers, verify ownership
  if (buyerId && rfq.buyerId !== buyerId) {
    throw new ApiError(403, 'Access denied');
  }

  return rfq;
};

export const updateRFQService = async (id, buyerId, data) => {
  const where = {
    id,
    deletedAt: null
  };
  
  // Only filter by buyerId if provided (for non-admin users)
  if (buyerId) {
    where.buyerId = buyerId;
  }
  
  const rfq = await prisma.rFQ.findFirst({
    where,
    include: {
      items: true
    }
  });

  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  // Prevent status change if RFQ has responses
  if (data.status && rfq.status !== data.status) {
    const hasResponses = await prisma.rFQResponse.count({
      where: { rfqId: id }
    });
    
    if (hasResponses > 0 && ['DRAFT', 'SENT'].includes(data.status)) {
      throw new ApiError(400, 'Cannot change RFQ status to DRAFT or SENT after suppliers have responded');
    }
  }

  // Prevent modification of items if RFQ has responses
  if (data.items && data.items.length > 0) {
    const hasResponses = await prisma.rFQResponse.count({
      where: { rfqId: id }
    });
    
    if (hasResponses > 0) {
      throw new ApiError(400, 'Cannot modify RFQ items after suppliers have responded');
    }
  }

  const updated = await prisma.rFQ.update({
    where: { id },
    data: {
      title: data.title,
      notes: data.notes,
      status: data.status,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null
    },
    include: {
      items: true
    }
  });

  return updated;
};

export const deleteRFQService = async (id, buyerId) => {
  const where = {
    id,
    deletedAt: null
  };
  
  // Only filter by buyerId if provided (for non-admin users)
  if (buyerId) {
    where.buyerId = buyerId;
  }
  
  const rfq = await prisma.rFQ.findFirst({
    where
  });

  if (!rfq) {
    throw new ApiError(404, 'RFQ not found');
  }

  await prisma.rFQ.update({
    where: { id },
    data: {
      deletedAt: new Date()
    }
  });
};

export const getAssignedRFQsService = async (userId) => {
  // Get supplier by userId (need createdAt for legacy global RFQ visibility)
  const supplier = await prisma.supplier.findFirst({
    where: {
      userId,
      deletedAt: null
    },
    select: { id: true, createdAt: true }
  });

  // Return empty array if supplier not found (instead of 404)
  if (!supplier) {
    return [];
  }

  // Suppliers only see RFQs that were explicitly sent to them (rfq_suppliers), or legacy
  // global RFQs (no assignments) only if supplier existed before the RFQ was sent.
  const rfqs = await prisma.rFQ.findMany({
    where: {
      deletedAt: null,
      OR: [
        // Explicitly sent to this supplier (rfq_suppliers join table)
        {
          assignedSuppliers: {
            some: { supplierId: supplier.id }
          }
        },
        // Legacy global: SENT RFQ with no assignments; only show to suppliers created before RFQ sent
        {
          status: 'SENT',
          assignedSuppliers: { none: {} },
          updatedAt: { gt: supplier.createdAt }
        },
        // RFQs where this supplier has already responded and the process is ongoing
        {
          status: {
            in: ['RESPONDED', 'QUOTED', 'AWAITING_PAYMENT', 'NEGOTIATION', 'CONFIRMED']
          },
          responses: {
            some: {
              supplierId: supplier.id
            }
          }
        },
        // RFQs where buyer requested lower price and admin sent negotiation to this supplier
        {
          responses: {
            some: {
              supplierId: supplier.id,
              status: {
                in: ['NEGOTIATION_REQUESTED', 'NEGOTIATION_SENT_TO_SUPPLIER', 'SUPPLIER_COUNTER_OFFER']
              }
            }
          }
        }
      ]
    },
    include: {
      buyer: {
        select: {
          id: true,
          email: true,
          fullName: true
        }
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return rfqs;
};

/** Same shape as getAssignedRFQsService; when status === 'RESPONDED' returns only RFQs where supplier has a response with status in [SUBMITTED, SENT_TO_BUYER]. */
export const getSupplierRFQsService = async (userId, status) => {
  const supplier = await prisma.supplier.findFirst({
    where: {
      userId,
      deletedAt: null
    },
    select: { id: true }
  });

  if (!supplier) {
    return [];
  }

  const respondedQuotationStatuses = ['SUBMITTED', 'SENT_TO_BUYER', 'NEGOTIATION_SENT_TO_SUPPLIER', 'SUPPLIER_COUNTER_OFFER'];

  if (status === 'RESPONDED') {
    const rfqs = await prisma.rFQ.findMany({
      where: {
        deletedAt: null,
        responses: {
          some: {
            supplierId: supplier.id,
            status: { in: respondedQuotationStatuses }
          }
        }
      },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return rfqs;
  }

  return getAssignedRFQsService(userId);
};

export const sendRFQToSuppliersService = async (rfqId, supplierIds, userId) => {
  try {
    // Verify RFQ exists and user has access
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id: rfqId,
        deletedAt: null
      },
      include: {
        items: true
      }
    });

    if (!rfq) {
      throw new ApiError(404, 'RFQ not found');
    }

    // Verify user is admin or buyer who owns the RFQ
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.role !== 'ADMIN' && rfq.buyerId !== userId) {
      throw new ApiError(403, 'You do not have permission to send this RFQ');
    }

    // Validate RFQ has items
    if (!rfq.items || rfq.items.length === 0) {
      throw new ApiError(400, 'RFQ must have at least one item before sending to suppliers');
    }

    // Who has already been sent this RFQ (rfq_suppliers)
    const existingAssignments = await prisma.rFQSupplier.findMany({
      where: { rfqId },
      select: { supplierId: true }
    });
    const alreadySentSupplierIds = new Set(existingAssignments.map(a => a.supplierId));

    // Responses for this RFQ (to allow resend only when NEGOTIATION_REQUESTED)
    const responses = await prisma.rFQResponse.findMany({
      where: { rfqId },
      select: { supplierId: true, status: true }
    });
    const supplierResponseStatus = new Map(responses.map(r => [r.supplierId, r.status]));

    // If supplierIds array is empty, send to all active suppliers who have not received it yet
    let requestedSupplierIds = supplierIds && supplierIds.length > 0 ? supplierIds : null;
    if (!requestedSupplierIds || requestedSupplierIds.length === 0) {
      const allSuppliers = await prisma.supplier.findMany({
        where: { isActive: true, deletedAt: null },
        select: { id: true }
      });
      requestedSupplierIds = allSuppliers.map(s => s.id);
    }

    // Filter: allow (a) not yet sent, or (b) already sent but quotation status is NEGOTIATION_REQUESTED (resend)
    const targetSupplierIds = requestedSupplierIds.filter(sid => {
      if (!alreadySentSupplierIds.has(sid)) return true;
      const status = supplierResponseStatus.get(sid);
      return status === 'NEGOTIATION_REQUESTED';
    });

    if (targetSupplierIds.length === 0) {
      const allAlreadySent = requestedSupplierIds.every(sid => alreadySentSupplierIds.has(sid));
      throw new ApiError(
        400,
        allAlreadySent
          ? 'RFQ already sent to all selected suppliers. Resending is only allowed when a quotation status is NEGOTIATION_REQUESTED.'
          : 'No suppliers to send to. Resending is only allowed when quotation status is NEGOTIATION_REQUESTED.'
      );
    }

    // Verify all supplier IDs exist and are active
    const validSuppliers = await prisma.supplier.findMany({
      where: {
        id: { in: targetSupplierIds },
        isActive: true,
        deletedAt: null
      },
      select: { id: true }
    });

    if (validSuppliers.length !== targetSupplierIds.length) {
      throw new ApiError(400, 'One or more suppliers are invalid or inactive');
    }

    // Update RFQ status to SENT
    const updatedRFQ = await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: 'SENT' },
      include: {
        buyer: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        },
        items: true
      }
    });

    // Record which suppliers this RFQ was sent to (no duplicates: skipDuplicates)
    await prisma.rFQSupplier.createMany({
      data: targetSupplierIds.map(supplierId => ({ rfqId, supplierId })),
      skipDuplicates: true
    });

    logger.info(`RFQ ${rfqId} sent to ${targetSupplierIds.length} supplier(s) by user ${userId}`);

    return {
      rfq: updatedRFQ,
      suppliersSent: targetSupplierIds.length,
      supplierIds: targetSupplierIds
    };
  } catch (error) {
    logger.error('Send RFQ to suppliers service error:', error);
    throw error;
  }
};

export const processPaymentService = async (id, buyerId, data) => {
  const { paymentType, amount } = data;

  logger.info(`[processPaymentService] Starting payment for RFQ ${id}, buyer ${buyerId}, type: ${paymentType}`);

  if (!paymentType || !['FULL', 'ADVANCE', 'PARTIAL', 'REMAINING'].includes(paymentType)) {
    throw new ApiError(400, 'Invalid payment type. Must be FULL, ADVANCE, PARTIAL, or REMAINING');
  }

  const rfq = await prisma.rFQ.findFirst({
    where: {
      id,
      deletedAt: null,
      buyerId
    }
  });

  if (!rfq) {
    logger.info(`[processPaymentService] RFQ not found: ${id}`);
    throw new ApiError(404, 'RFQ not found');
  }

  logger.info(`[processPaymentService] RFQ found: ${rfq.id}, status: ${rfq.status}`);

  const acceptedResponse = await prisma.rFQResponse.findFirst({
    where: {
      rfqId: rfq.id,
      status: 'ACCEPTED'
    },
    include: {
      items: true,
      supplier: {
        select: {
          id: true,
          companyName: true
        }
      }
    }
  });

  if (!acceptedResponse) {
    logger.info(`[processPaymentService] No ACCEPTED quotation found for RFQ ${id}`);
    throw new ApiError(400, 'No accepted quotation found');
  }

  logger.info(`[processPaymentService] Found ACCEPTED response: ${acceptedResponse.id}`);

  const payments = await prisma.payment.findMany({
    where: { rfqId: rfq.id }
  });

  const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalAmount = parseFloat(acceptedResponse.totalAmount) || 0;
  const remainingAmount = totalAmount - totalPaid;

  logger.info('Remaining amount:', remainingAmount);
  logger.info(`[processPaymentService] Total paid: ${totalPaid}, Total amount: ${totalAmount}, Remaining: ${remainingAmount}`);

  if (remainingAmount <= 0) {
    logger.info(`[processPaymentService] Already fully paid for RFQ ${id}`);
    throw new ApiError(400, 'Already fully paid');
  }

  let amountToPay = 0;

  if (paymentType === 'FULL') {
    amountToPay = totalAmount;
  } else if (paymentType === 'PARTIAL') {
    if (!amount || amount <= 0) {
      throw new ApiError(400, 'Invalid partial amount');
    }
    amountToPay = parseFloat(amount);
    if (amountToPay > remainingAmount) {
      throw new ApiError(400, 'Payment amount exceeds remaining balance');
    }
  } else if (paymentType === 'REMAINING') {
    amountToPay = remainingAmount;
  } else {
    throw new ApiError(400, 'Invalid payment type');
  }

  logger.info(`[processPaymentService] Amount to pay: ${amountToPay}`);

  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const newPayment = await prisma.payment.create({
    data: {
      rfqId: rfq.id,
      quotationId: acceptedResponse.id,
      buyerId: buyerId,
      amount: amountToPay,
      currency: acceptedResponse.currency || 'USD',
      paymentType: paymentType,
      status: 'PAID',
      transactionId,
      gateway: 'MANUAL',
      gatewayResponse: {},
      confirmedAt: new Date()
    }
  });

  logger.info(`[processPaymentService] Payment created: ${newPayment.id}`);

  const newTotalPaid = totalPaid + amountToPay;
  const newRemainingAmount = totalAmount - newTotalPaid;

  let paymentStatus = 'PARTIAL';

  if (newTotalPaid >= totalAmount) {
    paymentStatus = 'PAID';

    await prisma.rFQResponse.update({
      where: { id: acceptedResponse.id },
      data: { paymentStatus: 'PAID' }
    });

    await prisma.rFQ.update({
      where: { id: rfq.id },
      data: { status: 'COMPLETED' }
    });
  } else {
    await prisma.rFQResponse.update({
      where: { id: acceptedResponse.id },
      data: { paymentStatus: 'PARTIAL' }
    });
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { rfqId: id }
  });

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: {
        amount: newTotalPaid,
        status: paymentStatus === 'PAID' ? 'PAID' : 'PARTIAL',
        updatedAt: new Date()
      }
    });
  } else {
    await prisma.payment.create({
      data: {
        rfqId: rfq.id,
        quotationId: acceptedResponse.id,
        buyerId: buyerId,
        amount: newTotalPaid,
        currency: acceptedResponse.currency || 'USD',
        paymentType: paymentType === 'REMAINING' ? 'FULL' : paymentType,
        status: paymentStatus === 'PAID' ? 'PAID' : 'PARTIAL',
        transactionId,
        gateway: 'MANUAL',
        gatewayResponse: {}
      }
    });
  }

  logger.info(`[processPaymentService] Payment processed. Status: ${paymentStatus}, Total paid: ${newTotalPaid}, Remaining: ${newRemainingAmount}`);

  return {
    totalPaid: newTotalPaid,
    remainingAmount: newRemainingAmount,
    paymentStatus: paymentStatus
  };
};

export const completeRFQService = async (id, buyerId) => {
  try {
    const rfq = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId,
        deletedAt: null
      },
      include: {
        selectedQuotation: true
      }
    });

    if (!rfq) {
      throw new ApiError(404, 'RFQ not found or you do not have access');
    }

    if (rfq.status !== 'IN_PROGRESS' && rfq.status !== 'SHIPPED') {
      throw new ApiError(400, `RFQ can only be completed from IN_PROGRESS or SHIPPED status. Current status: ${rfq.status}`);
    }

    if (rfq.paymentStatus !== 'PAID' && rfq.paymentStatus !== 'PARTIAL') {
      throw new ApiError(400, 'RFQ can only be completed after payment is made');
    }

    const updated = await prisma.rFQ.update({
      where: { id },
      data: {
        status: 'COMPLETED'
      },
      include: {
        selectedQuotation: {
          include: {
            supplier: {
              select: {
                id: true,
                companyName: true
              }
            }
          }
        }
      }
    });

    logger.info(`RFQ ${id} marked as completed by buyer ${buyerId}`);
    return updated;
  } catch (error) {
    logger.error('Complete RFQ service error:', error);
    throw error;
  }
};
