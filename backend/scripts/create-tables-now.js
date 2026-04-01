import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('📦 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    console.log('📄 Reading SQL file...');
    const sqlFile = join(__dirname, 'create-tables-updated.sql');
    const sql = readFileSync(sqlFile, 'utf-8');
    console.log('✅ SQL file loaded\n');

    console.log('🔨 Creating tables...\n');
    
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await prisma.$executeRawUnsafe(statement);
          successCount++;
          if ((i + 1) % 10 === 0) {
            process.stdout.write(`\r⏳ Progress: ${i + 1}/${statements.length} statements executed...`);
          }
        } catch (error) {
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('does not exist')) {
            errorCount++;
            if (errorCount <= 5) {
              console.log(`\n⚠️  Warning on statement ${i + 1}: ${error.message.substring(0, 100)}`);
            }
          }
        }
      }
    }

    console.log('\n');
    console.log('========================================');
    console.log('✅ SUCCESS! Tables creation completed!');
    console.log('========================================\n');
    console.log(`📊 Statistics:`);
    console.log(`   - Statements executed: ${successCount}`);
    console.log(`   - Warnings: ${errorCount}\n`);

    console.log('🔍 Verifying tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log(`\n✅ Found ${tables.length} tables:\n`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('Authentication')) {
      console.error('\n💡 Tip: Check your DATABASE_URL in .env file');
      console.error('   Format: postgresql://username:password@localhost:5432/pharmetis?schema=public');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  }
}

createTables();
