import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:Admin@localhost:5432/postgres?schema=public'
    }
  }
});

async function createDatabase() {
  try {
    console.log('📦 Connecting to PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Connected\n');

    console.log('🔨 Creating database "pharmetis"...');
    await prisma.$executeRawUnsafe('CREATE DATABASE pharmetis;');
    console.log('✅ Database "pharmetis" created successfully!\n');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Database "pharmetis" already exists\n');
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createDatabase();
