# DUMMY SUPPLIER LOGIN CREDENTIALS

## 🚀 Quick Test Accounts

All dummy suppliers use the same password for easy testing: **`Supplier123!`**

### Test Supplier 1
- **Email:** `supplier1@test.com`
- **Password:** `Supplier123!`
- **Company:** Test Supplier One
- **Country:** India
- **Status:** ✅ Verified & Active
- **Login URL:** http://localhost:5175/supplier/login

### Test Supplier 2
- **Email:** `supplier2@test.com`
- **Password:** `Supplier123!`
- **Company:** Test Supplier Two
- **Country:** United States
- **Status:** ✅ Verified & Active
- **Login URL:** http://localhost:5175/supplier/login

### Test Supplier 3
- **Email:** `supplier3@test.com`
- **Password:** `Supplier123!`
- **Company:** Test Supplier Three
- **Country:** Germany
- **Status:** ✅ Verified & Active
- **Login URL:** http://localhost:5175/supplier/login

---

## 📝 Additional Test Accounts

### Previously Created Test Supplier
- **Email:** `supplier@test.com`
- **Password:** `Supplier123!`
- **Company:** Test Supplier Company
- **Status:** ✅ Verified & Active

### Seed Data Suppliers (from database seed)
All use password: **`password123`**

1. **MediPharma Industries**
   - Email: `vendor1@medipharma.com`
   - Password: `password123`

2. **GlobalPharma Solutions**
   - Email: `vendor2@globalpharma.com`
   - Password: `password123`

3. **BioMed Exports Ltd**
   - Email: `vendor3@biomed.com`
   - Password: `password123`

4. **PharmaCore International**
   - Email: `vendor4@pharmacore.com`
   - Password: `password123`

5. **Asian Pharma Group**
   - Email: `vendor5@asianpharma.com`
   - Password: `password123`

---

## 🔧 How to Create More Dummy Suppliers

### Option 1: Using the Script
```bash
cd backend
node scripts/create-dummy-suppliers.js
```

### Option 2: Using the Test Supplier Script
```bash
cd backend
node scripts/create-test-supplier.js
```

### Option 3: Manual Registration
Visit: http://localhost:5175/supplier/register

---

## 📋 Quick Reference

**All Dummy Suppliers:**
- Password: `Supplier123!`
- Status: Auto-verified and Active
- Can login immediately
- Can submit RFQ responses
- Can manage products

**Login Endpoint:**
- URL: `POST /api/auth/login`
- Body: `{ "email": "supplier1@test.com", "password": "Supplier123!" }`

**Supplier Portal:**
- Login: http://localhost:5175/supplier/login
- Dashboard: http://localhost:5175/supplier/dashboard
- Products: http://localhost:5175/supplier/products
- Profile: http://localhost:5175/supplier/profile

---

## ✅ Verification

To verify suppliers exist in database:
```bash
cd backend
node scripts/get-suppliers.js
```

---

**Note:** All dummy suppliers are pre-verified and active for immediate testing. No admin approval required.
