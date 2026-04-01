import prisma from '../src/config/database.js';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env.js';

async function createTestSupplier() {
  try {
    const testEmail = 'supplier@test.com';
    const testPassword = 'Supplier123!';
    const companyName = 'Test Supplier Company';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    let user;
    if (existingUser) {
      console.log(`\n⚠️  User with email ${testEmail} already exists!`);
      const existingSupplier = await prisma.supplier.findFirst({
        where: { userId: existingUser.id }
      });
      
      if (existingSupplier) {
        console.log(`\n✅ Supplier already exists:`);
        console.log(`   Supplier ID: ${existingSupplier.id}`);
        console.log(`   Company: ${existingSupplier.companyName}`);
        console.log(`   Email: ${testEmail}`);
        console.log(`   Password: ${testPassword}`);
        console.log(`   Status: ${existingSupplier.isVerified ? 'Verified' : 'Pending Approval'}`);
        await prisma.$disconnect();
        return;
      } else {
        console.log(`\nUser exists but no supplier profile found. Creating supplier profile...`);
        user = existingUser;
      }
    }

    // Create user if doesn't exist
    if (!user) {
      // Hash password
      const hashedPassword = await bcrypt.hash(testPassword, env.BCRYPT_SALT_ROUNDS);

      // Create user
      user = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          role: 'VENDOR',
          fullName: 'Test Supplier Admin'
        }
      });
    }

    // Generate slug
    const slug = companyName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Create supplier
    const supplier = await prisma.supplier.create({
      data: {
        userId: user.id,
        companyName,
        slug,
        country: 'India',
        city: 'Mumbai',
        address: '123 Test Street',
        phone: '+91-9876543210',
        website: 'https://test-supplier.com',
        description: 'Test supplier account for development',
        isActive: true,
        isVerified: true // Auto-verify for test account
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

    console.log('\n✅ Test Supplier Created Successfully!\n');
    console.log('=== LOGIN CREDENTIALS ===');
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword}`);
    console.log(`\n=== SUPPLIER DETAILS ===`);
    console.log(`Supplier ID: ${supplier.id}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Company: ${supplier.companyName}`);
    console.log(`Status: ${supplier.isVerified ? '✅ Verified' : '⏳ Pending'}`);
    console.log(`\nYou can now login at: http://localhost:5175/supplier/login\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error creating test supplier:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestSupplier();
