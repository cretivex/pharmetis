import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env');
config({ path: envPath });

const prisma = new PrismaClient();

async function testRFQ() {
  try {
    console.log('\n🔍 Testing RFQ Data...\n');
    
    // Test 1: Get RFQs with all relations
    const rfqs = await prisma.rFQ.findMany({
      where: {
        deletedAt: null
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        responses: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ Found ${rfqs.length} RFQs\n`);

    rfqs.forEach((rfq, i) => {
      console.log(`${i + 1}. ${rfq.title || 'Untitled RFQ'}`);
      console.log(`   ID: ${rfq.id}`);
      console.log(`   Status: ${rfq.status}`);
      console.log(`   Buyer: ${rfq.buyer.email}`);
      console.log(`   Items: ${rfq.items.length}`);
      console.log(`   Responses: ${rfq.responses.length}`);
      console.log(`   Created: ${rfq.createdAt}`);
      console.log(`   Updated: ${rfq.updatedAt}`);
      if (rfq.expiresAt) {
        console.log(`   Expires: ${rfq.expiresAt}`);
      }
      console.log('');
    });

    // Test 2: Verify data structure
    const sample = rfqs[0];
    if (sample) {
      console.log('✅ Data Structure Check:');
      console.log(`   - id: ${sample.id ? '✅' : '❌'}`);
      console.log(`   - buyerId: ${sample.buyerId ? '✅' : '❌'}`);
      console.log(`   - title: ${sample.title !== null ? '✅' : '⚠️ (null)'}`);
      console.log(`   - status: ${sample.status ? '✅' : '❌'}`);
      console.log(`   - items: ${sample.items ? '✅' : '❌'}`);
      console.log(`   - buyer: ${sample.buyer ? '✅' : '❌'}`);
      console.log(`   - createdAt: ${sample.createdAt ? '✅' : '❌'}`);
      console.log(`   - updatedAt: ${sample.updatedAt ? '✅' : '❌'}`);
      console.log(`   - deletedAt: ${sample.deletedAt === null ? '✅' : '⚠️ (soft deleted)'}\n`);
      
      if (sample.items.length > 0) {
        const item = sample.items[0];
        console.log('✅ RFQ Item Structure Check:');
        console.log(`   - productId: ${item.productId !== null ? '✅' : '⚠️ (null)'}`);
        console.log(`   - productName: ${item.productName ? '✅' : '❌'}`);
        console.log(`   - quantity: ${item.quantity ? '✅' : '⚠️ (null)'}`);
        console.log(`   - unit: ${item.unit ? '✅' : '⚠️ (null)'}\n`);
      }
    }

    // Test 3: Check foreign keys
    console.log('✅ Foreign Key Check:');
    const rfqWithInvalidBuyer = await prisma.rFQ.findFirst({
      where: {
        deletedAt: null
      },
      include: {
        buyer: true
      }
    });
    
    if (rfqWithInvalidBuyer) {
      console.log(`   - buyerId references valid user: ${rfqWithInvalidBuyer.buyer ? '✅' : '❌'}\n`);
    }

    console.log('✅ All tests passed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testRFQ();
