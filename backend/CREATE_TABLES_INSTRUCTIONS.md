# Create All Database Tables - Instructions

## Quick Start

### Method 1: Using PowerShell Script (Easiest)

```powershell
cd backend
.\scripts\create-tables-direct.ps1
```

This script will:
- Ask for your PostgreSQL credentials
- Create the database if it doesn't exist
- Create all 20 tables
- Set up all relationships and indexes

### Method 2: Using SQL File Directly

1. **Open PostgreSQL command line:**
   ```bash
   psql -U postgres
   ```

2. **Create database (if not exists):**
   ```sql
   CREATE DATABASE pharmetis;
   \c pharmetis
   ```

3. **Run SQL file:**
   ```sql
   \i scripts/create-tables.sql
   ```
   
   Or from command line:
   ```bash
   psql -U postgres -d pharmetis -f scripts/create-tables.sql
   ```

### Method 3: Fix DATABASE_URL and Use Prisma

1. **Update `.env` file with correct DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/pharmetis?schema=public
   ```
   
   **Important:** 
   - Replace `username` with your PostgreSQL username
   - Replace `password` with your PostgreSQL password
   - If password contains special characters, URL encode them:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - `$` becomes `%24`
     - `%` becomes `%25`
     - `&` becomes `%26`

2. **Run migration:**
   ```bash
   npm run prisma:migrate
   ```
   
   When prompted, enter: `init`

## Verify Tables Created

### Using Prisma Studio:
```bash
npm run prisma:studio
```

### Using psql:
```sql
\dt
```

You should see 20 tables listed.

## Tables Created (20 total)

### Core Tables (5)
1. **users** - User accounts
2. **suppliers** - Supplier profiles  
3. **products** - Product catalog
4. **rfqs** - Request for Quotations
5. **orders** - Purchase orders

### Supporting Tables (15)
6. **supplier_certifications** - Supplier certifications
7. **supplier_compliance** - Compliance flags
8. **supplier_manufacturing_capabilities** - Manufacturing details
9. **product_images** - Product images
10. **product_certifications** - Product certs
11. **product_compliance** - Product compliance
12. **rfq_items** - RFQ line items
13. **rfq_responses** - Supplier quotes
14. **rfq_response_items** - Quote items
15. **order_items** - Order line items
16. **saved_products** - User favorites
17. **access_requests** - Access requests
18. **user_settings** - User preferences
19. **categories** - Product categories
20. **product_categories** - Product-category mapping

## Troubleshooting

### Error: "invalid port number in database URL"
- Check your `.env` file
- Ensure port is a number (usually 5432)
- No spaces in DATABASE_URL
- Special characters in password must be URL encoded

### Error: "database does not exist"
- Create database first:
  ```sql
  CREATE DATABASE pharmetis;
  ```

### Error: "relation already exists"
- Tables already exist
- This is normal if you've run the script before
- Use `DROP DATABASE pharmetis; CREATE DATABASE pharmetis;` to start fresh (WARNING: deletes all data)

### Error: "psql: command not found"
- Install PostgreSQL
- Or add PostgreSQL bin directory to PATH
- Or use Method 3 (Prisma migration) instead

## After Tables Are Created

1. **Update .env with correct DATABASE_URL**
2. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```
3. **Start the server:**
   ```bash
   npm run dev
   ```
