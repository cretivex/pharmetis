import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SuppliersHero from '../components/suppliers/SuppliersHero'
import SuppliersFilterBar from '../components/suppliers/SuppliersFilterBar'
import SuppliersGrid from '../components/suppliers/SuppliersGrid'
import WhyPartnerSection from '../components/suppliers/WhyPartnerSection'
import SuppliersCtaSection from '../components/suppliers/SuppliersCtaSection'
import { suppliersService } from '../services/suppliers.service.js'
import { transformSupplier } from '../utils/dataTransform.js'

const defaultFilters = {
  country: 'All',
  certification: 'All',
  totalProducts: 'All',
  dosageForm: 'All',
}

function Suppliers() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const apiFilters = {
        search: searchQuery || undefined,
        country: filters.country !== 'All' ? filters.country : undefined,
        page: 1,
        limit: 100,
      }

      const result = await suppliersService.getAll(apiFilters)
      const suppliersData = result.data?.suppliers || result.suppliers || []
      const transformed = suppliersData.map(transformSupplier)
      setSuppliers(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filters.country])

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

  const filteredSuppliers = useMemo(() => {
    let list = suppliers.filter((supplier) => {
      if (filters.certification !== 'All') {
        const certs = supplier.certifications || []
        if (
          !certs.some(
            (cert) =>
              cert.toLowerCase().includes(filters.certification.toLowerCase()) ||
              cert === filters.certification
          )
        ) {
          return false
        }
      }

      if (filters.totalProducts !== 'All') {
        const products = supplier.totalProducts || 0
        switch (filters.totalProducts) {
          case '0-200':
            if (products > 200) return false
            break
          case '200-400':
            if (products < 200 || products > 400) return false
            break
          case '400+':
            if (products < 400) return false
            break
          default:
            break
        }
      }

      if (filters.dosageForm !== 'All') {
        const forms = supplier.manufacturingCapability || []
        const needle = {
          TABLET: 'tablet',
          CAPSULE: 'capsule',
          INJECTION: 'inject',
          SYRUP: 'syrup',
          CREAM: 'cream',
        }[filters.dosageForm]
        const match = forms.some((f) => f.toLowerCase().includes(needle))
        if (!match) return false
      }

      return true
    })

    return list
  }, [suppliers, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters(defaultFilters)
    setSearchQuery('')
  }

  const handleQuickFilter = (index) => {
    if (index === 0) {
      setFilters((prev) => ({ ...prev, certification: 'WHO-GMP' }))
    } else if (index === 1) {
      setFilters((prev) => ({ ...prev, totalProducts: 'All' }))
    } else if (index === 2) {
      setFilters((prev) => ({ ...prev, country: 'All' }))
    }
    requestAnimationFrame(() => {
      document.getElementById('suppliers-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleViewSupplier = (supplier) => {
    navigate(`/suppliers/${supplier.slug}`)
  }

  const handleSendInquiry = (supplier) => {
    navigate('/send-rfq', { state: { supplier } })
  }

  if (loading) {
    return (
      <div className="page-mesh min-h-screen text-slate-900 antialiased">
        <SuppliersHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {}}
        />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 py-20 shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-4 text-slate-600">Loading suppliers…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-mesh min-h-screen text-slate-900 antialiased">
        <SuppliersHero
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={loadSuppliers}
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50/90 p-8 text-center">
            <p className="text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadSuppliers}
              className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-mesh min-h-screen text-slate-900 antialiased">
      <SuppliersHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={loadSuppliers}
        onQuickFilter={handleQuickFilter}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-slate-300/60 bg-[#e8ecf2] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-5 md:p-6">
        <SuppliersFilterBar
          certification={filters.certification}
          country={filters.country}
          totalProducts={filters.totalProducts}
          dosageForm={filters.dosageForm}
          onCertificationChange={(v) => handleFilterChange('certification', v)}
          onCountryChange={(v) => handleFilterChange('country', v)}
          onTotalProductsChange={(v) => handleFilterChange('totalProducts', v)}
          onDosageFormChange={(v) => handleFilterChange('dosageForm', v)}
          onReset={handleResetFilters}
        />
        {filteredSuppliers.length > 0 ? (
          <SuppliersGrid
            suppliers={filteredSuppliers}
            onViewProfile={handleViewSupplier}
            onSendInquiry={handleSendInquiry}
          />
        ) : (
          <div
            id="suppliers-grid"
            className="scroll-mt-28 rounded-xl border border-slate-300/80 bg-white py-16 text-center shadow-[0_4px_24px_-8px_rgba(5,11,29,0.12)]"
          >
            <p className="text-lg font-semibold text-slate-800">No suppliers found</p>
            <p className="mt-2 text-sm text-slate-600">Try adjusting filters or your search.</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
            >
              Reset filters
            </button>
          </div>
        )}
        </div>
      </div>
      <WhyPartnerSection />
      <SuppliersCtaSection />
    </div>
  )
}

export default Suppliers
