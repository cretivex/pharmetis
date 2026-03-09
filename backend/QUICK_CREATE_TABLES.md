# Quick Create Tables Guide

## Problem: No Tables in Database

If you see "no tables" in your database, follow these steps:

## Option 1: Fix DATABASE_URL and Use Prisma (Recommended)

1. **Update `.env` file:**
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/pharmetis?schema=public
   ```
   Replace `username` and `password` with your PostgreSQL credentials.

2. **Run migration:**
   ```bash
   cd backend
   npm run prisma:migrate
   ```
   Enter migration name: `init`

## Option 2: Use PowerShell Script

```powershell
cd backend
.\scripts\create-all-tables.ps1
```

This will:
- Ask for your PostgreSQL credentials
- Create database if needed
- Create all 21 tables

## Option 3: Use SQL File Directly

1. **Open PostgreSQL:**
   ```bash
   psql -U postgres
   ```

2. **Create database:**
   ```sql
   CREATE DATABASE pharmetis;
   \c pharmetis
   ```

3. **Run SQL file:**
   ```sql
   \i backend/scripts/create-tables-updated.sql
   ```

## Tables Created (21 total)

- **users** - User accounts
- **refresh_tokens** - Refresh token storage
- **suppliers** - Supplier profiles
- **products** - Product catalog
- **rfqs** - Request for Quotations
- **orders** - Purchase orders
- Plus 15 supporting tables

## Verify Tables

```bash
npm run prisma:studio
```

Or in psql:
```sql
\dt
```
