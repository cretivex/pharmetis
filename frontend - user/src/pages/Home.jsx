import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import BulkHeroSection from '../components/sections/BulkHeroSection'
import FeaturedProductsSection from '../components/sections/FeaturedProductsSection'
import B2BSuppliersSection from '../components/sections/B2BSuppliersSection'
import B2BHowItWorksSection from '../components/sections/B2BHowItWorksSection'
import B2BComplianceSection from '../components/sections/B2BComplianceSection'
import B2BMetricsSection from '../components/sections/B2BMetricsSection'
import B2BCTASection from '../components/sections/B2BCTASection'
import { productsService } from '../services/products.service.js'
import { suppliersService } from '../services/suppliers.service.js'
import { transformProduct, transformSupplier } from '../utils/dataTransform.js'

function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    country: 'All',
    certification: 'All',
    dosageForm: 'All',
    moq: 'All',
    availability: 'All',
  })
  
  // Real data from APIs
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load featured products
      const featured = await productsService.getFeatured()
      // Handle backend response: { success, message, data: products[] }
      const featuredData = Array.isArray(featured) ? featured : (featured.data || [])
      const transformedFeatured = featuredData.map(transformProduct)
      setFeaturedProducts(transformedFeatured)

      // Load all products for filtering
      const products = await productsService.getAll({ limit: 50 })
      // Handle backend response: { success, message, data: { products, pagination } }
      const productsData = products.data?.products || products.products || []
      const transformedProducts = productsData.map(transformProduct)
      setAllProducts(transformedProducts)

      // Load suppliers
      const suppliersData = await suppliersService.getAll({ limit: 6, isVerified: true })
      // Handle backend response: { success, message, data: { suppliers, pagination } }
      const suppliersList = suppliersData.data?.suppliers || suppliersData.suppliers || []
      const transformedSuppliers = suppliersList.map(transformSupplier)
      // Remove duplicates based on supplier ID
      const uniqueSuppliers = transformedSuppliers.filter((supplier, index, self) =>
        index === self.findIndex((s) => s.id === supplier.id)
      )
      setSuppliers(uniqueSuppliers)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = searchQuery ? allProducts : featuredProducts

    return filtered.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          (product.name || '').toLowerCase().includes(query) ||
          (product.brand || '').toLowerCase().includes(query) ||
          (product.manufacturer || '').toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Country filter
      if (filters.country !== 'All') {
        const countryMap = {
          IN: 'India',
          US: 'United States',
          DE: 'Germany',
          GB: 'United Kingdom',
          CN: 'China',
        }
        if (product.country !== countryMap[filters.country]) return false
      }

      // Certification filter
      if (filters.certification !== 'All') {
        if (!(product.certifications || []).some(cert => 
          cert.includes(filters.certification) || 
          cert.toLowerCase().includes(filters.certification.toLowerCase())
        )) return false
      }

      // Dosage form filter
      if (filters.dosageForm !== 'All') {
        const dosageMap = {
          'Tablet': 'TABLET',
          'Capsule': 'CAPSULE',
          'Injection': 'INJECTABLE',
          'Syrup': 'SYRUP',
        }
        if (product.dosageForm !== dosageMap[filters.dosageForm]) return false
      }

      // Availability filter
      if (filters.availability !== 'All') {
        if (product.availability !== filters.availability) return false
      }

      return true
    })
  }, [searchQuery, filters, allProducts, featuredProducts])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      country: 'All',
      certification: 'All',
      dosageForm: 'All',
      moq: 'All',
      availability: 'All',
    })
    setSearchQuery('')
  }

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product } })
  }

  const handleViewDetails = (product) => {
    navigate(`/medicines/${product.slug || product.id}`)
  }

  const handleViewSupplier = (supplier) => {
    navigate(`/suppliers/${supplier.slug || supplier.id}`)
  }

  const handleSendInquiry = (supplier) => {
    navigate('/send-rfq', { state: { supplier } })
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 1. Hero Section */}
      <BulkHeroSection onSearch={handleSearch} />

      {/* 2. Featured Products Section with Integrated Filters */}
      <FeaturedProductsSection
        products={filteredProducts}
        onSendRFQ={handleSendRFQ}
        onViewDetails={handleViewDetails}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Verified Suppliers Section */}
      <B2BSuppliersSection
        suppliers={suppliers}
        onViewSupplier={handleViewSupplier}
        onSendInquiry={handleSendInquiry}
      />

      {/* 5. How It Works */}
      <B2BHowItWorksSection />

      {/* 6. Enterprise Compliance Section */}
      <B2BComplianceSection />

      {/* 7. Performance Metrics */}
      <B2BMetricsSection />

      {/* 8. Final CTA Section */}
      <B2BCTASection />
    </div>
  )
}

export default Home
