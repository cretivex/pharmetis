# SUPPLIER DASHBOARD PAGE AUDIT REPORT
**Page:** `/supplier/dashboard`  
**Date:** 2026-02-23

---

## STEP 1 — API ENDPOINTS IDENTIFIED

### Endpoints Used:
1. **GET `/api/rfqs/assigned`**
   - Method: GET
   - Request: None (uses authenticated user from token)
   - Response: `{ success: boolean, message: string, data: RFQ[] }`
   - Purpose: Get RFQs assigned to the logged-in supplier (status SENT, not yet responded)

---

## STEP 2 — BACKEND VALIDATION

### ✅ Controller: `getAssignedRFQs`
- **File:** `backend/src/modules/rfqs/rfqs.controller.js`
- ✅ Has try/catch block
- ✅ Proper status code: 200
- ✅ Standardized response format: `{ success: true, message: string, data: result }`
- ✅ Uses `req.user.id` from authentication middleware

### ✅ Service: `getAssignedRFQsService`
- **File:** `backend/src/modules/rfqs/rfqs.service.js`
- ✅ Proper Prisma queries
- ✅ Validates supplier exists
- ✅ Filters RFQs by status SENT
- ✅ Excludes RFQs supplier already responded to
- ✅ Includes related data (buyer, items, product info)
- ✅ Error handling with ApiError

### ✅ Route Configuration
- **File:** `backend/src/modules/rfqs/rfqs.routes.js`
- ✅ Protected with `authenticate` middleware
- ✅ Route order: `/assigned` before `/:id` (correct)

---

## STEP 3 — DATABASE VERIFICATION

### RFQ Model Structure:
```sql
-- Verify RFQs assigned to supplier
SELECT 
  rfq.id,
  rfq.title,
  rfq.status,
  rfq."buyerId",
  rfq."expiresAt",
  rfq."createdAt",
  rfq."updatedAt",
  rfq."deletedAt",
  s.id as supplier_id,
  s."companyName" as supplier_name,
  u.id as user_id,
  u.email as user_email
FROM rfqs rfq
CROSS JOIN suppliers s
JOIN users u ON u.id = s."userId"
WHERE rfq.status = 'SENT'
  AND rfq."deletedAt" IS NULL
  AND s."deletedAt" IS NULL
  AND s."isActive" = true
  AND rfq.id NOT IN (
    SELECT "rfqId" 
    FROM rfq_responses 
    WHERE "supplierId" = s.id
  )
ORDER BY rfq."createdAt" DESC;

-- Check supplier exists and is active
SELECT 
  s.id,
  s."companyName",
  s."isVerified",
  s."isActive",
  s."deletedAt",
  u.id as user_id,
  u.email,
  u.role
FROM suppliers s
JOIN users u ON u.id = s."userId"
WHERE s."deletedAt" IS NULL
  AND u."deletedAt" IS NULL
ORDER BY s."createdAt" DESC;

-- Verify RFQ items are included
SELECT 
  rfq.id as rfq_id,
  rfq.title,
  COUNT(rfi.id) as item_count
FROM rfqs rfq
LEFT JOIN rfq_items rfi ON rfi."rfqId" = rfq.id
WHERE rfq."deletedAt" IS NULL
GROUP BY rfq.id
ORDER BY rfq."createdAt" DESC;

-- Check RFQ responses to verify exclusion logic
SELECT 
  rr.id as response_id,
  rr."rfqId",
  rr."supplierId",
  rr."isAccepted",
  rr."createdAt",
  s."companyName" as supplier_name
FROM rfq_responses rr
JOIN suppliers s ON s.id = rr."supplierId"
WHERE s."deletedAt" IS NULL
ORDER BY rr."createdAt" DESC;

-- Verify timestamps
SELECT 
  id,
  title,
  status,
  "createdAt",
  "updatedAt",
  CASE 
    WHEN "updatedAt" > "createdAt" THEN '✅ Updated'
    ELSE '⚠️ Not updated'
  END as timestamp_status
FROM rfqs
WHERE "deletedAt" IS NULL
ORDER BY "createdAt" DESC
LIMIT 10;
```

### ✅ Database Structure:
- `createdAt` and `updatedAt` fields exist ✅
- Soft delete: `deletedAt` field exists ✅
- Foreign keys: `buyerId` → `users.id`, `rfqId` → `rfqs.id` ✅
- Indexes on `status`, `createdAt`, `deletedAt` ✅

---

## STEP 4 — FRONTEND BUTTON VALIDATION

### Buttons Checked:

1. **"Respond" Button** (for RFQs with status SENT)
   - ✅ Calls correct navigation: `navigate(\`/supplier/rfqs/${rfq.id}\`)`
   - ✅ Conditional rendering: Only shows for status === 'SENT'
   - ✅ Has proper styling and icon
   - ⚠️ No loading state (not needed for navigation)
   - ✅ Error handling: Navigation errors handled by React Router

2. **"View" Button** (for other statuses)
   - ✅ Calls correct navigation: `navigate(\`/supplier/rfqs/${rfq.id}\`)`
   - ✅ Conditional rendering: Shows for non-SENT statuses
   - ✅ Has proper styling
   - ⚠️ No loading state (not needed for navigation)

### Data Loading:
- ✅ Has loading state: `loading` state with Loader2 spinner
- ✅ Error handling: try/catch with console.error
- ✅ Empty state: Shows message when no RFQs
- ⚠️ No error message displayed to user (only console.error)
- ✅ UI updates: Stats calculated from loaded data

