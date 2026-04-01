# Supplier Login Credentials

## 🚀 Dummy Test Supplier Accounts

All dummy suppliers use the same password for easy testing: **`Supplier123!`**

### Dummy Supplier 1
**Email:** `supplier1@test.com`  
**Password:** `Supplier123!`  
**Company:** Test Supplier One  
**Country:** India  
**Status:** ✅ Verified & Active  
**Login URL:** http://localhost:5175/supplier/login

### Dummy Supplier 2
**Email:** `supplier2@test.com`  
**Password:** `Supplier123!`  
**Company:** Test Supplier Two  
**Country:** United States  
**Status:** ✅ Verified & Active  
**Login URL:** http://localhost:5175/supplier/login

### Dummy Supplier 3
**Email:** `supplier3@test.com`  
**Password:** `Supplier123!`  
**Company:** Test Supplier Three  
**Country:** Germany  
**Status:** ✅ Verified & Active  
**Login URL:** http://localhost:5175/supplier/login

### Test Supplier Account (Previously Created)
**Email:** `supplier@test.com`  
**Password:** `Supplier123!`  
**Company:** Test Supplier Company  
**Status:** ✅ Verified & Active  
**Login URL:** http://localhost:5175/supplier/login

---

## Existing Suppliers from Database

All existing suppliers use the default password from seed file: **`password123`**

### 1. MediPharma Industries
- **Email:** `vendor1@medipharma.com`
- **Password:** `password123`
- **Supplier ID:** `896c8cac-3ff8-48e5-9c5b-0e0f9ba609ca`
- **User ID:** `7e6e4653-dbb3-4788-948d-418be6777e59`
- **Country:** India
- **Status:** ✅ Verified | Active

### 2. GlobalPharma Solutions
- **Email:** `vendor2@globalpharma.com`
- **Password:** `password123`
- **Supplier ID:** `ffd0d3cf-b41d-4bd0-b302-3300d6c26d37`
- **User ID:** `d15b1151-3dbc-4cb9-8958-8e91300cc056`
- **Country:** Germany
- **Status:** ✅ Verified | Active

### 3. BioMed Exports Ltd
- **Email:** `vendor3@biomed.com`
- **Password:** `password123`
- **Supplier ID:** `09662ea0-4e45-49e2-b550-888fe37bd84a`
- **User ID:** `369fdb11-c427-4efb-8e8b-a1a012554163`
- **Country:** United Kingdom
- **Status:** ✅ Verified | Active

### 4. PharmaCore International
- **Email:** `vendor4@pharmacore.com`
- **Password:** `password123`
- **Supplier ID:** `9c8eaa83-39c1-4220-81d9-5bf56d01be8b`
- **User ID:** `e0607cee-6c6b-41b5-8ffb-76cecb5a220d`
- **Country:** United States
- **Status:** ✅ Verified | Active

### 5. Asian Pharma Group
- **Email:** `vendor5@asianpharma.com`
- **Password:** `password123`
- **Supplier ID:** `32ff8b63-2aee-4e7b-95df-a6c45b796d01`
- **User ID:** `68f65650-49f7-4d9e-a87e-adbedf316a36`
- **Country:** China
- **Status:** ✅ Verified | Active

---

## Quick Access

### To View All Suppliers:
```bash
cd backend
node scripts/get-suppliers.js
```

### To Create Dummy Suppliers (3 accounts):
```bash
cd backend
node scripts/create-dummy-suppliers.js
```

### To Create Single Test Supplier:
```bash
cd backend
node scripts/create-test-supplier.js
```

### To Register New Supplier:
Visit: http://localhost:5175/supplier/register

---

## Notes

- All passwords are hashed in the database and cannot be retrieved
- Default seed password for all vendors: `password123`
- New test supplier password: `Supplier123!`
- Suppliers must be verified by admin before they can fully access the system
- Login endpoint: `POST /api/auth/login`
