import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
config({ path: envPath });

const prisma = new PrismaClient();

async function showTables() {
  try {
    console.log('\n🔍 Checking database tables...\n');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env file');
      process.exit(1);
    }

    const dbName = process.env.DATABASE_URL.split('/').pop()?.split('?')[0] || 'unknown';
    console.log(`📦 Database: ${dbName}\n`);
    
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Get all tables with detailed info
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_type,
        table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    // Get column count for each table
    const tablesWithColumns = await Promise.all(
      tables.map(async (table) => {
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public'
          AND table_name = ${table.table_name}
          ORDER BY ordinal_position;
        `;
        return {
          ...table,
          column_count: columns.length,
          columns: columns
        };
      })
    );

    console.log(`📊 Found ${tables.length} tables in schema 'public':\n`);

    tablesWithColumns.forEach((table, i) => {
      console.log(`${(i + 1).toString().padStart(2, ' ')}. ${table.table_name.padEnd(40)} (${table.column_count} columns)`);
    });

    console.log('\n📋 SQL Query to run in pgAdmin Query Tool:');
    console.log('   SELECT table_name FROM information_schema.tables');
    console.log("   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';");
    console.log('   ORDER BY table_name;\n');

    console.log('💡 If tables are not visible in pgAdmin:');
    console.log('   1. Right-click on "ali" database → Refresh');
    console.log('   2. Expand "ali" → Schemas → public → Tables');
    console.log('   3. Right-click "Tables" → Refresh');
    console.log('   4. Check if you\'re looking at the correct database\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('does not exist')) {
      console.error('\n💡 The database might not exist. Run: npm run db:setup-ali');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

showTables();
