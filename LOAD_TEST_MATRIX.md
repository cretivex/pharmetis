# Final Testing Matrix (B2B Marketplace)

Tech: React + Node.js/Express + JWT  
Base URL: `http://localhost:5000`

Scripts in this repo:

- `k6-load-test.js`
- `k6-login-load-test.js`
- `k6-rfq-flow-test.js`
- `api-tests.js`

---

## 0) Pre-check (mandatory)

```powershell
cd "C:\Users\kingf\Downloads\AP PROJECT (5)\AP PROJECT"
curl.exe -s -o NUL -w "%{http_code}" http://localhost:5000/api/products
```

Expected: `200`

Also verify:

- backend running on 5000
- DB connected
- seeded users exist (buyer/supplier/admin)
- products exist

---

## 1) Functional Testing

### Manual checklist

Auth:

- buyer/supplier registration
- admin approval flow (if enabled)
- buyer/supplier/admin login
- token/session persistence

Product flow:

- supplier adds product
- product saved in DB
- product visible in buyer list/search/filter

RFQ core flow:

- buyer creates RFQ
- admin forwards RFQ
- supplier submits quotation
- admin reviews/sends to buyer
- buyer accepts or negotiates

Validation/security:

- required fields
- duplicate handling
- unauthorized access blocked
- clear error messages

### Automated functional/API

```powershell
node .\api-tests.js
```

Covers:

- auth register/login
- products list + protected create
- buyer RFQ create
- admin send RFQ
- supplier quotation submit
- admin review/send-to-buyer
- buyer quotation accept
- unauthorized checks

---

## 2) API Testing Targets

Primary endpoints tested (actual project routes):

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/products`
- `POST /api/buyer/rfqs`
- `POST /api/rfq-responses/:rfqId`
- `POST /api/buyer/quotations/:id/accept`

Each test validates:

- status code
- response structure/token/id extraction
- auth protection
- invalid payload behavior

---

## 3) Load Testing (k6)

### A) Smoke sanity

```powershell
k6 run --vus 1 --iterations 1 .\k6-load-test.js
```

Pass: all checks pass, login works, no request failures.

### B) Login bottleneck

```powershell
k6 run .\k6-login-load-test.js
```

Goal: auth throughput + rate limit behavior.

### C) Main user flow baseline

```powershell
k6 run .\k6-load-test.js
```

Flow: login -> products -> search -> profile -> auth/me.

### D) Multi-user realism

```powershell
$env:USERS_JSON = Get-Content ".\loadtest-users.example.json" -Raw
k6 run .\k6-login-load-test.js
Remove-Item Env:\USERS_JSON
```

Goal: avoid single-account artifacts.

### E) Full B2B RFQ flow (core business)

```powershell
k6 run .\k6-rfq-flow-test.js
```

Flow:

- buyer -> RFQ
- admin -> forward
- supplier -> quote
- admin -> review/send-to-buyer
- buyer -> accept

### F) Soak

```powershell
k6 run --vus 40 --duration 30m .\k6-load-test.js
```

### G) Spike

```powershell
k6 run --stage 30s:20 --stage 30s:300 --stage 30s:20 --stage 30s:0 .\k6-login-load-test.js
```

---

## 4) Product Visibility Check (critical)

After supplier product create:

- verify `GET /api/products` returns new product
- verify buyer UI/search can discover it
- verify no stale cache issue

---

## 5) Thresholds & Pass Criteria

Load thresholds:

- `p(95) < 2000ms`
- error rate `< 1%` (or `< 2%` for specific stress scenarios)

Business criteria:

- RFQ flow passes end-to-end
- no data mismatch/duplication
- auth boundaries enforced

---

## 6) Reporting (mandatory)

For each run, capture:

- run type + timestamp
- exact command
- avg/p90/p95/p99 latency
- error rate + RPS
- failed checks/endpoints
- CPU/memory/DB connections

Use: `LOAD_TEST_RESULTS.md`

