# 🧪 COMPREHENSIVE FLOW TESTING GUIDE

## Prerequisites

1. **Backend Server Running:**
   ```bash
   cd backend
   npm run dev
   ```
   Should see: `🚀 Server running on port 5000`

2. **Frontend Admin Running:**
   ```bash
   cd frontend-admin
   npm run dev
   ```
   Should be on: `http://localhost:5174`

3. **Frontend Supplier Running:**
   ```bash
   cd "FRONTEND - SUPPLIER"
   npm run dev
   ```
   Should be on: `http://localhost:5175`

4. **Frontend User Running:**
   ```bash
   cd "frontend - user"
   npm run dev
   ```
   Should be on: `http://localhost:5173`

---

## 🔐 AUTHENTICATION FLOWS

### 1. Admin Login Flow
**URL:** `http://localhost:5174/login`

**Test Steps:**
1. Open admin frontend
2. Enter credentials:
   - Email: `admin@pharmetis.com`
   - Password: `Admin123!`
3. Click "Sign In"
4. ✅ Should redirect to `/dashboard`
5. ✅ Should see dashboard stats
6. ✅ Token stored in localStorage as `adminToken`

**Expected Result:** ✅ Successfully logged in, dashboard loads

---

### 2. Supplier Login Flow
**URL:** `http://localhost:5175/supplier/login`

**Test Steps:**
1. Open supplier frontend
2. Enter credentials:
   - Email: `supplier1@test.com`
   - Password: `Supplier123!`
3. Click "Sign In"
4. ✅ Should redirect to `/supplier/dashboard`
5. ✅ Should see assigned RFQs
6. ✅ Token stored in localStorage as `supplierToken`

**Expected Result:** ✅ Successfully logged in, dashboard loads

---

### 3. Supplier Registration Flow
**URL:** `http://localhost:5175/supplier/register`

**Test Steps:**
1. Open supplier registration
2. Fill multi-step form:
   - Step 1: Company details, email, password
   - Step 2: Contact information
   - Step 3: Address
   - Step 4: Documents
   - Step 5: Product upload (optional)
3. Submit form
4. ✅ Should create supplier account
5. ✅ Should redirect to login
6. ✅ Should be able to login with new credentials

**Expected Result:** ✅ Supplier registered successfully

---

### 4. User/Buyer Login Flow
**URL:** `http://localhost:5173/login`

**Test Steps:**
1. Open user frontend
2. Enter credentials:
   - Email: `buyer@test.com`
   - Password: `password123`
3. Click "Sign In"
4. ✅ Should redirect to home/dashboard
5. ✅ Token stored in localStorage as `accessToken`

**Expected Result:** ✅ Successfully logged in

---

## 📦 PRODUCT CRUD FLOWS

### 1. Create Product (Admin)
**URL:** `http://localhost:5174/products/new`

**Test Steps:**
1. Login as admin
2. Navigate to Products → New Product
3. Fill product form:
   - Name, Brand, Strength
   - Dosage Form, Manufacturer
   - Price, Availability
   - Categories
   - Images (URLs)
4. Click "Create Product"
5. ✅ Should create product
6. ✅ Should redirect to edit page
7. ✅ Product visible in products list

**Expected Result:** ✅ Product created successfully

---

### 2. Bulk Upload Products (Admin/Supplier)
**URL:** `http://localhost:5174/products/new` or Supplier Products page

**Test Steps:**
1. Navigate to product creation
2. Toggle to "Bulk Upload"
3. Download template CSV
4. Fill template with product data
5. Upload CSV file
6. ✅ Should process upload
7. ✅ Should show success/failed counts
8. ✅ Products created in database

**Expected Result:** ✅ Bulk products uploaded successfully

---

### 3. Edit Product
**URL:** `http://localhost:5174/products/:id/edit`

**Test Steps:**
1. Navigate to product edit page
2. Modify product fields
3. Update categories
4. Add/remove images
5. Click "Update Product"
6. ✅ Should update product
7. ✅ Changes reflected in database
8. ✅ Updated timestamp changed

