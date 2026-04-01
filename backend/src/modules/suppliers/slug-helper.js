import prisma from '../../config/database.js';
import { logger } from '../../utils/logger.js';

/**
 * Generate a unique slug from company name
 * Checks database for existing slugs and appends counter if needed
 * 
 * @param {string} companyName - The company name to generate slug from
 * @returns {Promise<string>} - Unique slug
 * 
 * @example
 * "CRETIVEX PRIVATE LIMITED" → "cretivex-private-limited"
 * If exists → "cretivex-private-limited-1"
 * If exists → "cretivex-private-limited-2"
 */
export const generateUniqueSlug = async (companyName) => {
  try {
    // Generate base slug from company name
    const baseSlug = companyName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/(^-|-$)/g, ''); // Remove leading/trailing hyphens

    // If base slug is empty after processing, use a fallback
    if (!baseSlug || baseSlug.length === 0) {
      const fallbackSlug = `company-${Date.now()}`;
      logger.warn(`Generated fallback slug for company name: "${companyName}" → "${fallbackSlug}"`);
      return fallbackSlug;
    }

    let slug = baseSlug;
    let counter = 1;
    let exists = true;
    const maxAttempts = 1000; // Safety limit to prevent infinite loops

    // Check if slug exists and append counter until unique
    while (exists && counter <= maxAttempts) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          slug: slug,
          deletedAt: null // Exclude soft-deleted suppliers
        },
        select: {
          id: true,
          slug: true
        }
      });

      if (!existingSupplier) {
        // Slug is unique, break the loop
        exists = false;
      } else {
        // Slug exists, try with counter
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Safety check: if we hit max attempts, use timestamp
    if (counter > maxAttempts) {
      const timestampSlug = `${baseSlug}-${Date.now()}`;
      logger.warn(`Max attempts reached for slug generation. Using timestamp: "${timestampSlug}"`);
      return timestampSlug;
    }

    logger.debug(`Generated unique slug: "${companyName}" → "${slug}"`);
    return slug;
  } catch (error) {
    logger.error('Error generating unique slug:', error);
    // Fallback to timestamp-based slug on error
    const fallbackSlug = `company-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    logger.warn(`Using fallback slug due to error: "${fallbackSlug}"`);
    return fallbackSlug;
  }
};
