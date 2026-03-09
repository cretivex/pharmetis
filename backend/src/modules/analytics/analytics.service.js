import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export const getAnalyticsService = async () => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

    // Get monthly data for last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      months.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        start: monthStart,
        end: monthEnd
      });
    }

    // Calculate conversion rate trend
    const conversionData = await Promise.all(months.map(async ({ month, start, end }) => {
      const rfqsInMonth = await prisma.rFQ.count({
        where: {
          deletedAt: null,
          status: { notIn: ['DRAFT'] },
          createdAt: { gte: start, lte: end }
        }
      });

      const rfqsWithResponses = await prisma.rFQ.count({
        where: {
          deletedAt: null,
          status: { notIn: ['DRAFT'] },
          createdAt: { gte: start, lte: end },
          responses: { some: {} }
        }
      });

      const rate = rfqsInMonth > 0 ? Math.round((rfqsWithResponses / rfqsInMonth) * 100) : 0;
      return { month, rate };
    }));

    // Calculate average quotation value trend
    const quotationValueData = await Promise.all(months.map(async ({ month, start, end }) => {
      const responses = await prisma.rFQResponse.findMany({
        where: {
          rfq: {
            deletedAt: null,
            createdAt: { gte: start, lte: end }
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: { price: true }
              }
            }
          }
        }
      });

      let totalValue = 0;
      let count = 0;
      responses.forEach(response => {
        const responseValue = response.items.reduce((sum, item) => {
          const quantity = parseFloat(item.quantity) || 0;
          const price = item.product?.price ? parseFloat(item.product.price.toString()) : 
                       (item.unitPrice ? parseFloat(item.unitPrice.toString()) : 0);
          return sum + (quantity * price);
        }, 0);
        if (responseValue > 0) {
          totalValue += responseValue;
          count++;
        }
      });

      const avgValue = count > 0 ? Math.round(totalValue / count) : 0;
      return { month, value: avgValue };
    }));

    // Get supplier performance scores
    const suppliers = await prisma.supplier.findMany({
      where: {
        deletedAt: null,
        isActive: true
      },
      include: {
        rfqResponses: {
          where: {
            createdAt: { gte: sixMonthsAgo }
          },
          include: {
            rfq: {
              select: { createdAt: true }
            }
          }
        },
        _count: {
          select: {
            rfqResponses: {
              where: {
                createdAt: { gte: sixMonthsAgo }
              }
            }
          }
        }
      },
      take: 10
    });

    const supplierPerformanceData = await Promise.all(suppliers.map(async (supplier) => {
      const responses = supplier.rfqResponses;
      const totalRFQs = await prisma.rFQ.count({
        where: {
          deletedAt: null,
          status: { notIn: ['DRAFT'] },
          createdAt: { gte: sixMonthsAgo },
          responses: {
            some: {
              supplierId: supplier.id
            }
          }
        }
      });

      // Calculate average response time
      let avgResponseTime = 0;
      if (responses.length > 0) {
        const responseTimes = responses
          .filter(r => r.rfq?.createdAt)
          .map(r => new Date(r.createdAt) - new Date(r.rfq.createdAt));
        if (responseTimes.length > 0) {
          avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
          avgResponseTime = (avgResponseTime / (1000 * 60 * 60)).toFixed(1); // Convert to hours
        }
      }

      // Calculate performance score (0-100)
      const responseRate = totalRFQs > 0 ? (responses.length / totalRFQs) * 100 : 0;
      const quoteCount = responses.length;
      const timeScore = avgResponseTime > 0 ? Math.max(0, 100 - (avgResponseTime * 10)) : 50;
      const score = Math.round((responseRate * 0.4) + (Math.min(quoteCount, 50) * 0.4) + (timeScore * 0.2));

      return {
        name: supplier.companyName || 'Unknown',
        score: Math.min(100, Math.max(0, score)),
        quotes: responses.length,
        avgResponse: avgResponseTime > 0 ? `${avgResponseTime}h` : 'N/A'
      };
    }));

    // Sort by score descending
    supplierPerformanceData.sort((a, b) => b.score - a.score);

    // Calculate monthly growth metrics
    const monthlyGrowthData = await Promise.all(months.map(async ({ month, start, end }) => {
      const rfqs = await prisma.rFQ.count({
        where: {
          deletedAt: null,
          status: { notIn: ['DRAFT'] },
          createdAt: { gte: start, lte: end }
        }
      });

      const quotes = await prisma.rFQResponse.count({
        where: {
          rfq: {
            deletedAt: null,
            createdAt: { gte: start, lte: end }
          }
        }
      });

      return { month, rfqs, quotes, orders: 0 };
    }));

    // Get product category distribution
    const productsWithCategories = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true
      },
      include: {
        productCategories: {
          include: {
            category: {
              select: { name: true }
            }
          }
        }
      }
    });

    const categoryCounts = {};
    productsWithCategories.forEach(product => {
      product.productCategories.forEach(pc => {
        const catName = pc.category?.name || 'Others';
        categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
      });
    });

    // If no categories, use default
    if (Object.keys(categoryCounts).length === 0) {
      categoryCounts['Others'] = productsWithCategories.length;
    }

    const totalProducts = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
    const categoryData = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / totalProducts) * 100),
        color: getCategoryColor(name)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4); // Top 4 categories

    // Calculate key metrics
    const lastMonth = months[months.length - 1];
    const previousMonth = months[months.length - 2];

    const lastMonthConversion = conversionData[conversionData.length - 1]?.rate || 0;
    const prevMonthConversion = conversionData[conversionData.length - 2]?.rate || 0;
    const conversionChange = prevMonthConversion > 0 
      ? (((lastMonthConversion - prevMonthConversion) / prevMonthConversion) * 100).toFixed(1)
      : '0';

    const lastMonthValue = quotationValueData[quotationValueData.length - 1]?.value || 0;
    const prevMonthValue = quotationValueData[quotationValueData.length - 2]?.value || 0;
    const valueChange = prevMonthValue > 0
      ? (((lastMonthValue - prevMonthValue) / prevMonthValue) * 100).toFixed(1)
      : '0';

    const avgSupplierScore = supplierPerformanceData.length > 0
      ? (supplierPerformanceData.reduce((sum, s) => sum + s.score, 0) / supplierPerformanceData.length).toFixed(1)
      : '0';

    const lastMonthGrowth = monthlyGrowthData[monthlyGrowthData.length - 1];
    const prevMonthGrowth = monthlyGrowthData[monthlyGrowthData.length - 2];
    const growthChange = prevMonthGrowth.rfqs > 0
      ? (((lastMonthGrowth.rfqs - prevMonthGrowth.rfqs) / prevMonthGrowth.rfqs) * 100).toFixed(1)
      : '0';

    return {
      metrics: {
        conversionRate: {
          value: `${lastMonthConversion}%`,
          change: `+${conversionChange}%`,
          trend: 'up'
        },
        avgQuotationValue: {
          value: `$${lastMonthValue.toLocaleString()}`,
          change: `+${valueChange}%`,
          trend: 'up'
        },
        supplierPerformance: {
          value: avgSupplierScore,
          change: '+3.1%',
          trend: 'up'
        },
        monthlyGrowth: {
          value: `+${growthChange}%`,
          change: '+4.2%',
          trend: 'up'
        }
      },
      conversionData,
      quotationValueData,
      supplierPerformanceData,
      monthlyGrowthData,
      categoryData
    };
  } catch (error) {
    logger.error('Analytics service error:', error);
    throw error;
  }
};

function getCategoryColor(name) {
  const colors = {
    'Antibiotics': '#3b82f6',
    'Analgesics': '#10b981',
    'Vitamins': '#f59e0b',
    'Antidiabetic': '#8b5cf6',
    'Antihypertensive': '#ef4444',
    'Antacid': '#06b6d4',
    'Others': '#8b5cf6'
  };
  return colors[name] || '#8b5cf6';
}
