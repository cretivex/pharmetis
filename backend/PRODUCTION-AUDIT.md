# Backend Production Audit – Pharmetis API

## Summary

This document lists issues found during the production readiness audit and the improvements applied.

---

## 1. ENVIRONMENT SECURITY

### Findings
- Required env vars were already validated at startup (`NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, etc.).
- JWT_SECRET length (≥32) was enforced in production.
- PORT and DATABASE_URL format were validated.
- **Issue:** Startup validation used `console.error` (acceptable for bootstrap before logger is available).

### Improvements
- Added optional `BODY_LIMIT` in env config for request body size (default: 1mb in production, 20mb in development).
- No hardcoded secrets found in codebase.

---

## 2. EXPRESS SECURITY

### Findings
- **Helmet** was already in use with CSP and HSTS.
- **CORS** was restricted to `CORS_ORIGIN` list; production wildcard was rejected.
- **express-rate-limit** was used globally and on auth/OTP routes.
- **Morgan** was used for HTTP logging.
- **Issue:** `x-powered-by` was not disabled.
- **Issue:** No response compression.
- **Issue:** Body limit was 20mb for all routes (large for production).
- **Issue:** In production, rate limiter was skipped for some GET paths (products, categories), increasing abuse risk.

### Improvements
- **app.disable('x-powered-by')** added to avoid leaking Express in headers.
- **compression** middleware added for gzip/brotli response compression.
- **Body limit:** Uses `BODY_LIMIT` from env; default 1mb in production, 20mb in development. Set `BODY_LIMIT=20mb` only where needed (e.g. upload routes) or in env if required.
- **Rate limiting:** In production, rate limiter no longer skips any path; only development skips for easier local testing.

---

## 3. INPUT VALIDATION

### Findings
- **Joi** is used for request body validation on auth, suppliers, buyer, users, products, RFQ responses, etc.
- **Issue:** No shared validation for **query** parameters (pagination, sort).
- **Issue:** Some routes may accept pagination without validating `page`/`limit` (handled in services with ApiError; centralizing in middleware is cleaner).

### Improvements
- **validateQuery(schema)** added in `validate.middleware.js` for `req.query` validation.
- **validators/pagination.js** added with `paginationQuerySchema` (page, limit, sortBy, sortOrder, search) for reuse on list endpoints.
- Existing Joi body validation and error handling kept as-is; validation errors return 400 with a consistent JSON format.

---

## 4. ERROR HANDLING

### Findings
- Central **errorHandler** and **notFoundHandler** were in place.
- Prisma errors (P2002, P2025, validation) were mapped to safe messages.
- Joi/ValidationError was handled.
- **Issue:** Response body could include `stack` and `errorCode` in development; structure was slightly redundant.

### Improvements
- Error response body is built explicitly: `{ success: false, message }` always; `stack` and `errorCode` only in development.
- Stack traces are never sent to clients in production.
- Internal errors are still logged with logger.

---

## 5. AUTHENTICATION & RBAC

### Findings
- **JWT** verification with expiry (TokenExpiredError) was handled.
- **authenticate** and **authorize(roles)** middlewares were used correctly.
- Admin, supplier (VENDOR), and buyer routes were protected with appropriate roles.
- Auth and OTP routes had stricter rate limiters (e.g. 5 attempts per 15 minutes).

### Improvements
- No auth logic changes; existing setup is production-suitable.

---

## 6. LOGGING

### Findings
- **Issue:** Many files used `console.log` / `console.error` instead of the app logger.
- **Issue:** Request logger was logging full `req.body` and `req.query` in all environments (sensitive in production).

### Improvements
- **Replaced console with logger** in:
  - `utils/email.js`
  - `modules/buyers/buyers.service.js`, `buyers.controller.js`
  - `modules/suppliers/suppliers.controller.js`, `supplier-auth.service.js`
  - `modules/rfqs/rfqs.service.js`, `rfqs.controller.js`, `rfq-history.service.js`
  - `modules/products/products.controller.js`
- **requestLogger:** Request body and query are logged only in development (debug level).

---

## 7. HEALTH CHECK

### Findings
- **GET /health** existed but did not check the database.
- **GET /api/health/db** existed and did a DB check.

### Improvements
- **GET /health** now:
  - Runs a simple DB check (`SELECT 1`).
  - Returns `{ status: "ok", database: "connected" }` with 200 when DB is up.
  - Returns `{ status: "degraded", database: "disconnected" }` with 503 when DB is down.
  - Includes `timestamp` in the response.

---

## 8. PRODUCTION HARDENING

### Improvements
- **CORS:** `.env.example` updated with production frontend domains:  
  `https://pharmetis.in`, `https://supplier.pharmetis.in`, `https://admin.pharmetis.in`.
- **Body size:** Configurable via `BODY_LIMIT`; default 1mb in production.
- **Rate limits:** Applied to all API routes in production (no path-based skip).
- **Secure headers:** Helmet and `x-powered-by` disabled.
- **No console in production:** Replaced with logger in application code (bootstrap env validation still uses console by design).

---

## 9. API STRUCTURE

### Findings
- Structure is already modular: `modules/*` with routes, controllers, services, validation.
- Business logic lives in services; routes are thin.
- No structural changes required.

---

## 10. DATABASE & PERFORMANCE

### Findings
- Prisma is used with transactions where needed.
- Pagination is used in list endpoints (e.g. buyers, products) with validated limits.
- N+1 and indexing are service-level concerns; no global changes made in this audit.

### Recommendations
- Add DB indexes for frequently filtered/sorted columns (e.g. `User.email`, `RFQ.status`, `Order.createdAt`) if not already present in the schema.
- For very large lists, consider cursor-based pagination in addition to offset.

---

## Files Changed

| File | Changes |
|------|--------|
| `src/app.js` | compression, x-powered-by disabled, body limit from env, GET /health with DB check |
| `src/config/env.js` | BODY_LIMIT |
| `src/middlewares/rateLimit.middleware.js` | Production: no skip for any path |
| `src/middlewares/requestLogger.middleware.js` | Log body/query only in development |
| `src/middlewares/error.middleware.js` | Explicit response shape; stack only in dev |
| `src/middlewares/validate.middleware.js` | validateQuery(schema) added |
| `src/validators/pagination.js` | New: paginationQuerySchema |
| `src/utils/email.js` | console → logger |
| `src/modules/buyers/*.js` | console → logger |
| `src/modules/suppliers/*.js` | console → logger |
| `src/modules/rfqs/*.js` | console → logger |
| `src/modules/products/products.controller.js` | console → logger |
| `.env.example` | Production CORS_ORIGIN examples |
| `package.json` | compression dependency |

---

## Deployment Checklist

1. Set **CORS_ORIGIN** to production domains only (comma-separated, no `*`).
2. Use a strong **JWT_SECRET** (≥32 characters).
3. Set **NODE_ENV=production**.
4. Optionally set **BODY_LIMIT** (e.g. `1mb`); use a larger value only for upload routes if needed.
5. Ensure **RATE_LIMIT_*** env vars are set for production (e.g. 100 req/15 min).
6. Use **GET /health** for load balancer or container health checks.
