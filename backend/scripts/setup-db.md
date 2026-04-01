# Database Setup Instructions

## Prerequisites

1. PostgreSQL 14+ installed and running
2. Database created (or create one using the steps below)

## Steps

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE pharmetis;
```

Or using psql command line:
```bash
createdb pharmetis
```

### 2. Update .env File

Edit `backend/.env` and update the `DATABASE_URL`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/pharmetis?schema=public
```

Replace:
- `username` with your PostgreSQL username
- `password` with your PostgreSQL password
- `localhost:5432` if your database is on a different host/port

### 3. Run Migration

```bash
npm run prisma:migrate
```

This will:
- Create all 20 tables
- Set up all relationships
- Create indexes
- Set up constraints

### 4. Verify

```bash
npm run prisma:studio
```

This opens Prisma Studio where you can view and manage your database.

## Tables Created

The migration will create 20 tables:

**Core Tables (5):**
1. users
2. suppliers
3. products
4. rfqs
5. orders

**Supporting Tables (15):**
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
