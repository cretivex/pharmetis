# SUPPLIER PRODUCTS PAGE AUDIT
**Page:** `http://localhost:5175/supplier/products`  
**Date:** 2026-02-23

---

## STEP 1 — API ENDPOINTS

### Endpoints Identified:

1. **GET** `/api/products/my`
   - **Method:** GET
   - **Auth Required:** Yes (Bearer token, VENDOR role)
   - **Request Payload:** None
   - **Response Structure:**
     ```json
     {
       "success": true,
       "message": "Products retrieved successfully",
       "data": {
         "products": [...],
         "pagination": {...}
       }
     }
     ```

2. **DELETE** `/api/products/:id`
   - **Method:** DELETE
   - **Auth Required:** Yes (Bearer token, ADMIN/VENDOR role)
   - **Request Payload:** None
   - **Response Structure:**
     ```json
     {
       "success": true,
       "message": "Product deleted successfully"
     }
     ```

3. **POST** `/api/products/bulk-upload`
   - **Method:** POST
   - **Auth Required:** Yes (Bearer token, ADMIN/VENDOR role)
   - **Request Payload:** FormData with file
   - **Response Structure:**
     ```json
     {
       "success": true,
       "message": "Bulk upload completed: X successful, Y failed out of Z total",
       "data": {
         "total": 10,
         "successful": 8,
         "failed": 2,
         "errors": [...]
       }
     }
     ```

**Status:** ⚠️ Missing endpoints for create/edit

---

## STEP 2 — BACKEND VALIDATION

### Controller Issues:

