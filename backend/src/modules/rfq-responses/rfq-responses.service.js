import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { createRFQHistoryEntry } from '../rfqs/rfq-history.service.js';
import { createAdminNotifications } from '../notifications/notifications.service.js';

/** Admin/buyer list: returns all quotation statuses including SENT_TO_BUYER, NEGOTIATION_*, BUYER_ACCEPTED, CONFIRMED. No status filter. */
export const getRFQResponsesService = async (rfqId, user) => {
  try {
    const where = {};
    
    if (rfqId) {
      const rfq = await prisma.rFQ.findFirst({
        where: {
          id: rfqId,
          deletedAt: null,
          ...(user.role !== 'ADMIN' ? { buyerId: user.id } : {})
        }
      });
      
      if (!rfq) {
        throw new ApiError(404, 'RFQ not found');
      }
      
      where.rfqId = rfqId;
    } else if (user.role !== 'ADMIN') {
      const userRFQs = await prisma.rFQ.findMany({
        where: {
          buyerId: user.id,
          deletedAt: null
        },
        select: { id: true }
      });
      
      where.rfqId = { in: userRFQs.map(r => r.id) };
    }
    
    const responses = await prisma.rFQResponse.findMany({
      where: {
        ...where,
        rfq: {
          deletedAt: null
        }
      },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            status: true,
            buyer: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            },
            items: {
              select: {
                id: true,
                productName: true,
                quantity: true,
                unit: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            country: true,
            slug: true,
            certifications: {
              select: {
                type: true
              }
            }
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return responses;
  } catch (error) {
    logger.error('Get RFQ responses service error:', error);
    throw error;
  }
};

export const getRFQResponseByIdService = async (id, user) => {
  try {
    const response = await prisma.rFQResponse.findFirst({
      where: {
        id,
        rfq: {
          deletedAt: null,
          ...(user.role !== 'ADMIN' ? { buyerId: user.id } : {})
        }
      },
      include: {
        rfq: {
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
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            country: true,
            city: true
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
      }
    });
    
    if (!response) {
      throw new ApiError(404, 'RFQ response not found');
    }
    
    return response;
  } catch (error) {
    logger.error('Get RFQ response by ID service error:', error);
    throw error;
  }
};

export const acceptRFQResponseService = async (id, user) => {
  try {
    const response = await prisma.rFQResponse.findFirst({
      where: {
        id,
        rfq: {
          deletedAt: null,
          ...(user.role !== 'ADMIN' ? { buyerId: user.id } : {})
        }
      },
      include: {
        rfq: true,
        items: true
      }
    });
    
    if (!response) {
      throw new ApiError(404, 'RFQ response not found');
    }

    // Calculate total amount from quotation items
    const totalAmount = parseFloat(response.totalAmount) || response.items.reduce((sum, item) => {
      return sum + (parseFloat(item.totalPrice) || 0);
    }, 0);
    
    // Update quotation to accepted
    const updated = await prisma.rFQResponse.update({
      where: { id },
      data: {
        isAccepted: true
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true
          }
        },
        rfq: true
      }
    });

    // Update RFQ status to AWAITING_PAYMENT and set payment fields
    await prisma.rFQ.update({
      where: { id: response.rfqId },
      data: {
        status: 'AWAITING_PAYMENT',
        totalAmount: totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        paymentStatus: 'PENDING',
        selectedQuotationId: id
      }
    });

    logger.info(`Quotation ${id} accepted by buyer. RFQ ${response.rfqId} updated to AWAITING_PAYMENT.`);
    
    return updated;
  } catch (error) {
    logger.error('Accept RFQ response service error:', error);
    throw error;
  }
};

export const rejectRFQResponseService = async (id, user) => {
  try {
    const response = await prisma.rFQResponse.findFirst({
      where: {
        id,
        rfq: {
          deletedAt: null,
          ...(user.role !== 'ADMIN' ? { buyerId: user.id } : {})
        }
      }
    });
    
    if (!response) {
      throw new ApiError(404, 'RFQ response not found');
    }
    
    const updated = await prisma.rFQResponse.update({
      where: { id },
      data: {
        isAccepted: false
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true
          }
        }
      }
    });
    
    return updated;
  } catch (error) {
    logger.error('Reject RFQ response service error:', error);
    throw error;
  }
};

