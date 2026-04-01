# PharmaTrade B2B Marketplace — Production Readiness Audit (2026)

**Audit type:** Pre-launch due diligence (investor/CTO lens)  
**Scope:** Frontend (user), Backend (API), Roles, Security, CRUD, Performance, Edge cases, Scalability  
**Date:** 2026

---

## 🔎 1. FRONTEND AUDIT

### Route protection
| Issue | Severity |
|-------|----------|
| No shared `ProtectedRoute` component; each page/layout implements its own `authService.isAuthenticated()` + `navigate('/login')`. Inconsistent and easy to miss on new routes. | **High** |
| `/checkout/:quotationId`, `/payment`, `/settings` have **no route-level guard**. User can open URLs directly; protection relies on in-page logic or API 403. | **High** |
| `/send-rfq` checks role in-page and shows error but does not redirect to `/unauthorized` when role is wrong. | **Medium** |

### Reusability & duplication
| Issue | Severity |
|-------|----------|
| **Loading:** Ad-hoc spinners and "Loading…" text in every page; no shared `Loading` or `Spinner` component. | Low |
| **Empty state:** "No X found" implemented locally in Orders, MyRFQs, Suppliers, Medicines, SendRFQ, etc.; no shared `EmptyState`. | Low |
| **Error state:** Per-page `error` + inline message/alert; no shared `ErrorState` or toast. | Medium |
| **Forms:** EditDelivery and Checkout duplicate validation pattern (`validateForm`, `validationErrors`, inline borders). | Low |
| **Settings:** Two separate Settings pages (root `/settings` and `/buyer/settings`) with overlapping concerns. | Low |

### Design tokens & theming
| Issue | Severity |
|-------|----------|
| No single design-token system. Tailwind `theme.extend` has a few colors; many components use raw `slate-*`, `blue-*`. | Low |
| **Hardcoded colors:** SendRFQ (`#F7F9FC`, `#F0FDF4`, `#FEF3C7`, etc.), Checkout/Settings (`#F3F4F6`), Payment (`#3b82f6`, `#e2e8f0`). Not theme/dark-mode friendly. | Medium |
| `index.css` uses `rgba(...)` in utilities; no CSS variables for colors. ThemeContext toggles `.dark`; no `:root` design tokens in frontend user (some in MedicineDetail redesign). | Low |

### Forms & validation
| Issue | Severity |
|-------|----------|
| **No validation library** (no Zod/Yup). Manual checks in SendRFQ, EditDelivery, Checkout. | Medium |
| Login/Register/RequestAccess rely on HTML `required` and API error messages only. | Low |
| Inconsistent validation UX (some inline errors, some banners). | Low |

### Loading / empty / error
| Issue | Severity |
|-------|----------|
| **Skeleton loaders:** Only buyer Suppliers uses `animate-pulse`; no shared Skeleton component elsewhere. | Low |
| **API failures:** Handled in try/catch with `setError(...)`; no global toast or error boundary. 401 triggers redirect and localStorage clear in axios interceptor. | Medium |
| **403/404/5xx:** Not handled in axios interceptor; only 401 triggers redirect. Users may see raw error or blank state. | Medium |

### Other
| Issue | Severity |
|-------|----------|
| **Unnecessary re-renders:** No audit of React.memo/useMemo/useCallback; ProductCard and list pages may re-render more than needed. | Low |
| **Console:** `console.log`/`console.error` still present in some files (e.g. ProductCard, backend references). | Low |

---

## 🔐 2. ROLE & PERMISSION AUDIT

### Roles in use
- **ADMIN** — dashboard, analytics, system settings, admin orders, admin buyers, review/send RFQ responses, supplier CRUD.
- **BUYER** — RFQs, quotations, checkout, payments, orders, saved products, buyer dashboard.
- **VENDOR (supplier)** — products (own), RFQ responses, profile.

### Backend enforcement (good)
- `authenticate` + `authorize(...roles)` used on routes. Buyer routes use `authorize('BUYER', 'ADMIN')`; admin routes use `authorize('ADMIN')`; checkout/payments use `authorize('BUYER')`.
- RFQ services filter by `buyerId` when role is not ADMIN; `getRFQByIdService`, update, delete enforce ownership.
- Product create/update/delete: VENDOR gets `supplierId` from profile and ownership checked in controller.
- RFQ responses: ADMIN-only for review/send-to-buyer; ownership checks in services.

