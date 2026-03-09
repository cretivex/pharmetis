import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function showTables() {
  try {
    console.log('📊 Database Tables Information\n');
    console.log('='.repeat(50));
    
    await prisma.$connect();
    
    const dbName = process.env.DATABASE_URL?.split('/').pop()?.split('?')[0];
    console.log(`Database: ${dbName}`);
    console.log(`Schema: public\n`);
    console.log('='.repeat(50) + '\n');

    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT COUNT(*) 
         FROM information_schema.columns 
         WHERE table_name = t.table_name 
         AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log(`✅ Found ${tables.length} tables:\n`);

    // Group by category
    const coreTables = ['users', 'refresh_tokens', 'suppliers', 'products', 'rfqs', 'orders'];
    const supportingTables = tables.filter(t => !coreTables.includes(t.table_name));

    console.log('📦 CORE TABLES (6):');
    console.log('-'.repeat(50));
    tables
      .filter(t => coreTables.includes(t.table_name))
      .forEach((table, i) => {
        console.log(`  ${(i + 1).toString().padStart(2)}. ${table.table_name.padEnd(35)} (${table.column_count} columns)`);
      });

    console.log('\n📋 SUPPORTING TABLES (15):');
    console.log('-'.repeat(50));
    supportingTables.forEach((table, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${table.table_name.padEnd(35)} (${table.column_count} columns)`);
    });

    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Total: ${tables.length} tables in database "${dbName}"`);
    console.log(`\n📍 Location in pgAdmin:`);
    console.log(`   Servers → PostgreSQL → Databases → ${dbName} → Schemas → public → Tables\n`);

    // Generate SQL for pgAdmin
    console.log('📝 SQL Query for pgAdmin Query Tool:');
    console.log('-'.repeat(50));
    console.log(`
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
    `.trim());
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

showTables();
