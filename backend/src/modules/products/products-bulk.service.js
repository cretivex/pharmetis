import XLSX from 'xlsx';
import { createProductService } from './products.service.js';
import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/database.js';

const DOSAGE_FORMS = ['TABLET', 'CAPSULE', 'INJECTABLE', 'SYRUP', 'SUSPENSION', 'CREAM', 'OINTMENT', 'DROPS', 'SPRAY', 'OTHER'];
const AVAILABILITY_OPTIONS = ['IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK'];

/**
 * Parse CSV file content
 */
const parseCSV = (buffer) => {
  const text = buffer.toString('utf-8');
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new ApiError(400, 'CSV file must have at least a header row and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, ''));
  
  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length === headers.length && values.some(v => v)) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }
  
  return rows;
};

/**
 * Parse Excel file (.xlsx only) - Skip empty rows
 */
const parseExcel = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Get raw data
  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  // Filter out completely empty rows (prevents 65,535 blank rows issue)
  const filteredData = rawData.filter(row => {
    return Object.values(row).some(value => {
      if (value === null || value === undefined) return false;
      const strValue = value.toString().trim();
      return strValue !== '';
    });
  });
  
  // Normalize keys to lowercase with underscores
  return filteredData.map(row => {
    const normalized = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      normalized[normalizedKey] = row[key];
    });
    return normalized;
  });
};

/**
 * Map CSV/Excel column names to product fields
 */
const mapRowToProduct = (row, defaultSupplierId) => {
  // Column name mappings (case-insensitive, handles various formats)
  const mappings = {
    // Required fields
    name: ['name', 'productname', 'product name', 'productname'],
    supplierid: ['supplierid', 'supplier id', 'supplier', 'supplierid'],
    dosageform: ['dosageform', 'dosage form', 'dosage', 'form'],
    
    // Optional fields
    brand: ['brand', 'brandname', 'brand name'],
    strength: ['strength', 'dose', 'dosage'],
    manufacturer: ['manufacturer', 'manufacturername', 'manufacturer name', 'mfg'],
    country: ['country', 'countryoforigin', 'country of origin', 'origin'],
    description: ['description', 'desc', 'details'],
    apiname: ['apiname', 'api name', 'active ingredient', 'ingredient'],
    composition: ['composition', 'comp', 'formula'],
    packagingtype: ['packagingtype', 'packaging type', 'packaging', 'package'],
    shelflife: ['shelflife', 'shelf life', 'expiry', 'expirydate'],
    storageconditions: ['storageconditions', 'storage conditions', 'storage', 'storagereq'],
    regulatoryapprovals: ['regulatoryapprovals', 'regulatory approvals', 'approvals', 'certifications'],
    hscode: ['hscode', 'hs code', 'harmonized code'],
    moq: ['moq', 'minimum order quantity', 'min order'],
    availability: ['availability', 'stock status', 'stock', 'status'],
    price: ['price', 'cost', 'unitprice', 'unit price'],
    images: ['images', 'image', 'imageurl', 'image url', 'photo'],
    categories: ['categories', 'category', 'categoryids', 'category ids']
  };

  const getValue = (keys) => {
    for (const key of keys) {
      const rowKey = Object.keys(row).find(k => 
        k.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') === key.toLowerCase()
      );
      if (rowKey && row[rowKey]) {
        return row[rowKey];
      }
    }
    return null;
  };

  const product = {
    supplierId: getValue(mappings.supplierid) || defaultSupplierId,
    name: getValue(mappings.name),
    dosageForm: getValue(mappings.dosageform)?.toUpperCase() || 'TABLET',
    brand: getValue(mappings.brand) || null,
    strength: getValue(mappings.strength) || null,
    manufacturer: getValue(mappings.manufacturer) || null,
    country: getValue(mappings.country) || null,
    description: getValue(mappings.description) || null,
    apiName: getValue(mappings.apiname) || null,
    composition: getValue(mappings.composition) || null,
    packagingType: getValue(mappings.packagingtype) || null,
    shelfLife: getValue(mappings.shelflife) || null,
    storageConditions: getValue(mappings.storageconditions) || null,
    regulatoryApprovals: getValue(mappings.regulatoryapprovals) || null,
    hsCode: getValue(mappings.hscode) || null,
    moq: getValue(mappings.moq) || null,
    availability: getValue(mappings.availability)?.toUpperCase().replace(/\s+/g, '_') || 'IN_STOCK',
    price: getValue(mappings.price) ? parseFloat(getValue(mappings.price)) : null,
    images: [],
    categoryIds: []
  };

  // Handle images (comma-separated URLs)
  const imageValue = getValue(mappings.images);
  if (imageValue) {
    const imageUrls = imageValue.split(',').map(url => url.trim()).filter(url => url);
    product.images = imageUrls.map((url, index) => ({
      url: url,
      alt: product.name || 'Product image',
      order: index
    }));
  }

  // Handle categories (comma-separated category names or IDs)
  const categoryValue = getValue(mappings.categories);
  if (categoryValue) {
    // For now, we'll need to look up category IDs by name
    // This will be handled in the bulk create function
    product.categoryNames = categoryValue.split(',').map(c => c.trim()).filter(c => c);
  }

  return product;
};