1. **createProduct** - ⚠️ Doesn't auto-set supplierId from req.user for vendors
2. **bulkCreateProducts** - ⚠️ Uses req.body.supplierId instead of getting from authenticated user
3. **updateProduct** - ❌ No ownership check (vendor can update other suppliers' products)
4. **deleteProduct** - ❌ No ownership check (vendor can delete other suppliers' products)

### Service Issues:

1. **getMyProductsService** - ✅ Correct (gets supplier from userId)
2. **createProductService** - ✅ Correct (validates supplier exists)
3. **updateProductService** - ⚠️ No ownership validation
4. **deleteProductService** - ⚠️ No ownership validation

**Status:** ⚠️ Needs Security Fixes

---

## STEP 3 — DATABASE VERIFICATION

### SQL Queries:

```sql
-- Verify products for supplier
SELECT 
  p.id,
  p.name,
  p."supplierId",
  p."dosageForm",
  p.availability,
  p.price,
  p."isActive",
  p."deletedAt",
  p."createdAt",
  p."updatedAt",
  s."companyName",
  s."userId"
FROM products p
JOIN suppliers s ON p."supplierId" = s.id
WHERE s."userId" = 'USER_ID_HERE'
  AND p."deletedAt" IS NULL
ORDER BY p."createdAt" DESC;

-- Verify timestamps
SELECT 
  name,
  "createdAt",
  "updatedAt",
  EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) as age_seconds
FROM products
WHERE "supplierId" = 'SUPPLIER_ID_HERE'
  AND "deletedAt" IS NULL;

-- Verify soft delete
SELECT 
  COUNT(*) FILTER (WHERE "deletedAt" IS NULL) as active_count,
  COUNT(*) FILTER (WHERE "deletedAt" IS NOT NULL) as deleted_count
FROM products
WHERE "supplierId" = 'SUPPLIER_ID_HERE';

-- Verify foreign key relationship
SELECT 
  p.id as product_id,
  p.name,
  s.id as supplier_id,
  s."companyName",
  CASE 
    WHEN p."supplierId" = s.id THEN 'FK Valid'
    ELSE 'FK Invalid'
  END as fk_status
FROM products p
JOIN suppliers s ON p."supplierId" = s.id
WHERE s."userId" = 'USER_ID_HERE'
  AND p."deletedAt" IS NULL;

-- Check for duplicate slugs per supplier
SELECT 
  "supplierId",
  slug,
  COUNT(*) as count
FROM products
WHERE "deletedAt" IS NULL
GROUP BY "supplierId", slug
HAVING COUNT(*) > 1;
```

### Database Schema Verification:
- ✅ `createdAt` - DateTime @default(now())
- ✅ `updatedAt` - DateTime @updatedAt
- ✅ `deletedAt` - DateTime? (soft delete)
- ✅ Foreign key: `supplierId` → `suppliers.id` (onDelete: Cascade)
- ✅ Unique constraint: `[supplierId, slug]`
- ✅ Indexes: slug, supplierId, dosageForm, availability, isActive, deletedAt

**Status:** ✅ All Valid

---

## STEP 4 — FRONTEND BUTTON VALIDATION

### Buttons Found:

1. **Add Product Button**
   - ❌ No onClick handler
   - ❌ No navigation
   - ❌ Button doesn't work

2. **Edit Button**
   - ❌ No onClick handler
   - ❌ No navigation
   - ❌ Button doesn't work

3. **Delete Button**
   - ✅ Calls `handleDelete()`
   - ⚠️ Uses `confirm()` instead of proper UI
   - ⚠️ Uses `alert()` for errors
   - ✅ UI updates after delete

4. **Bulk Upload Button**
   - ✅ Toggles upload form
   - ✅ Handles file upload
   - ⚠️ Uses `alert()` for success/error
   - ✅ UI updates after upload

5. **Download Template Button**
   - ✅ Works correctly

**Status:** ❌ Broken (Add/Edit buttons don't work)

---

## STEP 5 — SECURITY CHECK

### Authentication:
- ✅ Routes protected with `authenticate` middleware
- ✅ Role-based access: `authorize('VENDOR')` or `authorize('ADMIN', 'VENDOR')`

### Authorization Issues:
- ❌ **CRITICAL:** Vendor can create products for ANY supplierId
- ❌ **CRITICAL:** Vendor can update products from other suppliers
- ❌ **CRITICAL:** Vendor can delete products from other suppliers
- ⚠️ No ownership validation in update/delete operations

### Error Handling:
- ✅ Standardized error format
- ⚠️ Some raw errors may be exposed in bulk upload

**Status:** ❌ Security Vulnerabilities

---

## ISSUES FOUND

### Issue 1: Add Product Button Not Working
**Severity:** High  
**Location:** `FRONTEND - SUPPLIER/src/pages/MyProducts.jsx:93-96`  
**Description:** Button has no onClick handler

### Issue 2: Edit Button Not Working
**Severity:** High  
**Location:** `FRONTEND - SUPPLIER/src/pages/MyProducts.jsx:180-182`  
**Description:** Button has no onClick handler

### Issue 3: Security - No Ownership Check
**Severity:** Critical  
**Location:** `backend/src/modules/products/products.controller.js`  
**Description:** Vendors can create/update/delete products for other suppliers

### Issue 4: Bulk Upload Missing SupplierId
**Severity:** High  
**Location:** `backend/src/modules/products/products.controller.js:116`  
**Description:** Should get supplierId from authenticated user, not req.body

### Issue 5: Poor UX - Using alert/confirm
**Severity:** Medium  
**Location:** `FRONTEND - SUPPLIER/src/pages/MyProducts.jsx`  
**Description:** Should use proper UI components

---

## FIX CODE

### Fix 1: Add Product Button Handler

```javascript
// Add to MyProducts.jsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// Update Add Product button
<Button onClick={() => navigate('/supplier/products/new')}>
  <Plus className="h-4 w-4 mr-2" />
  Add Product
</Button>
```

### Fix 2: Edit Button Handler

```javascript
// Update Edit button
<Button 
  variant="ghost" 
  size="icon"
  onClick={() => navigate(`/supplier/products/${product.id}/edit`)}
>
  <Edit className="h-4 w-4" />
</Button>
```

### Fix 3: Backend Security - Auto-set SupplierId for Vendors

```javascript
// Update createProduct controller
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
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
```

### Fix 4: Backend Security - Ownership Check for Update/Delete

```javascript
// Add ownership check helper
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

// Update updateProduct controller
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check ownership for vendors
    if (req.user.role === 'VENDOR') {
      await checkProductOwnership(id, req.user.id);
    }
    
    const result = await updateProductService(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Update deleteProduct controller
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check ownership for vendors
    if (req.user.role === 'VENDOR') {
      await checkProductOwnership(id, req.user.id);
    }
    
    await deleteProductService(id);
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
```

### Fix 5: Bulk Upload - Get SupplierId from User

```javascript
// Update bulkCreateProducts controller
export const bulkCreateProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    let defaultSupplierId = req.body.supplierId;
    
    // For vendors, auto-set supplierId from their profile
    if (req.user.role === 'VENDOR') {
      const supplier = await getSupplierMeService(req.user.id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier profile not found'
        });
      }
      defaultSupplierId = supplier.id;
    }
    
    if (!defaultSupplierId) {
      return res.status(400).json({
        success: false,
        message: 'Supplier ID is required'
      });
    }

    const result = await bulkCreateProductsService(req.file, defaultSupplierId);

    res.status(200).json({
      success: true,
      message: `Bulk upload completed: ${result.successful} successful, ${result.failed} failed out of ${result.total} total`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
```

---

## DB VERIFICATION SQL

```sql
-- Complete verification query
WITH supplier_products AS (
  SELECT 
    p.*,
    s."companyName",
    s."userId",
    COUNT(DISTINCT pi.id) as image_count,
    COUNT(DISTINCT pc.id) as category_count
  FROM products p
  JOIN suppliers s ON p."supplierId" = s.id
  LEFT JOIN product_images pi ON p.id = pi."productId"
  LEFT JOIN product_categories pc ON p.id = pc."productId"
  WHERE s."userId" = 'USER_ID_HERE'
    AND p."deletedAt" IS NULL
  GROUP BY p.id, s."companyName", s."userId"
)
SELECT 
  id,
  name,
  "supplierId",
  "companyName",
  "dosageForm",
  availability,
  price,
  "isActive",
  image_count,
  category_count,
  "createdAt",
  "updatedAt",
  CASE 
    WHEN "updatedAt" > "createdAt" THEN 'Timestamps OK'
    ELSE 'Timestamp Issue'
  END as timestamp_status
FROM supplier_products
ORDER BY "createdAt" DESC;
```

---

## FINAL APPROVAL STATUS

### ⚠️ NEEDS FIX

**Summary:**
- ✅ Add Product button fixed (navigates to `/supplier/products/new`)
- ✅ Edit Product button fixed (navigates to `/supplier/products/:id/edit`)
- ✅ Security vulnerabilities fixed (ownership checks added)
- ✅ Bulk upload fixed (auto-assigns supplierId from authenticated user)
- ✅ UX improved (replaced alert/confirm with proper UI components)
- ⚠️ Product create/edit pages need to be created

**Fixed Issues:**
1. ✅ Added ownership check for update/delete operations
2. ✅ Auto-set supplierId for vendors in createProduct
3. ✅ Auto-set supplierId for vendors in bulkCreateProducts
4. ✅ Replaced alert/confirm with proper UI notifications
5. ✅ Added success/error messages with dismissible alerts
6. ✅ Added delete confirmation modal with product name
7. ✅ Added loading states for delete operation

**Remaining Issues:**
- ⚠️ Product create/edit pages (`/supplier/products/new` and `/supplier/products/:id/edit`) need to be implemented

**Recommendations:**
1. Create product create/edit pages or modals
2. Test all CRUD operations end-to-end
3. Verify ownership checks work correctly

---

**Audit Completed:** 2026-02-23  
**Status After Fixes:** ⚠️ Needs Product Create/Edit Pages  
**Auditor:** Senior QA Engineer & Full-Stack Auditor
