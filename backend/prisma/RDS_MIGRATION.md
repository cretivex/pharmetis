# AWS RDS PostgreSQL + Prisma Migrate

Your migration SQL files are already in [`prisma/migrations/`](./migrations/). You do **not** regenerate them for RDS—you **apply** the same history to the new database.

## 1. Create the RDS instance

- Engine: **PostgreSQL** (match a version compatible with your app; 14–16 is typical).
- Note the **endpoint** (host), **port** (default `5432`), **database name**, **master username**, and **password**.
- **VPC security group**: allow inbound **PostgreSQL (5432)** from:
  - your laptop IP (for `migrate deploy` from your machine), and/or
  - the security group of your EC2/ECS/Lambda that runs the API.
- **Public access**: enable only if you must connect from outside the VPC (less secure; prefer VPN or bastion).

## 2. `DATABASE_URL` for Prisma

Use a single connection string (URL-encode the password if it contains `@`, `#`, `/`, etc.).

**With SSL (recommended for RDS):**

```bash
DATABASE_URL="postgresql://USER:PASSWORD@YOUR-RDS-ENDPOINT.region.rds.amazonaws.com:5432/DB_NAME?schema=public&sslmode=require"
```

If you see certificate errors during `migrate deploy`, try (dev only):

```bash
# Not for production — relaxes cert verification
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public&sslmode=require&sslaccept=accept_invalid_certs"
```

Set this in your shell or in `.env` **only on the machine running the migrate command** (do not commit secrets).

## 3. Fresh RDS (empty database)

1. Create the target database in RDS if it does not exist (some setups use one DB per instance; RDS often creates `postgres` initially—you can create `pharmetis` via psql or use the default DB name you chose).

2. From the **`backend`** directory:

```bash
npx prisma generate
npx prisma migrate deploy
```

`migrate deploy` runs every migration in `prisma/migrations/` in order and records them in `_prisma_migrations`.

3. Optional seed data:

```bash
npm run prisma:seed
```

## 4. Ongoing workflow

- **Local / dev**: change `schema.prisma`, then create a new migration:

  ```bash
  npx prisma migrate dev --name describe_your_change
  ```

  Commit the new folder under `prisma/migrations/`.

- **RDS / staging / production**: after deploy, run:

  ```bash
  npx prisma migrate deploy
  ```

  Use CI/CD or a release step so this runs once per release with the same `DATABASE_URL` as the app.

## 5. If RDS already has tables (not from Prisma)

See [`BASELINE_AND_DEPLOY.md`](./BASELINE_AND_DEPLOY.md) for baselining with `prisma migrate resolve --applied "<migration_name>"`.

## 6. NPM scripts (reference)

| Script | Use |
|--------|-----|
| `npm run prisma:generate` | Regenerate Prisma Client |
| `npm run prisma:migrate:deploy` | Apply pending migrations (RDS/prod) |
| `npm run prisma:studio` | Browse DB (needs `DATABASE_URL` pointing at RDS) |

## 7. Current migration folders (deploy order)

Prisma orders by migration directory name. Your repo includes (among others):

- `20260223095846_init`
- `20260223095847_add_therapeutics_manufacturer_to_supplier`
- `20260305120000_audit_log_enterprise`
- …through…
- `20260308100000_add_supplier_reset_otp_fields`

`prisma migrate deploy` applies all pending ones automatically—no need to run them one-by-one.
