import { Prisma } from '@prisma/client';
import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { parseMoqNumeric } from '../../utils/moq.js';

function toArray(val) {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

/** Public catalog: only safe Prisma order fields */
const PRODUCT_SORT_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'name',
  'price',
  'availability',
  'dosageForm',
  'moqNumeric',
]);

function resolveSortFromCatalogParam(filters) {
  const sortParam = filters.sort != null ? String(filters.sort) : null;
  const map = {
    relevance: { sortBy: 'createdAt', sortOrder: 'desc' },
    'price-low': { sortBy: 'price', sortOrder: 'asc' },
    'price-high': { sortBy: 'price', sortOrder: 'desc' },
    'moq-asc': { sortBy: 'moqNumeric', sortOrder: 'asc' },
    newest: { sortBy: 'createdAt', sortOrder: 'desc' },
    'name-asc': { sortBy: 'name', sortOrder: 'asc' },
    'name-desc': { sortBy: 'name', sortOrder: 'desc' },
    'rating-desc': { sortBy: 'createdAt', sortOrder: 'desc' },
  };
  if (sortParam && map[sortParam]) {
    return map[sortParam];
  }
  return {
    sortBy: filters.sortBy ?? 'createdAt',
    sortOrder: filters.sortOrder ?? 'desc',
  };
}

/** Map UI certification tokens to ProductCompliance flags (AND). */
function certificationsToComplianceWhere(certs) {
  const list = toArray(certs)
    .map((c) => String(c).trim().toUpperCase())
    .filter(Boolean);
  if (list.length === 0) return null;
  const complianceWhere = {};
  for (const c of list) {
    if (c === 'GMP' || c === 'WHO-GMP' || (c.includes('WHO') && c.includes('GMP'))) {
      complianceWhere.whoGmp = true;
    } else if (c === 'FDA') {
      complianceWhere.fda = true;
    } else if (c === 'ISO') {
      complianceWhere.iso = true;
    }
  }
  return Object.keys(complianceWhere).length ? complianceWhere : null;
}

export const getProductsService = async (filters = {}) => {
  const resolved = resolveSortFromCatalogParam(filters);
  const {
    search,
    dosageForm,
    availability,
    country,
    therapeuticAreas,
    manufacturer,
    categoryIds,
    category: categorySlug,
    certification,
    minPrice,
    maxPrice,
    moq: minMoqParam,
    page = 1,
    limit = 20,
  } = filters;

  let sortByRaw = resolved.sortBy;
  let sortOrderRaw = resolved.sortOrder;

  const sortBy = PRODUCT_SORT_FIELDS.has(String(sortByRaw)) ? String(sortByRaw) : 'createdAt';
  const sortOrder = String(sortOrderRaw).toLowerCase() === 'asc' ? 'asc' : 'desc';

  const where = {
    deletedAt: null,
    supplier: {
      isActive: true,
      deletedAt: null,
    },
  };

  // Public listing: active products only unless admin explicitly filters (e.g. vendor dashboard)
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive === 'true' || filters.isActive === true;
  } else {
    where.isActive = true;
  }

  const andClauses = [];

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { manufacturer: { contains: search, mode: 'insensitive' } },
      { composition: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { apiName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const dosageForms = toArray(dosageForm).filter(Boolean);
  if (dosageForms.length > 0) {
    where.dosageForm = dosageForms.length === 1 ? dosageForms[0] : { in: dosageForms };
  }

  const availabilities = toArray(availability).filter(Boolean);
  if (availabilities.length > 0) {
    where.availability = availabilities.length === 1 ? availabilities[0] : { in: availabilities };
  }

  const countries = toArray(country).filter(Boolean);
  if (countries.length > 0) {
    andClauses.push({
      OR: [
        { country: { in: countries } },
        {
          supplier: {
            country: { in: countries },
            deletedAt: null,
            isActive: true,
          },
        },
      ],
    })
  }

  const therapeutics = toArray(therapeuticAreas).filter(Boolean);
  if (therapeutics.length > 0) {
    andClauses.push({
      OR: therapeutics.map((t) => ({ therapeutics: { contains: t, mode: 'insensitive' } }))
    });
  }

  const manufacturers = toArray(manufacturer).filter(Boolean);
  if (manufacturers.length > 0) {
    andClauses.push({
      OR: [
        { manufacturer: { in: manufacturers } },
        {
          supplier: {
            manufacturer: { in: manufacturers },
            deletedAt: null,
            isActive: true,
          },
        },
      ],
    })
  }

  const categoryIdList = [...toArray(categoryIds).filter(Boolean)];

  if (categorySlug) {
    const cat = await prisma.category.findFirst({
      where: {
        slug: String(categorySlug),
        deletedAt: null,
        isActive: true,
      },
      select: { id: true },
    });
    if (cat) categoryIdList.push(cat.id);
  }

  if (categoryIdList.length > 0) {
    where.productCategories = {
      some: { categoryId: { in: [...new Set(categoryIdList)] } },
    };
  }

  const certList = toArray(certification).filter(Boolean);
  const complianceWhere = certificationsToComplianceWhere(certList);
  if (complianceWhere) {
    where.compliance = { is: complianceWhere };
  }

  const minP =
    minPrice !== undefined && minPrice !== '' && !Number.isNaN(parseFloat(minPrice))
      ? parseFloat(minPrice)
      : null;
  const maxP =
    maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(parseFloat(maxPrice))
      ? parseFloat(maxPrice)
      : null;
  if (minP != null || maxP != null) {
    where.price = {};
    if (minP != null) where.price.gte = new Prisma.Decimal(minP);
    if (maxP != null) where.price.lte = new Prisma.Decimal(maxP);
  }

  const minMoq =
    minMoqParam !== undefined && minMoqParam !== '' && !Number.isNaN(parseInt(String(minMoqParam), 10))
      ? parseInt(String(minMoqParam), 10)
      : null;
  if (minMoq != null) {
    where.moqNumeric = { not: null, gte: minMoq };
  }

  if (andClauses.length > 0) {
    where.AND = [...(where.AND || []), ...andClauses];
  }

  const pageNum = Math.max(1, parseInt(String(page), 10) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20))
  const skip = (pageNum - 1) * limitNum
  const take = limitNum

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            country: true,
            slug: true,
            therapeutics: true,
            manufacturer: true
          }
        },
        images: {
          take: 1,
          orderBy: { order: 'asc' }
        },
        compliance: true,
        productCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          },
          take: 1
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take
    }),
    prisma.product.count({ where })
  ]);

  return {
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 0,
    },
  }
};

