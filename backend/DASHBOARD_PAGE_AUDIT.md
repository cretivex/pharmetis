# Dashboard Page Audit Report
## URL: http://localhost:5174/dashboard

---

## STEP 1 — API Endpoints

| Endpoint | Method | Auth | Purpose | Status |
|----------|--------|------|---------|--------|
| `/api/dashboard/stats` | GET | ✅ Required (ADMIN) | Load dashboard statistics | ✅ Working |

**Request:**
- Headers: `Authorization: Bearer <token>`
- No body required

**Response Structure:**
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "kpis": {
      "activeRFQs": number,
      "pipelineValue": number,
      "avgQuoteTime": string,
      "conversionRate": number,
      "expiringSoon": number
    },
    "urgencyAlerts": {
      "expiring": number,
      "noSuppliers": number,
      "pendingReview": number,
      "inactive": number
    },
    "activeRFQs": [...],
    "financialMetrics": {...},
    "supplierHealth": [...]
  }
}
```

---

## STEP 2 — Backend Validation

### Controller: ✅
- ✅ Try/catch exists
- ✅ Status code 200
- ✅ Error handling via `next(error)`
- ✅ API response format correct: `{ success, message, data }`

### Service: ✅
- ✅ Prisma queries correct
- ✅ Soft delete check: `deletedAt: null`
- ✅ Status filtering: Excludes DRAFT and CLOSED RFQs
- ✅ Date calculations for expiring RFQs (7 days)
- ✅ Date calculations for inactive suppliers (30 days)
- ✅ Pipeline value uses actual product MRP from items
- ✅ Average quote time calculated from timestamps
- ✅ Supplier response rates calculated from data
- ✅ Includes relations (buyer, items, responses)

### Issues Found:

#### ⚠️ Issue 1: Product MRP Type Handling
**Location:** `dashboard.service.js:38`
**Problem:** Product MRP is Decimal type, needs proper parsing
**Current Code:**
```javascript
const mrp = item.product?.mrp ? parseFloat(item.product.mrp.toString()) : 0;
```
**Status:** ✅ Already handled correctly

#### ⚠️ Issue 2: Supplier Response Rate Calculation Logic
**Location:** `dashboard.service.js:177-200`
**Problem:** `totalRFQs` and `respondedRFQs` use identical queries, resulting in 100% response rate
**Current Code:**
```javascript
const totalRFQs = await prisma.rFQ.count({
  where: {
    deletedAt: null,
    status: { notIn: ['DRAFT'] },
    responses: {
      some: {
        supplierId: supplier.id
      }
    }
  }
});

const respondedRFQs = await prisma.rFQ.count({
  where: {
    deletedAt: null,
    status: { notIn: ['DRAFT'] },
    responses: {
      some: {
        supplierId: supplier.id
      }
    }
  }
});
```
**Fix Required:** Calculate total RFQs assigned to supplier vs responded RFQs

#### ⚠️ Issue 3: Supplier Health Missing Response Count
**Location:** `dashboard.service.js:162-166`
**Problem:** Supplier query includes `_count.responses` but it's not used
**Status:** ⚠️ Not critical but inefficient

---

## STEP 3 — Database Verification

### Verification SQL:

```sql
-- Check active RFQs count
SELECT COUNT(*) as active_rfqs
FROM rfqs
WHERE "deletedAt" IS NULL
AND status NOT IN ('DRAFT', 'CLOSED');

-- Check expiring RFQs (7 days)
SELECT COUNT(*) as expiring_soon
FROM rfqs
WHERE "deletedAt" IS NULL
AND "expiresAt" >= NOW()
AND "expiresAt" <= NOW() + INTERVAL '7 days'
AND status NOT IN ('CLOSED');

-- Check RFQs with no suppliers (no responses)
SELECT COUNT(*) as no_suppliers
FROM rfqs r
WHERE r."deletedAt" IS NULL
AND r.status NOT IN ('DRAFT', 'CLOSED')
AND NOT EXISTS (
  SELECT 1 FROM rfq_responses rr 
  WHERE rr."rfqId" = r.id
);

-- Check pending review quotations
SELECT COUNT(*) as pending_review
FROM rfq_responses rr
INNER JOIN rfqs r ON r.id = rr."rfqId"
WHERE r."deletedAt" IS NULL
AND r.status NOT IN ('CLOSED');

