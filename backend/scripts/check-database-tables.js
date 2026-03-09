import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
const envPath = path.join(__dirname, '..', '.env');
config({ path: envPath });

const prisma = new PrismaClient();

// Expected tables from schema
const expectedTables = [
  'users',
  'refresh_tokens',
  'suppliers',
  'products',
  'rfqs',
  'orders',
  'access_requests',
  'categories',
  'order_items',
  'product_categories',
  'product_certifications',
  'product_compliance',
  'product_images',
  'rfq_items',
  'rfq_response_items',
  'rfq_responses',
  'saved_products',
  'supplier_certifications',
  'supplier_compliance',
  'supplier_manufacturing_capabilities',
  'user_settings'
];

async function checkTables() {
  try {
    console.log('\n🔍 Checking database tables...\n');
    
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env file');
      console.error('   Please set DATABASE_URL in backend/.env');
      console.error('   Example: DATABASE_URL=postgresql://postgres:Admin@localhost:5432/ali?schema=public\n');
      process.exit(1);
    }

    const dbName = process.env.DATABASE_URL.split('/').pop()?.split('?')[0] || 'unknown';
    console.log(`📦 Database: ${dbName}`);
    console.log(`🔗 Connection: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);
    
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    if (tables.length === 0) {
      console.log('❌ NO TABLES FOUND\n');
      console.log('📋 To create all tables, run:');
      console.log('   1. npm run prisma:generate');
      console.log('   2. npm run prisma:migrate');
      console.log('   OR');
      console.log('   2. npm run prisma:push\n');
      process.exit(1);
    }

    console.log(`📊 Found ${tables.length} tables:\n`);
    
    const foundTableNames = tables.map(t => t.table_name);
    const missing = expectedTables.filter(t => !foundTableNames.includes(t));
    const extra = foundTableNames.filter(t => !expectedTables.includes(t));

    // Display tables
    expectedTables.forEach((expectedTable, i) => {
      const exists = foundTableNames.includes(expectedTable);
      const table = tables.find(t => t.table_name === expectedTable);
      const status = exists ? '✅' : '❌';
      const columns = table ? `(${table.column_count} cols)` : '';
      console.log(`  ${status} ${(i + 1).toString().padStart(2, ' ')}. ${expectedTable.padEnd(40)} ${columns}`);
    });

    if (extra.length > 0) {
      console.log(`\n⚠️  Extra tables found (not in schema): ${extra.join(', ')}`);
    }

    if (missing.length > 0) {
      console.log(`\n❌ Missing ${missing.length} table(s): ${missing.join(', ')}`);
      console.log('\n📋 To create missing tables, run:');
      console.log('   1. npm run prisma:generate');
      console.log('   2. npm run prisma:migrate');
      console.log('   OR');
      console.log('   2. npm run prisma:push\n');
      process.exit(1);
    } else {
      console.log('\n✅ All required tables are present!');
      console.log(`\n📊 Summary:`);
      console.log(`   Total tables: ${tables.length}`);
      console.log(`   Expected: ${expectedTables.length}`);
      console.log(`   Status: ✅ Complete\n`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('does not exist')) {
      console.error('\n💡 The database might not exist. Create it in pgAdmin first.');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Check your DATABASE_URL credentials in .env file.');
    } else if (error.message.includes('Connection refused')) {
      console.error('\n💡 PostgreSQL server might not be running.');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
