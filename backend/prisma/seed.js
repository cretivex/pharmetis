import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n');

  // Clear existing data (in correct order due to foreign keys)
  console.log('🧹 Clearing existing data...');
  try {
    await prisma.savedProduct.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.rFQResponseItem.deleteMany();
    await prisma.rFQResponse.deleteMany();
    await prisma.rFQItem.deleteMany();
    await prisma.rFQ.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.productCertification.deleteMany();
    await prisma.productCompliance.deleteMany();
    await prisma.product.deleteMany();
    await prisma.supplierCertification.deleteMany();
    await prisma.supplierCompliance.deleteMany();
    await prisma.supplierManufacturingCapability.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.category.deleteMany();
    await prisma.accessRequest.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared\n');
  } catch (error) {
    console.log('⚠️ Some tables may be empty, continuing...\n');
  }

  // ============================================
  // CREATE USERS
  // ============================================
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pharmetis.com' },
    update: {},
    create: {
      email: 'admin@pharmetis.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create 5 vendors
  const vendor1 = await prisma.user.upsert({
    where: { email: 'vendor1@medipharma.com' },
    update: {},
    create: {
      email: 'vendor1@medipharma.com',
      password: hashedPassword,
      role: 'VENDOR',
    },
  });

  const vendor2 = await prisma.user.upsert({
    where: { email: 'vendor2@globalpharma.com' },
    update: {},
    create: {
      email: 'vendor2@globalpharma.com',
      password: hashedPassword,
      role: 'VENDOR',
    },
  });

  const vendor3 = await prisma.user.upsert({
    where: { email: 'vendor3@biomed.com' },
    update: {},
    create: {
      email: 'vendor3@biomed.com',
      password: hashedPassword,
      role: 'VENDOR',
    },
  });

  const vendor4 = await prisma.user.upsert({
    where: { email: 'vendor4@pharmacore.com' },
    update: {},
    create: {
      email: 'vendor4@pharmacore.com',
      password: hashedPassword,
      role: 'VENDOR',
    },
  });

  const vendor5 = await prisma.user.upsert({
    where: { email: 'vendor5@asianpharma.com' },
    update: {},
    create: {
      email: 'vendor5@asianpharma.com',
      password: hashedPassword,
      role: 'VENDOR',
    },
  });

  // Create 5 buyers
  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer1@healthcare.com' },
    update: {},
    create: {
      email: 'buyer1@healthcare.com',
      password: hashedPassword,
      role: 'BUYER',
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: 'buyer2@pharmacy.com' },
    update: {},
    create: {
      email: 'buyer2@pharmacy.com',
      password: hashedPassword,
      role: 'BUYER',
    },
  });

  const buyer3 = await prisma.user.upsert({
    where: { email: 'buyer3@hospital.com' },
    update: {},
    create: {
      email: 'buyer3@hospital.com',
      password: hashedPassword,
      role: 'BUYER',
    },
  });

  const buyer4 = await prisma.user.upsert({
    where: { email: 'buyer4@distributor.com' },
    update: {},
    create: {
      email: 'buyer4@distributor.com',
      password: hashedPassword,
      role: 'BUYER',
    },
  });

  const buyer5 = await prisma.user.upsert({
    where: { email: 'buyer5@wholesale.com' },
    update: {},
    create: {
      email: 'buyer5@wholesale.com',
      password: hashedPassword,
      role: 'BUYER',
    },
  });

  console.log(`✅ Created 11 users (1 Admin, 5 Vendors, 5 Buyers)\n`);

  // ============================================
  // CREATE CATEGORIES
  // ============================================
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'analgesics' },
      update: {},
      create: {
        name: 'Analgesics',
        slug: 'analgesics',
        description: 'Pain relief medications including paracetamol, ibuprofen, and aspirin',
        order: 1,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'antibiotics' },
      update: {},
      create: {
        name: 'Antibiotics',
        slug: 'antibiotics',
        description: 'Antibacterial medications for treating infections',
        order: 2,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cardiovascular' },
      update: {},
      create: {
        name: 'Cardiovascular',
        slug: 'cardiovascular',
        description: 'Heart and blood pressure medications',
        order: 3,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'diabetes' },
      update: {},
      create: {
        name: 'Diabetes',
        slug: 'diabetes',
        description: 'Diabetes management medications including metformin and insulin',
        order: 4,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'gastrointestinal' },
      update: {},
      create: {
        name: 'Gastrointestinal',
        slug: 'gastrointestinal',
        description: 'Digestive system medications for acid reflux and ulcers',
        order: 5,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'respiratory' },
      update: {},
      create: {
        name: 'Respiratory',
        slug: 'respiratory',
        description: 'Medications for asthma, COPD, and respiratory conditions',
        order: 6,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'antiviral' },
      update: {},
      create: {
        name: 'Antiviral',
        slug: 'antiviral',
        description: 'Antiviral medications for treating viral infections',
        order: 7,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'vitamins' },
      update: {},
      create: {
        name: 'Vitamins & Supplements',
        slug: 'vitamins',
        description: 'Vitamins, minerals, and nutritional supplements',
        order: 8,
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories\n`);

  // ============================================
  // CREATE SUPPLIERS
  // ============================================
  console.log('🏭 Creating suppliers...');
  const supplierData = [
    {
      user: vendor1,
      companyName: 'MediPharma Industries',
      slug: 'medipharma-industries',
      country: 'India',
      city: 'Mumbai',
      address: '123 Pharma Street, Andheri East, Mumbai 400069',
      phone: '+91-22-1234-5678',
      website: 'https://medipharma.com',
      description: 'Leading pharmaceutical manufacturer with 15+ years of experience in producing high-quality medicines. Specializes in bulk manufacturing of tablets, capsules, and injectables, serving global markets with WHO-GMP and FDA-compliant products.',
      yearsInBusiness: 15,
      logo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop',
      isVerified: true,
    },
    {
      user: vendor2,
      companyName: 'GlobalPharma Solutions',
      slug: 'globalpharma-solutions',
      country: 'Germany',
      city: 'Berlin',
      address: '456 Health Avenue, Mitte, Berlin 10115',
      phone: '+49-30-9876-5432',
      website: 'https://globalpharma.de',
      description: 'European pharmaceutical manufacturer specializing in GMP-certified products. With 12 years of experience, we export to over 50 countries worldwide.',
      yearsInBusiness: 12,
      logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop',
      isVerified: true,
    },
    {
      user: vendor3,
      companyName: 'BioMed Exports Ltd',
      slug: 'biomed-exports-ltd',
      country: 'United Kingdom',
      city: 'London',
      address: '789 Medical Road, Westminster, London SW1A 1AA',
      phone: '+44-20-1234-5678',
      website: 'https://biomed.co.uk',
      description: 'UK-based pharmaceutical exporter with FDA and MHRA approvals. We specialize in high-quality generic medicines for global distribution.',
      yearsInBusiness: 10,
      logo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop',
      isVerified: true,
    },
    {
      user: vendor4,
      companyName: 'PharmaCore International',
      slug: 'pharmacore-international',
      country: 'United States',
      city: 'New Jersey',
      address: '321 Pharma Boulevard, Parsippany, NJ 07054',
      phone: '+1-973-123-4567',
      website: 'https://pharmacore.com',
      description: 'US-based pharmaceutical manufacturer with 20 years of experience. FDA-approved facility producing cGMP-compliant products for domestic and international markets.',
      yearsInBusiness: 20,
      logo: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=200&fit=crop',
      isVerified: true,
    },
    {
      user: vendor5,
      companyName: 'Asian Pharma Group',
      slug: 'asian-pharma-group',
      country: 'China',
      city: 'Shanghai',
      address: '654 Industrial Park, Pudong, Shanghai 200120',
      phone: '+86-21-8765-4321',
      website: 'https://asianpharma.cn',
      description: 'Leading Chinese pharmaceutical manufacturer with WHO-GMP certification. We produce a wide range of pharmaceutical products for global markets.',
      yearsInBusiness: 8,
      logo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=200&h=200&fit=crop',
      isVerified: false,
    },
  ];

  const suppliers = [];
  for (const data of supplierData) {
    const supplier = await prisma.supplier.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        userId: data.user.id,
        companyName: data.companyName,
        slug: data.slug,
        country: data.country,
        city: data.city,
        address: data.address,
        phone: data.phone,
          website: data.website,
        description: data.description,
        yearsInBusiness: data.yearsInBusiness,
        logo: data.logo,
        isActive: true,
        isVerified: data.isVerified,
      },
    });
    suppliers.push(supplier);
  }
  console.log(`✅ Created ${suppliers.length} suppliers\n`);

  // ============================================
  // CREATE SUPPLIER CERTIFICATIONS
  // ============================================
  console.log('📜 Creating supplier certifications...');
  const supplierCertifications = [
    // Supplier 1
    { supplierId: suppliers[0].id, type: 'WHO-GMP', number: 'WHO-GMP-2024-001', issuedBy: 'WHO', issuedDate: new Date('2020-01-15'), expiryDate: new Date('2025-01-15') },
    { supplierId: suppliers[0].id, type: 'FDA', number: 'FDA-REG-12345', issuedBy: 'FDA', issuedDate: new Date('2019-06-20'), expiryDate: new Date('2024-06-20') },
    { supplierId: suppliers[0].id, type: 'ISO 9001', number: 'ISO-9001-2023', issuedBy: 'ISO', issuedDate: new Date('2023-03-10'), expiryDate: new Date('2026-03-10') },
    // Supplier 2
    { supplierId: suppliers[1].id, type: 'WHO-GMP', number: 'WHO-GMP-2024-002', issuedBy: 'WHO', issuedDate: new Date('2021-05-12'), expiryDate: new Date('2026-05-12') },
    { supplierId: suppliers[1].id, type: 'ISO 13485', number: 'ISO-13485-2023', issuedBy: 'ISO', issuedDate: new Date('2023-01-15'), expiryDate: new Date('2026-01-15') },
    { supplierId: suppliers[1].id, type: 'EMA', number: 'EMA-REG-67890', issuedBy: 'EMA', issuedDate: new Date('2020-08-30'), expiryDate: new Date('2025-08-30') },
    // Supplier 3
    { supplierId: suppliers[2].id, type: 'FDA', number: 'FDA-REG-67890', issuedBy: 'FDA', issuedDate: new Date('2020-08-30'), expiryDate: new Date('2025-08-30') },
    { supplierId: suppliers[2].id, type: 'MHRA', number: 'MHRA-REG-11111', issuedBy: 'MHRA', issuedDate: new Date('2021-03-20'), expiryDate: new Date('2026-03-20') },
    { supplierId: suppliers[2].id, type: 'ISO 9001', number: 'ISO-9001-UK-2023', issuedBy: 'ISO', issuedDate: new Date('2023-05-01'), expiryDate: new Date('2026-05-01') },
    // Supplier 4
    { supplierId: suppliers[3].id, type: 'FDA', number: 'FDA-REG-22222', issuedBy: 'FDA', issuedDate: new Date('2018-01-10'), expiryDate: new Date('2025-01-10') },
    { supplierId: suppliers[3].id, type: 'cGMP', number: 'CGMP-US-2023', issuedBy: 'FDA', issuedDate: new Date('2023-06-15'), expiryDate: new Date('2026-06-15') },
    { supplierId: suppliers[3].id, type: 'WHO-GMP', number: 'WHO-GMP-2024-003', issuedBy: 'WHO', issuedDate: new Date('2022-09-01'), expiryDate: new Date('2027-09-01') },
    // Supplier 5
    { supplierId: suppliers[4].id, type: 'WHO-GMP', number: 'WHO-GMP-2024-004', issuedBy: 'WHO', issuedDate: new Date('2023-01-01'), expiryDate: new Date('2026-01-01') },
    { supplierId: suppliers[4].id, type: 'ISO 9001', number: 'ISO-9001-CN-2023', issuedBy: 'ISO', issuedDate: new Date('2023-04-20'), expiryDate: new Date('2026-04-20') },
  ];

  await Promise.all(
    supplierCertifications.map(cert => 
      prisma.supplierCertification.create({ data: cert })
    )
  );
  console.log(`✅ Created ${supplierCertifications.length} supplier certifications\n`);

  // ============================================
  // CREATE SUPPLIER COMPLIANCE
  // ============================================
  console.log('✅ Creating supplier compliance...');
  const complianceData = [
    { supplierId: suppliers[0].id, whoGmp: true, fda: true, iso: true, dmf: true, coa: true, auditTrail: true },
    { supplierId: suppliers[1].id, whoGmp: true, fda: false, iso: true, dmf: false, coa: true, auditTrail: true },
    { supplierId: suppliers[2].id, whoGmp: false, fda: true, iso: true, dmf: false, coa: true, auditTrail: false },
    { supplierId: suppliers[3].id, whoGmp: true, fda: true, iso: false, dmf: true, coa: true, auditTrail: true },
    { supplierId: suppliers[4].id, whoGmp: true, fda: false, iso: true, dmf: false, coa: false, auditTrail: false },
  ];

  for (const compliance of complianceData) {
    await prisma.supplierCompliance.upsert({
      where: { supplierId: compliance.supplierId },
      update: compliance,
      create: compliance,
    });
  }
  console.log(`✅ Created supplier compliance records\n`);

  // ============================================
  // CREATE SUPPLIER MANUFACTURING CAPABILITIES
  // ============================================
  console.log('🏗️ Creating supplier manufacturing capabilities...');
  const manufacturingCapabilities = [
    {
      supplierId: suppliers[0].id,
      dosageForms: ['Tablets', 'Capsules', 'Injectables', 'Syrups', 'Suspensions'],
      productionCapacity: '50 million units per month',
      packagingTypes: ['Blister packs', 'Bottles', 'Vials', 'Ampoules', 'Bulk packaging'],
      coldChain: false,
      minOrderTerms: 'MOQ: 10,000 units per product',
      exportMarkets: ['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Middle East', 'Africa'],
      regulatoryApprovals: ['US FDA', 'EMA', 'WHO-GMP', 'UK MHRA', 'Health Canada', 'TGA Australia'],
    },
    {
      supplierId: suppliers[1].id,
      dosageForms: ['Tablets', 'Capsules', 'Injectables'],
      productionCapacity: '30 million units per month',
      packagingTypes: ['Blister packs', 'Bottles', 'Vials'],
      coldChain: true,
      minOrderTerms: 'MOQ: 5,000 units per product',
      exportMarkets: ['European Union', 'United States', 'Canada', 'Australia'],
      regulatoryApprovals: ['EMA', 'WHO-GMP', 'Health Canada', 'TGA Australia'],
    },
    {
      supplierId: suppliers[2].id,
      dosageForms: ['Tablets', 'Capsules', 'Syrups'],
      productionCapacity: '25 million units per month',
      packagingTypes: ['Blister packs', 'Bottles'],
      coldChain: false,
      minOrderTerms: 'MOQ: 8,000 units per product',
      exportMarkets: ['United Kingdom', 'United States', 'Ireland', 'New Zealand'],
      regulatoryApprovals: ['UK MHRA', 'FDA', 'HPRA Ireland', 'Medsafe NZ'],
    },
    {
      supplierId: suppliers[3].id,
      dosageForms: ['Tablets', 'Capsules', 'Injectables', 'Creams', 'Ointments'],
      productionCapacity: '75 million units per month',
      packagingTypes: ['Blister packs', 'Bottles', 'Vials', 'Tubes'],
      coldChain: true,
      minOrderTerms: 'MOQ: 15,000 units per product',
      exportMarkets: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina'],
      regulatoryApprovals: ['US FDA', 'Health Canada', 'COFEPRIS Mexico', 'ANVISA Brazil'],
    },
    {
      supplierId: suppliers[4].id,
        dosageForms: ['Tablets', 'Capsules', 'Injectables'],
        productionCapacity: '100 million units per month',
      packagingTypes: ['Blister packs', 'Bottles', 'Vials'],
      coldChain: false,
      minOrderTerms: 'MOQ: 20,000 units per product',
      exportMarkets: ['Southeast Asia', 'Middle East', 'Africa', 'Latin America'],
      regulatoryApprovals: ['WHO-GMP', 'NMPA China', 'ASEAN Regulatory'],
    },
  ];

  for (const capability of manufacturingCapabilities) {
    await prisma.supplierManufacturingCapability.upsert({
      where: { supplierId: capability.supplierId },
      update: capability,
      create: capability,
    });
  }
  console.log(`✅ Created supplier manufacturing capabilities\n`);

  // ============================================
  // CREATE PRODUCTS
  // ============================================
  console.log('💊 Creating products...');
  const productData = [
    // Supplier 1 Products
    { name: 'Paracetamol 500mg', brand: 'Tylenol', strength: '500mg', dosageForm: 'TABLET', manufacturer: 'MediPharma Industries', country: 'India', description: 'High-quality paracetamol tablets for pain relief and fever reduction. WHO-GMP and FDA approved.', apiName: 'Paracetamol', composition: 'Paracetamol 500mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store in a cool, dry place below 30°C', regulatoryApprovals: 'FDA, WHO-GMP', hsCode: '30049090', moq: '10,000 units', availability: 'IN_STOCK', price: 0.05, supplierId: suppliers[0].id, categoryId: categories[0].id },
    { name: 'Metformin 500mg', brand: 'Glucophage', strength: '500mg', dosageForm: 'TABLET', manufacturer: 'MediPharma Industries', country: 'India', description: 'First-line treatment for type 2 diabetes. Effective glucose control medication.', apiName: 'Metformin', composition: 'Metformin HCl 500mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store below 30°C in a dry place', regulatoryApprovals: 'FDA, WHO-GMP', hsCode: '30049090', moq: '15,000 units', availability: 'IN_STOCK', price: 0.10, supplierId: suppliers[0].id, categoryId: categories[3].id },
    { name: 'Atorvastatin 20mg', brand: 'Lipitor', strength: '20mg', dosageForm: 'TABLET', manufacturer: 'MediPharma Industries', country: 'India', description: 'Cholesterol-lowering medication. Reduces risk of cardiovascular events.', apiName: 'Atorvastatin', composition: 'Atorvastatin Calcium 20mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store below 30°C', regulatoryApprovals: 'FDA, WHO-GMP', hsCode: '30049090', moq: '12,000 units', availability: 'IN_STOCK', price: 0.20, supplierId: suppliers[0].id, categoryId: categories[2].id },
    { name: 'Amlodipine 5mg', brand: 'Norvasc', strength: '5mg', dosageForm: 'TABLET', manufacturer: 'MediPharma Industries', country: 'India', description: 'Calcium channel blocker for hypertension and angina.', apiName: 'Amlodipine', composition: 'Amlodipine Besylate 5mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store below 30°C', regulatoryApprovals: 'FDA, WHO-GMP', hsCode: '30049090', moq: '8,000 units', availability: 'IN_STOCK', price: 0.18, supplierId: suppliers[0].id, categoryId: categories[2].id },
    { name: 'Ibuprofen 400mg', brand: 'Advil', strength: '400mg', dosageForm: 'TABLET', manufacturer: 'MediPharma Industries', country: 'India', description: 'Non-steroidal anti-inflammatory drug for pain and inflammation.', apiName: 'Ibuprofen', composition: 'Ibuprofen 400mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store in a dry place', regulatoryApprovals: 'FDA, WHO-GMP', hsCode: '30049090', moq: '20,000 units', availability: 'IN_STOCK', price: 0.08, supplierId: suppliers[0].id, categoryId: categories[0].id },
    // Supplier 2 Products
    { name: 'Amoxicillin 250mg', brand: 'Amoxil', strength: '250mg', dosageForm: 'CAPSULE', manufacturer: 'GlobalPharma Solutions', country: 'Germany', description: 'Broad-spectrum antibiotic for bacterial infections. EMA and WHO-GMP approved.', apiName: 'Amoxicillin', composition: 'Amoxicillin Trihydrate 250mg', packagingType: 'Bottle (100 capsules)', shelfLife: '24 months', storageConditions: 'Store below 25°C in a dry place', regulatoryApprovals: 'EMA, WHO-GMP', hsCode: '30041011', moq: '5,000 units', availability: 'MADE_TO_ORDER', price: 0.12, supplierId: suppliers[1].id, categoryId: categories[1].id },
    { name: 'Omeprazole 20mg', brand: 'Prilosec', strength: '20mg', dosageForm: 'CAPSULE', manufacturer: 'GlobalPharma Solutions', country: 'Germany', description: 'Proton pump inhibitor for acid reflux and ulcers.', apiName: 'Omeprazole', composition: 'Omeprazole 20mg', packagingType: 'Blister Pack (14 capsules)', shelfLife: '24 months', storageConditions: 'Store below 25°C', regulatoryApprovals: 'EMA, WHO-GMP', hsCode: '30049090', moq: '25,000 units', availability: 'MADE_TO_ORDER', price: 0.15, supplierId: suppliers[1].id, categoryId: categories[4].id },
    { name: 'Losartan 50mg', brand: 'Cozaar', strength: '50mg', dosageForm: 'TABLET', manufacturer: 'GlobalPharma Solutions', country: 'Germany', description: 'Angiotensin receptor blocker for blood pressure control.', apiName: 'Losartan', composition: 'Losartan Potassium 50mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store below 30°C', regulatoryApprovals: 'EMA, WHO-GMP', hsCode: '30049090', moq: '18,000 units', availability: 'IN_STOCK', price: 0.16, supplierId: suppliers[1].id, categoryId: categories[2].id },
    // Supplier 3 Products
    { name: 'Ibuprofen 400mg', brand: 'Advil', strength: '400mg', dosageForm: 'TABLET', manufacturer: 'BioMed Exports Ltd', country: 'United Kingdom', description: 'Non-steroidal anti-inflammatory drug for pain and inflammation.', apiName: 'Ibuprofen', composition: 'Ibuprofen 400mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store in a dry place', regulatoryApprovals: 'MHRA, FDA', hsCode: '30049090', moq: '20,000 units', availability: 'IN_STOCK', price: 0.08, supplierId: suppliers[2].id, categoryId: categories[0].id },
    { name: 'Amlodipine 5mg', brand: 'Norvasc', strength: '5mg', dosageForm: 'TABLET', manufacturer: 'BioMed Exports Ltd', country: 'United Kingdom', description: 'Calcium channel blocker for hypertension.', apiName: 'Amlodipine', composition: 'Amlodipine Besylate 5mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store below 30°C', regulatoryApprovals: 'MHRA, FDA', hsCode: '30049090', moq: '8,000 units', availability: 'IN_STOCK', price: 0.18, supplierId: suppliers[2].id, categoryId: categories[2].id },
    { name: 'Paracetamol 500mg', brand: 'Tylenol', strength: '500mg', dosageForm: 'TABLET', manufacturer: 'BioMed Exports Ltd', country: 'United Kingdom', description: 'High-quality paracetamol tablets. MHRA approved.', apiName: 'Paracetamol', composition: 'Paracetamol 500mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store in a cool, dry place', regulatoryApprovals: 'MHRA, FDA', hsCode: '30049090', moq: '10,000 units', availability: 'IN_STOCK', price: 0.06, supplierId: suppliers[2].id, categoryId: categories[0].id },
    // Supplier 4 Products
    { name: 'Metformin 500mg', brand: 'Glucophage', strength: '500mg', dosageForm: 'TABLET', manufacturer: 'PharmaCore International', country: 'United States', description: 'FDA-approved metformin for type 2 diabetes management.', apiName: 'Metformin', composition: 'Metformin HCl 500mg', packagingType: 'Bottle (100 tablets)', shelfLife: '36 months', storageConditions: 'Store below 30°C', regulatoryApprovals: 'FDA, cGMP', hsCode: '30049090', moq: '20,000 units', availability: 'IN_STOCK', price: 0.12, supplierId: suppliers[3].id, categoryId: categories[3].id },
    { name: 'Atorvastatin 20mg', brand: 'Lipitor', strength: '20mg', dosageForm: 'TABLET', manufacturer: 'PharmaCore International', country: 'United States', description: 'FDA-approved cholesterol-lowering medication.', apiName: 'Atorvastatin', composition: 'Atorvastatin Calcium 20mg', packagingType: 'Bottle (90 tablets)', shelfLife: '36 months', storageConditions: 'Store below 30°C', regulatoryApprovals: 'FDA, cGMP', hsCode: '30049090', moq: '15,000 units', availability: 'IN_STOCK', price: 0.25, supplierId: suppliers[3].id, categoryId: categories[2].id },
    // Supplier 5 Products
    { name: 'Paracetamol 500mg', brand: 'Tylenol', strength: '500mg', dosageForm: 'TABLET', manufacturer: 'Asian Pharma Group', country: 'China', description: 'Cost-effective paracetamol tablets. WHO-GMP certified.', apiName: 'Paracetamol', composition: 'Paracetamol 500mg', packagingType: 'Blister Pack (10x10)', shelfLife: '36 months', storageConditions: 'Store in a cool, dry place', regulatoryApprovals: 'WHO-GMP', hsCode: '30049090', moq: '50,000 units', availability: 'IN_STOCK', price: 0.03, supplierId: suppliers[4].id, categoryId: categories[0].id },
    { name: 'Amoxicillin 250mg', brand: 'Amoxil', strength: '250mg', dosageForm: 'CAPSULE', manufacturer: 'Asian Pharma Group', country: 'China', description: 'Broad-spectrum antibiotic. WHO-GMP certified.', apiName: 'Amoxicillin', composition: 'Amoxicillin Trihydrate 250mg', packagingType: 'Bottle (100 capsules)', shelfLife: '24 months', storageConditions: 'Store below 25°C', regulatoryApprovals: 'WHO-GMP', hsCode: '30041011', moq: '30,000 units', availability: 'MADE_TO_ORDER', price: 0.08, supplierId: suppliers[4].id, categoryId: categories[1].id },
  ];

  const products = [];
  for (const data of productData) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existing = await prisma.product.findFirst({
      where: {
        supplierId: data.supplierId,
        slug: slug,
      },
    });

    let product;
    if (existing) {
      product = existing;
    } else {
      product = await prisma.product.create({
        data: {
          supplierId: data.supplierId,
          name: data.name,
          slug: slug,
          brand: data.brand,
          strength: data.strength,
          dosageForm: data.dosageForm,
          manufacturer: data.manufacturer,
          country: data.country,
          description: data.description,
          apiName: data.apiName,
          composition: data.composition,
          packagingType: data.packagingType,
          shelfLife: data.shelfLife,
          storageConditions: data.storageConditions,
          regulatoryApprovals: data.regulatoryApprovals,
          hsCode: data.hsCode,
          moq: data.moq,
          availability: data.availability,
          price: data.price,
          isActive: true,
          images: {
            create: [
              {
                url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
                alt: data.name,
                order: 0,
              },
              {
                url: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=400&fit=crop',
                alt: `${data.name} - Package`,
                order: 1,
              },
            ],
          },
          productCategories: {
            create: {
              categoryId: data.categoryId,
            },
          },
        },
      });
    }
    products.push(product);
  }

  // Update supplier totalProducts count
  for (const supplier of suppliers) {
    const productCount = await prisma.product.count({
      where: { supplierId: supplier.id, deletedAt: null, isActive: true },
    });
    await prisma.supplier.update({
      where: { id: supplier.id },
      data: { totalProducts: productCount },
    });
  }

  console.log(`✅ Created ${products.length} products\n`);

  // ============================================
  // CREATE PRODUCT CERTIFICATIONS
  // ============================================
  console.log('📋 Creating product certifications...');
  const productCertifications = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const supplier = suppliers.find(s => s.id === product.supplierId);
    
    if (supplier?.isVerified) {
      productCertifications.push(
        prisma.productCertification.create({
          data: {
            productId: product.id,
            type: 'WHO-GMP',
            number: `WHO-GMP-PROD-${String(i + 1).padStart(3, '0')}`,
            issuedBy: 'WHO',
            issuedDate: new Date('2023-01-10'),
            expiryDate: new Date('2026-01-10'),
          },
        })
      );
      
      if (supplier.country === 'United States' || supplier.country === 'India') {
        productCertifications.push(
          prisma.productCertification.create({
            data: {
              productId: product.id,
              type: 'FDA',
              number: `FDA-PROD-${String(i + 1).padStart(3, '0')}`,
              issuedBy: 'FDA',
              issuedDate: new Date('2023-02-15'),
              expiryDate: new Date('2026-02-15'),
            },
          })
        );
      }
    }
  }
  await Promise.all(productCertifications);
  console.log(`✅ Created ${productCertifications.length} product certifications\n`);

  // ============================================
  // CREATE PRODUCT COMPLIANCE
  // ============================================
  console.log('✅ Creating product compliance...');
  for (const product of products) {
    const supplier = suppliers.find(s => s.id === product.supplierId);
    const hasWhoGmp = product.regulatoryApprovals?.includes('WHO-GMP') || false;
    const hasFda = product.regulatoryApprovals?.includes('FDA') || false;
    const hasIso = supplier?.isVerified || false;
    
    await prisma.productCompliance.upsert({
      where: { productId: product.id },
      update: {
        whoGmp: hasWhoGmp,
        fda: hasFda,
        iso: hasIso,
        dmf: hasFda && supplier?.country === 'United States',
        coa: true,
      },
      create: {
        productId: product.id,
        whoGmp: hasWhoGmp,
        fda: hasFda,
        iso: hasIso,
        dmf: hasFda && supplier?.country === 'United States',
        coa: true,
      },
    });
  }
  console.log(`✅ Created product compliance records\n`);

  // ============================================
  // CREATE RFQs
  // ============================================
  console.log('📝 Creating RFQs...');
  const rfqs = [];
  
  // Create RFQs with different statuses
  const rfq1 = await prisma.rFQ.create({
    data: {
      buyerId: buyer1.id,
      title: 'Bulk Order - Paracetamol 500mg',
      status: 'SENT',
      notes: 'Need urgent delivery within 30 days. Please quote best price for 50,000 units.',
      expiresAt: new Date('2024-12-31'),
    },
  });
  await prisma.rFQItem.create({
    data: {
      rfqId: rfq1.id,
      productId: products[0].id,
      productName: products[0].name,
      quantity: '50000',
      unit: 'units',
      notes: 'Standard packaging, blister pack preferred',
    },
  });
  rfqs.push(rfq1);

  const rfq2 = await prisma.rFQ.create({
    data: {
      buyerId: buyer2.id,
      title: 'Multiple Products RFQ',
      status: 'DRAFT',
      notes: 'Exploring options for multiple products. Need competitive pricing.',
    },
  });
  await prisma.rFQItem.createMany({
    data: [
      {
        rfqId: rfq2.id,
        productId: products[1].id,
        productName: products[1].name,
        quantity: '10000',
        unit: 'units',
      },
      {
        rfqId: rfq2.id,
        productId: products[2].id,
        productName: products[2].name,
        quantity: '20000',
        unit: 'units',
      },
    ],
  });
  rfqs.push(rfq2);

  const rfq3 = await prisma.rFQ.create({
    data: {
      buyerId: buyer3.id,
      title: 'Cardiovascular Medications RFQ',
      status: 'SENT',
      notes: 'Looking for bulk supply of cardiovascular medications. Long-term contract possible.',
      expiresAt: new Date('2025-01-15'),
    },
  });
  await prisma.rFQItem.createMany({
    data: [
      {
        rfqId: rfq3.id,
        productId: products[2].id,
        productName: products[2].name,
        quantity: '30000',
        unit: 'units',
        notes: 'Need FDA approved',
      },
      {
        rfqId: rfq3.id,
        productId: products[3].id,
        productName: products[3].name,
        quantity: '25000',
        unit: 'units',
      },
    ],
  });
  rfqs.push(rfq3);

  const rfq4 = await prisma.rFQ.create({
    data: {
      buyerId: buyer4.id,
      title: 'Antibiotics Order',
      status: 'RESPONDED',
      notes: 'Urgent requirement for antibiotics',
      expiresAt: new Date('2024-12-20'),
    },
  });
  await prisma.rFQItem.create({
    data: {
      rfqId: rfq4.id,
      productId: products[5].id,
      productName: products[5].name,
      quantity: '15000',
      unit: 'units',
    },
  });
  rfqs.push(rfq4);

  console.log(`✅ Created ${rfqs.length} RFQs\n`);

  // ============================================
  // CREATE RFQ RESPONSES
  // ============================================
  console.log('📨 Creating RFQ responses...');
  const rfqItem1 = await prisma.rFQItem.findFirst({ where: { rfqId: rfq1.id } });
  const rfqItem4 = await prisma.rFQItem.findFirst({ where: { rfqId: rfq4.id } });
  
  const rfqResponse1 = await prisma.rFQResponse.create({
    data: {
      rfqId: rfq1.id,
      supplierId: suppliers[0].id,
      totalAmount: 2500.00,
      currency: 'USD',
      validity: new Date('2025-01-31'),
      notes: 'We can deliver within 25 days. Best price for bulk order.',
      isAccepted: false,
    },
  });
  
  if (rfqItem1) {
    await prisma.rFQResponseItem.create({
      data: {
        rfqResponseId: rfqResponse1.id,
        rfqItemId: rfqItem1.id,
        productId: products[0].id,
        productName: products[0].name,
        quantity: '50000',
        unit: 'units',
        unitPrice: 0.05,
        totalPrice: 2500.00,
        leadTime: '25 days',
        notes: 'Can reduce price for larger orders',
      },
    });
  }

  const rfqResponse2 = await prisma.rFQResponse.create({
    data: {
      rfqId: rfq4.id,
      supplierId: suppliers[1].id,
      totalAmount: 1800.00,
      currency: 'USD',
      validity: new Date('2024-12-25'),
      notes: 'Ready to ship immediately. Competitive pricing.',
      isAccepted: true,
    },
  });
  
  if (rfqItem4) {
    await prisma.rFQResponseItem.create({
      data: {
        rfqResponseId: rfqResponse2.id,
        rfqItemId: rfqItem4.id,
        productId: products[5].id,
        productName: products[5].name,
        quantity: '15000',
        unit: 'units',
        unitPrice: 0.12,
        totalPrice: 1800.00,
        leadTime: '15 days',
      },
    });
  }

  console.log(`✅ Created RFQ responses\n`);

  // ============================================
  // CREATE ORDERS
  // ============================================
  console.log('🛒 Creating orders...');
  const orders = [];
  
  const order1 = await prisma.order.create({
    data: {
      buyerId: buyer1.id,
      supplierId: suppliers[0].id,
      orderNumber: `ORD-${Date.now()}-001`,
      status: 'CONFIRMED',
      totalAmount: 2500.00,
      currency: 'USD',
      shippingAddress: '123 Healthcare Street, New York, NY 10001, USA',
      notes: 'Please ensure proper packaging and include COA',
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: products[0].id,
      productName: products[0].name,
      quantity: 50000,
      unit: 'units',
      unitPrice: 0.05,
      totalPrice: 2500.00,
    },
  });
  orders.push(order1);

  const order2 = await prisma.order.create({
    data: {
      buyerId: buyer2.id,
      supplierId: suppliers[1].id,
      orderNumber: `ORD-${Date.now()}-002`,
      status: 'PROCESSING',
      totalAmount: 1200.00,
      currency: 'USD',
      shippingAddress: '456 Pharmacy Avenue, Los Angeles, CA 90001, USA',
      notes: 'Rush order - please expedite',
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products[5].id,
      productName: products[5].name,
      quantity: 10000,
      unit: 'units',
      unitPrice: 0.12,
      totalPrice: 1200.00,
    },
  });
  orders.push(order2);

  const order3 = await prisma.order.create({
    data: {
      buyerId: buyer3.id,
      supplierId: suppliers[2].id,
      orderNumber: `ORD-${Date.now()}-003`,
      status: 'SHIPPED',
      totalAmount: 3600.00,
      currency: 'USD',
      shippingAddress: '789 Hospital Drive, Chicago, IL 60601, USA',
    },
  });
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order3.id,
        productId: products[8].id,
        productName: products[8].name,
        quantity: 20000,
        unit: 'units',
        unitPrice: 0.08,
        totalPrice: 1600.00,
      },
      {
        orderId: order3.id,
        productId: products[9].id,
        productName: products[9].name,
        quantity: 10000,
        unit: 'units',
        unitPrice: 0.18,
        totalPrice: 1800.00,
      },
    ],
  });
  orders.push(order3);

  const order4 = await prisma.order.create({
    data: {
      buyerId: buyer4.id,
      supplierId: suppliers[3].id,
      orderNumber: `ORD-${Date.now()}-004`,
      status: 'DELIVERED',
      totalAmount: 2400.00,
      currency: 'USD',
      shippingAddress: '321 Medical Center, Houston, TX 77001, USA',
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order4.id,
      productId: products[11].id,
      productName: products[11].name,
      quantity: 20000,
      unit: 'units',
      unitPrice: 0.12,
      totalPrice: 2400.00,
    },
  });
  orders.push(order4);

  const order5 = await prisma.order.create({
    data: {
      buyerId: buyer5.id,
      supplierId: suppliers[4].id,
      orderNumber: `ORD-${Date.now()}-005`,
      status: 'PENDING',
      totalAmount: 1500.00,
      currency: 'USD',
      shippingAddress: '654 Wholesale Blvd, Miami, FL 33101, USA',
    },
  });
  await prisma.orderItem.create({
    data: {
      orderId: order5.id,
      productId: products[13].id,
      productName: products[13].name,
      quantity: 50000,
      unit: 'units',
      unitPrice: 0.03,
      totalPrice: 1500.00,
    },
  });
  orders.push(order5);

  console.log(`✅ Created ${orders.length} orders\n`);

  // ============================================
  // CREATE SAVED PRODUCTS
  // ============================================
  console.log('❤️ Creating saved products...');
  const savedProducts = [
    { userId: buyer1.id, productId: products[0].id },
    { userId: buyer1.id, productId: products[2].id },
    { userId: buyer1.id, productId: products[3].id },
    { userId: buyer2.id, productId: products[1].id },
    { userId: buyer2.id, productId: products[5].id },
    { userId: buyer3.id, productId: products[8].id },
    { userId: buyer3.id, productId: products[9].id },
    { userId: buyer4.id, productId: products[11].id },
    { userId: buyer5.id, productId: products[13].id },
  ];

  for (const saved of savedProducts) {
    try {
      await prisma.savedProduct.upsert({
        where: {
          userId_productId: {
            userId: saved.userId,
            productId: saved.productId,
          },
        },
        update: {},
        create: saved,
      });
    } catch (error) {
      // Skip if already exists
    }
  }
  console.log(`✅ Created ${savedProducts.length} saved products\n`);

  // ============================================
  // CREATE ACCESS REQUESTS
  // ============================================
  console.log('🔐 Creating access requests...');
  await Promise.all([
    prisma.accessRequest.create({
      data: {
        userId: null,
        companyName: 'New Pharma Distributor',
        email: 'newdistributor@example.com',
        phone: '+1-555-123-4567',
        country: 'United States',
        message: 'We are a new pharmaceutical distributor looking to source bulk medicines. Please grant access to your platform.',
        status: 'PENDING',
      },
    }),
    prisma.accessRequest.create({
      data: {
        userId: null,
        companyName: 'Global Medical Supplies',
        email: 'contact@globalmedical.com',
        phone: '+44-20-9876-5432',
        country: 'United Kingdom',
        message: 'Interested in becoming a buyer on your platform. We have 10+ years of experience in pharmaceutical distribution.',
        status: 'PENDING',
      },
    }),
    prisma.accessRequest.create({
      data: {
        userId: buyer5.id,
        companyName: 'Wholesale Pharma Co',
        email: 'buyer5@wholesale.com',
        phone: '+1-305-555-7890',
        country: 'United States',
        message: 'Requesting additional access permissions for bulk ordering.',
        status: 'APPROVED',
      },
    }),
  ]);
  console.log(`✅ Created access requests\n`);

  // ============================================
  // CREATE USER SETTINGS
  // ============================================
  console.log('⚙️ Creating user settings...');
  const userSettingsData = [
    {
      userId: buyer1.id,
      language: 'en',
      currency: 'USD',
      timezone: 'America/New_York',
      notifications: { email: true, sms: false, push: true, rfqUpdates: true, orderUpdates: true },
      preferences: { theme: 'light', itemsPerPage: 20, defaultView: 'grid' },
    },
    {
      userId: buyer2.id,
      language: 'en',
      currency: 'USD',
      timezone: 'America/Los_Angeles',
      notifications: { email: true, sms: true, push: true, rfqUpdates: true, orderUpdates: true },
      preferences: { theme: 'dark', itemsPerPage: 50, defaultView: 'list' },
    },
    {
      userId: vendor1.id,
      language: 'en',
      currency: 'USD',
      timezone: 'Asia/Kolkata',
      notifications: { email: true, sms: false, push: false, rfqNotifications: true, orderNotifications: true },
      preferences: { theme: 'light', itemsPerPage: 30, defaultView: 'grid' },
    },
    {
      userId: vendor2.id,
      language: 'de',
      currency: 'EUR',
      timezone: 'Europe/Berlin',
      notifications: { email: true, sms: false, push: true, rfqNotifications: true },
      preferences: { theme: 'light', itemsPerPage: 25, defaultView: 'grid' },
    },
  ];

  for (const settings of userSettingsData) {
    await prisma.userSettings.upsert({
      where: { userId: settings.userId },
      update: {},
      create: settings,
    });
  }
  console.log(`✅ Created user settings\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('✅ Database seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Users: 11 (1 Admin, 5 Vendors, 5 Buyers)`);
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Supplier Certifications: ${supplierCertifications.length}`);
  console.log(`   - Supplier Compliance: 5`);
  console.log(`   - Supplier Manufacturing Capabilities: 5`);
  console.log(`   - Product Certifications: ${productCertifications.length}`);
  console.log(`   - Product Compliance: ${products.length}`);
  console.log(`   - RFQs: ${rfqs.length}`);
  console.log(`   - RFQ Responses: 2`);
  console.log(`   - Orders: ${orders.length}`);
  console.log(`   - Saved Products: ${savedProducts.length}`);
  console.log(`   - Access Requests: 3`);
  console.log(`   - User Settings: ${userSettingsData.length}\n`);
  console.log('🔑 Test Credentials:');
  console.log('   Admin: admin@pharmetis.com / password123');
  console.log('   Vendor: vendor1@medipharma.com / password123');
  console.log('   Buyer: buyer1@healthcare.com / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
