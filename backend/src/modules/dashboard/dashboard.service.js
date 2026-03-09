import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export const getDashboardCountsService = async () => {
  try {
    logger.debug('Fetching dashboard counts...');
    
    // Active RFQs (OPEN, SENT, RESPONDED, QUOTED, etc. - not DRAFT, EXPIRED, CANCELLED)
    let rfqsCount = 0;
    try {
      rfqsCount = await prisma.rFQ.count({
        where: {
          deletedAt: null,
          status: {
            notIn: ['DRAFT', 'EXPIRED', 'CANCELLED']
          }
        }
      });
      logger.debug('RFQs count:', rfqsCount);
    } catch (error) {
      logger.error('Error counting RFQs:', error);
      // Continue with 0 if RFQ count fails
    }

    // Quotations pending review (SUBMITTED, UNDER_REVIEW)
    let quotationsCount = 0;
    try {
      quotationsCount = await prisma.rFQResponse.count({
        where: {
          status: {
            in: ['SUBMITTED', 'UNDER_REVIEW']
          },
          rfq: {
            deletedAt: null
          }
        }
      });
      logger.debug('Quotations count:', quotationsCount);
    } catch (error) {
      logger.error('Error counting quotations:', error);
      // Continue with 0 if quotations count fails
    }

    // Accepted quotations (BUYER_ACCEPTED, CONFIRMED) – visible in admin Quotations "Accepted" tab
    let acceptedQuotationsCount = 0;
    try {
      acceptedQuotationsCount = await prisma.rFQResponse.count({
        where: {
          status: {
            in: ['BUYER_ACCEPTED', 'CONFIRMED']
          },
          rfq: {
            deletedAt: null
          }
        }
      });
      logger.debug('Accepted quotations count:', acceptedQuotationsCount);
    } catch (error) {
      logger.error('Error counting accepted quotations:', error);
    }

    // Active suppliers
    let suppliersCount = 0;
    try {
      suppliersCount = await prisma.supplier.count({
        where: {
          deletedAt: null,
          isActive: true
        }
      });
      logger.debug('Suppliers count:', suppliersCount);
    } catch (error) {
      logger.error('Error counting suppliers:', error);
      // Continue with 0 if suppliers count fails
    }

    const result = {
      rfqs: rfqsCount || 0,
      quotations: quotationsCount || 0,
      acceptedQuotations: acceptedQuotationsCount || 0,
      suppliers: suppliersCount || 0
    };

    logger.debug('Dashboard counts result:', result);
    return result;
  } catch (error) {
    logger.error('Error fetching dashboard counts:', error);
    throw error;
  }
};