export const getProductBySlugService = async (slug) => {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      deletedAt: null,
      isActive: true
    },
    include: {
      supplier: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          country: true,
          city: true,
          address: true,
          phone: true,
          website: true,
          description: true,
          therapeutics: true,
          manufacturer: true,
          yearsInBusiness: true,
          isVerified: true,
          isActive: true,
          logo: true,
          compliance: true,
          certifications: true,
          _count: {
            select: {
              products: {
                where: {
                  deletedAt: null,
                  isActive: true
                }
              }
            }
          }
        }
      },
      images: {
        orderBy: { order: 'asc' }
      },
      certifications: true,
      compliance: true,
      productCategories: {
        include: {
          category: true
        }
      }
    }
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

export const getProductByIdService = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      supplier: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          country: true,
          city: true,
          address: true,
          phone: true,
          website: true,
          description: true,
          therapeutics: true,
          manufacturer: true,
          yearsInBusiness: true,
          isVerified: true,
          isActive: true,
          logo: true,
          compliance: true,
          certifications: true,
          _count: {
            select: {
              products: {
                where: {
                  deletedAt: null,
                  isActive: true
                }
              }
            }
          }
        }
      },
      images: true,
      certifications: true,
      compliance: true,
      productCategories: {
        select: { categoryId: true }
      }
    }
  });

  if (!product || product.deletedAt) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

export const getFeaturedProductsService = async () => {
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      availability: 'IN_STOCK',
      supplier: {
        isActive: true,
        deletedAt: null,
      },
    },
    include: {
      supplier: {
        select: {
          id: true,
          companyName: true,
          country: true,
          slug: true
        }
      },
      images: {
        take: 1,
        orderBy: { order: 'asc' }
      },
      compliance: true
    },
    take: 12,
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products;
};