export const updateRFQResponseService = async (id, user, data) => {
  try {
    const response = await prisma.rFQResponse.findUnique({
      where: { id },
      include: {
        items: true
      }
    });
    
    if (!response) {
      throw new ApiError(404, 'RFQ response not found');
    }
    
    if (user.role !== 'ADMIN') {
      const rfq = await prisma.rFQ.findUnique({
        where: { id: response.rfqId },
        select: { buyerId: true }
      });
      
      if (!rfq || rfq.buyerId !== user.id) {
        throw new ApiError(403, 'Access denied');
      }
    }
    
    const updateData = {};
    
    if (data.totalAmount !== undefined) {
      updateData.totalAmount = parseFloat(data.totalAmount);
    }
    
    if (data.currency !== undefined) {
      updateData.currency = data.currency;
    }
    
    if (data.validity !== undefined) {
      updateData.validity = data.validity ? new Date(data.validity) : null;
    }
    
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    
    if (data.adminNotes !== undefined) {
      updateData.adminNotes = data.adminNotes;
    }
    
    const updated = await prisma.rFQResponse.update({
      where: { id },
      data: updateData,
      include: {
        rfq: {
          include: {
            buyer: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            companyName: true,
            country: true,
            city: true
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
      }
    });
    
    if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      await Promise.all(
        data.items.map(async item => {
          const existingItem = response.items.find(i => i.id === item.id);
          if (!existingItem) return;
          
          const editPrice = item.editedUnitPrice !== undefined ? parseFloat(item.editedUnitPrice) : existingItem.unitPrice;
          const margin = item.margin !== undefined ? parseFloat(item.margin) : 0;
          const finalUnitPrice = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : 
            (editPrice * (1 + margin / 100));
          const quantity = parseFloat(existingItem.quantity) || 1;
          const finalTotalPrice = item.totalPrice !== undefined ? parseFloat(item.totalPrice) :
            (finalUnitPrice * quantity);
          
          return prisma.rFQResponseItem.update({
            where: { id: item.id },
            data: {
              unitPrice: finalUnitPrice,
              totalPrice: finalTotalPrice
            }
          });
        })
      );
      
      const updatedWithItems = await prisma.rFQResponse.findUnique({
        where: { id },
        include: {
          rfq: {
            include: {
              buyer: {
                select: {
                  id: true,
                  email: true,
                  fullName: true
                }
              }
            }
          },
          supplier: {
            select: {
              id: true,
              companyName: true,
              country: true,
              city: true
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
        }
      });
      
      return updatedWithItems;
    }
    
    return updated;
  } catch (error) {
    logger.error('Update RFQ response service error:', error);
    throw error;
  }
};

export const createRFQResponseService = async (rfqId, userId, data) => {
  let isUpdate = false;
  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        userId,
        deletedAt: null
      },
      select: { id: true }
    });

    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }

    const rfq = await prisma.rFQ.findUnique({
      where: {
        id: rfqId
      },
      include: {
        items: true
      }
    });
    
    if (!rfq || rfq.deletedAt) {
      throw new ApiError(404, 'RFQ not found');
    }
    
    // Check for existing response from this supplier (one quotation per supplier per RFQ)
    const existingResponse = await prisma.rFQResponse.findFirst({
      where: {
        rfqId,
        supplierId: supplier.id
      },
      include: {
        items: true
      }
    });

    // Only one quotation per supplier per RFQ unless status is NEGOTIATION_REQUESTED (use resubmit endpoint)
    if (existingResponse && existingResponse.status === 'NEGOTIATION_REQUESTED') {
      throw new ApiError(400, 'Please use the resubmit quotation endpoint to submit your revised quote.');
    }
    
    // If response exists, check if it's editable and UPDATE instead of creating
    if (existingResponse) {
      // Non-editable statuses: once sent to buyer or accepted, cannot edit
      const nonEditableStatuses = ['SENT_TO_BUYER', 'BUYER_ACCEPTED', 'BUYER_REJECTED'];
      
      if (nonEditableStatuses.includes(existingResponse.status)) {
        throw new ApiError(400, `Cannot edit quotation. Current status: ${existingResponse.status}. This quotation has already been sent to the buyer.`);
      }

      // If editable, update the existing response instead of creating new one
      logger.info(`Updating existing RFQ response ${existingResponse.id} for RFQ ${rfqId}, Supplier ${supplier.id}`);

      const totalAmount = data.totalAmount || data.items.reduce((sum, item) => {
        const price = parseFloat(item.unitPrice || item.price) || 0;
        const quantity = parseFloat(item.quantity) || 0;
        const itemTotal = parseFloat(item.totalPrice) || (price * quantity);
        return sum + itemTotal;
      }, 0);

      // Delete old items
      await prisma.rFQResponseItem.deleteMany({
        where: { rfqResponseId: existingResponse.id }
      });

      // Update response with new data
      const updatedResponse = await prisma.rFQResponse.update({
        where: { id: existingResponse.id },
        data: {
          totalAmount,
          supplierPrice: totalAmount,
          currency: data.currency || existingResponse.currency || 'USD',
          validity: data.validity ? new Date(data.validity) : existingResponse.validity,
          notes: data.notes !== undefined ? data.notes : existingResponse.notes,
          // Reset status to SUBMITTED if it was DRAFT or keep current if already SUBMITTED/UNDER_REVIEW
          status: existingResponse.status === 'DRAFT' ? 'SUBMITTED' : existingResponse.status,
          items: {
            create: data.items.map((item, index) => {
              const rfqItem = rfq.items[index] || rfq.items.find(i => i.id === item.rfqItemId);
              const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
              const quantity = parseFloat(item.quantity) || 1;
              const totalPrice = parseFloat(item.totalPrice) || (unitPrice * quantity);
              
              return {
                rfqItemId: item.rfqItemId || rfqItem?.id || null,
                productId: item.productId || null,
                productName: item.productName || rfqItem?.productName || 'Product',
                quantity: item.quantity?.toString() || rfqItem?.quantity?.toString() || '1',
                unit: item.unit || rfqItem?.unit || 'units',
                unitPrice: unitPrice,
                totalPrice: totalPrice,
                leadTime: item.leadTime || (item.deliveryDays ? `${item.deliveryDays} days` : null),
                notes: item.notes || null
              };
            })
          }
        },
        include: {
          rfq: {
            include: {
              buyer: {
                select: {
                  id: true,
                  email: true,
                  fullName: true
                }
              }
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
      });

      // Update RFQ status to RESPONDED if not already
      if (rfq.status !== 'RESPONDED') {
        await prisma.rFQ.update({
          where: { id: rfqId },
          data: { status: 'RESPONDED' }
        });
      }

      // Create history entry and admin notification for update (only if status changed to SUBMITTED)
      if (existingResponse.status === 'DRAFT' && updatedResponse.status === 'SUBMITTED') {
        await createRFQHistoryEntry({
          rfqId,
          responseId: updatedResponse.id,
          actorRole: 'VENDOR',
          actorId: supplier.id,
          action: 'SUPPLIER_SUBMITTED',
          note: data.notes || null
        });
        const rfq = await prisma.rFQ.findUnique({ where: { id: rfqId }, select: { title: true } });
        await createAdminNotifications({
          title: 'Supplier submitted quotation',
          message: `A supplier submitted a quotation for RFQ "${rfq?.title || 'RFQ'}".`,
          link: `/rfq/${rfqId}`,
          type: 'SUPPLIER_SUBMITTED'
        });
      }

      logger.info(`RFQ response updated: ${updatedResponse.id} for RFQ ${rfqId}, Supplier ${supplier.id}`);

      // Mark as update and attach flag
      updatedResponse._isUpdate = true;
      return updatedResponse;
    }
    
    const totalAmount = data.totalAmount || data.items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice || item.price) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const itemTotal = parseFloat(item.totalPrice) || (price * quantity);
      return sum + itemTotal;
    }, 0);

    const response = await prisma.rFQResponse.create({
      data: {
        rfqId,
        supplierId: supplier.id,
        totalAmount,
        supplierPrice: totalAmount,
        currency: data.currency || 'USD',
        validity: data.validity ? new Date(data.validity) : null,
        notes: data.notes || null,
        status: data.status || 'SUBMITTED',
        items: {
          create: data.items.map((item, index) => {
            const rfqItem = rfq.items[index] || rfq.items.find(i => i.id === item.rfqItemId);
            const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
            const quantity = parseFloat(item.quantity) || 1;
            const totalPrice = parseFloat(item.totalPrice) || (unitPrice * quantity);
            
            return {
              rfqItemId: item.rfqItemId || rfqItem?.id || null,
              productId: item.productId || null,
              productName: item.productName || rfqItem?.productName || 'Product',
              quantity: item.quantity?.toString() || rfqItem?.quantity?.toString() || '1',
              unit: item.unit || rfqItem?.unit || 'units',
              unitPrice: unitPrice,
              totalPrice: totalPrice,
              leadTime: item.leadTime || (item.deliveryDays ? `${item.deliveryDays} days` : null),
              notes: item.notes || null
            };
          })
        }
      },
      include: {
        rfq: {
          include: {
            buyer: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
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
    });

    await prisma.rFQ.update({
      where: { id: rfqId },
      data: { status: 'RESPONDED' }
    });

    // SUPPLIER_SUBMITTED history
    await createRFQHistoryEntry({
      rfqId,
      responseId: response.id,
      actorRole: 'VENDOR',
      actorId: supplier.id,
      action: 'SUPPLIER_SUBMITTED',
      note: data.notes || null
    });

    await createAdminNotifications({
      title: 'Supplier submitted quotation',
      message: `A supplier submitted a quotation for RFQ "${response.rfq?.title || 'RFQ'}".`,
      link: `/rfq/${rfqId}`,
      type: 'SUPPLIER_SUBMITTED'
    });

    return response;
  } catch (error) {
    logger.error('Create RFQ response service error:', error);
    throw error;
  }
};

export const getMyRFQResponsesService = async (userId) => {
  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        userId,
        deletedAt: null
      },
      select: { id: true }
    });

    // Return empty array if supplier not found (instead of 404)
    if (!supplier) {
      return [];
    }

    const responses = await prisma.rFQResponse.findMany({
      where: {
        supplierId: supplier.id,
        rfq: {
          deletedAt: null
        }
      },
      include: {
        rfq: {
          select: {
            id: true,
            title: true,
            status: true,
            expiresAt: true,
            buyer: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            },
            items: {
              select: {
                id: true,
                productName: true,
                quantity: true,
                unit: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            companyName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const marginPercentVal = (r) => (r.marginPercent != null ? parseFloat(r.marginPercent.toString()) : 0);
    const buyerRequested = (r) => (r.buyerRequestedPrice != null ? parseFloat(r.buyerRequestedPrice.toString()) : null);
    return responses.map((r) => {
      const plain = { ...r };
      delete plain.marginPercent;
      delete plain.adminFinalPrice;
      const buyerReq = buyerRequested(r);
      const marginPct = marginPercentVal(r);
      if (buyerReq != null && marginPct > 0) {
        plain.requestedPrice = buyerReq / (1 + marginPct / 100);
      } else if (buyerReq != null) {
        plain.requestedPrice = buyerReq;
      }
      if (plain.requestedPrice != null) {
        delete plain.buyerRequestedPrice;
      }
      // Alias for supplier-facing UI: target price they are asked to meet (never expose buyer's number)
      if (plain.requestedPrice != null) {
        plain.requestedSupplierPrice = plain.requestedPrice;
      }
      // Ensure supplier always sees: supplierPrice, requestedSupplierPrice, supplierCounterPrice, status (already on plain)
      return plain;
    });
  } catch (error) {
    logger.error('Get my RFQ responses service error:', error);
    throw error;
  }
};

export const checkSupplierQuotationStatus = async (rfqId, supplierId) => {
  try {
    const response = await prisma.rFQResponse.findFirst({
      where: {
        rfqId,
        supplierId
      },
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    });

    return response || null;
  } catch (error) {
    logger.error('Check supplier quotation status error:', error);
    throw error;
  }
};

export const reviewSupplierQuotationService = async (id, user, action, adminNotes = null) => {
  try {
    if (user.role !== 'ADMIN') {
      throw new ApiError(403, 'Only admins can review quotations');
    }

    logger.info(`Reviewing quotation ID: ${id}, Action: ${action}`);

    const response = await prisma.rFQResponse.findUnique({
      where: { id },
      include: {
        rfq: true,
        supplier: true,
        items: true
      }
    });

    if (!response) {
      logger.error(`Quotation not found: ${id}`);
      throw new ApiError(404, 'Quotation not found');
    }

    const allowedStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'CONFIRMED', 'ACCEPTED', 'SENT_TO_BUYER', 'BUYER_ACCEPTED'];
    if (!allowedStatuses.includes(response.status)) {
      logger.error(`Invalid status for review: ${response.status} (ID: ${id})`);
      throw new ApiError(400, `Quotation cannot be reviewed. Current status: ${response.status}. Allowed statuses: ${allowedStatuses.join(', ')}`);
    }

    if (action === 'APPROVE') {
      // If quotation is already CONFIRMED or beyond, only update admin notes
      if (['CONFIRMED', 'BUYER_ACCEPTED', 'SENT_TO_BUYER'].includes(response.status)) {
        const updated = await prisma.rFQResponse.update({
          where: { id },
          data: {
            adminNotes: adminNotes || response.adminNotes
          },
          include: {
            rfq: true,
            supplier: true,
            items: true
          }
        });
        logger.info(`Quotation ${id} admin notes updated (status: ${response.status})`);
        return updated;
      }

      const updated = await prisma.rFQResponse.update({
        where: { id },
        data: {
          status: 'ACCEPTED',
          adminNotes: adminNotes || null
        },
        include: {
          rfq: true,
          supplier: true,
          items: true
        }
      });

      const finalTotal = parseFloat(updated.totalAmount) || updated.items.reduce((sum, item) => {
        return sum + (parseFloat(item.totalPrice) || 0);
      }, 0);

      await prisma.rFQ.update({
        where: { id: response.rfqId },
        data: {
          selectedQuotationId: id,
          status: 'QUOTED'
        }
      });

      // ADMIN_APPROVED history
      await createRFQHistoryEntry({
        rfqId: response.rfqId,
        responseId: updated.id,
        actorRole: 'ADMIN',
        actorId: user.id,
        action: 'ADMIN_APPROVED',
        note: adminNotes || null
      });

      logger.info(`Quotation ${id} approved successfully. RFQ ${response.rfqId} updated with selected quotation and payment status.`);
      return updated;
    } else if (action === 'REJECT') {
      if (['CONFIRMED', 'BUYER_ACCEPTED'].includes(response.status)) {
        throw new ApiError(400, `Cannot reject quotation with status: ${response.status}. Order has already been confirmed and payment processed.`);
      }

      const updated = await prisma.rFQResponse.update({
        where: { id },
        data: {
          status: 'REJECTED',
          adminNotes: adminNotes || null
        },
        include: {
          rfq: true,
          supplier: true,
          items: true
        }
      });

      logger.info(`Quotation ${id} rejected successfully`);
      return updated;
    } else {
      throw new ApiError(400, 'Invalid action. Use APPROVE or REJECT');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error(`Review quotation service error [${error.statusCode}]:`, error.message);
      throw error;
    }
    logger.error('Review supplier quotation service unexpected error:', error);
    throw error;
  }
};

export const resubmitQuotationService = async (id, userId, data) => {
  try {
    const supplier = await prisma.supplier.findFirst({
      where: {
        userId,
        deletedAt: null
      },
      select: { id: true }
    });

    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }

    const existingResponse = await prisma.rFQResponse.findUnique({
      where: { id },
      include: {
        rfq: {
          include: {
            items: true
          }
        },
        items: true
      }
    });

    if (!existingResponse) {
      throw new ApiError(404, 'Quotation not found');
    }

    if (existingResponse.supplierId !== supplier.id) {
      throw new ApiError(403, 'You can only resubmit your own quotations');
    }

    const resubmitAllowed = ['REJECTED', 'SENT_BACK_TO_SUPPLIER'];
    if (!resubmitAllowed.includes(existingResponse.status)) {
      throw new ApiError(400, `Cannot resubmit quotation with status: ${existingResponse.status}. Only REJECTED or SENT_BACK_TO_SUPPLIER quotations can be resubmitted.`);
    }

    const totalAmount = data.totalAmount || data.items.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice || item.price) || 0;
      const quantity = parseFloat(item.quantity) || 0;
      const itemTotal = parseFloat(item.totalPrice) || (price * quantity);
      return sum + itemTotal;
    }, 0);

    // Delete old items
    await prisma.rFQResponseItem.deleteMany({
      where: { rfqResponseId: id }
    });

    // Update response with new data
    const updated = await prisma.rFQResponse.update({
      where: { id },
      data: {
        totalAmount,
        currency: data.currency || existingResponse.currency || 'USD',
        validity: data.validity ? new Date(data.validity) : existingResponse.validity,
        notes: data.notes !== undefined ? data.notes : existingResponse.notes,
        status: 'SUBMITTED',
        adminNotes: null,
        items: {
          create: data.items.map((item, index) => {
            const rfqItem = existingResponse.rfq.items[index] || existingResponse.rfq.items.find(i => i.id === item.rfqItemId);
            const unitPrice = parseFloat(item.unitPrice || item.price) || 0;
            const quantity = parseFloat(item.quantity) || 1;
            const totalPrice = parseFloat(item.totalPrice) || (unitPrice * quantity);
            
            return {
              rfqItemId: item.rfqItemId || rfqItem?.id || null,
              productId: item.productId || null,
              productName: item.productName || rfqItem?.productName || 'Product',
              quantity: item.quantity?.toString() || rfqItem?.quantity?.toString() || '1',
              unit: item.unit || rfqItem?.unit || 'units',
              unitPrice: unitPrice,
              totalPrice: totalPrice,
              leadTime: item.leadTime || (item.deliveryDays ? `${item.deliveryDays} days` : null),
              notes: item.notes || null
            };
          })
        }
      },
      include: {
        rfq: {
          include: {
            buyer: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            }
          }
        },
        supplier: {
          select: {
            id: true,
            companyName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    logger.info(`Quotation ${id} resubmitted successfully by supplier ${supplier.id}`);
    return updated;
  } catch (error) {
    logger.error('Resubmit quotation service error:', error);
    throw error;
  }
};

export const sendQuotationToBuyerService = async (id, user, editedData = null) => {
  try {
    if (user.role !== 'ADMIN') {
      throw new ApiError(403, 'Only admins can send quotations to buyers');
    }

    const response = await prisma.rFQResponse.findFirst({
      where: {
        id
      },
      include: {
        rfq: {
          include: {
            buyer: true
          }
        },
        supplier: true,
        items: true
      }
    });

    if (!response) {
      throw new ApiError(404, 'Quotation not found');
    }

    const allowedStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED'];
    const allowedWithSupplierCounter = (response.status === 'SENT_BACK_TO_SUPPLIER' || response.status === 'SUPPLIER_COUNTER_OFFER') && (response.supplierNegotiationResponse === 'COUNTER' || response.supplierNegotiationResponse === 'COUNTERED');
    if (!allowedStatuses.includes(response.status) && !allowedWithSupplierCounter) {
      throw new ApiError(400, `Cannot send quotation. Current status: ${response.status}. Only ${allowedStatuses.join(', ')} or supplier-countered quotations can be sent to buyer.`);
    }

    const supplierPriceVal = response.supplierPrice != null ? parseFloat(response.supplierPrice.toString()) : (response.totalAmount != null ? parseFloat(response.totalAmount.toString()) : 0);
    const marginPct = editedData?.marginPercent != null ? parseFloat(editedData.marginPercent) : (response.marginPercent != null ? parseFloat(response.marginPercent.toString()) : 0);

    let finalTotalAmount;
    if (allowedWithSupplierCounter && response.supplierCounterPrice != null && !editedData?.totalAmount) {
      const supplierCounter = parseFloat(response.supplierCounterPrice.toString());
      finalTotalAmount = marginPct > 0 ? supplierCounter * (1 + marginPct / 100) : supplierCounter;
    } else if (editedData?.totalAmount != null) {
      finalTotalAmount = parseFloat(editedData.totalAmount);
    } else if (marginPct > 0 && supplierPriceVal > 0) {
      finalTotalAmount = supplierPriceVal * (1 + marginPct / 100);
    } else {
      finalTotalAmount = response.adminFinalPrice ? parseFloat(response.adminFinalPrice.toString()) : supplierPriceVal;
    }

    // Map items - handle both edited items (with finalUnitPrice/finalTotalPrice) and original items
    const itemsToCreate = editedData?.items 
      ? editedData.items.map(item => ({
          productId: item.productId || null,
          productName: item.productName || item.product || 'Unknown Product',
          quantity: item.quantity?.toString() || item.qty?.toString() || '0',
          unit: item.unit || null,
          unitPrice: item.finalUnitPrice || item.unitPrice || item.editedUnitPrice || 0,
          totalPrice: item.finalTotalPrice || item.totalPrice || item.price || 0,
          leadTime: item.leadTime?.toString() || null,
          notes: item.notes || null
        }))
      : response.items.map(item => ({
          productId: item.productId || null,
          productName: item.productName || 'Unknown Product',
          quantity: item.quantity?.toString() || '0',
          unit: item.unit || null,
          unitPrice: item.unitPrice ? parseFloat(item.unitPrice.toString()) : 0,
          totalPrice: item.totalPrice ? parseFloat(item.totalPrice.toString()) : 0,
          leadTime: item.leadTime?.toString() || null,
          notes: item.notes || null
        }));

    // Check if BuyerQuotation already exists for this RFQResponse
    const existingBuyerQuotation = await prisma.buyerQuotation.findUnique({
      where: { rfqResponseId: id }
    });

    let buyerQuotation;
    if (existingBuyerQuotation) {
      // Update existing BuyerQuotation
      await prisma.buyerQuotationItem.deleteMany({
        where: { buyerQuotationId: existingBuyerQuotation.id }
      });

      buyerQuotation = await prisma.buyerQuotation.update({
        where: { id: existingBuyerQuotation.id },
        data: {
          totalAmount: finalTotalAmount,
          currency: editedData?.currency || response.currency || 'USD',
          validity: editedData?.validity ? new Date(editedData.validity) : response.validity,
          notes: editedData?.notes || response.notes,
          items: {
            create: itemsToCreate
          }
        },
        include: {
          rfq: true,
          buyer: true,
          supplier: true,
          items: true
        }
      });
    } else {
      // Create new BuyerQuotation
      buyerQuotation = await prisma.buyerQuotation.create({
        data: {
          rfqResponseId: id,
          rfqId: response.rfqId,
          buyerId: response.rfq.buyerId,
          supplierId: response.supplierId,
          totalAmount: finalTotalAmount,
          currency: editedData?.currency || response.currency || 'USD',
          validity: editedData?.validity ? new Date(editedData.validity) : response.validity,
          notes: editedData?.notes || response.notes,
          items: {
            create: itemsToCreate
          }
        },
        include: {
          rfq: true,
          buyer: true,
          supplier: true,
          items: true
        }
      });
    }

    const updatePayload = {
      status: 'SENT_TO_BUYER',
      adminFinalPrice: finalTotalAmount,
      adminNotes: editedData?.adminNotes || response.adminNotes,
      sentToBuyerAt: new Date()
    };
    if (response.supplierPrice == null && supplierPriceVal > 0) {
      updatePayload.supplierPrice = supplierPriceVal;
    }
    if (editedData?.marginPercent != null) {
      updatePayload.marginPercent = parseFloat(editedData.marginPercent);
    }
    await prisma.rFQResponse.update({
      where: { id },
      data: updatePayload
    });

    // Update RFQ to set selectedQuotationId and status to QUOTED
    await prisma.rFQ.update({
      where: { id: response.rfqId },
      data: {
        selectedQuotationId: id,
        status: 'QUOTED'
      }
    });

    // SENT_TO_BUYER history
    await createRFQHistoryEntry({
      rfqId: response.rfqId,
      responseId: id,
      actorRole: 'ADMIN',
      actorId: user.id,
      action: 'SENT_TO_BUYER',
      note: editedData?.adminNotes || null
    });

    // Create notification for buyer
    try {
      await prisma.notification.create({
        data: {
          userId: response.rfq.buyerId,
          type: 'QUOTATION_RECEIVED',
          title: 'New Quotation Received',
          message: `A quotation has been sent for your RFQ: ${response.rfq.title || response.rfq.id}`,
          link: `/my-rfqs/${response.rfqId}`,
          isRead: false
        }
      });
    } catch (notifError) {
      logger.warn('Failed to create notification for buyer:', notifError);
    }

    logger.info(`Quotation sent to buyer: RFQ ${response.rfqId}, Buyer ${response.rfq.buyerId}`);

    return buyerQuotation;
  } catch (error) {
    logger.error('Send quotation to buyer service error:', error);
    throw error;
  }
};

export const sendBackToSupplierService = async (id, user) => {
  if (user.role !== 'ADMIN' && !['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN'].includes(user.role)) {
    throw new ApiError(403, 'Only admins can send quotations back to supplier');
  }

  const response = await prisma.rFQResponse.findUnique({
    where: { id },
    include: { rfq: true, supplier: true }
  });

  if (!response) {
    throw new ApiError(404, 'Quotation not found');
  }

  if (response.status !== 'REVISION_REQUESTED' && response.status !== 'NEGOTIATION_REQUESTED') {
    throw new ApiError(400, `Cannot send back. Current status: ${response.status}. Only REVISION_REQUESTED or NEGOTIATION_REQUESTED quotations can be sent back to supplier.`);
  }

  const updated = await prisma.rFQResponse.update({
    where: { id },
    data: { status: 'SENT_BACK_TO_SUPPLIER' },
    include: {
      rfq: { select: { id: true, title: true } },
      supplier: { select: { id: true, companyName: true } },
      items: true
    }
  });

  logger.info(`Quotation ${id} sent back to supplier ${response.supplierId} by admin ${user.id}`);
  return updated;
};

export const sendNegotiationToSupplierService = async (id, user) => {
  if (user.role !== 'ADMIN' && !['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN'].includes(user.role)) {
    throw new ApiError(403, 'Only admins can send negotiation to supplier');
  }

  const response = await prisma.rFQResponse.findUnique({
    where: { id },
    include: { rfq: true, supplier: true }
  });

  if (!response) {
    throw new ApiError(404, 'Quotation not found');
  }
  const allowedStatus = 'NEGOTIATION_REQUESTED';
  if (response.status !== allowedStatus) {
    throw new ApiError(400, `Cannot send negotiation to supplier. Current status: ${response.status}. Only NEGOTIATION_REQUESTED quotations can be forwarded.`);
  }
  if (response.buyerRequestedPrice == null) {
    throw new ApiError(400, 'No buyer requested price on this quotation.');
  }

  const updated = await prisma.rFQResponse.update({
    where: { id },
    data: { status: 'NEGOTIATION_SENT_TO_SUPPLIER' },
    include: {
      rfq: { select: { id: true, title: true } },
      supplier: { select: { id: true, companyName: true } },
      items: true
    }
  });

  try {
    await createRFQHistoryEntry({
      rfqId: response.rfqId,
      responseId: id,
      actorRole: 'ADMIN',
      actorId: user.id,
      action: 'NEGOTIATION_SENT_TO_SUPPLIER',
      note: 'Negotiation sent to supplier (buyer requested price forwarded)'
    });
  } catch (historyErr) {
    logger.warn('RFQ history entry failed (non-fatal)', { error: historyErr?.message, responseId: id });
  }

  logger.info(`Negotiation sent to supplier for quotation ${id} by admin ${user.id}`);
  return updated;
};

export const submitNegotiationResponseService = async (responseId, userId, data) => {
  const supplier = await prisma.supplier.findFirst({
    where: { userId, deletedAt: null },
    select: { id: true }
  });
  if (!supplier) {
    throw new ApiError(403, 'Supplier profile not found');
  }

  const response = await prisma.rFQResponse.findUnique({
    where: { id: responseId },
    include: { rfq: true }
  });
  if (!response) {
    throw new ApiError(404, 'Quotation not found');
  }
  if (response.supplierId !== supplier.id) {
    throw new ApiError(403, 'You can only respond to your own quotation');
  }
  const allowedStatuses = ['SENT_BACK_TO_SUPPLIER', 'NEGOTIATION_SENT_TO_SUPPLIER'];
  if (!allowedStatuses.includes(response.status)) {
    throw new ApiError(400, `Cannot submit negotiation response. Current status: ${response.status}. Quotation must be sent to supplier for negotiation.`);
  }
  const buyerRequested = response.buyerRequestedPrice != null;
  if (!buyerRequested) {
    throw new ApiError(400, 'This quotation has no buyer price request to respond to.');
  }

  const action = (data.action || '').toUpperCase();
  if (!['ACCEPT', 'COUNTER', 'REJECT'].includes(action)) {
    throw new ApiError(400, 'action must be ACCEPT, COUNTER, or REJECT');
  }

  if (response.supplierNegotiationResponse) {
    throw new ApiError(400, 'You have already submitted a negotiation response.');
  }

  const updateData = { supplierNegotiationResponse: action };

  if (action === 'ACCEPT') {
    updateData.adminFinalPrice = response.buyerRequestedPrice;
    updateData.status = 'ACCEPTED';
  } else if (action === 'COUNTER') {
    const counterPrice = data.counterPrice != null ? parseFloat(data.counterPrice) : null;
    if (counterPrice == null || isNaN(counterPrice) || counterPrice <= 0) {
      throw new ApiError(400, 'counterPrice is required and must be a positive number for counter offer');
    }
    updateData.supplierCounterPrice = counterPrice;
    updateData.status = 'SUPPLIER_COUNTER_OFFER';
  } else if (action === 'REJECT') {
    updateData.status = 'REJECTED';
  }

  const updated = await prisma.rFQResponse.update({
    where: { id: responseId },
    data: updateData,
    include: {
      rfq: { select: { id: true, title: true } },
      supplier: { select: { id: true, companyName: true } },
      items: true
    }
  });

  await createRFQHistoryEntry({
    rfqId: response.rfqId,
    responseId,
    actorRole: 'VENDOR',
    actorId: userId,
    action: 'SUPPLIER_NEGOTIATION_RESPONSE',
    note: action === 'COUNTER' ? `Counter: ${updateData.supplierCounterPrice}` : action
  });

  if (action === 'COUNTER') {
    await createAdminNotifications({
      title: 'Supplier counter offered',
      message: `A supplier sent a counter offer for RFQ "${updated.rfq?.title || 'RFQ'}".`,
      link: `/quotations`,
      type: 'SUPPLIER_COUNTER_OFFER'
    });
  }

  logger.info(`Negotiation response ${action} for quotation ${responseId} by supplier ${supplier.id}`);
  return updated;
};
