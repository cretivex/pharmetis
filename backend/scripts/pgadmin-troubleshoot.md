# pgAdmin Troubleshooting - Tables Not Visible

## Quick Fix Steps

### Step 1: Refresh pgAdmin
1. **Right-click** on the **"ali"** database
2. Select **"Refresh"**
3. Wait for it to reload

### Step 2: Navigate to Tables
1. Expand **"ali"** database
2. Expand **"Schemas"**
3. Expand **"public"** schema
4. Expand **"Tables"**
5. **Right-click** on **"Tables"** → **"Refresh"**

### Step 3: Verify Database Connection
Make sure you're looking at the correct database:
- Database name should be: **ali**
- Schema should be: **public**

### Step 4: Run SQL Query in pgAdmin
1. Right-click on **"ali"** database
2. Select **"Query Tool"**
3. Run this SQL:

```sql
SELECT 
  table_name,
  table_type,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

This will show all tables. If you see 21 tables, they exist but pgAdmin UI might need refresh.

## Common Issues

### Issue 1: Looking at Wrong Database
- Make sure you're connected to **"ali"** database, not "pharmetis" or "postgres"
- Check the database name in the left sidebar

### Issue 2: Wrong Schema
- Tables are in **"public"** schema
- Make sure you're looking at: `ali → Schemas → public → Tables`

### Issue 3: pgAdmin Cache
- Close and reopen pgAdmin
- Or disconnect and reconnect to the server

### Issue 4: Connection Issues
- Verify PostgreSQL server is running
- Check if you can connect to the database

## Verify Tables via Command Line

Run this command to verify tables exist:

```bash
cd backend
node scripts/check-database-tables.js
```

Or:

```bash
npm run db:check
```

## If Tables Still Don't Exist

If the verification script shows tables exist but pgAdmin doesn't show them:

1. **Recreate tables:**
   ```bash
   cd backend
   npm run prisma:push
   ```

2. **Or run migration again:**
   ```bash
   npm run prisma:migrate
   ```

3. **Then refresh pgAdmin again**

## Expected Tables (21 total)

1. users
2. refresh_tokens
3. suppliers
4. products
5. rfqs
6. orders
7. access_requests
8. categories
9. order_items
10. product_categories
11. product_certifications
12. product_compliance
13. product_images
14. rfq_items
15. rfq_response_items
16. rfq_responses
17. saved_products
18. supplier_certifications
19. supplier_compliance
20. supplier_manufacturing_capabilities
21. user_settings

Plus: `_prisma_migrations` (Prisma internal table)