### Vulnerabilities
| Issue | Severity |
|-------|----------|
| **Hardcoded admin escalation:** `secure-otp.service.js` auto-upgrades `cretivex4@gmail.com` to ADMIN on OTP verify. Backdoor and role-escalation risk. | **Critical** |
| **Frontend-only checks:** Buyer dashboard and Send RFQ rely on layout/page checks. A determined user can call buyer/admin APIs via Postman with a stolen token; backend correctly returns 403, but UX is inconsistent and some routes (e.g. `/checkout`, `/payment`) are reachable without guard. | **High** |
| **BUYER can hit buyer APIs:** Correct. ADMIN can hit buyer endpoints by design. No issue. | — |
| **Admin accidentally hitting buyer-only APIs:** If admin uses same frontend, they can; backend allows ADMIN on buyer routes. Not a vulnerability. | — |
| **RFQ/Quotation:** Backend validates `buyerId` and quotation status; Postman cannot bypass without valid token and correct role. | — |

---

## 🧠 3. API & BACKEND AUDIT

### REST and status codes
- **401** used for missing/invalid/expired token (auth middleware, JWT errors). **Correct.**
- **403** used for role mismatch (authorize middleware). **Correct.**
- **404** used for not found (e.g. product by slug, Prisma P2025). **Correct.**
- **400** used for validation (Joi), bad request. **Correct.**
- **409** for duplicate (e.g. email) in error handler. **Correct.**
- **500** fallback in error handler. **Correct.**

### Validation
- **Joi** used for body validation via `validate(schema)` on auth, products, suppliers, buyer RFQ, payments, RFQ responses, users.
- **Gap:** Only `req.body` is validated. **`req.params` and `req.query` are not validated** (e.g. UUID for `id`, slug format). Prisma will throw for invalid UUID; malicious slug input could cause unexpected behavior if not sanitized elsewhere.

### Slugs
- Product: slug unique per `(supplierId, slug)`. Generated from name with duplicate check in create/update. **Safe.**
- Supplier: slug unique; generated in supplier creation. **Safe.**
- Get by slug: `findFirst({ where: { slug, deletedAt: null } })`. No raw SQL. **No SQL injection from slug.**

### SQL / injection
- Prisma used throughout; no raw SQL in reviewed code. **Low injection risk.**

### Pagination
- Products, suppliers, buyers, RFQs, orders, admin orders use `skip`/`take` and return `pagination: { page, limit, total, totalPages }`. **Implemented.**

### N+1 and performance
- Product list uses `include` for supplier, images, productCategories (with category); single query. **No N+1 in getProductsService.**
- Not audited every list endpoint; possible N+1 in complex RFQ/order includes. **Worth a targeted check.**

### Indexes (Prisma schema)
- User: email, role, createdAt, deletedAt.
- Product: slug, supplierId, dosageForm, availability, isActive, deletedAt; unique (supplierId, slug).
- Supplier: slug, country, isVerified, isActive, deletedAt.
- RefreshToken, OTP, etc. indexed. **Reasonable.**

### Timestamps and soft delete
- Models use `createdAt`/`updatedAt`. **Correct.**
- User, Supplier, Product use `deletedAt` (soft delete). Queries filter `deletedAt: null` where appropriate. **Consistent.**

---

## 🧾 4. CRUD COMPLETENESS CHECK

| Entity | Create | Read | Update | Delete | Status changes | Soft delete | Audit log | Admin override |
|--------|--------|------|--------|--------|----------------|-------------|-----------|-----------------|
| **Products** | ✅ (ADMIN/VENDOR) | ✅ (public by slug/id; list paginated) | ✅ (ownership for VENDOR) | ✅ (soft in service) | isActive | ✅ deletedAt | ❌ No | ✅ ADMIN |
| **Suppliers** | ✅ (register + OTP) | ✅ | ✅ (ADMIN + VENDOR /me) | ✅ (ADMIN) | isActive, isVerified | ✅ deletedAt | ❌ No | ✅ |
| **Buyers** | ✅ (register OTP) | ✅ (ADMIN list) | Via users/profile | Not explicit | — | User deletedAt | ❌ No | — |
| **RFQs** | ✅ (BUYER) | ✅ (by buyer/admin) | ✅ (draft) | ✅ | DRAFT→SENT, etc. | ❌ Hard delete | RFQ history | ✅ ADMIN send/review |
| **Orders** | ✅ (checkout) | ✅ (buyer + admin) | ✅ (delivery edit, status) | Not exposed | ✅ status | ❌ | ❌ No order audit | ✅ ADMIN status |
| **Certifications** | Via supplier/product | Via relations | Via supplier/product | — | — | — | ❌ No | — |

