# Settings Data Persistence Fix

## Problem
When updating profile data in Settings page and reloading, data was reset to original values. Data wasn't persisting.

## Root Causes

1. **Buyer users don't have Supplier records**
   - `companyName`, `phone`, `country`, `city` were only saved to Supplier table
   - Buyers don't have Supplier records, so data was lost

2. **Frontend not reloading after save**
   - After saving, frontend didn't fetch updated data from server
   - UI showed old cached values

3. **Data mapping issue**
   - Frontend expected data from `supplier` object
   - But buyers don't have supplier records

## Fixes Applied

### 1. Added Fields to User Model
**File**: `backend/prisma/schema.prisma`

Added to User model:
- `companyName String?`
- `phone String?`
- `country String?`
- `city String?`

**Why**: Now both buyers and vendors can store company info in User table.

### 2. Updated Service to Save to User Table
**File**: `backend/src/modules/users/users.service.js`

**Changes**:
- Save `companyName`, `phone`, `country`, `city` to User table for ALL users
- For vendors, ALSO save to Supplier table (for business profile)
- Return data from User table (with fallback to Supplier for vendors)

### 3. Frontend Reloads Data After Save
**File**: `frontend - user/src/pages/Settings.jsx`

**Changes**:
- `handleSaveProfile()` now calls `loadUserData()` after save
- `handleSaveSettings()` now calls `getSettings()` after save
- Ensures UI shows latest data from database

### 4. Fixed Data Mapping
**File**: `frontend - user/src/pages/Settings.jsx`

**Changes**:
- Load from `profileData.companyName` first, fallback to `supplier.companyName`
- Same for phone, country, city
- Works for both buyers and vendors

## Database Migration

Run:
```bash
cd backend
npm run prisma:push
```

This adds columns to `users` table:
- `companyName`
- `phone`
- `country`
- `city`

## Verification

### SQL Query to Verify:
```sql
-- Check user profile data
SELECT 
  id,
  email,
  "fullName",
  "companyName",
  phone,
  country,
  city,
  "updatedAt"
FROM users
WHERE "deletedAt" IS NULL
ORDER BY "updatedAt" DESC
LIMIT 5;

-- Verify data persists after update
-- 1. Update profile in UI
-- 2. Reload page
-- 3. Check updatedAt timestamp changed
-- 4. Verify all fields show updated values
```

### Test Steps:
1. ✅ Update profile fields (fullName, email, companyName, phone, country, city)
2. ✅ Click "Save Changes"
3. ✅ Wait for success message
4. ✅ Reload page (F5)
5. ✅ Verify all updated values are still there

## Status

✅ **FIXED** - Data now persists correctly after page reload.

All profile fields are saved to database and reloaded correctly.
