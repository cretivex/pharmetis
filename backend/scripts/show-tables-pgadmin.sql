-- Run this SQL in pgAdmin Query Tool to see all tables
-- Right-click on "ali" database → Query Tool → Paste this → Execute (F5)

-- Show all tables in public schema
SELECT 
  table_name,
  table_type,
  table_schema
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show table count
SELECT 
  COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Show tables with column count
SELECT 
  t.table_name,
  COUNT(c.column_name) as column_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c 
  ON t.table_name = c.table_name 
  AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;