export const getDashboardStatsService = async () => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Active RFQs (not deleted, not DRAFT)
  const activeRFQsCount = await prisma.rFQ.count({
    where: {
      deletedAt: null,
      status: {
        notIn: ['DRAFT']
      }
    }
  });

  // Pipeline Value (sum of RFQ items values using actual product MRP)
  const rfqItemsWithProducts = await prisma.rFQItem.findMany({
    where: {
      rfq: {
        deletedAt: null,
        status: {
          notIn: ['DRAFT']
        }
      },
      productId: { not: null }
    },
    include: {
      product: {
        select: { price: true }
      }
    }
  });

  const pipelineValue = rfqItemsWithProducts.reduce((sum, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = item.product?.price ? parseFloat(item.product.price.toString()) : 0;
    return sum + (quantity * price);
  }, 0);

  // Expiring Soon (RFQs expiring in 7 days)
  const expiringSoonCount = await prisma.rFQ.count({
    where: {
      deletedAt: null,
      expiresAt: {
        gte: now,
        lte: sevenDaysFromNow
      },
      status: {
        notIn: ['DRAFT', 'EXPIRED']
      }
    }
  });

  // RFQs with no suppliers assigned (no responses)
  const rfqsWithNoSuppliers = await prisma.rFQ.count({
    where: {
      deletedAt: null,
      status: {
        notIn: ['DRAFT']
      },
      responses: {
        none: {}
      }
    }
  });

  // Quotations pending review (all RFQ responses - count as pending review)
  const pendingReviewCount = await prisma.rFQResponse.count({
    where: {
      rfq: {
        deletedAt: null,
        status: { notIn: ['DRAFT', 'EXPIRED'] }
      }
    }
  });

  // Suppliers inactive >30 days
  const inactiveSuppliersCount = await prisma.supplier.count({
    where: {
      deletedAt: null,
      isActive: true,
      updatedAt: {
        lt: thirtyDaysAgo
      }
    }
  });

  // Get active RFQs for table
  const activeRFQs = await prisma.rFQ.findMany({
    where: {
      deletedAt: null,
      status: {
        notIn: ['DRAFT']
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
              price: true
            }
          }
        }
      },
      responses: {
        select: {
          id: true
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
    take: 4
  });

  // Calculate RFQ values and format
  const formattedRFQs = activeRFQs.map(rfq => {
    const totalValue = rfq.items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = item.product?.price ? parseFloat(item.product.price.toString()) : 0;
      const itemValue = quantity * price;
      return sum + itemValue;
    }, 0);

    const expiresIn = rfq.expiresAt 
      ? Math.ceil((new Date(rfq.expiresAt) - now) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: rfq.id,
      buyer: rfq.buyer?.fullName || rfq.buyer?.email || 'Unknown',
      value: totalValue,
      suppliers: rfq._count.responses,
      responses: rfq._count.responses,
      expiresIn: expiresIn,
      status: rfq.status,
      createdAt: rfq.createdAt
    };
  });

  // Get supplier health data
  const suppliers = await prisma.supplier.findMany({
    where: {
      deletedAt: null,
      isActive: true
    },
    take: 4,
    orderBy: {
      updatedAt: 'desc'
    }
  });

  // Calculate supplier response rates
  const supplierResponseStats = await Promise.all(
    suppliers.map(async (supplier) => {
      // Count total RFQs (all active RFQs in system)
      const totalRFQs = await prisma.rFQ.count({
        where: {
          deletedAt: null,
          status: { notIn: ['DRAFT'] }
        }
      });

      // Count RFQ responses for this supplier
      const respondedRFQs = await prisma.rFQResponse.count({
        where: {
          supplierId: supplier.id,
          rfq: {
            deletedAt: null,
            status: { notIn: ['DRAFT'] }
          }
        }
      });

      const responseRate = totalRFQs > 0 
        ? ((respondedRFQs / totalRFQs) * 100).toFixed(1)
        : 0;

      const lastActive = supplier.updatedAt;
      const daysSinceUpdate = Math.ceil((now - new Date(lastActive)) / (1000 * 60 * 60 * 24));
      
      let lastActiveText = 'Today';
      if (daysSinceUpdate === 1) lastActiveText = '1 day ago';
      else if (daysSinceUpdate > 1) lastActiveText = `${daysSinceUpdate} days ago`;

      return {
        id: supplier.id,
        name: supplier.companyName || 'Unknown Supplier',
        status: daysSinceUpdate > 30 ? 'warning' : 'active',
        responseRate: parseFloat(responseRate),
        lastActive: lastActiveText
      };
    })
  );

  const formattedSuppliers = supplierResponseStats;

  // Calculate conversion rate (RFQs with responses / total RFQs)
  const totalRFQsWithResponses = await prisma.rFQ.count({
    where: {
      deletedAt: null,
      status: {
        notIn: ['DRAFT']
      },
      responses: {
        some: {}
      }
    }
  });

  const totalRFQs = await prisma.rFQ.count({
    where: {
      deletedAt: null,
      status: {
        notIn: ['DRAFT']
      }
    }
  });

  const conversionRate = totalRFQs > 0 
    ? ((totalRFQsWithResponses / totalRFQs) * 100).toFixed(1)
    : 0;

  // Calculate average quote response time from actual data
  let avgQuoteTime = '0h';
  try {
    const quoteResponses = await prisma.rFQResponse.findMany({
      where: {
        rfq: {
          deletedAt: null
        },
        createdAt: { not: null }
      },
      select: {
        createdAt: true,
        rfq: {
          select: {
            createdAt: true
          }
        }
      },
      take: 100
    });

    if (quoteResponses.length > 0) {
      const validResponses = quoteResponses.filter(r => r.rfq?.createdAt);
      if (validResponses.length > 0) {
        const totalResponseTime = validResponses.reduce((sum, response) => {
          const responseTime = new Date(response.createdAt) - new Date(response.rfq.createdAt);
          return sum + responseTime;
        }, 0);
        const avgResponseTimeMs = totalResponseTime / validResponses.length;
        const avgResponseTimeHours = (avgResponseTimeMs / (1000 * 60 * 60)).toFixed(1);
        avgQuoteTime = `${avgResponseTimeHours}h`;
      }
    }
  } catch (error) {
    logger.warn('Error calculating avg quote time:', error);
    avgQuoteTime = '0h';
  }

    return {
      kpis: {
        activeRFQs: activeRFQsCount || 0,
        pipelineValue: pipelineValue || 0,
        avgQuoteTime: avgQuoteTime || '0h',
        conversionRate: parseFloat(conversionRate) || 0,
        expiringSoon: expiringSoonCount || 0
      },
      urgencyAlerts: {
        expiring: expiringSoonCount || 0,
        noSuppliers: rfqsWithNoSuppliers || 0,
        pendingReview: pendingReviewCount || 0,
        inactive: inactiveSuppliersCount || 0
      },
      activeRFQs: formattedRFQs || [],
      financialMetrics: {
        totalPipeline: pipelineValue || 0,
        avgQuoteValue: activeRFQsCount > 0 ? (pipelineValue / activeRFQsCount) : 0,
        totalSavings: (pipelineValue || 0) * 0.1,
        conversionRate: parseFloat(conversionRate) || 0
      },
      supplierHealth: formattedSuppliers || []
    };
  } catch (error) {
    logger.error('Dashboard service error:', error);
    throw error;
  }
};

export const getDashboardMonitoringService = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let userActivityCount = 0;
    try {
      userActivityCount = await prisma.auditLog.count({
        where: { createdAt: { gte: twentyFourHoursAgo } }
      });
    } catch {
      // AuditLog table may not exist in older deployments
    }
    let pendingApprovals = 0;
    try {
      pendingApprovals = await prisma.rFQResponse.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
          rfq: { deletedAt: null }
        }
      });
    } catch (err) {
      logger.error('Error counting pending approvals:', err);
    }
    const systemLoad = 0; // Placeholder; os.loadavg() or external metrics
    const errorRate = 0; // Placeholder; wire to error log aggregation
    const dbConnectionCount = 0; // Placeholder; Prisma pool or pg stats
    const authFailures24h = 0; // Placeholder; auth failure log or table
    return {
      userActivityCount,
      pendingApprovals,
      systemLoad,
      errorRate,
      dbConnectionCount,
      authFailures24h,
    };
  } catch (error) {
    logger.error('Dashboard monitoring service error:', error);
    throw error;
  }
};
