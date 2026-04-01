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

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const createCategoryService = async (data) => {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  if (!slug) throw new ApiError(400, 'Category slug is required');

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      parentId: data.parentId || null,
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
      category_image: data.category_image || null,
      subcategory_image: data.subcategory_image || null
    }
  });
};

export const updateCategoryService = async (id, data) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing || existing.deletedAt) {
    throw new ApiError(404, 'Category not found');
  }

  const updateData = { ...data };
  if (data.slug !== undefined) {
    updateData.slug = data.slug ? slugify(data.slug) : null;
  } else if (data.name) {
    updateData.slug = slugify(data.name);
  }

  if (updateData.slug === null) {
    delete updateData.slug;
  }

  return prisma.category.update({
    where: { id },
    data: updateData
  });
};
