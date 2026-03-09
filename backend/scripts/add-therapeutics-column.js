import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTherapeuticsColumn() {
  try {
    console.log('Checking if therapeutics column exists...');
    
    // Check if column exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'therapeutics'
    `;
    
    if (result.length > 0) {
      console.log('✅ Therapeutics column already exists in products table');
      return;
    }
    
    console.log('Adding therapeutics column to products table...');
    
    // Add the column
    await prisma.$executeRaw`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "therapeutics" TEXT
    `;
    
    console.log('✅ Successfully added therapeutics column to products table');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addTherapeuticsColumn();