/**
 * Validate product data
 */
const validateProduct = (product, rowIndex) => {
  const errors = [];

  if (!product.name || !product.name.trim()) {
    errors.push('Product name is required');
  }

  if (!product.supplierId) {
    errors.push('Supplier ID is required');
  }

  if (!DOSAGE_FORMS.includes(product.dosageForm)) {
    errors.push(`Invalid dosage form: ${product.dosageForm}. Must be one of: ${DOSAGE_FORMS.join(', ')}`);
  }

  if (product.availability && !AVAILABILITY_OPTIONS.includes(product.availability)) {
    errors.push(`Invalid availability: ${product.availability}. Must be one of: ${AVAILABILITY_OPTIONS.join(', ')}`);
  }

  if (product.price !== null && (isNaN(product.price) || product.price < 0)) {
    errors.push('Price must be a valid positive number');
  }

  return errors;
};

/**
 * Look up category IDs by names
 */
const resolveCategoryIds = async (categoryNames) => {
  if (!categoryNames || categoryNames.length === 0) {
    return [];
  }

  const categories = await prisma.category.findMany({
    where: {
      name: {
        in: categoryNames,
        mode: 'insensitive'
      },
      deletedAt: null
    }
  });

  return categories.map(c => c.id);
};

/**
 * Bulk create products from parsed data
 */
export const bulkCreateProductsService = async (file, defaultSupplierId) => {
  if (!file || !file.buffer) {
    throw new ApiError(400, 'No file provided');
  }

  const fileName = file.originalname.toLowerCase();

  // Only accept .xlsx files
  if (!fileName.endsWith('.xlsx')) {
    throw new ApiError(400, 'Invalid file format. Only Excel (.xlsx) files are supported.');
  }

  let rows = [];

  try {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Get raw rows
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    
    // Remove completely empty rows (prevents 65,535 blank rows)
    rows = rawRows.filter(row => {
      return Object.values(row).some(val => {
        if (val === null || val === undefined) return false;
        const strVal = val.toString().trim();
        return strVal !== '';
      });
    });

    if (rows.length === 0) {
      throw new ApiError(400, 'Excel file contains no valid rows. Please ensure your file has data rows.');
    }
    
    // Normalize keys to lowercase with underscores
    rows = rows.map(row => {
      const normalized = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        normalized[normalizedKey] = row[key];
      });
      return normalized;
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(400, `Failed to parse file: ${error.message}`);
  }

  const results = {
    total: rows.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNumber = i + 2; // +2 because row 1 is header, and arrays are 0-indexed

    try {
      // Map row to product
      const productData = mapRowToProduct(row, defaultSupplierId);

      // Validate product
      const validationErrors = validateProduct(productData, i);
      if (validationErrors.length > 0) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          product: productData.name || 'Unknown',
          errors: validationErrors
        });
        continue;
      }

      // Resolve category IDs if category names provided
      if (productData.categoryNames && productData.categoryNames.length > 0) {
        productData.categoryIds = await resolveCategoryIds(productData.categoryNames);
        delete productData.categoryNames;
      }

      // Verify supplier exists
      const supplier = await prisma.supplier.findUnique({
        where: { id: productData.supplierId },
        select: { id: true }
      });

      if (!supplier) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          product: productData.name,
          errors: [`Supplier with ID ${productData.supplierId} not found`]
        });
        continue;
      }

      // Create product
      await createProductService(productData);
      results.successful++;

    } catch (error) {
      results.failed++;
      results.errors.push({
        row: rowNumber,
        product: row.name || row.productname || 'Unknown',
        errors: [error.message || 'Failed to create product']
      });
    }
  }

  return results;
};
