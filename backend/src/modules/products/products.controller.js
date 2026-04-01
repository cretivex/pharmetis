import { 
  getProductsService, 
  getProductBySlugService, 
  getProductByIdService, 
  getFeaturedProductsService,
  createProductService,
  updateProductService,
  deleteProductService,
  getMyProductsService
} from './products.service.js';
import { getSupplierMeService, createSupplierService } from '../suppliers/suppliers.service.js';
import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import XLSX from 'xlsx';

export const getProducts = async (req, res, next) => {
  try {
    const result = await getProductsService(req.query);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await getProductBySlugService(slug);
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent /my from being matched as /:id
    if (id === 'my') {
      return res.status(404).json({
        success: false,
        message: 'Route not found. Use /products/my for your products.',
        data: null
      });
    }
    
    const result = await getProductByIdService(id);
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const result = await getFeaturedProductsService();
    res.status(200).json({
      success: true,
      message: 'Featured products retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    // For vendors, auto-set supplierId from their profile
    if (req.user.role === 'VENDOR') {
      const supplier = await getSupplierMeService(req.user.id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier profile not found'
        });
      }
      req.body.supplierId = supplier.id;
    }
    
    // Validate supplierId exists
    if (!req.body.supplierId) {
      return res.status(400).json({
        success: false,
        message: 'Supplier ID is required'
      });
    }
    
    const result = await createProductService(req.body);
    if (req.user) {
      const { logAdminAction } = await import('../../utils/auditLogger.js');
      await logAdminAction({
        user: { id: req.user.id, email: req.user.email, role: req.user.role },
        action: 'PRODUCT_CREATE',
        resourceType: 'Product',
        resourceId: result?.id,
        newValue: result ? { name: result.name, slug: result.slug } : undefined,
        req,
      });
    }
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const checkProductOwnership = async (productId, userId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      supplier: {
        select: { userId: true }
      }
    }
  });
  
  if (!product || product.deletedAt) {
    throw new ApiError(404, 'Product not found');
  }
  
  if (product.supplier.userId !== userId) {
    throw new ApiError(403, 'You do not have permission to modify this product');
  }
  
  return product;
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'VENDOR') {
      await checkProductOwnership(id, req.user.id);
    }

    const existing = await getProductByIdService(id).catch(() => null);
    const result = await updateProductService(id, req.body);

    if (req.user) {
      const { logAdminAction } = await import('../../utils/auditLogger.js');
      await logAdminAction({
        user: { id: req.user.id, email: req.user.email, role: req.user.role },
        action: 'PRODUCT_UPDATE',
        resourceType: 'Product',
        resourceId: id,
        oldValue: existing ? { name: existing.name, slug: existing.slug } : undefined,
        newValue: result ? { name: result.name, slug: result.slug } : undefined,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role === 'VENDOR') {
      await checkProductOwnership(id, req.user.id);
    }

    const existing = await getProductByIdService(id).catch(() => null);
    await deleteProductService(id);

    if (req.user) {
      const { logAdminAction } = await import('../../utils/auditLogger.js');
      await logAdminAction({
        user: { id: req.user.id, email: req.user.email, role: req.user.role },
        action: 'PRODUCT_DELETE',
        resourceType: 'Product',
        resourceId: id,
        oldValue: existing ? { name: existing.name, slug: existing.slug } : undefined,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate slug from name
const generateSlug = (name, supplierId) => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  // Add supplierId prefix to ensure uniqueness per supplier
  return `${supplierId.substring(0, 8)}-${baseSlug}`;
};

export const bulkCreateProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a valid .xlsx file.'
      });
    }

    // Verify file is .xlsx
    const fileName = req.file.originalname.toLowerCase();
    if (!fileName.endsWith('.xlsx')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only Excel (.xlsx) files are supported.'
      });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Remove empty rows
    const rows = rawRows.filter(row =>
      Object.values(row).some(val =>
        val && val.toString().trim() !== ''
      )
    );

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'Excel contains no valid rows.'
      });
    }

    // Get or create supplier
    let supplier = await getSupplierMeService(req.user.id);
    
    if (!supplier) {
      supplier = await createSupplierService({
        userId: req.user.id,
        companyName: req.user.companyName || req.user.email?.split('@')[0] || '',
        country: req.user.country || '',
        city: req.user.city || null,
        address: null,
        phone: req.user.phone || '',
        website: null,
        description: null,
        yearsInBusiness: null,
        logo: null
      });
      logger.info(`[bulkCreateProducts] Auto-created supplier profile for user ${req.user.id}`);
    }

    let successful = 0;
    let failed = 0;
    const errors = [];

    // Debug: Log first row structure
    if (rows.length > 0) {
      logger.info('[bulkCreateProducts] Sample row:', rows[0]);
      logger.info(`[bulkCreateProducts] Sample row keys: ${Object.keys(rows[0]).join(', ')}`);
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Flexible column support (case-insensitive, handles various formats)
      const productName =
        row.productName ||
        row.name ||
        row.ProductName ||
        row['Product Name'] ||
        row['product name'] ||
        row.NAME ||
        row.Name;

      const description =
        row.description ||
        row.Description ||
        row.desc ||
        row.DESC ||
        '';

      const price = parseFloat(row.price || row.Price || row.PRICE || 0);
      const stock = parseInt(row.stock || row.Stock || row.STOCK || 0);
      
      // Optional fields with flexible names
      const brand = row.brand || row.Brand || row.BRAND || null;
      const strength = row.strength || row.Strength || row.STRENGTH || null;
      const manufacturer = row.manufacturer || row.Manufacturer || row.MANUFACTURER || null;
      const dosageForm = (row.dosageForm || row['Dosage Form'] || row.dosageform || row.DOSAGEFORM || 'TABLET').toUpperCase();

      // Validate required fields
      if (!productName || productName.toString().trim() === '') {
        failed++;
        errors.push(`Row ${i + 2}: Missing product name`);
        continue;
      }

      if (isNaN(price) || price < 0) {
        failed++;
        errors.push(`Row ${i + 2}: Invalid price (must be a number >= 0)`);
        continue;
      }

      try {
        const slug = generateSlug(productName.toString().trim(), supplier.id);
        const validDosageForms = ['TABLET', 'CAPSULE', 'INJECTABLE', 'SYRUP', 'SUSPENSION', 'CREAM', 'OINTMENT', 'DROPS', 'SPRAY', 'OTHER'];
        const finalDosageForm = validDosageForms.includes(dosageForm) ? dosageForm : 'TABLET';

        // Check if product exists (by supplierId + slug)
        const existingProduct = await prisma.product.findFirst({
          where: {
            supplierId: supplier.id,
            slug: slug,
            deletedAt: null
          }
        });

        if (existingProduct) {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: productName.toString().trim(),
              description: description.toString().trim() || null,
              price: price || null,
              brand: brand ? brand.toString().trim() : null,
              strength: strength ? strength.toString().trim() : null,
              manufacturer: manufacturer ? manufacturer.toString().trim() : null,
              dosageForm: finalDosageForm,
              isActive: true,
              deletedAt: null
            }
          });
        } else {
          // Create new product
          await prisma.product.create({
            data: {
              supplierId: supplier.id,
              name: productName.toString().trim(),
              slug: slug,
              description: description.toString().trim() || null,
              price: price || null,
              brand: brand ? brand.toString().trim() : null,
              strength: strength ? strength.toString().trim() : null,
              manufacturer: manufacturer ? manufacturer.toString().trim() : null,
              dosageForm: finalDosageForm,
              availability: 'IN_STOCK',
              isActive: true
            }
          });
        }

        successful++;
      } catch (err) {
        failed++;
        const errorMsg = err.message || 'Failed to create product';
        errors.push(`Row ${i + 2}: ${errorMsg}`);
        logger.error(`[bulkCreateProducts] Row ${i + 2} error:`, err);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bulk upload completed',
      data: {
        total: rows.length,
        successful,
        failed,
        errors: errors.slice(0, 50) // Limit errors to first 50
      }
    });
  } catch (error) {
    logger.error('[bulkCreateProducts] Error:', error);
    logger.error('Bulk Upload Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Bulk upload failed'
    });
  }
};

export const getMyProducts = async (req, res, next) => {
  try {
    logger.info(`[getMyProducts] User: ${req.user.id}, Role: ${req.user.role}`);
    const result = await getMyProductsService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get my products error:', error);
    next(error);
  }
};
