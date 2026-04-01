import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import LandingHero from '../components/landing/LandingHero'
import LandingTrustBar from '../components/landing/LandingTrustBar'
import LandingHowWeVerify from '../components/landing/LandingHowWeVerify'
import LandingFeaturedProducts from '../components/landing/LandingFeaturedProducts'
import LandingVerifiedSuppliers from '../components/landing/LandingVerifiedSuppliers'
import LandingHowItWorks from '../components/landing/LandingHowItWorks'
import LandingComplianceCta from '../components/landing/LandingComplianceCta'
import { productsService } from '../services/products.service.js'
import { suppliersService } from '../services/suppliers.service.js'
import { transformProduct, transformSupplier } from '../utils/dataTransform.js'

function Home() {
  const navigate = useNavigate()
  const { hash } = useLocation()
  const [filters, setFilters] = useState({
    country: 'All',
    certification: 'All',
    dosageForm: 'All',
    moq: 'All',
    availability: 'All',
  })

  const [featuredProducts, setFeaturedProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (hash === '#compliance') {
      navigate('/compliance', { replace: true })
      return
    }
    if (!hash) return
    const id = hash.replace('#', '')
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [hash, navigate])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const featured = await productsService.getFeatured()
      const featuredData = Array.isArray(featured) ? featured : featured.data || []
      setFeaturedProducts(featuredData.map(transformProduct))

      const suppliersData = await suppliersService.getAll({ limit: 6, isVerified: true })
      const suppliersList = suppliersData.data?.suppliers || suppliersData.suppliers || []
      const transformedSuppliers = suppliersList.map(transformSupplier)
      const uniqueSuppliers = transformedSuppliers.filter(
        (supplier, index, self) => index === self.findIndex((s) => s.id === supplier.id)
      )
      setSuppliers(uniqueSuppliers)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = featuredProducts

    return filtered.filter((product) => {
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

      if (filters.certification !== 'All') {
        if (
          !(product.certifications || []).some(
            (cert) =>
              cert.includes(filters.certification) ||
              cert.toLowerCase().includes(filters.certification.toLowerCase())
          )
        )
          return false
      }

      if (filters.dosageForm !== 'All') {
        const dosageMap = {
          Tablet: 'TABLET',
          Capsule: 'CAPSULE',
          Injection: 'INJECTABLE',
          Syrup: 'SYRUP',
        }
        if (product.dosageForm !== dosageMap[filters.dosageForm]) return false
      }

      if (filters.availability !== 'All') {
        if (product.availability !== filters.availability) return false
      }

      return true
    })
  }, [filters, featuredProducts])

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
  }

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product } })
  }

  const handleSendInquiry = (supplier) => {
    navigate('/send-rfq', { state: { supplier } })
  }

  if (loading) {
    return (
      <div className="page-mesh flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-b-brand" />
          <p className="text-sm text-slate-600">Loading…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-mesh min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadData}
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-mesh min-h-screen text-slate-900 antialiased">
      <LandingHero />
      <LandingTrustBar />
      <LandingFeaturedProducts
        products={filteredProducts}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onSendRFQ={handleSendRFQ}
      />
      <LandingVerifiedSuppliers suppliers={suppliers} onSendInquiry={handleSendInquiry} />
      <LandingHowWeVerify />
      <LandingHowItWorks />
      <LandingComplianceCta />
    </div>
  )
}

export default Home
