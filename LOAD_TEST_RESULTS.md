# Load Test Results Log

Use this file to record every k6 execution consistently.

Reference matrix: `LOAD_TEST_MATRIX.md`

---

## Run #001

- **Date/Time:** YYYY-MM-DD HH:mm
- **Engineer:** 
- **Environment:** local / staging / production-like
- **Backend Version/Commit:** 
- **Database:** local / shared / snapshot
- **Script:** `k6-load-test.js` / `k6-login-load-test.js`
- **Command:**

```bash
# paste exact command here
```

### Scenario

- **Type:** smoke / login-only / baseline / credential-pool / soak / spike
- **Target VUs:** 
- **Duration/Stages:** 
- **Credentials Mode:** single-user / pool (`USERS_JSON`)

### k6 Summary

- **http_reqs:** 
- **RPS (approx):** 
- **http_req_duration avg:** 
- **http_req_duration p(90):** 
- **http_req_duration p(95):** 
- **http_req_duration p(99):** 
- **http_req_failed:** 
- **checks passed:** 

### Endpoint Notes (by tags/checks)

- **login:** pass/fail, latency notes
- **products_list:** pass/fail, latency notes
- **products_search:** pass/fail, latency notes
- **users_profile:** pass/fail, latency notes
- **auth_me:** pass/fail, latency notes

### Backend/DB Observations

- **CPU:** 
- **Memory:** 
- **DB connections:** 
- **Slow queries/errors:** 
- **Rate limiting observed?:** yes/no (details)

### Failures / Errors

- **Error snippets:** 
- **Likely root cause:** 

### Decision

- **Status:** PASS / CONDITIONAL PASS / FAIL
- **Against targets:** met / partially met / not met
- **Next action:** 

---

## Run #002

- **Date/Time:** 
- **Engineer:** 
- **Environment:** 
- **Backend Version/Commit:** 
- **Database:** 
- **Script:** 
- **Command:**

```bash
# paste exact command here
```

### Scenario

- **Type:** 
- **Target VUs:** 
- **Duration/Stages:** 
- **Credentials Mode:** 

### k6 Summary

- **http_reqs:** 
- **RPS (approx):** 
- **http_req_duration avg:** 
- **http_req_duration p(90):** 
- **http_req_duration p(95):** 
- **http_req_duration p(99):** 
- **http_req_failed:** 
- **checks passed:** 

### Endpoint Notes (by tags/checks)

- **login:** 
- **products_list:** 
- **products_search:** 
- **users_profile:** 
- **auth_me:** 

### Backend/DB Observations

- **CPU:** 
- **Memory:** 
- **DB connections:** 
- **Slow queries/errors:** 
- **Rate limiting observed?:** 

### Failures / Errors

- **Error snippets:** 
- **Likely root cause:** 

### Decision

- **Status:** 
- **Against targets:** 
- **Next action:** 

---

## Trend Snapshot (update weekly)

- **Best p95 (main journey):** 
- **Worst p95 (main journey):** 
- **Average error rate (main journey):** 
- **Login-only failure pattern:** none / occasional / frequent
- **Top recurring bottleneck endpoint:** 
- **Open performance risks:** 

