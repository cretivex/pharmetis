import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

export const getCategoriesService = async (filters = {}) => {
  const {
    isActive,
    parentId,
    search
  } = filters;

  const where = {
    deletedAt: null
  };

  if (isActive !== undefined) {
    where.isActive = isActive === 'true' || isActive === true;
  }

  if (parentId !== undefined) {
    where.parentId = parentId === 'null' ? null : parentId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } }
    ];
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      children: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: [
      { order: 'asc' },
      { name: 'asc' }
    ]
  });

  return categories;
};

export const getCategoryByIdService = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: true,
      children: {
        where: { deletedAt: null }
      }
    }
  });

  if (!category || category.deletedAt) {
    throw new ApiError(404, 'Category not found');
  }

  return category;
};
