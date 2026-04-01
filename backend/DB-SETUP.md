# Database setup

## 1. Create the database (if it doesn't exist)

```bash
npm run db:create
```

This creates the `pharmetis` database. Edit `scripts/create-database.js` if your PostgreSQL user/password differ from the default.

## 2. Create / sync all tables

**Option A – Push schema (no migration history):**

```bash
npm run prisma:push
```

**Option B – Use migrations:**

```bash
npm run prisma:migrate:deploy
```

## 3. Generate Prisma client

Stop the backend server, then:

```bash
npm run prisma:generate
```

## 4. Verify tables

```bash
npm run db:verify
```

All 38 application tables should be listed as present.

## 5. (Optional) Seed data

```bash
npm run seed
```

## Troubleshooting

- **ERR_CONNECTION_REFUSED** – Start the backend: `npm run dev` (default port 5000).
- **Prisma enum / validation errors** – Run `npm run prisma:generate` after changing the schema; restart the server.
- **Missing tables** – Run `npm run prisma:push` then `npm run db:verify`.
