// Transform API product data to match component expectations
export const transformProduct = (product) => {
  // Safely extract certifications
  let certifications = [];
  if (product.certifications && Array.isArray(product.certifications)) {
    certifications = product.certifications.map(c => {
      if (typeof c === 'string') return c;
      return c.type || c.certificationType || 'Certified';
    });
  } else if (product.compliance) {
    // ProductCompliance is a single object, not an array
    if (Array.isArray(product.compliance)) {
      certifications = product.compliance.map(c => {
        if (typeof c === 'string') return c;
        return c.certificationType || c.type || 'Certified';
      });
    } else if (typeof product.compliance === 'object' && product.compliance !== null) {
      // Extract certification types from the compliance object
      const complianceObj = product.compliance;
      if (complianceObj.certificationType) {
        certifications = [complianceObj.certificationType];
      } else {
        // Extract from boolean flags
        if (complianceObj.whoGmp) certifications.push('WHO-GMP');
        if (complianceObj.fda) certifications.push('FDA');
        if (complianceObj.iso) certifications.push('ISO');
        if (complianceObj.dmf) certifications.push('DMF');
        if (complianceObj.coa) certifications.push('COA');
      }
    }
  }

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand || 'N/A',
    manufacturer: product.manufacturer || product.supplier?.companyName || 'N/A',
    country: product.country || product.supplier?.country || 'N/A',
    moq: product.moq || 'Contact for MOQ',
    availability: product.availability === 'IN_STOCK' ? 'In Stock' : 
                  product.availability === 'MADE_TO_ORDER' ? 'Made to Order' : 
                  'Out of Stock',
    price: product.price != null ? parseFloat(product.price) : null,
    certifications: certifications,
    image: product.images?.[0]?.url || 
           'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
    strength: product.strength,
    dosageForm: product.dosageForm,
    supplier: product.supplier
  };
};

// Transform API supplier data to match component expectations
export const transformSupplier = (supplier) => {
  // Extract certifications
  const certifications = supplier.certifications?.map(c => c.type || c) || []
  
  // Check compliance flags from certifications
  const hasWhoGmp = certifications.some(c => c.toLowerCase().includes('who-gmp') || c.toLowerCase().includes('who gmp'))
  const hasFda = certifications.some(c => c.toLowerCase().includes('fda'))
  const hasIso = certifications.some(c => c.toLowerCase().includes('iso'))
  
  // Extract manufacturing capabilities
  // manufacturingCapabilities is a single object (one-to-one relation), not an array
  const manufacturingCapabilities = supplier.manufacturingCapabilities || null
  const manufacturingCapability = manufacturingCapabilities?.dosageForms || []
  
  return {
    id: supplier.id,
    name: supplier.companyName,
    slug: supplier.slug,
    country: supplier.country || 'N/A',
    city: supplier.city,
    certifications: certifications,
    totalProducts: supplier._count?.products || 0,
    yearsInBusiness: supplier.yearsInBusiness || 0,
    image: supplier.logo || 
           'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=400&fit=crop',
    isVerified: supplier.isVerified || false,
    description: supplier.description,
    email: supplier.email,
    phone: supplier.phone,
    website: supplier.website,
    // Additional fields for detail page
    manufacturingCapability: manufacturingCapability,
    exportMarkets: manufacturingCapabilities?.exportMarkets || [],
    regulatoryApprovals: manufacturingCapabilities?.regulatoryApprovals || certifications,
    compliance: {
      whoGmp: hasWhoGmp,
      fda: hasFda,
      iso: hasIso,
      dmf: false, // Not in schema yet
      coa: false, // Not in schema yet
      auditTrail: false // Not in schema yet
    },
    capability: {
      dosageForms: manufacturingCapability.length > 0 ? manufacturingCapability : ['Tablets', 'Capsules'],
      productionCapacity: manufacturingCapabilities?.productionCapacity || 'Contact for details',
      packagingTypes: manufacturingCapabilities?.packagingTypes || ['Blister packs', 'Bottles'],
      coldChain: manufacturingCapabilities?.coldChain || false,
      minOrderTerms: manufacturingCapabilities?.minOrderTerms || 'MOQ: Contact supplier'
    },
    performance: {
      totalOrders: supplier.totalOrders || 0,
      countriesServed: supplier.countriesServed || 1,
      avgResponseTime: supplier.avgResponseTime || 'Contact supplier',
      repeatBuyersPercent: supplier.repeatBuyersPercent || 0
    },
    quickStats: {
      responseTime: supplier.avgResponseTime || 'Contact supplier',
      verifiedStatus: supplier.isVerified ? 'Verified' : 'Not Verified',
      onTimeDelivery: supplier.onTimeDelivery || 'N/A'
    }
  };
};