**Expected Result:** ✅ Product updated successfully

---

### 4. Delete Product
**URL:** `http://localhost:5174/products`

**Test Steps:**
1. Navigate to products list
2. Find product to delete
3. Click delete button
4. Confirm deletion
5. ✅ Should soft delete product
6. ✅ Product removed from list
7. ✅ `deletedAt` set in database

**Expected Result:** ✅ Product deleted (soft delete)

---

## 📋 RFQ FLOWS

### 1. Create RFQ (Buyer)
**URL:** `http://localhost:5173/send-rfq`

**Test Steps:**
1. Login as buyer
2. Navigate to Send RFQ
3. Fill RFQ form:
   - Title, Notes
   - Add products/items
   - Set expiry date
4. Submit RFQ
5. ✅ Should create RFQ with status DRAFT
6. ✅ Should be able to send RFQ
7. ✅ RFQ status changes to SENT

**Expected Result:** ✅ RFQ created and sent

---

### 2. View Assigned RFQs (Supplier)
**URL:** `http://localhost:5175/supplier/dashboard`

**Test Steps:**
1. Login as supplier
2. View dashboard
3. ✅ Should see assigned RFQs
4. ✅ Should see pending count
5. ✅ Should see submitted count
6. Click on RFQ
7. ✅ Should navigate to RFQ response page

**Expected Result:** ✅ RFQs displayed correctly

---

### 3. Respond to RFQ (Supplier)
**URL:** `http://localhost:5175/supplier/rfqs/:id`

**Test Steps:**
1. Navigate to RFQ response page
2. Fill response form:
   - Price per item
   - Quantity
   - Delivery days
   - Notes
   - Upload quotation PDF (optional)
3. Submit response
4. ✅ Should create RFQ response
5. ✅ RFQ status changes to RESPONDED
6. ✅ Response visible to buyer

**Expected Result:** ✅ RFQ response submitted

---

### 4. View Quotations (Admin/Buyer)
**URL:** `http://localhost:5174/quotations` or `/quotations/:rfqId`

**Test Steps:**
1. Navigate to quotations page
2. ✅ Should see all RFQ responses
3. ✅ Should see comparison table
4. ✅ Should see supplier intelligence
5. Select preferred quote
6. Click "Accept Quote"
7. ✅ Should accept quotation
8. ✅ Status updated to ACCEPTED

**Expected Result:** ✅ Quotations displayed and managed

---

## 🏭 SUPPLIER FLOWS

### 1. View Supplier Profile
**URL:** `http://localhost:5175/supplier/profile`

**Test Steps:**
1. Login as supplier
2. Navigate to profile
3. ✅ Should see company info
4. ✅ Should see contact details
5. ✅ Should see verification status
6. ✅ Should see document status

**Expected Result:** ✅ Profile displayed correctly

---

### 2. Manage Products (Supplier)
**URL:** `http://localhost:5175/supplier/products`

**Test Steps:**
1. Navigate to My Products
2. ✅ Should see all supplier products
3. Click "Add Product"
4. Fill product form
5. Submit
6. ✅ Should create product
7. ✅ Product visible in list
8. Edit/Delete products
9. ✅ CRUD operations work

**Expected Result:** ✅ Product management working

---

## 🛒 ORDER FLOWS

### 1. Create Order (Buyer)
**Test Steps:**
1. Login as buyer
2. View product
3. Add to cart/order
4. Create order
5. ✅ Should create order
6. ✅ Order status: PENDING
7. ✅ Order visible in orders list

**Expected Result:** ✅ Order created

---

### 2. View Orders
**URL:** `http://localhost:5173/orders`

**Test Steps:**
1. Navigate to orders
2. ✅ Should see all orders
3. ✅ Should see order status
4. ✅ Should see order details
5. Filter by status
6. ✅ Filtering works

**Expected Result:** ✅ Orders displayed correctly

---

## 🔍 SEARCH & FILTER FLOWS

