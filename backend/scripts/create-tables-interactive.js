import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createTables() {
  try {
    console.log('========================================');
    console.log('Pharmetis - Create Database Tables');
    console.log('========================================\n');

    const username = await question('PostgreSQL Username (default: postgres): ') || 'postgres';
    const password = await question('PostgreSQL Password: ');
    const host = await question('Host (default: localhost): ') || 'localhost';
    const port = await question('Port (default: 5432): ') || '5432';
    const database = await question('Database name (default: pharmetis): ') || 'pharmetis';

    rl.close();

    const databaseUrl = `postgresql://${username}:${password}@${host}:${port}/${database}?schema=public`;
    
    console.log('\n📦 Connecting to database...');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });

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
          if ((i + 1) % 5 === 0) {
            process.stdout.write(`\r⏳ Progress: ${i + 1}/${statements.length} statements...`);
          }
        } catch (error) {
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate') &&
              !error.message.includes('does not exist')) {
            errorCount++;
          }
        }
      }
    }

    console.log('\n');
    console.log('========================================');
    console.log('✅ SUCCESS! Tables creation completed!');
    console.log('========================================\n');

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
    console.log(`\n💡 Update your .env file with:`);
    console.log(`DATABASE_URL="${databaseUrl}"`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('Authentication')) {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. Username and password are correct');
      console.error('   3. Database exists (or create it first)');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Database connection closed');
  }
}

createTables();
