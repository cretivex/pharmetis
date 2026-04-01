-- ============================================
-- Run this in pgAdmin Query Tool
-- Make sure you're connected to database: pharmetis
-- ============================================

-- Show current database
SELECT current_database();

-- Show current schema
SELECT current_schema();

-- List all tables in public schema
SELECT 
    table_schema,
    table_name,
    (SELECT COUNT(*) 
     FROM information_schema.columns 
     WHERE table_name = t.table_name 
     AND table_schema = t.table_schema) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Count total tables
SELECT 
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
