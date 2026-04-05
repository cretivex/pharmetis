import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
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

  const featuredQuery = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const featured = await productsService.getFeatured()
      const featuredData = Array.isArray(featured) ? featured : featured.data || []
      return featuredData.map(transformProduct)
    },
  })

  const suppliersQuery = useQuery({
    queryKey: ['home-suppliers', { limit: 6, isVerified: true }],
    queryFn: async () => {
      const res = await suppliersService.getAll({ limit: 6, isVerified: true })
      const suppliersList = res.data?.suppliers || res.suppliers || []
      const transformed = suppliersList.map(transformSupplier)
      return transformed.filter(
        (supplier, index, self) => index === self.findIndex((s) => s.id === supplier.id)
      )
    },
  })

  const featuredProducts = featuredQuery.data ?? []

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
      <LandingVerifiedSuppliers
        suppliers={suppliersQuery.data ?? []}
        isLoading={suppliersQuery.isPending}
        isError={suppliersQuery.isError}
        onRetry={() => suppliersQuery.refetch()}
        onSendInquiry={handleSendInquiry}
      />
      <LandingHowWeVerify />
      <LandingHowItWorks />
      <LandingComplianceCta />
    </div>
  )
}

export default Home