-- Check inactive suppliers (>30 days)
SELECT COUNT(*) as inactive_suppliers
FROM suppliers
WHERE "deletedAt" IS NULL
AND "isActive" = true
AND "updatedAt" < NOW() - INTERVAL '30 days';

-- Verify pipeline value calculation
SELECT 
  SUM(ri.quantity::numeric * COALESCE(p.mrp, 0)) as pipeline_value
FROM rfq_items ri
INNER JOIN rfqs r ON r.id = ri."rfqId"
LEFT JOIN products p ON p.id = ri."productId"
WHERE r."deletedAt" IS NULL
AND r.status NOT IN ('DRAFT', 'CLOSED')
AND ri."productId" IS NOT NULL;

-- Verify conversion rate
SELECT 
  COUNT(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM rfq_responses rr WHERE rr."rfqId" = r.id
  )) as with_responses,
  COUNT(*) as total_rfqs,
  ROUND(
    (COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM rfq_responses rr WHERE rr."rfqId" = r.id
    ))::numeric / NULLIF(COUNT(*), 0)::numeric) * 100, 
    1
  ) as conversion_rate
FROM rfqs r
WHERE r."deletedAt" IS NULL
AND r.status != 'DRAFT';

-- Verify supplier response rates
SELECT 
  s.id,
  s."companyName",
  COUNT(DISTINCT r.id) FILTER (WHERE r."deletedAt" IS NULL AND r.status NOT IN ('DRAFT')) as total_rfqs,
  COUNT(DISTINCT r.id) FILTER (
    WHERE r."deletedAt" IS NULL 
    AND r.status NOT IN ('DRAFT')
    AND EXISTS (
      SELECT 1 FROM rfq_responses rr 
      WHERE rr."rfqId" = r.id AND rr."supplierId" = s.id
    )
  ) as responded_rfqs,
  ROUND(
    (COUNT(DISTINCT r.id) FILTER (
      WHERE r."deletedAt" IS NULL 
      AND r.status NOT IN ('DRAFT')
      AND EXISTS (
        SELECT 1 FROM rfq_responses rr 
        WHERE rr."rfqId" = r.id AND rr."supplierId" = s.id
      )
    )::numeric / NULLIF(COUNT(DISTINCT r.id) FILTER (WHERE r."deletedAt" IS NULL AND r.status NOT IN ('DRAFT')), 0)::numeric) * 100,
    1
  ) as response_rate
FROM suppliers s
LEFT JOIN rfq_responses rr ON rr."supplierId" = s.id
LEFT JOIN rfqs r ON r.id = rr."rfqId"
WHERE s."deletedAt" IS NULL
AND s."isActive" = true
GROUP BY s.id, s."companyName"
LIMIT 4;
```

### Database Status: ✅
- ✅ `createdAt` and `updatedAt` working
- ✅ Soft delete implemented (`deletedAt`)
- ✅ Foreign keys correct (buyerId, rfqId, supplierId)
- ✅ All required fields present

---

## STEP 4 — Frontend Button Validation

### Buttons: ✅
1. **"View All" (Urgency Alerts)** ⚠️
   - Calls: None (no onClick handler)
   - Status: ⚠️ Button exists but not functional

2. **"View All" (RFQs)** ✅
   - Calls: `navigate('/rfq')`
   - Status: ✅ Working

3. **"View" (RFQ row)** ✅
   - Calls: `navigate(`/rfq/${rfq.id}`)`
   - Status: ✅ Working

4. **"View All" (Suppliers)** ✅
   - Calls: `navigate('/suppliers')`
   - Status: ✅ Working

### Loading State: ✅
- ✅ Loading spinner shown while fetching
- ✅ Error message displayed on failure
- ✅ Empty states handled

### Error Handling: ✅
- ✅ Try/catch in `loadDashboardData`
- ✅ Error state displayed
- ✅ Console error logging

### UI Updates: ✅
- ✅ State updates after API call
- ✅ Data formatted correctly (currency, percentages)
- ✅ Real-time data display

---

## STEP 5 — Security Check

### Auth Middleware: ✅
- ✅ Route protected: `authenticate` middleware
- ✅ Role-based access: `authorize('ADMIN')` middleware
- ✅ Token required in Authorization header
- ✅ 401 redirects to login (via axios interceptor)
- ✅ 403 for non-admin users

### Error Exposure: ✅
- ✅ No raw stack traces in production
- ✅ Generic error messages
- ✅ Error middleware handles exceptions

---

## ISSUES FOUND & FIXES

### Issue 1: Supplier Response Rate Calculation (CRITICAL)
**Severity:** ⚠️ Medium
**Location:** `backend/src/modules/dashboard/dashboard.service.js:177-200`
**Problem:** Both `totalRFQs` and `respondedRFQs` use identical queries, always resulting in 100% response rate
**Fix Required:** Calculate total RFQs assigned to supplier vs responded RFQs

### Issue 2: "View All" Button Not Functional
**Severity:** ⚠️ Low
**Location:** `frontend-admin/src/pages/Dashboard.jsx:377`
**Problem:** "View All" button in Urgency Alerts has no onClick handler
**Fix Required:** Add navigation or filter functionality

---

## FIX CODE

### Fix 1: Supplier Response Rate Calculation

```javascript
// backend/src/modules/dashboard/dashboard.service.js

