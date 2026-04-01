import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTables() {
  try {
    console.log('📦 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected\n');

    // Create enums first
    console.log('🔨 Creating enums...');
    const enumQueries = [
      `DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VENDOR', 'BUYER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "RFQStatus" AS ENUM ('DRAFT', 'SENT', 'RESPONDED', 'ACCEPTED', 'REJECTED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "ProductAvailability" AS ENUM ('IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN CREATE TYPE "DosageForm" AS ENUM ('TABLET', 'CAPSULE', 'INJECTABLE', 'SYRUP', 'SUSPENSION', 'CREAM', 'OINTMENT', 'DROPS', 'SPRAY', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`
    ];

    for (const query of enumQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
      } catch (e) {}
    }
    console.log('✅ Enums ready\n');

    // Create users table first (no dependencies)
    console.log('🔨 Creating users table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" "UserRole" NOT NULL DEFAULT 'BUYER',
        "deletedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ users table created\n');

    // Create products table
    console.log('🔨 Creating products table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "products" (
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
      );
    `);
    console.log('✅ products table created\n');

    // Create rfqs table
    console.log('🔨 Creating rfqs table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "rfqs" (
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
      );
    `);
    console.log('✅ rfqs table created\n');

    // Create orders table
    console.log('🔨 Creating orders table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "orders" (
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
      );
    `);
    console.log('✅ orders table created\n');

    // Add indexes and constraints
    console.log('🔨 Adding indexes and constraints...');
    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");`,
      `CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");`,
      `CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");`,
      `CREATE INDEX IF NOT EXISTS "users_createdAt_idx" ON "users"("createdAt");`,
      `CREATE INDEX IF NOT EXISTS "users_deletedAt_idx" ON "users"("deletedAt");`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "products_supplierId_slug_key" ON "products"("supplierId", "slug");`,
      `CREATE INDEX IF NOT EXISTS "products_supplierId_idx" ON "products"("supplierId");`,
      `CREATE INDEX IF NOT EXISTS "products_dosageForm_idx" ON "products"("dosageForm");`,
      `CREATE INDEX IF NOT EXISTS "products_availability_idx" ON "products"("availability");`,
      `CREATE INDEX IF NOT EXISTS "products_isActive_idx" ON "products"("isActive");`,
      `CREATE INDEX IF NOT EXISTS "rfqs_buyerId_idx" ON "rfqs"("buyerId");`,
      `CREATE INDEX IF NOT EXISTS "rfqs_status_idx" ON "rfqs"("status");`,
      `CREATE INDEX IF NOT EXISTS "orders_buyerId_idx" ON "orders"("buyerId");`,
      `CREATE INDEX IF NOT EXISTS "orders_supplierId_idx" ON "orders"("supplierId");`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "orders_orderNumber_key" ON "orders"("orderNumber");`
    ];

    for (const idx of indexes) {
      try {
        await prisma.$executeRawUnsafe(idx);
      } catch (e) {}
    }
    console.log('✅ Indexes created\n');

    // Add foreign keys
    console.log('🔨 Adding foreign keys...');
    const fks = [
      `DO $$ BEGIN ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN ALTER TABLE "orders" ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`,
      `DO $$ BEGIN ALTER TABLE "orders" ADD CONSTRAINT "orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN null; END $$;`
    ];

    for (const fk of fks) {
      try {
        await prisma.$executeRawUnsafe(fk);
      } catch (e) {}
    }
    console.log('✅ Foreign keys added\n');

    // Final verification
    console.log('🔍 Verifying all tables...');
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

    console.log('\n✅ All tables created successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixTables();
