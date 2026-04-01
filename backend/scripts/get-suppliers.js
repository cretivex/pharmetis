import prisma from '../src/config/database.js';

async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            fullName: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n=== SUPPLIERS IN DATABASE ===\n');
    
    if (suppliers.length === 0) {
      console.log('No suppliers found in database.');
      console.log('\nTo create a test supplier, use the registration form at:');
      console.log('http://localhost:5175/supplier/register');
      console.log('\nOr run: node scripts/create-test-supplier.js\n');
    } else {
      suppliers.forEach((supplier, index) => {
        console.log(`\n${index + 1}. Supplier ID: ${supplier.id}`);
        console.log(`   Company: ${supplier.companyName}`);
        console.log(`   Email: ${supplier.user?.email || 'N/A'}`);
        console.log(`   User ID: ${supplier.userId}`);
        console.log(`   Status: ${supplier.isVerified ? '✅ Verified' : '⏳ Pending'} | ${supplier.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   Country: ${supplier.country}`);
        console.log(`   Created: ${supplier.createdAt.toLocaleDateString()}`);
      });
      
      console.log('\n=== LOGIN CREDENTIALS ===');
      console.log('\n⚠️  Note: Passwords are hashed and cannot be retrieved.');
      console.log('To login, use the email addresses shown above.');
      console.log('If you need to reset a password, you can:');
      console.log('1. Use the registration form to create a new account');
      console.log('2. Or create a test supplier with known credentials (see below)');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

getSuppliers();
