import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

const MIN_QUERY_LEN = 2;
const MAX_RESULTS = 25;

export async function unifiedSearchService({ q, type = 'product' }) {
  const term = String(q ?? '').trim();
  if (term.length < MIN_QUERY_LEN) {
    throw new ApiError(400, `Search query must be at least ${MIN_QUERY_LEN} characters`);
  }

  const t = String(type).toLowerCase();
  if (t === 'supplier') {
    const suppliers = await prisma.supplier.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        isVerified: true,
        companyName: { contains: term, mode: 'insensitive' },
      },
      select: {
        id: true,
        companyName: true,
        slug: true,
        country: true,
        logo: true,
        logo_url: true,
      },
      take: MAX_RESULTS,
      orderBy: { companyName: 'asc' },
    });
    return { type: 'supplier', results: suppliers };
  }

  if (t !== 'product') {
    throw new ApiError(400, 'Invalid type; use product or supplier');
  }

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      supplier: {
        isActive: true,
        deletedAt: null,
      },
      OR: [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { apiName: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      moq: true,
      country: true,
      image_url: true,
      supplierId: true,
      supplier: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          country: true,
        },
      },
      images: {
        take: 1,
        orderBy: { order: 'asc' },
        select: { url: true, alt: true },
      },
    },
    take: MAX_RESULTS,
    orderBy: { updatedAt: 'desc' },
  });

  return { type: 'product', results: products };
}
