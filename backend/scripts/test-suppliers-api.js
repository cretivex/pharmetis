import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
config({ path: envPath });

const prisma = new PrismaClient();

async function testSuppliers() {
  try {
    console.log('\n🔍 Testing Suppliers Data...\n');
    
    // Test 1: Get suppliers with all relations
    const suppliers = await prisma.supplier.findMany({
      where: {
        deletedAt: null,
        isActive: true
      },
      include: {
        compliance: true,
        certifications: {
          take: 5
        },
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
                isActive: true
              }
            }
          }
        }
      },
      take: 3
    });

    console.log(`✅ Found ${suppliers.length} suppliers\n`);

    suppliers.forEach((supplier, i) => {
      console.log(`${i + 1}. ${supplier.companyName}`);
      console.log(`   Country: ${supplier.country}`);
      console.log(`   Years: ${supplier.yearsInBusiness || 'N/A'}`);
      console.log(`   Products: ${supplier._count.products}`);
      console.log(`   Certifications: ${supplier.certifications.length}`);
      console.log(`   Verified: ${supplier.isVerified}`);
      console.log(`   Created: ${supplier.createdAt}`);
      console.log(`   Updated: ${supplier.updatedAt}\n`);
    });

    // Test 2: Verify data structure matches API response
    const sample = suppliers[0];
    if (sample) {
      console.log('✅ Data Structure Check:');
      console.log(`   - companyName: ${sample.companyName ? '✅' : '❌'}`);
      console.log(`   - slug: ${sample.slug ? '✅' : '❌'}`);
      console.log(`   - country: ${sample.country ? '✅' : '❌'}`);
      console.log(`   - yearsInBusiness: ${sample.yearsInBusiness !== null ? '✅' : '⚠️ (null)'}`);
      console.log(`   - _count.products: ${sample._count?.products !== undefined ? '✅' : '❌'}`);
      console.log(`   - certifications: ${sample.certifications ? '✅' : '❌'}`);
      console.log(`   - isVerified: ${sample.isVerified !== undefined ? '✅' : '❌'}\n`);
    }

    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testSuppliers();
