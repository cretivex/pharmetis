# Create Tables Using Your Database GUI Tool

Since `psql` is not available and Prisma authentication is failing, use your database GUI tool (pgAdmin, DBeaver, etc.) to execute the SQL file.

## Steps:

### 1. Open Your Database Tool
- Open pgAdmin, DBeaver, or your preferred PostgreSQL client
- Connect to your `pharmetis` database

### 2. Open the SQL File
- Navigate to: `backend/scripts/create-tables-updated.sql`
- Open it in your database tool's SQL editor

### 3. Execute the SQL
- Select all the SQL content (Ctrl+A)
- Execute it (F5 or Run button)
- Wait for completion

### 4. Verify Tables
Run this query to see all created tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see **21 tables** including:
- users
- refresh_tokens
- suppliers
- products
- rfqs
- orders
- And 15 more supporting tables

## Alternative: Interactive Script

If you want to try with different credentials:

```bash
cd backend
node scripts/create-tables-interactive.js
```

This will prompt you for:
- Username
- Password
- Host
- Port
- Database name

Then it will create all tables and show you the correct DATABASE_URL to use in your `.env` file.
