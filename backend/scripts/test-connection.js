import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('📦 Testing database connection...');
    console.log(`Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}\n`);
    
    await prisma.$connect();
    console.log('✅ Connected to database\n');

    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL Version:', result[0].version);
    console.log('');

    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log(`📊 Found ${tables.length} tables:`);
    if (tables.length === 0) {
      console.log('   ⚠️  No tables found - need to run migration\n');
    } else {
      tables.forEach((table, i) => {
        console.log(`   ${i + 1}. ${table.table_name}`);
      });
      console.log('');
    }

    console.log('✅ Connection test successful');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