### 1. Product Search
**URL:** `http://localhost:5173/medicines`

**Test Steps:**
1. Navigate to medicines page
2. Enter search term
3. ✅ Should filter products
4. Apply filters (dosage form, availability)
5. ✅ Filters work correctly
6. Sort products
7. ✅ Sorting works

**Expected Result:** ✅ Search and filters working

---

### 2. Supplier Search
**URL:** `http://localhost:5173/suppliers`

**Test Steps:**
1. Navigate to suppliers page
2. Search suppliers
3. ✅ Should filter suppliers
4. View supplier detail
5. ✅ Supplier detail loads

**Expected Result:** ✅ Supplier search working

---

## 💾 SAVED PRODUCTS FLOW

### 1. Save Product
**Test Steps:**
1. View product detail
2. Click "Save" button
3. ✅ Should save product
4. Navigate to Saved Products
5. ✅ Product visible in saved list

**Expected Result:** ✅ Product saved

---

### 2. View Saved Products
**URL:** `http://localhost:5173/saved-products`

**Test Steps:**
1. Navigate to saved products
2. ✅ Should see all saved products
3. Remove saved product
4. ✅ Product removed from list

**Expected Result:** ✅ Saved products working

---

## ⚙️ SETTINGS FLOWS

### 1. System Settings (Admin)
**URL:** `http://localhost:5174/settings`

**Test Steps:**
1. Navigate to settings
2. Update settings
3. Save changes
4. ✅ Should persist settings
5. Refresh page
6. ✅ Settings still saved

**Expected Result:** ✅ Settings persist

---

### 2. User Settings
**URL:** `http://localhost:5173/settings`

**Test Steps:**
1. Navigate to user settings
2. Update profile
3. Save changes
4. ✅ Should update profile
5. ✅ Changes persisted

**Expected Result:** ✅ User settings working

---

## 📊 ANALYTICS & DASHBOARD FLOWS

### 1. Admin Dashboard
**URL:** `http://localhost:5174/dashboard`

**Test Steps:**
1. Login as admin
2. View dashboard
3. ✅ Should see stats cards
4. ✅ Should see charts
5. ✅ Should see recent activity
6. Filter by date range
7. ✅ Filters work

**Expected Result:** ✅ Dashboard loads correctly

---

### 2. Analytics Page
**URL:** `http://localhost:5174/analytics`

**Test Steps:**
1. Navigate to analytics
2. ✅ Should see analytics data
3. ✅ Should see charts
4. ✅ Should see trends
5. Export data
6. ✅ Export works

**Expected Result:** ✅ Analytics working

---

## 🚨 ERROR HANDLING TESTS

### 1. Invalid Login
**Test Steps:**
1. Enter wrong credentials
2. Submit login
3. ✅ Should show error message
4. ✅ Should not redirect
5. ✅ Should not store token

**Expected Result:** ✅ Error handling works

---

### 2. Network Error
**Test Steps:**
1. Stop backend server
2. Try to load page
3. ✅ Should show error message
4. ✅ Should not crash
5. ✅ Should allow retry

**Expected Result:** ✅ Network errors handled

---

### 3. Unauthorized Access
**Test Steps:**
1. Try to access protected route without token
2. ✅ Should redirect to login
3. ✅ Should clear invalid token

**Expected Result:** ✅ Unauthorized access blocked

---

## ✅ FINAL VERIFICATION

### Checklist:
- [ ] All authentication flows work
- [ ] All CRUD operations work
- [ ] All navigation works
- [ ] All forms validate
- [ ] All error handling works
- [ ] All loading states work
- [ ] All success messages show
- [ ] All data persists
- [ ] All filters work
- [ ] All search works

---

## 🎯 SUCCESS CRITERIA

✅ **All flows must:**
1. Complete without errors
2. Show appropriate loading states
3. Display success/error messages
4. Persist data correctly
5. Handle errors gracefully
6. Navigate correctly
7. Update UI after operations

---

**Status:** Ready for comprehensive testing