### Issues Found:
1. ⚠️ **No error message displayed to user** - Errors only logged to console
2. ⚠️ **Stats calculation might be incorrect** - Stats based on assigned RFQs only, not all RFQs supplier has access to
3. ⚠️ **No refresh/retry button** - If load fails, user can't retry without page refresh

---

## STEP 5 — SECURITY CHECK

### ✅ Protected Routes:
- Route uses `authenticate` middleware ✅
- Route defined in `rfqs.routes.js` with `router.use(authenticate)` ✅

### ✅ Role-Based Access:
- `getAssignedRFQsService` checks:
  - Supplier exists and is active ✅
  - Uses `req.user.id` from JWT token ✅
  - Only returns RFQs supplier hasn't responded to ✅

### ✅ Error Exposure:
- Errors go through error middleware ✅
- No raw database errors exposed ✅
- Proper ApiError usage ✅
- 404 error for supplier not found ✅

---

## ISSUES FOUND & FIXES

### Issue 1: No Error Message Displayed to User
**Problem:** Errors only logged to console, user sees empty state  
**Fix:** Add error state and display error message

### Issue 2: Stats Might Be Incomplete
**Problem:** Stats only count assigned RFQs, not submitted responses  
**Fix:** Fetch submitted responses separately or adjust calculation

### Issue 3: No Refresh/Retry Functionality
**Problem:** If load fails, user can't retry  
**Fix:** Add retry button or auto-retry

---

## FIX CODE

### Fix 1: Add Error Display and Retry
```javascript
const [error, setError] = useState(null)

const loadRFQs = async () => {
  try {
    setLoading(true)
    setError(null)
    const data = await getAssignedRFQs()
    const rfqsList = Array.isArray(data) ? data : (data?.rfqs || data || [])
    setRfqs(rfqsList)
    
    setStats({
      assigned: rfqsList.length,
      pending: rfqsList.filter(r => r.status === 'SENT').length,
      submitted: rfqsList.filter(r => r.status === 'RESPONDED').length,
    })
  } catch (error) {
    console.error('Failed to load RFQs:', error)
    setError(error.response?.data?.message || 'Failed to load RFQs')
    setRfqs([])
  } finally {
    setLoading(false)
  }
}
```

### Fix 2: Fetch Submitted Responses for Accurate Stats
```javascript
const loadDashboardData = async () => {
  try {
    setLoading(true)
    setError(null)
    
    const [assignedData, responsesData] = await Promise.all([
      getAssignedRFQs(),
      getMyResponses()
    ])
    
    const rfqsList = Array.isArray(assignedData) ? assignedData : (assignedData?.rfqs || assignedData || [])
    const responsesList = Array.isArray(responsesData) ? responsesData : (responsesData || [])
    
    setRfqs(rfqsList)
    
    setStats({
      assigned: rfqsList.length,
      pending: rfqsList.filter(r => r.status === 'SENT').length,
      submitted: responsesList.length,
    })
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    setError(error.response?.data?.message || 'Failed to load dashboard data')
    setRfqs([])
  } finally {
    setLoading(false)
  }
}
```

---

## DB VERIFICATION SQL

```sql
-- Get assigned RFQs for a specific supplier
WITH supplier_data AS (
  SELECT s.id as supplier_id, u.id as user_id
  FROM suppliers s
  JOIN users u ON u.id = s."userId"
  WHERE u.email = 'supplier1@test.com'
    AND s."deletedAt" IS NULL
)
SELECT 
  rfq.id,
  rfq.title,
  rfq.status,
  rfq."expiresAt",
  rfq."createdAt",
  rfq."updatedAt",
  COUNT(rfi.id) as item_count,
  COUNT(rr.id) as response_count
FROM rfqs rfq
CROSS JOIN supplier_data sd
LEFT JOIN rfq_items rfi ON rfi."rfqId" = rfq.id
LEFT JOIN rfq_responses rr ON rr."rfqId" = rfq.id AND rr."supplierId" = sd.supplier_id
WHERE rfq.status = 'SENT'
  AND rfq."deletedAt" IS NULL
  AND rfq.id NOT IN (
    SELECT "rfqId" 
    FROM rfq_responses 
    WHERE "supplierId" = sd.supplier_id
  )
GROUP BY rfq.id
ORDER BY rfq."createdAt" DESC;

-- Verify supplier can access their assigned RFQs
SELECT 
  s.id as supplier_id,
  s."companyName",
  COUNT(DISTINCT rfq.id) as assigned_rfqs,
  COUNT(DISTINCT CASE WHEN rfq.status = 'SENT' THEN rfq.id END) as pending_rfqs,
  COUNT(DISTINCT rr.id) as submitted_responses
FROM suppliers s
JOIN users u ON u.id = s."userId"
LEFT JOIN rfqs rfq ON rfq.status = 'SENT' 
  AND rfq."deletedAt" IS NULL
  AND rfq.id NOT IN (
    SELECT "rfqId" FROM rfq_responses WHERE "supplierId" = s.id
  )
LEFT JOIN rfq_responses rr ON rr."supplierId" = s.id
WHERE s."deletedAt" IS NULL
  AND u.email = 'supplier1@test.com'
GROUP BY s.id, s."companyName";
```

---

## FINAL APPROVAL STATUS

### ⚠️ Needs Fix

**Working:**
- ✅ API endpoint functional
- ✅ Backend validation correct
- ✅ Database structure correct
- ✅ Security middleware in place
- ✅ Navigation buttons work

**Issues:**
- ⚠️ No error message displayed to user
- ⚠️ Stats calculation might be incomplete (submitted count based on assigned RFQs, not actual responses)
- ⚠️ No retry functionality on error

**Critical Issues:** None

**Status:** ⚠️ **NEEDS FIX** (Minor UX improvements needed)
