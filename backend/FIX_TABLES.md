# Fix Empty Tables Issue

## Quick Fix Commands

```bash
cd backend

# 1. Generate Prisma Client
npm run prisma:generate

# 2. Push schema to database (creates tables)
npm run prisma:push

# 3. Verify tables were created
npm run db:verify
```

## Alternative: Use Migration

```bash
cd backend

# 1. Generate Prisma Client
npm run prisma:generate

# 2. Create and apply migration
npm run prisma:migrate

# 3. Verify tables
npm run db:verify
```

## Test Connection

```bash
npm run db:test
```

## If Tables Still Empty

1. **Check DATABASE_URL in `.env`:**
   ```
   DATABASE_URL="postgresql://postgres:Admin@localhost:5432/pharmetis?schema=public"
   ```

2. **Verify you're looking at correct database:**
   - Database name: `pharmetis`
   - Schema: `public`

3. **Refresh your database GUI tool**

4. **Run verification:**
   ```bash
   npm run db:verify
   ```

## Expected Tables (21 total)

- users
- refresh_tokens
- suppliers
- products
- rfqs
- orders
- access_requests
- categories
- order_items
- product_categories
- product_certifications
- product_compliance
- product_images
- rfq_items
- rfq_response_items
- rfq_responses
- saved_products
- supplier_certifications
- supplier_compliance
- supplier_manufacturing_capabilities
- user_settings
