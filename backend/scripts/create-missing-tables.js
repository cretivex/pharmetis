import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const missingTables = [
  {
    name: 'users',
    sql: `CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" "UserRole" NOT NULL DEFAULT 'BUYER',
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "users_pkey" PRIMARY KEY ("id")
    );`
  },
  {
    name: 'products',
    sql: `CREATE TABLE IF NOT EXISTS "products" (
      "id" TEXT NOT NULL,
      "supplierId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "brand" TEXT,
      "strength" TEXT,
      "dosageForm" "DosageForm" NOT NULL,
      "manufacturer" TEXT,
      "country" TEXT,
      "description" TEXT,
      "apiName" TEXT,
      "composition" TEXT,
      "packagingType" TEXT,
      "shelfLife" TEXT,
      "storageConditions" TEXT,
      "regulatoryApprovals" TEXT,
      "hsCode" TEXT,
      "moq" TEXT,
      "availability" "ProductAvailability" NOT NULL DEFAULT 'IN_STOCK',
      "price" DECIMAL(10,2),
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "products_pkey" PRIMARY KEY ("id")
    );`
  },
  {
    name: 'rfqs',
    sql: `CREATE TABLE IF NOT EXISTS "rfqs" (
      "id" TEXT NOT NULL,
      "buyerId" TEXT NOT NULL,
      "title" TEXT,
      "status" "RFQStatus" NOT NULL DEFAULT 'DRAFT',
      "notes" TEXT,
      "expiresAt" TIMESTAMP(3),
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
    );`
  },
  {
    name: 'orders',
    sql: `CREATE TABLE IF NOT EXISTS "orders" (
      "id" TEXT NOT NULL,
      "buyerId" TEXT NOT NULL,
      "supplierId" TEXT NOT NULL,
      "orderNumber" TEXT NOT NULL,
      "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
      "totalAmount" DECIMAL(10,2) NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'USD',
      "shippingAddress" TEXT,
      "notes" TEXT,
      "deletedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
    );`
  },
  {
    name: 'supplier_certifications',
    sql: `CREATE TABLE IF NOT EXISTS "supplier_certifications" (
      "id" TEXT NOT NULL,
      "supplierId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "number" TEXT,
      "issuedBy" TEXT,
      "issuedDate" TIMESTAMP(3),
      "expiryDate" TIMESTAMP(3),
      "document" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "supplier_certifications_pkey" PRIMARY KEY ("id")
    );`
  }
];

async function createMissingTables() {
  try {
    console.log('📦 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected\n');

    console.log('🔍 Checking existing tables...');
    const existing = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;
    
    const existingNames = existing.map(t => t.table_name);
    console.log(`Found ${existingNames.length} existing tables\n`);

    console.log('🔨 Creating missing tables...\n');
    
    for (const table of missingTables) {
      if (existingNames.includes(table.name)) {
        console.log(`⏭️  ${table.name} - already exists`);
        continue;
      }
      
      try {
        await prisma.$executeRawUnsafe(table.sql);
        console.log(`✅ ${table.name} - created`);
      } catch (error) {
        console.log(`⚠️  ${table.name} - ${error.message.substring(0, 80)}`);
      }
    }

    console.log('\n🔍 Verifying all tables...');
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    console.log(`\n✅ Total tables: ${allTables.length}\n`);
    allTables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    console.log('\n✅ Done!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables();
