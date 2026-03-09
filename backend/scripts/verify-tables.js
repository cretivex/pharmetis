import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function verifyTables() {
  try {
    console.log('🔍 Verifying database tables...\n');
    console.log(`Database: ${process.env.DATABASE_URL?.split('/').pop()?.split('?')[0]}\n`);
    
    await prisma.$connect();

    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    if (tables.length === 0) {
      console.log('❌ NO TABLES FOUND\n');
      console.log('Run these commands to create tables:');
      console.log('  1. npm run prisma:generate');
      console.log('  2. npm run prisma:push');
      console.log('  OR');
      console.log('  2. npm run prisma:migrate');
      process.exit(1);
    }

    console.log(`✅ Found ${tables.length} tables:\n`);
    
    const expectedTables = [
      'users', 'refresh_tokens', 'otps', 'user_otps', 'audit_logs',
      'suppliers', 'products', 'rfq_suppliers', 'rfqs', 'rfq_history',
      'orders', 'order_delivery_details', 'supplier_certifications',
      'supplier_compliance', 'supplier_manufacturing_capabilities',
      'product_images', 'product_certifications', 'product_compliance',
      'rfq_items', 'rfq_responses', 'buyer_quotations', 'buyer_quotation_items',
      'rfq_response_items', 'order_items', 'saved_products',
      'access_requests', 'company_info', 'addresses', 'user_settings',
      'system_settings', 'notifications', 'activity_logs',
      'payments', 'payment_transactions', 'shipment_details',
      'negotiation_history', 'categories', 'product_categories'
    ];

    const foundTableNames = tables.map(t => t.table_name);
    const missing = expectedTables.filter(t => !foundTableNames.includes(t));

    tables.forEach((table, i) => {
      const status = expectedTables.includes(table.table_name) ? '✅' : '⚠️';
      console.log(`  ${status} ${(i + 1).toString().padStart(2, ' ')}. ${table.table_name.padEnd(35)} (${table.column_count} columns)`);
    });

    if (missing.length > 0) {
      console.log(`\n⚠️  Missing tables: ${missing.join(', ')}`);
      console.log('\nRun: npm run prisma:push');
    } else {
      console.log('\n✅ All expected tables are present!');
    }

    console.log('\n📊 Summary:');
    console.log(`   Total tables: ${tables.length}`);
    console.log(`   Expected: ${expectedTables.length}`);
    console.log(`   Status: ${missing.length === 0 ? '✅ Complete' : '⚠️  Incomplete'}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();