### Missing or weak flows
- **Audit log:** No structured audit log for orders, product updates, or supplier updates. RFQ has history.
- **Buyer delete:** No dedicated “delete buyer” flow; only user soft delete if exists.
- **Order cancel:** Not verified if buyer can cancel; admin can change status.
- **Certifications:** No standalone CRUD; embedded in supplier/product. **Acceptable for MVP.**

---

## 🛡 5. SECURITY CHECK

| Item | Status | Risk |
|------|--------|------|
| **JWT expiration** | 7d access, 30d refresh in env. | Access window long; refresh exists but frontend doesn’t use it on 401. |
| **Refresh token** | Stored in DB (RefreshToken), revoked on logout. Backend `/auth/refresh` implemented. | **Frontend never calls refresh on 401;** clears storage and redirects to login. Users logged out on any 401. |
| **CSRF** | No CSRF tokens. API is JSON + Bearer; same-origin/cors. | Risk lower for SPA + CORS but not zero for cookie-based flows. |
| **Rate limiting** | apiRateLimiter (100/15min prod), authRateLimiter (5/15min), otpRateLimiter (5/15min). **Skipped in development.** | In prod, limits apply. Dev skip is intentional. |
| **CORS** | Origin from env (split by comma), credentials true, methods/headers set. | **If CORS_ORIGIN includes `*` or wrong value, risk.** |
| **Env** | Backend `.env.example` present and detailed. **Frontend has no .env.example** (VITE_API_URL, etc.). | Onboarding and security review harder. |
| **File upload** | MAX_FILE_SIZE, UPLOAD_DIR in .env. Validation of file type/size in upload endpoints not fully audited. | **Validate type and size in code.** |
| **Password** | Bcrypt with 12 rounds (env). | **Good.** |
| **Role escalation** | **Hardcoded email to ADMIN in secure-otp.service.** | **Critical.** |
| **Hidden admin endpoints** | `/debug/routes` only in development. | **Good.** |
| **Helmet** | CSP and HSTS in production. | **Good.** |

---

## ⚡ 6. PERFORMANCE CHECK

| Item | Status |
|------|--------|
| **Bundle size** | Not measured. No audit of tree-shaking or lazy loading. |
| **Lazy loading** | No `React.lazy` / `Suspense` for routes in AppRoutes. All pages loaded upfront. |
| **Images** | No image optimization (e.g. responsive srcset, CDN). Product/supplier images are URLs. |
| **Caching** | No HTTP cache headers or service worker. ProductCard caches “saved” list in memory for 30s. |
| **API caching** | No server-side caching (e.g. Redis) for product list or public endpoints. |
| **DB indexing** | Prisma schema has indexes on key fields; no obvious missing index for main queries. |
| **Slow queries** | Not profiled. Products list uses include with nested relations; limit 20 by default. |

**Optimization opportunities:** Lazy route components, bundle analysis, image optimization, consider caching for public product/supplier lists, refresh token on 401 to reduce re-login.

---

## 📦 7. PRODUCTION READINESS CHECKLIST

| Item | Status |
|------|--------|
| **.env.example (backend)** | ✅ Present and detailed. |
| **.env.example (frontend user)** | ❌ **Missing.** |
| **Logging** | ✅ Backend logger; morgan + request logger. |
| **Error boundary (frontend)** | ❌ **No React Error Boundary.** Unhandled render errors can blank the app. |
| **404 page** | ❌ **No catch-all route.** Unknown paths may render blank or last match. |
| **500 fallback** | ❌ No generic “Something went wrong” page; errors are per-page. |
| **SEO metadata** | ✅ index.html meta description/keywords. Dynamic title/meta in MedicineDetail. Not site-wide. |
| **Sitemap** | ❌ Not found. |
| **Robots.txt** | ❌ Not found. |
| **Accessibility** | Not audited (a11y). Some forms have labels; focus and ARIA not reviewed. |
| **Mobile responsiveness** | Layouts use Tailwind responsive classes; not fully audited. |

---

## 🧪 8. EDGE CASE TESTING (Simulated)

| Scenario | Expected behavior | Risk |
|----------|-------------------|------|
| **Empty DB / 0 products** | List endpoints return empty array; UI should show empty state. | **Low**; empty states exist but are per-page. |
| **1 supplier** | Works. No special case for “single supplier” in UI. | Low |
| **Deleted supplier with products** | Schema: Product has `onDelete: Cascade` to Supplier. So products deleted with supplier. If soft delete only on Supplier, products may still reference it — **verify.** | **Medium** (data model). |
| **Expired JWT** | 401 → frontend clears storage and redirects to login. No refresh attempt. | **Medium** (UX and unnecessary logouts). |
| **Slow API** | 10s timeout in axios. User sees loading until timeout then error. | Acceptable. |
| **Network failure** | `ERR_NETWORK` → console.error, reject. Page-level catch sets error message. | **Medium** (no retry or offline cue). |
| **Invalid RFQ (e.g. missing items)** | Backend validation (Joi) on create; 400. Frontend validation on SendRFQ. | Handled. |
| **Duplicate slug** | Product: unique (supplierId, slug); create fails with 409 if duplicate. Supplier: unique slug. | Handled. |
| **Duplicate email** | Prisma P2002 → 409 in error handler. | Handled. |
| **Huge product description** | Joi max 2000 on product. Larger body rejected. | Handled. |
| **Invalid UUID in URL** | Prisma throws; error handler can return 404/400. | Handled. |

