import prisma from '../src/config/database.js';
import { logger } from '../src/utils/logger.js';

const REQUIRED_TABLES = [
  'users',
  'refresh_tokens',
  'suppliers',
  'products',
  'rfqs',
  'orders',
  'supplier_certifications',
  'supplier_compliance',
  'supplier_manufacturing_capabilities',
  'product_images',
  'product_certifications',
  'product_compliance',
  'rfq_items',
  'rfq_responses',
  'rfq_response_items',
  'order_items',
  'saved_products',
  'access_requests',
  'user_settings',
  'system_settings',
  'categories',
  'product_categories'
];

async function checkTables() {
  console.log('\n🔍 COMPREHENSIVE DATABASE AUDIT\n');
  console.log('='.repeat(60));
  
  try {
    // Get all tables from database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const existingTables = tables.map(t => t.table_name);
    const missingTables = REQUIRED_TABLES.filter(t => !existingTables.includes(t));
    
    console.log(`\n📊 Found ${existingTables.length} tables in database`);
    console.log(`📋 Required: ${REQUIRED_TABLES.length} tables`);
    
    if (missingTables.length === 0) {
      console.log('\n✅ ALL TABLES EXIST!');
      console.log('\nExisting tables:');
      existingTables.forEach(t => console.log(`  ✅ ${t}`));
    } else {
      console.log(`\n❌ MISSING ${missingTables.length} TABLES:`);
      missingTables.forEach(t => console.log(`  ❌ ${t}`));
      console.log('\n✅ Existing tables:');
      existingTables.forEach(t => console.log(`  ✅ ${t}`));
    }
    
    // Check enums
    console.log('\n\n🔍 Checking Enums...');
    const enums = await prisma.$queryRaw`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e'
      ORDER BY typname;
    `;
    console.log(`Found ${enums.length} enums:`);
    enums.forEach(e => console.log(`  ✅ ${e.typname}`));
    
    // Check indexes
    console.log('\n\n🔍 Checking Indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    console.log(`Found ${indexes.length} indexes`);
    
    return {
      allTablesExist: missingTables.length === 0,
      missingTables,
      existingTables,
      totalTables: existingTables.length
    };
    
  } catch (error) {
    console.error('\n❌ Error checking database:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkTables()
  .then(result => {
    if (result.allTablesExist) {
      console.log('\n\n✅ DATABASE AUDIT PASSED');
      process.exit(0);
    } else {
      console.log('\n\n⚠️  DATABASE AUDIT FAILED - Missing tables');
      console.log('\nRun: npm run prisma:migrate');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Audit failed:', error);
    process.exit(1);
  });