export const createProductService = async (data) => {
  const {
    supplierId,
    name,
    brand,
    strength,
    compareTo,
    ndcNumber,
    packSize,
    dosageForm,
    manufacturer,
    country,
    description,
    apiName,
    composition,
    therapeutics,
    packagingType,
    shelfLife,
    storageConditions,
    regulatoryApprovals,
    hsCode,
    moq,
    availability = 'IN_STOCK',
    price,
    moqNumeric: moqNumericIn,
    image_url,
    images = [],
    categoryIds = [],
  } = data;
  const normalizedImages = Array.isArray(images) && images.length > 0
    ? images
    : (image_url ? [{ url: image_url, alt: name, order: 0 }] : []);

  // Validate supplier exists
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true }
  });

  if (!supplier) {
    throw new ApiError(404, 'Supplier not found');
  }

  // Validate categories if provided
  if (categoryIds && categoryIds.length > 0) {
    const categories = await prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        deletedAt: null
      },
      select: { id: true }
    });

    if (categories.length !== categoryIds.length) {
      throw new ApiError(400, 'One or more categories not found');
    }
  }

  // Generate slug from name
  let baseSlug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Check for duplicate slug and append number if needed
  let finalSlug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        supplierId,
        slug: finalSlug,
        deletedAt: null
      },
      select: { id: true }
    });
    
    if (!existing) {
      break;
    }
    
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
    
    // Safety limit to prevent infinite loop
    if (counter > 1000) {
      finalSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  const product = await prisma.product.create({
    data: {
      supplierId,
      name,
      slug: finalSlug,
      brand,
      strength: strength || null,
      compareTo: compareTo || null,
      ndcNumber: ndcNumber || null,
      packSize: packSize || null,
      dosageForm,
      manufacturer,
      country,
      description,
      apiName,
      composition,
      therapeutics,
      packagingType,
      shelfLife,
      storageConditions,
      regulatoryApprovals,
      hsCode,
      moq,
      moqNumeric: moqNumericIn != null ? moqNumericIn : parseMoqNumeric(moq),
      availability,
      price: price ? parseFloat(price) : null,
      image_url: image_url || normalizedImages[0]?.url || null,
      images: {
        create: normalizedImages.map((img, index) => ({
          url: img.url,
          alt: img.alt || name,
          order: img.order || index
        }))
      },
      productCategories: categoryIds.length > 0 ? {
        create: categoryIds.map(categoryId => ({
          categoryId: categoryId
        }))
      } : undefined
    },
    include: {
      supplier: true,
      images: true,
      productCategories: {
        include: { category: true }
      }
    }
  });

  return product;
};

export const updateProductService = async (id, data) => {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product || product.deletedAt) {
    throw new ApiError(404, 'Product not found');
  }

  const { categoryIds, images, image_url, ...productData } = data;
  const updateData = { ...productData };
  
  // Generate new slug if name changed
  if (data.name && data.name !== product.name) {
    updateData.slug = data.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (updateData.price) {
    updateData.price = parseFloat(updateData.price);
  }

  if (data.moq !== undefined) {
    updateData.moqNumeric = parseMoqNumeric(data.moq);
  }

  if (image_url !== undefined) {
    updateData.image_url = image_url || null;
  } else if (Array.isArray(images) && images.length > 0) {
    updateData.image_url = images[0]?.url || null;
  }

  // Handle category updates
  if (categoryIds !== undefined) {
    // Delete existing product categories
    await prisma.productCategory.deleteMany({
      where: { productId: id }
    });

    // Create new product categories
    if (categoryIds && categoryIds.length > 0) {
      await prisma.productCategory.createMany({
        data: categoryIds.map(categoryId => ({
          productId: id,
          categoryId
        }))
      });
    }
  }

  if (Array.isArray(images)) {
    await prisma.productImage.deleteMany({
      where: { productId: id }
    });

    if (images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map((img, index) => ({
          productId: id,
          url: img.url,
          alt: img.alt || updateData.name || product.name,
          order: Number.isInteger(img.order) ? img.order : index
        }))
      });
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      supplier: true,
      images: true,
      productCategories: {
        include: {
          category: true
        }
      }
    }
  });

  return updated;
};

export const deleteProductService = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product || product.deletedAt) {
    throw new ApiError(404, 'Product not found');
  }

  await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date()
    }
  });
};

export const getMyProductsService = async (userId) => {
  // Get supplier by userId
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

  const products = await prisma.product.findMany({
    where: {
      supplierId: supplier.id,
      deletedAt: null
    },
    include: {
      images: {
        take: 1,
        orderBy: { order: 'asc' }
      },
      productCategories: {
        include: {
          category: {
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

  return {
    products,
    pagination: {
      page: 1,
      limit: products.length,
      total: products.length,
      totalPages: 1
    }
  };
};