---

## 📊 9. SCALABILITY CHECK

Assumptions: **10k products, 1k suppliers, 50k RFQs, 5k concurrent users.**

| Bottleneck | Concern |
|------------|--------|
| **Product list** | Single DB query with includes; pagination (e.g. 20). At 10k products, index on (deletedAt, isActive, sort) and limit keep it viable. **Monitor slow queries.** |
| **RFQ list** | Paginated; filter by buyerId. 50k RFQs with index on buyerId/createdAt is manageable. |
| **Concurrent users** | No horizontal scaling or queue reviewed. Node single process; 5k concurrent would need multiple instances + load balancer and stateless JWT. **Architecture not validated.** |
| **Rate limit** | 100 req/15min per IP. Under heavy use, legitimate users may hit limit; consider per-user or higher limit for authenticated. |
| **Refresh token table** | One row per session; growth with users. Cleanup of expired/revoked recommended. |
| **File storage** | Local UPLOAD_DIR does not scale across instances; need object storage (S3 etc.) for production. |

**Verdict:** Current design can handle moderate growth with DB tuning and horizontal scaling. Not validated for 5k concurrent users without load testing and architecture review.

---

## 📌 10. FINAL VERDICT

### Scores (1–10)

| Score | Value | Notes |
|-------|--------|------|
| **Product maturity** | **6** | Core flows (browse, RFQ, checkout, orders) exist. Gaps in empty/error UX, 404, and consistency. |
| **Security** | **5** | Auth and roles enforced on backend; refresh not used on frontend; **hardcoded admin email is critical.** |
| **UX maturity** | **5** | No shared loading/empty/error/skeleton; no Error Boundary; some routes unprotected. |
| **Backend reliability** | **7** | Validation (Joi), soft delete, pagination, error handler, logging. Missing audit log and some edge checks. |
| **Launch readiness** | **5** | Usable for controlled/soft launch after fixing critical items; not ready for unrestricted public launch. |

---

### Top 15 critical issues to fix before launch

1. **Remove hardcoded admin escalation** (`secure-otp.service.js`: cretivex4@gmail.com → ADMIN). Use env-based admin list or proper invite flow.
2. **Implement 401 → refresh token flow** in frontend axios interceptor: on 401, call `/auth/refresh` with refreshToken; on success retry request; on failure clear storage and redirect to login.
3. **Add a global React Error Boundary** so unhandled render errors show a fallback UI instead of a blank screen.
4. **Add a catch-all 404 route** in frontend (e.g. `<Route path="*" element={<NotFound />} />`).
5. **Protect sensitive routes** with a shared guard: at least `/checkout/:quotationId`, `/payment`, `/settings` (and optionally `/orders`, `/orders/:id`, etc.) so unauthenticated users are redirected to login.
6. **Add frontend .env.example** with VITE_API_URL and any other required vars.
7. **Validate req.params (and critical req.query)** on backend where needed (e.g. UUID, slug format) to avoid bad requests and clearer 400/404.
8. **Replace hardcoded hex colors** in SendRFQ, Checkout, Settings, Payment with theme tokens or Tailwind theme colors for dark mode and consistency.
9. **Introduce shared Loading / Empty / Error components** and use them across main pages to unify UX and reduce duplication.
10. **Confirm soft delete behavior** for Supplier and Product: when a supplier is soft-deleted, are products hidden or cascaded? Align schema and queries.
11. **Add a simple audit trail** for order status changes and (optionally) product/supplier updates for compliance and support.
12. **Document and enforce file upload validation** (type, size, and storage path) if uploads are used in production.
13. **Review CORS_ORIGIN** in production: ensure it is not `*` and only lists allowed frontend origins.
14. **Add sitemap and robots.txt** for public marketing/SEO if the site is to be indexed.
15. **Run a security pass on admin and buyer routes** with Postman (different roles and expired tokens) to confirm 401/403 and no privilege escalation.

---

*End of audit report.*
