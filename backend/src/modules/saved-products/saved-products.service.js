import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export const saveProductService = async (userId, productId) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || product.deletedAt) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if already saved
  const existing = await prisma.savedProduct.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (existing) {
    throw new ApiError(400, 'Product already liked');
  }

  const savedProduct = await prisma.savedProduct.create({
    data: {
      userId,
      productId
    },
    include: {
      product: {
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
          }
        }
      }
    }
  });

  return savedProduct;
};

export const unsaveProductService = async (userId, productId) => {
  const savedProduct = await prisma.savedProduct.findUnique({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });

  if (!savedProduct) {
    throw new ApiError(404, 'Liked product not found');
  }

  await prisma.savedProduct.delete({
    where: {
      userId_productId: {
        userId,
        productId
      }
    }
  });
};

export const getSavedProductsService = async (userId) => {
  const savedProducts = await prisma.savedProduct.findMany({
    where: { 
      userId
    },
    include: {
      product: {
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
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Filter out deleted or inactive products
  return savedProducts
    .map(sp => sp.product)
    .filter(product => product !== null && product.deletedAt === null && product.isActive === true);
};