// Replace lines 177-200 with:
const supplierResponseStats = await Promise.all(
  suppliers.map(async (supplier) => {
    // Count total RFQs (all RFQs, not just ones this supplier responded to)
    const totalRFQs = await prisma.rFQ.count({
      where: {
        deletedAt: null,
        status: { notIn: ['DRAFT', 'CLOSED'] }
      }
    });

    // Count RFQs this supplier has responded to
    const respondedRFQs = await prisma.rFQ.count({
      where: {
        deletedAt: null,
        status: { notIn: ['DRAFT', 'CLOSED'] },
        responses: {
          some: {
            supplierId: supplier.id
          }
        }
      }
    });

    const responseRate = totalRFQs > 0 
      ? ((respondedRFQs / totalRFQs) * 100).toFixed(1)
      : 0;

    const lastActive = supplier.updatedAt;
    const daysSinceUpdate = Math.ceil((now - new Date(lastActive)) / (1000 * 60 * 60 * 24));
    
    let lastActiveText = 'Today';
    if (daysSinceUpdate === 1) lastActiveText = '1 day ago';
    else if (daysSinceUpdate > 1) lastActiveText = `${daysSinceUpdate} days ago`;

    return {
      name: supplier.companyName,
      status: daysSinceUpdate > 30 ? 'warning' : 'active',
      responseRate: parseFloat(responseRate),
      lastActive: lastActiveText
    };
  })
);
```

### Fix 2: Add onClick to "View All" Button

```javascript
// frontend-admin/src/pages/Dashboard.jsx

// Replace line 377 with:
<Button 
  variant="ghost" 
  size="sm" 
  className="h-7 text-xs"
  onClick={() => navigate('/rfq?filter=expiring')}
>
  View All
  <ArrowRight className="w-3 h-3 ml-1" />
</Button>
```

---

## DB VERIFICATION SQL

```sql
-- Verify dashboard stats match database
SELECT 
  (SELECT COUNT(*) FROM rfqs WHERE "deletedAt" IS NULL AND status NOT IN ('DRAFT', 'CLOSED')) as active_rfqs,
  (SELECT COUNT(*) FROM rfqs WHERE "deletedAt" IS NULL AND "expiresAt" >= NOW() AND "expiresAt" <= NOW() + INTERVAL '7 days' AND status NOT IN ('CLOSED')) as expiring_soon,
  (SELECT COUNT(*) FROM rfqs WHERE "deletedAt" IS NULL AND status NOT IN ('DRAFT', 'CLOSED') AND NOT EXISTS (SELECT 1 FROM rfq_responses WHERE "rfqId" = rfqs.id)) as no_suppliers,
  (SELECT COUNT(*) FROM rfq_responses rr INNER JOIN rfqs r ON r.id = rr."rfqId" WHERE r."deletedAt" IS NULL AND r.status NOT IN ('CLOSED')) as pending_review,
  (SELECT COUNT(*) FROM suppliers WHERE "deletedAt" IS NULL AND "isActive" = true AND "updatedAt" < NOW() - INTERVAL '30 days') as inactive_suppliers;
```

---

## FINAL APPROVAL STATUS

### ⚠️ **NEEDS FIX**

**Issues:**
- ⚠️ Supplier response rate calculation is incorrect (always 100%)
- ⚠️ "View All" button in Urgency Alerts not functional

**All Other Requirements Met:**
- ✅ API endpoint working
- ✅ Backend validation complete
- ✅ Database queries verified
- ✅ Frontend buttons functional (except one)
- ✅ Security checks passed
- ✅ Real data from PostgreSQL
- ✅ CRUD operations verified (read-only page)

**Recommendation:** Fix supplier response rate calculation before production deployment.
