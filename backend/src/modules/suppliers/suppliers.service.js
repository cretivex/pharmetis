import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateUniqueSlug } from './slug-helper.js';

export const getSuppliersService = async (filters = {}) => {
  const {
    search,
    country,
    isVerified,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = filters;

  const where = {
    deletedAt: null
  };
  
  // Only filter by isActive if explicitly requested
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive === 'true' || filters.isActive === true;
  }

  if (search) {
    where.companyName = { contains: search, mode: 'insensitive' };
  }

  if (country) {
    where.country = country;
  }

  if (isVerified !== undefined) {
    where.isVerified = isVerified === 'true' || isVerified === true;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true
          }
        },
        compliance: true,
        certifications: {
          take: 5
        },
        manufacturingCapabilities: {
          select: { dosageForms: true }
        },
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
                isActive: true
              }
            },
            rfqResponses: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take
    }),
    prisma.supplier.count({ where })
  ]);

  return {
    suppliers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

export const getSupplierBySlugService = async (slug) => {
  const supplier = await prisma.supplier.findUnique({
    where: {
      slug
    },
    include: {
      compliance: true,
      certifications: true,
      manufacturingCapabilities: true,
      _count: {
        select: {
          products: {
            where: {
              deletedAt: null,
              isActive: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  if (!supplier || supplier.deletedAt || !supplier.isActive) {
    throw new ApiError(404, 'Supplier not found');
  }

  return supplier;
};

export const getSupplierByIdService = async (id) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      compliance: true,
      certifications: true,
      manufacturingCapabilities: true
    }
  });

  if (!supplier || supplier.deletedAt) {
    throw new ApiError(404, 'Supplier not found');
  }

  return supplier;
};

export const getSupplierProductsService = async (supplierId, filters = {}) => {
  const {
    dosageForm,
    availability,
    search,
    page = 1,
    limit = 20
  } = filters;

  const where = {
    supplierId,
    deletedAt: null,
    isActive: true
  };

  if (dosageForm) {
    where.dosageForm = dosageForm;
  }

  if (availability) {
    where.availability = availability;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          take: 1,
          orderBy: { order: 'asc' }
        },
        compliance: true
      },
      orderBy: {
        createdAt: 'desc'
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

export const createSupplierService = async (data) => {
  const {
    userId,
    companyName,
    country,
    city,
    address,
    phone,
    email,
    website,
    description,
    therapeutics,
    manufacturer,
    yearsInBusiness,
    logo,
    logo_url
  } = data;

  // Generate unique slug from company name
  const slug = await generateUniqueSlug(companyName);

  const supplier = await prisma.supplier.create({
    data: {
      userId,
      companyName,
      slug,
      country,
      city,
      address,
      phone,
      email,
      website,
      description,
      therapeutics: therapeutics || null,
      manufacturer: manufacturer || null,
      yearsInBusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
      logo: logo || logo_url || null,
      logo_url: logo_url || logo || null,
      isActive: true,
      isVerified: false
    },
    include: {
      user: true
    }
  });

  return supplier;
};

export const updateSupplierService = async (id, data) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id }
  });

  if (!supplier || supplier.deletedAt) {
    throw new ApiError(404, 'Supplier not found');
  }

  const updateData = { ...data };

  // Generate new unique slug if company name changed
  if (data.companyName && data.companyName !== supplier.companyName) {
    updateData.slug = await generateUniqueSlug(data.companyName);
  }

  if (updateData.yearsInBusiness) {
    updateData.yearsInBusiness = parseInt(updateData.yearsInBusiness);
  }

  if (updateData.logo_url !== undefined && updateData.logo === undefined) {
    updateData.logo = updateData.logo_url || null;
  }
  if (updateData.logo !== undefined && updateData.logo_url === undefined) {
    updateData.logo_url = updateData.logo || null;
  }
  
  // Handle approve/reject logic
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive === true || data.isActive === 'true';
    // If activating, also verify
    if (updateData.isActive && !supplier.isVerified) {
      updateData.isVerified = true;
    }
  }
  
  if (data.isVerified !== undefined) {
    updateData.isVerified = data.isVerified === true || data.isVerified === 'true';
    // If verifying, also activate
    if (updateData.isVerified && !supplier.isActive) {
      updateData.isActive = true;
    }
  }

  const updated = await prisma.supplier.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true
        }
      },
      compliance: true,
      certifications: true,
      _count: {
        select: {
          products: {
            where: {
              deletedAt: null,
              isActive: true
            }
          },
          rfqResponses: true
        }
      }
    }
  });

  return updated;
};

export const deleteSupplierService = async (id) => {
  const supplier = await prisma.supplier.findUnique({
    where: { id }
  });

  if (!supplier || supplier.deletedAt) {
    throw new ApiError(404, 'Supplier not found');
  }

  await prisma.supplier.update({
    where: { id },
    data: {
      deletedAt: new Date()
    }
  });
};

export const getSupplierMeService = async (userId) => {
  const supplier = await prisma.supplier.findFirst({
    where: {
      userId,
      deletedAt: null
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true
        }
      },
      compliance: true,
      certifications: true,
      _count: {
        select: {
          products: {
            where: {
              deletedAt: null
            }
          },
          rfqResponses: true
        }
      }
    }
  });

  return supplier || null;
};
