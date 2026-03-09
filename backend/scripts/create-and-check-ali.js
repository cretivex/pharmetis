import { Client } from 'pg';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.join(__dirname, '..', '.env');
config({ path: envPath });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

// Parse connection string
const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  process.exit(1);
}

const [, username, password, host, port, database] = urlMatch;

async function createDatabaseAndCheck() {
  const adminClient = new Client({
    user: username,
    password: password,
    host: host,
    port: parseInt(port),
    database: 'postgres' // Connect to default database
  });

  try {
    console.log('\n🔍 Checking database "ali"...\n');
    await adminClient.connect();
    
    // Check if database exists
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [database]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`📦 Creating database "${database}"...`);
      await adminClient.query(`CREATE DATABASE ${database}`);
      console.log(`✅ Database "${database}" created successfully\n`);
    } else {
      console.log(`✅ Database "${database}" already exists\n`);
    }

    await adminClient.end();

    // Now check tables
    console.log('🔍 Checking tables in database...\n');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    await prisma.$connect();

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

    const expectedTables = [
      'users', 'refresh_tokens', 'suppliers', 'products', 'rfqs', 'orders',
      'access_requests', 'categories', 'order_items', 'product_categories',
      'product_certifications', 'product_compliance', 'product_images',
      'rfq_items', 'rfq_response_items', 'rfq_responses', 'saved_products',
      'supplier_certifications', 'supplier_compliance',
      'supplier_manufacturing_capabilities', 'user_settings'
    ];

    const foundTableNames = tables.map(t => t.table_name);
    const missing = expectedTables.filter(t => !foundTableNames.includes(t));

    console.log(`📊 Found ${tables.length} tables:\n`);

    expectedTables.forEach((expectedTable, i) => {
      const exists = foundTableNames.includes(expectedTable);
      const table = tables.find(t => t.table_name === expectedTable);
      const status = exists ? '✅' : '❌';
      const columns = table ? `(${table.column_count} cols)` : '';
      console.log(`  ${status} ${(i + 1).toString().padStart(2, ' ')}. ${expectedTable.padEnd(40)} ${columns}`);
    });

    if (missing.length > 0) {
      console.log(`\n❌ Missing ${missing.length} table(s): ${missing.join(', ')}`);
      console.log('\n📋 To create all tables, run:');
      console.log('   1. npm run prisma:generate');
      console.log('   2. npm run prisma:migrate');
      console.log('   OR');
      console.log('   2. npm run prisma:push\n');
      await prisma.$disconnect();
      process.exit(1);
    } else {
      console.log('\n✅ All required tables are present!');
      console.log(`\n📊 Summary:`);
      console.log(`   Database: ${database}`);
      console.log(`   Total tables: ${tables.length}`);
      console.log(`   Expected: ${expectedTables.length}`);
      console.log(`   Status: ✅ Complete\n`);
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Check your DATABASE_URL credentials in .env file.');
    } else if (error.message.includes('Connection refused')) {
      console.error('\n💡 PostgreSQL server might not be running.');
    }
    process.exit(1);
  }
}

createDatabaseAndCheck();
