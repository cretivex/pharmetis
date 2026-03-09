import prisma from '../src/config/database.js';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env.js';

const dummySuppliers = [
  {
    email: 'supplier1@test.com',
    password: 'Supplier123!',
    companyName: 'Test Supplier One',
    country: 'India',
    city: 'Mumbai',
    phone: '+91-9876543210',
    description: 'Dummy supplier account for testing - Supplier 1'
  },
  {
    email: 'supplier2@test.com',
    password: 'Supplier123!',
    companyName: 'Test Supplier Two',
    country: 'United States',
    city: 'New York',
    phone: '+1-555-123-4567',
    description: 'Dummy supplier account for testing - Supplier 2'
  },
  {
    email: 'supplier3@test.com',
    password: 'Supplier123!',
    companyName: 'Test Supplier Three',
    country: 'Germany',
    city: 'Berlin',
    phone: '+49-30-12345678',
    description: 'Dummy supplier account for testing - Supplier 3'
  }
];

async function createDummySuppliers() {
  console.log('\n🚀 Creating Dummy Supplier Accounts...\n');

  const results = [];

  for (const supplierData of dummySuppliers) {
    try {
      const { email, password, companyName, country, city, phone, description } = supplierData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      let user;
      if (existingUser) {
        console.log(`⚠️  User ${email} already exists, checking supplier profile...`);
        const existingSupplier = await prisma.supplier.findFirst({
          where: { userId: existingUser.id }
        });

        if (existingSupplier) {
          console.log(`✅ Supplier already exists for ${email}`);
          results.push({
            email,
            password,
            supplierId: existingSupplier.id,
            companyName: existingSupplier.companyName,
            status: 'existing'
          });
          continue;
        } else {
          user = existingUser;
          console.log(`   Creating supplier profile for existing user...`);
        }
      } else {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

        // Create user
        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: 'VENDOR',
            fullName: `${companyName} Admin`
          }
        });
        console.log(`✅ Created user: ${email}`);
      }

      // Generate slug
      const slug = companyName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create or update supplier
      const supplier = await prisma.supplier.upsert({
        where: { userId: user.id },
        update: {
          companyName,
          slug,
          country,
          city,
          phone,
          description,
          isActive: true,
          isVerified: true // Auto-verify for test accounts
        },
        create: {
          userId: user.id,
          companyName,
          slug,
          country,
          city,
          address: `${city}, ${country}`,
          phone,
          website: `https://${slug}.com`,
          description,
          isActive: true,
          isVerified: true // Auto-verify for test accounts
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      });

      console.log(`✅ Created/Updated supplier: ${supplier.companyName}`);
      results.push({
        email,
        password,
        supplierId: supplier.id,
        userId: user.id,
        companyName: supplier.companyName,
        status: 'created'
      });

    } catch (error) {
      console.error(`❌ Error creating supplier ${supplierData.email}:`, error.message);
      results.push({
        email: supplierData.email,
        password: supplierData.password,
        status: 'error',
        error: error.message
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 DUMMY SUPPLIER ACCOUNTS SUMMARY');
  console.log('='.repeat(60) + '\n');

  results.forEach((result, index) => {
    if (result.status === 'error') {
      console.log(`${index + 1}. ❌ ${result.email}`);
      console.log(`   Error: ${result.error}\n`);
    } else {
      console.log(`${index + 1}. ✅ ${result.email}`);
      console.log(`   Password: ${result.password}`);
      console.log(`   Company: ${result.companyName}`);
      console.log(`   Supplier ID: ${result.supplierId}`);
      if (result.userId) {
        console.log(`   User ID: ${result.userId}`);
      }
      console.log(`   Status: ${result.status === 'created' ? 'Created' : 'Already Exists'}`);
      console.log(`   Login: http://localhost:5175/supplier/login\n`);
    }
  });

  console.log('='.repeat(60));
  console.log('✅ All dummy suppliers processed!');
  console.log('='.repeat(60) + '\n');

  await prisma.$disconnect();
}

createDummySuppliers().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
