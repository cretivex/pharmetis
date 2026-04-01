import prisma from '../../config/database.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache = null;
let cacheTime = 0;

function isCacheValid() {
  return cache && Date.now() - cacheTime < CACHE_TTL_MS;
}

const productWhere = {
  deletedAt: null,
  isActive: true
};

/**
 * Get filter metadata for medicines catalog: distinct dosage forms, countries,
 * therapeutic areas, manufacturers, availability, and categories.
 * Cached for 5 minutes.
 */
export async function getMedicinesFiltersService() {
  if (isCacheValid()) {
    return cache;
  }

  const [
    dosageForms,
    availabilityList,
    countriesFromSupplier,
    countriesFromProduct,
    therapeuticsRows,
    categoriesWithProducts,
    manufacturersFromProduct,
    manufacturersFromSupplier
  ] = await Promise.all([
    prisma.product.groupBy({
      by: ['dosageForm'],
      where: productWhere,
      orderBy: { dosageForm: 'asc' }
    }),
    prisma.product.groupBy({
      by: ['availability'],
      where: productWhere,
      orderBy: { availability: 'asc' }
    }),
    prisma.supplier.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        products: {
          some: { deletedAt: null, isActive: true }
        }
      },
      select: { country: true },
      distinct: ['country']
    }),
    prisma.product.findMany({
      where: {
        ...productWhere,
        country: { not: null }
      },
      select: { country: true },
      distinct: ['country']
    }),
    prisma.product.findMany({
      where: {
        ...productWhere,
        therapeutics: { not: null }
      },
      select: { therapeutics: true },
      distinct: ['therapeutics']
    }),
    prisma.category.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        products: {
          some: { product: { deletedAt: null, isActive: true } }
        }
      },
      select: { id: true, name: true, slug: true },
      orderBy: [{ order: 'asc' }, { name: 'asc' }]
    }),
    prisma.product.findMany({
      where: {
        ...productWhere,
        manufacturer: { not: null }
      },
      select: { manufacturer: true },
      distinct: ['manufacturer']
    }),
    prisma.supplier.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        manufacturer: { not: null },
        products: {
          some: { deletedAt: null, isActive: true }
        }
      },
      select: { manufacturer: true },
      distinct: ['manufacturer']
    })
  ]);

  const countriesSet = new Set([
    ...countriesFromSupplier.map((s) => s.country?.trim()).filter(Boolean),
    ...countriesFromProduct.map((p) => p.country?.trim()).filter(Boolean)
  ]);
  const therapeuticsSet = new Set();
  therapeuticsRows.forEach((r) => {
    const t = r.therapeutics?.trim();
    if (!t) return;
    t.split(',').forEach((s) => {
      const v = s.trim();
      if (v) therapeuticsSet.add(v);
    });
  });
  const manufacturersSet = new Set([
    ...manufacturersFromProduct.map((p) => p.manufacturer?.trim()).filter(Boolean),
    ...manufacturersFromSupplier.map((s) => s.manufacturer?.trim()).filter(Boolean)
  ]);

  const result = {
    dosageForm: dosageForms.map((r) => r.dosageForm),
    availability: availabilityList.map((r) => r.availability),
    country: Array.from(countriesSet).sort(),
    therapeuticAreas: Array.from(therapeuticsSet).sort(),
    manufacturer: Array.from(manufacturersSet).sort(),
    categories: categoriesWithProducts.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
  };

  cache = result;
  cacheTime = Date.now();
  return result;
}
