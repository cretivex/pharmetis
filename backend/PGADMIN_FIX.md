# Fix pgAdmin Not Showing Tables

## ✅ Confirmed: 21 Tables Exist
- Database: `pharmetis`
- Schema: `public`
- All tables are present and verified

## 🔧 Steps to See Tables in pgAdmin

### Step 1: Verify You're in the Right Database
1. In pgAdmin, expand: **Servers → PostgreSQL**
2. Connect to server (password: `Admin`)
3. Expand: **Databases**
4. **IMPORTANT:** Make sure you're looking at `pharmetis` (NOT `postgres`)

### Step 2: Navigate to Tables
```
Servers → PostgreSQL → Databases → pharmetis → Schemas → public → Tables
```

### Step 3: Refresh Everything
If tables don't appear, refresh in this order:

1. **Right-click `pharmetis` database** → **Refresh**
2. **Right-click `Schemas`** → **Refresh**  
3. **Right-click `public` schema** → **Refresh**
4. **Right-click `Tables`** → **Refresh**
5. Or press **F5** while on the database

### Step 4: Verify with SQL Query
1. Right-click `pharmetis` database
2. Select **Query Tool**
3. Run this SQL:

```sql
SELECT 
    table_schema,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

This should show all 21 tables.

### Step 5: If Still Not Visible
1. **Disconnect** from PostgreSQL server
2. **Close pgAdmin**
3. **Reopen pgAdmin**
4. **Reconnect** to server
5. Navigate to: `pharmetis → Schemas → public → Tables`
6. **Refresh** (F5)

## 📋 Expected Tables (21 total)

1. access_requests
2. categories
3. order_items
4. orders
5. product_categories
6. product_certifications
7. product_compliance
8. product_images
9. products
10. refresh_tokens
11. rfq_items
12. rfq_response_items
13. rfq_responses
14. rfqs
15. saved_products
16. supplier_certifications
17. supplier_compliance
18. supplier_manufacturing_capabilities
19. suppliers
20. user_settings
21. users

## 🔍 Quick Verification Script

Run this in terminal:
```bash
cd backend
node scripts/diagnose-pgadmin.js
```

This will show you exactly where the tables are and provide the SQL query to verify.
