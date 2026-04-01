# Create All Database Tables

## Option 1: Using Prisma Migrate (Recommended)

1. **Ensure your `.env` file has correct DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/pharmetis?schema=public
   ```

2. **Run the migration:**
   ```bash
   cd backend
   npm run prisma:migrate
   ```
   
   When prompted, enter migration name: `init`

## Option 2: Using SQL File Directly

1. **Connect to your PostgreSQL database:**
   ```bash
   psql -U postgres -d pharmetis
   ```

2. **Run the SQL file:**
   ```bash
   \i scripts/create-tables.sql
   ```
   
   Or from command line:
   ```bash
   psql -U postgres -d pharmetis -f scripts/create-tables.sql
   ```

## Option 3: Using Node.js Script

```bash
cd backend
node scripts/setup-database.js
```

## Verify Tables Created

After running any method, verify tables:

```bash
npm run prisma:studio
```

Or using psql:
```sql
\dt
```

## Tables Created (20 total)

### Core Tables (5)
1. users
2. suppliers
3. products
4. rfqs
5. orders

### Supporting Tables (15)
6. supplier_certifications
7. supplier_compliance
8. supplier_manufacturing_capabilities
9. product_images
10. product_certifications
11. product_compliance
12. rfq_items
13. rfq_responses
14. rfq_response_items
15. order_items
16. saved_products
17. access_requests
18. user_settings
19. categories
20. product_categories

## Troubleshooting

### Error: "invalid port number in database URL"
- Check your `.env` file
- Ensure DATABASE_URL format is correct
- Example: `postgresql://user:pass@localhost:5432/pharmetis?schema=public`

### Error: "database does not exist"
- Create database first:
  ```sql
  CREATE DATABASE pharmetis;
  ```

### Error: "relation already exists"
- Tables already exist, this is normal
- Use `prisma migrate reset` to start fresh (WARNING: deletes all data)
