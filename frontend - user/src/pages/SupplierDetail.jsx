import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Package,
  CheckCircle2,
  ShieldCheck,
  Award,
  FileText,
  FileCheck,
  Clock,
  TrendingUp,
  Globe,
  Filter,
  X,
  Pill,
} from 'lucide-react'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import ProductCard from '../components/ProductCard'
import Loading from '../components/ui/Loading'
import ErrorState from '../components/ui/ErrorState'
import { suppliersService } from '../services/suppliers.service.js'
import { productsService } from '../services/products.service.js'
import { transformSupplier } from '../utils/dataTransform.js'
import { transformProduct } from '../utils/dataTransform.js'

function SupplierDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [supplierProducts, setSupplierProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productFilters, setProductFilters] = useState({
    dosageForm: 'All',
    certification: 'All',
    moq: 'All',
    availability: 'All',
  })

  useEffect(() => {
    loadSupplierData()
  }, [slug])

  useEffect(() => {
    if (supplier?.id) {
      loadSupplierProducts()
    }
  }, [supplier?.id, productFilters])

  const loadSupplierData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const supplierData = await suppliersService.getBySlug(slug)
      const transformed = transformSupplier(supplierData)
      setSupplier(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load supplier data')
    } finally {
      setLoading(false)
    }
  }

  const loadSupplierProducts = async () => {
    try {
      const apiFilters = {
        dosageForm: productFilters.dosageForm !== 'All' ? productFilters.dosageForm : undefined,
        availability: productFilters.availability !== 'All' ? 
          (productFilters.availability === 'In Stock' ? 'IN_STOCK' : 
           productFilters.availability === 'Made to Order' ? 'MADE_TO_ORDER' : undefined) : undefined,
        page: 1,
        limit: 100
      }

      const result = await suppliersService.getProducts(supplier.id, apiFilters)
      const productsData = result.data?.products || result.products || []
      const transformed = productsData.map(transformProduct)
      setSupplierProducts(transformed)
    } catch (err) {
      setSupplierProducts([])
    }
  }

  // SEO: Update document title and meta tags
  useEffect(() => {
    if (supplier) {
      document.title = `${supplier.name} – Verified Pharmaceutical Supplier | Pharmetis`

      const metaDescription = document.querySelector('meta[name="description"]')
      const certs = supplier.certifications?.join(', ') || 'Certified'
      const description = `Source bulk medicines from ${supplier.name}, a verified pharmaceutical supplier in ${supplier.country}. ${certs} certified. ${supplier.totalProducts || 0}+ products available.`
      
      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = description
        document.head.appendChild(meta)
      }
    }
  }, [supplier])

  // Filter products (client-side filtering for additional filters)
  const filteredProducts = useMemo(() => {
    if (!supplierProducts || supplierProducts.length === 0) return []
    
    return supplierProducts.filter((product) => {
      const matchesDosageForm = productFilters.dosageForm === 'All' || 
        product.dosageForm?.toUpperCase() === productFilters.dosageForm.toUpperCase()
      
      const matchesCertification = productFilters.certification === 'All' ||
        (product.certifications || []).some((cert) => 
          cert.toLowerCase().includes(productFilters.certification.toLowerCase())
        )
      
      const matchesAvailability = productFilters.availability === 'All' || 
        product.availability === productFilters.availability

      // MOQ filter
      const matchesMOQ = productFilters.moq === 'All' || (() => {
        if (!product.moq) return false
        // Extract number from MOQ string (e.g., "10,000 units" -> 10000)
        const moqStr = product.moq.replace(/[^0-9]/g, '')
        const moqValue = parseInt(moqStr) || 0
        
        switch (productFilters.moq) {
          case '0-1000':
            return moqValue >= 0 && moqValue <= 1000
          case '1000-10000':
            return moqValue >= 1000 && moqValue <= 10000
          case '10000+':
            return moqValue >= 10000
          default:
            return true
        }
      })()

      return matchesDosageForm && matchesCertification && matchesAvailability && matchesMOQ
    })
  }, [productFilters, supplierProducts])

  const handleFilterChange = (filterName, value) => {
    setProductFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }))
  }

  const handleResetFilters = () => {
    setProductFilters({
      dosageForm: 'All',
      certification: 'All',
      moq: 'All',
      availability: 'All',
    })
  }

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product, supplier } })
  }

  const handleViewDetails = (product) => {
    navigate(`/medicines/${product.slug}`)
  }

  const activeFiltersCount = Object.values(productFilters).filter((value) => value !== 'All').length

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 pt-24 flex items-center justify-center">
        <Loading message="Loading supplier details..." fullScreen={false} />
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-blue-50 pt-24 flex items-center justify-center">
        <ErrorState
          message={error || 'Supplier not found'}
          retry="Back to Suppliers"
          onRetry={() => navigate('/suppliers')}
        />
      </div>
    )
  }

  // Transform supplier data for display
  const supplierDisplay = {
    ...supplier,
    certifications: supplier.certifications || [],
    manufacturingCapability: supplier.manufacturingCapability || [],
    exportMarkets: supplier.exportMarkets || [],
    regulatoryApprovals: supplier.regulatoryApprovals || [],
    compliance: supplier.compliance || {
      whoGmp: supplier.certifications?.some(c => c.toLowerCase().includes('who-gmp')) || false,
      fda: supplier.certifications?.some(c => c.toLowerCase().includes('fda')) || false,
      iso: supplier.certifications?.some(c => c.toLowerCase().includes('iso')) || false,
      dmf: false,
      coa: false,
      auditTrail: false,
    },
    capability: supplier.capability || {
      dosageForms: ['Tablets', 'Capsules', 'Injectables'],
      productionCapacity: 'Contact for details',
      packagingTypes: ['Blister packs', 'Bottles', 'Vials'],
      coldChain: false,
      minOrderTerms: 'MOQ: Contact supplier',
    },
    performance: supplier.performance || {
      totalOrders: 0,
      countriesServed: 1,
      avgResponseTime: 'Contact supplier',
      repeatBuyersPercent: 0,
    },
    quickStats: supplier.quickStats || {
      responseTime: 'Contact supplier',
      verifiedStatus: supplier.isVerified ? 'Verified' : 'Not Verified',
      onTimeDelivery: 'N/A',
    },
  }

  return (
    <div className="min-h-screen bg-blue-50 pt-24 pb-20">
      <Container>
        {/* Back Button */}
        <Link
          to="/suppliers"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Suppliers
        </Link>

        {/* 1. TOP SECTION – Supplier Overview */}
        <section className="mb-12">
          <div className="bg-white border border-blue-100 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* LEFT: Company Info */}
              <div className="lg:col-span-2">
                <div className="flex items-start gap-6">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-blue-200 flex items-center justify-center overflow-hidden">
                      {supplier.image ? (
                        <img src={supplier.image} alt={supplier.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-12 h-12 md:w-16 md:h-16 text-slate-600" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{supplierDisplay.name}</h1>
                    <div className="flex items-center gap-2 text-slate-600 mb-4">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg">{supplierDisplay.country}</span>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs text-slate-600 mb-1">Years in Business</div>
                        <div className="text-lg font-bold text-slate-900">{supplierDisplay.yearsInBusiness || 0}+</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs text-slate-600 mb-1">Total Products</div>
                        <div className="text-lg font-bold text-slate-900">{supplierDisplay.totalProducts || 0}+</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs text-slate-600 mb-1">Countries Served</div>
                        <div className="text-lg font-bold text-slate-900">{supplierDisplay.performance.countriesServed}+</div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="flex flex-wrap gap-2">
                      {supplierDisplay.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: CTAs and Quick Stats */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  {/* Primary CTA */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-base font-semibold py-4"
                    onClick={() => navigate('/send-rfq', { state: { supplier: supplierDisplay } })}
                  >
                    Send RFQ
                  </Button>

                  {/* Secondary CTA */}
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full text-base font-semibold py-4"
                    onClick={() => {
                      if (supplierDisplay.email) {
                        window.location.href = `mailto:${supplierDisplay.email}?subject=Inquiry about ${supplierDisplay.name}`
                      } else {
                        navigate('/send-rfq', { state: { supplier: supplierDisplay } })
                      }
                    }}
                  >
                    Contact Supplier
                  </Button>

                  {/* Quick Stats */}
                  <div className="pt-4 border-t border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Response Time</span>
                      <span className="text-sm font-semibold text-slate-900">{supplierDisplay.quickStats.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        {supplierDisplay.quickStats.verifiedStatus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">On-time Delivery</span>
                      <span className="text-sm font-semibold text-slate-900">{supplierDisplay.quickStats.onTimeDelivery}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. About Supplier */}
        <section className="mb-12">
          <div className="bg-white border border-blue-100 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">About Supplier</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-slate-700 leading-relaxed mb-4">{supplierDisplay.description || 'No description available.'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Manufacturing Capability</h3>
                <ul className="space-y-2">
                  {supplierDisplay.manufacturingCapability.length > 0 ? (
                    supplierDisplay.manufacturingCapability.map((capability, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                      <span>{capability}</span>
                    </li>
                    ))
                  ) : (
                    <li className="text-slate-500 text-sm">No manufacturing capabilities listed.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-blue-100">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-700" />
                  Export Markets
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supplierDisplay.exportMarkets.length > 0 ? (
                    supplierDisplay.exportMarkets.map((market, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
                      >
                        {market}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">No export markets listed.</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-700" />
                  Regulatory Approvals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {supplierDisplay.regulatoryApprovals.length > 0 ? (
                    supplierDisplay.regulatoryApprovals.map((approval, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200"
                    >
                      {approval}
                    </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-sm">No regulatory approvals listed.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Certifications & Compliance */}
        <section className="mb-12">
          <div className="bg-white border border-blue-100 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Certifications & Compliance</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: 'whoGmp', label: 'WHO-GMP', icon: ShieldCheck },
                { key: 'fda', label: 'FDA', icon: Award },
                { key: 'iso', label: 'ISO', icon: CheckCircle2 },
                { key: 'dmf', label: 'DMF', icon: FileText },
                { key: 'coa', label: 'COA Available', icon: FileCheck },
                { key: 'auditTrail', label: 'Audit Trail', icon: FileText },
              ].map((cert) => (
                <div
                  key={cert.key}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    supplierDisplay.compliance[cert.key]
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 opacity-50'
                  }`}
                >
                  <cert.icon
                    className={`w-8 h-8 mx-auto mb-3 ${
                      supplierDisplay.compliance[cert.key] ? 'text-blue-700' : 'text-slate-400'
                    }`}
                  />
                  <div
                    className={`text-sm font-semibold ${
                      supplierDisplay.compliance[cert.key] ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {cert.label}
                  </div>
                  {supplierDisplay.compliance[cert.key] && (
                    <div className="mt-2 text-xs text-emerald-600 font-medium">Certified</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Manufacturing & Product Capability */}
        <section className="mb-12">
          <div className="bg-white border border-blue-100 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Manufacturing & Product Capability</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <Pill className="w-6 h-6 text-blue-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Dosage Forms</h3>
                </div>
                <ul className="space-y-2">
                  {supplierDisplay.capability.dosageForms.map((form, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-700" />
                      {form}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Production Capacity</h3>
                </div>
                <p className="text-base font-semibold text-slate-900">{supplierDisplay.capability.productionCapacity}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-6 h-6 text-blue-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Packaging Types</h3>
                </div>
                <ul className="space-y-2">
                  {supplierDisplay.capability.packagingTypes.map((type, index) => (
                    <li key={index} className="text-sm text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-700" />
                      {type}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <Package className="w-6 h-6 text-blue-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Cold Chain</h3>
                </div>
                <p className="text-sm text-slate-700">
                  {supplierDisplay.capability.coldChain ? 'Cold chain storage available' : 'Standard storage only'}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="w-6 h-6 text-blue-700" />
                  <h3 className="text-lg font-semibold text-slate-900">Minimum Order Terms</h3>
                </div>
                <p className="text-sm text-slate-700">{supplierDisplay.capability.minOrderTerms}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Supplier Products */}
        <section className="mb-12">
          <div className="bg-white border border-blue-100 rounded-xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Supplier Products</h2>
                <p className="text-slate-600 mt-1">{filteredProducts.length} products available</p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-700" />
                  <h3 className="text-sm font-semibold text-slate-900">Filter Products</h3>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 bg-blue-700 text-white text-xs font-medium rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">Dosage Form</label>
                  <select
                    value={productFilters.dosageForm}
                    onChange={(e) => handleFilterChange('dosageForm', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Forms</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Injection">Injection</option>
                    <option value="Syrup">Syrup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">Certification</label>
                  <select
                    value={productFilters.certification}
                    onChange={(e) => handleFilterChange('certification', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Certifications</option>
                    <option value="WHO-GMP">WHO-GMP</option>
                    <option value="FDA">FDA</option>
                    <option value="ISO">ISO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">MOQ Range</label>
                  <select
                    value={productFilters.moq}
                    onChange={(e) => handleFilterChange('moq', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All MOQ</option>
                    <option value="0-1000">0 - 1,000</option>
                    <option value="1000-10000">1,000 - 10,000</option>
                    <option value="10000+">10,000+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">Availability</label>
                  <select
                    value={productFilters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Availability</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Made to Order">Made to Order</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSendRFQ={handleSendRFQ}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 6. Performance Metrics */}
        <section className="mb-12">
          <div className="bg-white border border-blue-100 rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Performance Metrics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{supplierDisplay.performance.totalOrders.toLocaleString()}</div>
                <div className="text-sm text-slate-600">Total Orders</div>
              </div>
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{supplierDisplay.performance.countriesServed}</div>
                <div className="text-sm text-slate-600">Countries Served</div>
              </div>
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
                  <Clock className="w-6 h-6 text-blue-700" />
                  {supplierDisplay.performance.avgResponseTime}
                </div>
                <div className="text-sm text-slate-600">Avg RFQ Response Time</div>
              </div>
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <div className="text-3xl font-bold text-slate-900 mb-2">{supplierDisplay.performance.repeatBuyersPercent}%</div>
                <div className="text-sm text-slate-600">Repeat Buyers</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Final Action Block */}
        <section>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Source from {supplierDisplay.name}?</h2>
            <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">
              Connect with this verified supplier and start your bulk pharmaceutical procurement today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="text-base font-semibold px-8 py-4"
                onClick={() => navigate('/send-rfq', { state: { supplier: supplierDisplay } })}
              >
                Start Sourcing from This Supplier
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base font-semibold px-8 py-4"
                onClick={() => navigate('/send-rfq', { state: { supplier: supplierDisplay, bulkRFQ: true } })}
              >
                Send Bulk RFQ
              </Button>
            </div>
          </div>
        </section>
      </Container>
    </div>
  )
}

export default SupplierDetail
