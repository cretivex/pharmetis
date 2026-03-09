import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDummyData() {
  console.log('🧹 Starting cleanup of dummy data...\n');

  try {
    // Delete in correct order due to foreign key constraints
    
    console.log('📦 Deleting order-related data...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    console.log('✅ Orders deleted');

    console.log('💳 Deleting payment data...');
    await prisma.paymentTransaction.deleteMany();
    await prisma.payment.deleteMany();
    console.log('✅ Payments deleted');

    console.log('📝 Deleting RFQ-related data...');
    await prisma.rFQHistory.deleteMany();
    await prisma.rFQResponseItem.deleteMany();
    await prisma.rFQResponse.deleteMany();
    await prisma.rFQItem.deleteMany();
    await prisma.rFQ.deleteMany();
    await prisma.buyerQuotationItem.deleteMany();
    await prisma.buyerQuotation.deleteMany();
    console.log('✅ RFQs deleted');

    console.log('💊 Deleting product-related data...');
    await prisma.savedProduct.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.productCertification.deleteMany();
    await prisma.productCompliance.deleteMany();
    await prisma.product.deleteMany();
    console.log('✅ Products deleted');

    console.log('🏭 Deleting supplier-related data...');
    await prisma.supplierCertification.deleteMany();
    await prisma.supplierCompliance.deleteMany();
    await prisma.supplierManufacturingCapability.deleteMany();
    await prisma.supplier.deleteMany();
    console.log('✅ Suppliers deleted');

    console.log('📁 Deleting categories...');
    await prisma.category.deleteMany();
    console.log('✅ Categories deleted');

    console.log('🔔 Deleting notifications...');
    await prisma.notification.deleteMany();
    console.log('✅ Notifications deleted');

    console.log('📋 Deleting access requests...');
    await prisma.accessRequest.deleteMany();
    console.log('✅ Access requests deleted');

    console.log('⚙️ Deleting user settings...');
    await prisma.userSettings.deleteMany();
    console.log('✅ User settings deleted');

    console.log('🚚 Deleting shipment details...');
    await prisma.shipmentDetail.deleteMany();
    console.log('✅ Shipment details deleted');

    console.log('📊 Deleting negotiation history...');
    await prisma.negotiationHistory.deleteMany();
    console.log('✅ Negotiation history deleted');

    // Keep users and refresh tokens (login data)
    console.log('\n✅ Cleanup completed!');
    console.log('📊 Remaining data:');
    const userCount = await prisma.user.count();
    const tokenCount = await prisma.refreshToken.count();
    console.log(`   - Users: ${userCount} (login accounts preserved)`);
    console.log(`   - Refresh Tokens: ${tokenCount} (login sessions preserved)`);
    console.log('\n🔑 All login credentials are preserved and ready to use!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupDummyData()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
