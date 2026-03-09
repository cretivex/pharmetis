import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

function toArray(val) {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}

export const getProductsService = async (filters = {}) => {
  const {
    search,
    dosageForm,
    availability,
    country,
    therapeuticAreas,
    manufacturer,
    categoryIds,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters;

  const where = {
    deletedAt: null
  };

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive === 'true' || filters.isActive === true;
  }

  const andClauses = [];

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { manufacturer: { contains: search, mode: 'insensitive' } },
      { composition: { contains: search, mode: 'insensitive' } }
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
        { supplier: { country: { in: countries }, deletedAt: null } }
      ]
    });
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
        { supplier: { manufacturer: { in: manufacturers }, deletedAt: null } }
      ]
    });
  }

  const categoryIdList = toArray(categoryIds).filter(Boolean);
  if (categoryIdList.length > 0) {
    where.productCategories = {
      some: { categoryId: { in: categoryIdList } }
    };
  }

  if (andClauses.length > 0) {
    where.AND = [...(where.AND || []), ...andClauses];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

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
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
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
      availability: 'IN_STOCK'
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
    images = [],
    categoryIds = []
  } = data;

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
      availability,
      price: price ? parseFloat(price) : null,
      images: {
        create: images.map((img, index) => ({
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

  const { categoryIds, ...productData } = data;
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