// Transform RFQ data
export const transformRFQ = (rfq) => {
  const acceptedResponses = rfq.responses?.filter(r => r.isAccepted) || [];
  const selectedQuotation = rfq.selectedQuotation || null;
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };
  
  return {
    id: rfq.id,
    rfqNumber: rfq.id ? rfq.id.substring(0, 8).toUpperCase() : 'N/A',
    title: rfq.title || 'Untitled RFQ',
    status: rfq.status || 'DRAFT',
    submittedDate: formatDate(rfq.createdAt),
    responses: rfq.responses?.length || 0,
    acceptedResponses: acceptedResponses.length,
    selectedQuotation: selectedQuotation,
    hasAcceptedQuotation: selectedQuotation?.isAccepted || acceptedResponses.length > 0,
    items: rfq.items || [],
    notes: rfq.notes,
    expiresAt: rfq.expiresAt,
    createdAt: rfq.createdAt,
    updatedAt: rfq.updatedAt
  };
};

// Transform product data for detail page (includes all fields)
export const transformProductDetail = (product) => {
  const base = transformProduct(product);
  
  // Extract images
  const images = product.images?.map(img => img.url) || [];
  
  // Extract compliance flags
  const compliance = product.compliance || {};
  const complianceFlags = {
    whoGmp: compliance.whoGmp || false,
    fda: compliance.fda || false,
    iso: compliance.iso || false,
    coa: compliance.coa || false,
    dmf: compliance.dmf || false
  };
  
  // Extract specifications - ensure therapeutics is always included
  const therapeuticsValue = product.therapeutics || null;

  const specifications = {
    apiName: product.apiName || 'N/A',
    composition: product.composition || product.name,
    therapeutics: therapeuticsValue || 'Not specified',
    packagingType: product.packagingType || 'Contact supplier',
    shelfLife: product.shelfLife || 'Contact supplier',
    storageConditions: product.storageConditions || 'Contact supplier',
    regulatoryApprovals: product.regulatoryApprovals || 'Contact supplier',
    hsCode: product.hsCode || 'N/A'
  };

  // Extract supplier/manufacturer info
  const supplier = product.supplier || {};
  const manufacturer = {
    name: supplier.companyName || product.manufacturer || 'N/A',
    country: supplier.country || product.country || 'N/A',
    yearsInBusiness: supplier.yearsInBusiness || 0,
    totalProducts: supplier._count?.products || 0,
    certifications: supplier.certifications?.map(c => c.type || c) || [],
    therapeutics: supplier.therapeutics || null,
    manufacturer: supplier.manufacturer || null,
    slug: supplier.slug || ''
  };
  
  return {
    ...base,
    images: images.length > 0 ? images : [base.image],
    description: product.description || 'No description available.',
    specifications,
    compliance: complianceFlags,
    manufacturer,
    compareTo: product.compareTo || null,
    ndcNumber: product.ndcNumber || null,
    packSize: product.packSize || null
  };
};

// Transform Order data
export const transformOrder = (order) => {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    orderDate: new Date(order.createdAt).toLocaleDateString(),
    expectedDelivery: order.expectedDelivery || 'TBD',
    totalAmount: order.totalAmount != null ? parseFloat(order.totalAmount) : null,
    supplier: order.supplier?.companyName || 'N/A',
    items: order.items || [],
    shippingAddress: order.shippingAddress
  };
};
