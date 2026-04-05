import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'
import { searchService } from '../services/search.service.js'
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

const PAGE_SIZE = 20

function Suppliers() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState(defaultFilters)

  const debouncedSearch = useDebouncedValue(searchQuery, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters.country])

  const listQuery = useQuery({
    queryKey: [
      'suppliers',
      'public-list',
      {
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        country: filters.country !== 'All' ? filters.country : undefined,
      },
    ],
    queryFn: async () => {
      const result = await suppliersService.getAll({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        country: filters.country !== 'All' ? filters.country : undefined,
      })
      return result
    },
  })

  const supplierSearchQuery = useQuery({
    queryKey: ['search', 'supplier', debouncedSearch.trim()],
    queryFn: () => searchService.search({ q: debouncedSearch.trim(), type: 'supplier' }),
    enabled: debouncedSearch.trim().length >= 2,
  })

  const rawSuppliers = useMemo(() => {
    const payload = listQuery.data
    if (!payload) return []
    return payload.data?.suppliers ?? payload.suppliers ?? []
  }, [listQuery.data])

  const suppliers = useMemo(() => rawSuppliers.map(transformSupplier), [rawSuppliers])

  const pagination = listQuery.data?.data?.pagination ?? listQuery.data?.pagination
  const totalPages = Math.max(1, pagination?.totalPages ?? 1)
  const safePage = pagination?.page != null ? pagination.page : page

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

  const loading = listQuery.isPending
  const fetchError = listQuery.isError
  const errMessage =
    listQuery.error?.response?.data?.message ||
    listQuery.error?.message ||
    'Unable to load suppliers. Please try again.'

  return (
    <div className="page-mesh min-h-screen text-slate-900 antialiased">
      <SuppliersHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={() => listQuery.refetch()}
        onQuickFilter={handleQuickFilter}
      />
      {supplierSearchQuery.data?.results?.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-2 pt-0 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Matching suppliers
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {supplierSearchQuery.data.results.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/suppliers/${s.slug}`)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-semibold text-slate-800 shadow-sm transition hover:border-brand hover:bg-sky-50"
                >
                  {s.companyName}
                  <span className="ml-1.5 font-normal text-slate-500">{s.country}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
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

          {fetchError && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/90 p-8 text-center">
              <p className="text-red-700">{errMessage}</p>
              <button
                type="button"
                onClick={() => listQuery.refetch()}
                className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-hover"
              >
                Retry
              </button>
            </div>
          )}

          {loading && !fetchError && (
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 py-20 shadow-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="mt-4 text-slate-600">Loading suppliers…</p>
            </div>
          )}

          {!loading && !fetchError && filteredSuppliers.length > 0 && (
            <>
              <SuppliersGrid
                suppliers={filteredSuppliers}
                onViewProfile={handleViewSupplier}
                onSendInquiry={handleSendInquiry}
              />
              {totalPages > 1 && (
                <nav
                  className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-slate-300/50 pt-8"
                  aria-label="Suppliers pagination"
                >
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </button>
                  <span className="px-3 text-sm text-slate-600">
                    Page <span className="font-semibold text-slate-900">{safePage}</span> of{' '}
                    <span className="font-semibold text-slate-900">{totalPages}</span>
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </nav>
              )}
            </>
          )}

          {!loading && !fetchError && filteredSuppliers.length === 0 && (
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
