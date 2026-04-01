import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('🔍 Diagnosing pgAdmin Table Visibility Issue\n');
    console.log('='.repeat(60));
    
    await prisma.$connect();
    
    const dbUrl = process.env.DATABASE_URL;
    const dbName = dbUrl?.split('/').pop()?.split('?')[0];
    const schema = dbUrl?.match(/schema=(\w+)/)?.[1] || 'public';
    
    console.log(`\n📊 Connection Details:`);
    console.log(`   Database: ${dbName}`);
    console.log(`   Schema: ${schema}`);
    console.log(`   Host: ${dbUrl?.match(/@([^:]+)/)?.[1] || 'localhost'}`);
    console.log(`   Port: ${dbUrl?.match(/:(\d+)\//)?.[1] || '5432'}\n`);

    // Check all schemas
    console.log('🔍 Checking all schemas...');
    const schemas = await prisma.$queryRaw`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name;
    `;
    
    console.log(`\n📁 Available schemas:`);
    schemas.forEach(s => {
      console.log(`   - ${s.schema_name}`);
    });

    // Check tables in public schema
    console.log(`\n🔍 Checking tables in 'public' schema...`);
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    if (tables.length === 0) {
      console.log('\n❌ NO TABLES FOUND in public schema!\n');
      console.log('🔧 Fix: Run these commands:');
      console.log('   1. npm run prisma:generate');
      console.log('   2. npm run prisma:push');
      return;
    }

    console.log(`\n✅ Found ${tables.length} tables in 'public' schema:\n`);
    tables.forEach((table, i) => {
      console.log(`   ${(i + 1).toString().padStart(2)}. ${table.table_name}`);
    });

    // Check if tables exist in other schemas
    console.log(`\n🔍 Checking other schemas for tables...`);
    const allTables = await prisma.$queryRaw`
      SELECT 
        table_schema,
        table_name
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name;
    `;

    const tablesBySchema = {};
    allTables.forEach(t => {
      if (!tablesBySchema[t.table_schema]) {
        tablesBySchema[t.table_schema] = [];
      }
      tablesBySchema[t.table_schema].push(t.table_name);
    });

    console.log(`\n📊 Tables by schema:`);
    Object.entries(tablesBySchema).forEach(([schema, tableList]) => {
      console.log(`\n   Schema: ${schema} (${tableList.length} tables)`);
      if (tableList.length <= 5) {
        tableList.forEach(t => console.log(`      - ${t}`));
      } else {
        tableList.slice(0, 5).forEach(t => console.log(`      - ${t}`));
        console.log(`      ... and ${tableList.length - 5} more`);
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n📍 pgAdmin Navigation Path:');
    console.log(`   Servers → PostgreSQL → Databases → ${dbName} → Schemas → ${schema} → Tables\n`);
    
    console.log('💡 If tables still not visible:');
    console.log('   1. Right-click database "' + dbName + '" → Refresh');
    console.log('   2. Right-click "Schemas" → Refresh');
    console.log('   3. Right-click "public" → Refresh');
    console.log('   4. Right-click "Tables" → Refresh');
    console.log('   5. Try disconnecting and reconnecting to server\n');

    console.log('📝 Run this SQL in pgAdmin Query Tool:');
    console.log('-'.repeat(60));
    console.log(`
SELECT 
    table_schema,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
    `.trim());
    console.log('');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('Authentication')) {
      console.error('\n💡 Check your DATABASE_URL in .env file');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
