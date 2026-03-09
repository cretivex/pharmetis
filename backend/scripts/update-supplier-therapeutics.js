import prisma from '../src/config/database.js';

async function updateSupplierTherapeutics() {
  try {
    const supplierId = '0341e2fd-9c29-4349-b3ef-9d62cc8c90d2'; // The supplier ID from the product
    
    console.log('\n🔧 Updating Supplier Therapeutics...\n');

    // Check if supplier exists
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
      select: { id: true, companyName: true, therapeutics: true, manufacturer: true }
    });

    if (!supplier) {
      console.log(`❌ Supplier with ID ${supplierId} not found`);
      await prisma.$disconnect();
      return;
    }

    console.log(`Found supplier: ${supplier.companyName}`);
    console.log(`Current therapeutics: ${supplier.therapeutics || 'Not set'}`);
    console.log(`Current manufacturer: ${supplier.manufacturer || 'Not set'}`);

    // Update with sample data if not set
    const updated = await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        therapeutics: supplier.therapeutics || 'Cardiovascular, First Aid, Emergency Care',
        manufacturer: supplier.manufacturer || 'Medical Supplies Inc.'
      },
      select: {
        id: true,
        companyName: true,
        therapeutics: true,
        manufacturer: true
      }
    });

    console.log(`\n✅ Updated supplier:`);
    console.log(`   Therapeutics: ${updated.therapeutics}`);
    console.log(`   Manufacturer: ${updated.manufacturer}`);
    console.log(`\n✅ Supplier updated successfully!\n`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error updating supplier:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

updateSupplierTherapeutics();
