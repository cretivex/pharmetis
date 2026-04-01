# Fix P3005: Database schema is not empty

Your database already has tables, but Prisma Migrate has no record of applied migrations. Do one of the following.

---

## Option A: Baseline then deploy (recommended)

Run these in the **backend** folder (where `prisma/` lives).

**Step 1 – Mark existing migrations as already applied (baseline):**

```bash
npx prisma migrate resolve --applied "20260223095846_init"
npx prisma migrate resolve --applied "20260223095847_add_therapeutics_manufacturer_to_supplier"
npx prisma migrate resolve --applied "20260305120000_audit_log_enterprise"
```

**Step 2 – Apply only the new migration (adds `QUOTATION_ACCEPTED`):**

```bash
npx prisma migrate deploy
```

If Step 1 fails with "table _prisma_migrations does not exist", use Option B first to create it, then run Step 1 and Step 2.

---

## Option B: Add the enum value manually (no migration history)

If you prefer not to touch migration history, run this SQL in PostgreSQL (psql, pgAdmin, or any client connected to the `pharmetis` database):

```sql
ALTER TYPE "RFQStatus" ADD VALUE IF NOT EXISTS 'QUOTATION_ACCEPTED';
```

- **PostgreSQL &lt; 9.5:** use `ADD VALUE 'QUOTATION_ACCEPTED';` (no `IF NOT EXISTS`).
- Then mark the migration as applied so future `prisma migrate deploy` does not try to run it:

```bash
npx prisma migrate resolve --applied "20260306000000_add_rfq_status_quotation_accepted"
```

---

## Option C: Create `_prisma_migrations` then baseline

If Prisma says the table does not exist, create it and baseline in one go:

```bash
npx prisma migrate resolve --applied "20260223095846_init"
npx prisma migrate resolve --applied "20260223095847_add_therapeutics_manufacturer_to_supplier"
npx prisma migrate resolve --applied "20260305120000_audit_log_enterprise"
npx prisma migrate resolve --applied "20260306000000_add_rfq_status_quotation_accepted"
```

Then run the enum change in SQL (Option B SQL above) and run:

```bash
npx prisma migrate deploy
```

Only do Option C if Option A fails due to a missing `_prisma_migrations` table.
