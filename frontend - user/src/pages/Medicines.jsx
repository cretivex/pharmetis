import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'
import MedicinesListingToolbar from '../components/medicines/MedicinesListingToolbar'
import MedicinesSidebar from '../components/medicines/MedicinesSidebar'
import MedicinesProductGrid from '../components/medicines/MedicinesProductGrid'
import MedicineCardSkeleton from '../components/medicines/MedicineCardSkeleton'
import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { productsService } from '../services/products.service.js'
import { filterService } from '../services/filter.service.js'
import { transformProduct } from '../utils/dataTransform.js'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'

const PAGE_SIZE = 20

const AVAILABILITY_LABELS = {
  IN_STOCK: 'In Stock',
  MADE_TO_ORDER: 'Made to Order',
  OUT_OF_STOCK: 'Out of Stock',
}

const DOSAGE_LABELS = {
  TABLET: 'Tablet',
  CAPSULE: 'Capsule',
  INJECTABLE: 'Injection',
  SYRUP: 'Syrup',
  SUSPENSION: 'Suspension',
  CREAM: 'Cream',
  OINTMENT: 'Ointment',
  DROPS: 'Drops',
  SPRAY: 'Spray',
  OTHER: 'Other',
}

function parseFiltersFromSearchParams(searchParams) {
  const getArray = (key) => {
    const v = searchParams.getAll(key)
    return v && v.length ? v : []
  }
  return {
    dosageForm: getArray('dosageForm'),
    country: getArray('country'),
    therapeuticAreas: getArray('therapeuticAreas'),
    manufacturer: getArray('manufacturer'),
    availability: getArray('availability'),
    categoryIds: getArray('categoryIds'),
    certification: getArray('certification'),
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minMoq: searchParams.get('moq') || '',
    categorySlug: searchParams.get('category') || '',
  }
}

function parsePage(searchParams) {
  const p = parseInt(searchParams.get('page') || '1', 10)
  return Number.isFinite(p) && p >= 1 ? p : 1
}

function buildSearchParams(filters, searchQuery, sortBy, page) {
  const params = new URLSearchParams()
  if (searchQuery && searchQuery.trim()) params.set('search', searchQuery.trim())
  if (sortBy && sortBy !== 'relevance') params.set('sort', sortBy)
  if (page > 1) params.set('page', String(page))
  filters.dosageForm.forEach((v) => params.append('dosageForm', v))
  filters.country.forEach((v) => params.append('country', v))
  filters.therapeuticAreas.forEach((v) => params.append('therapeuticAreas', v))
  filters.manufacturer.forEach((v) => params.append('manufacturer', v))
  filters.availability.forEach((v) => params.append('availability', v))
  filters.categoryIds.forEach((v) => params.append('categoryIds', v))
  filters.certification.forEach((v) => params.append('certification', v))
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.minMoq) params.set('moq', filters.minMoq)
  if (filters.categorySlug) params.set('category', filters.categorySlug)
  return params
}

function Medicines() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterMetadata, setFilterMetadata] = useState(null)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [filters, setFilters] = useState(() => parseFiltersFromSearchParams(searchParams))
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'relevance')
  const [page, setPage] = useState(() => parsePage(searchParams))
  const [view, setView] = useState('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    categories: false,
    country: false,
    dosageForm: false,
    availability: false,
    manufacturer: false,
    therapeuticAreas: false,
    certification: false,
    price: false,
    moq: false,
  })

  const debouncedSearch = useDebouncedValue(searchInput, 500)

  useEffect(() => {
    filterService
      .getMedicinesFilters()
      .then((data) => setFilterMetadata(data))
      .catch(() => {
        setFilterMetadata({
          dosageForm: [],
          availability: [],
          country: [],
          therapeuticAreas: [],
          manufacturer: [],
          categories: [],
        })
      })
      .finally(() => setFiltersLoading(false))
  }, [])

  useEffect(() => {
    const next = parseFiltersFromSearchParams(searchParams)
    setFilters(next)
    setSearchInput(searchParams.get('search') || '')
    setSortBy(searchParams.get('sort') || 'relevance')
    setPage(parsePage(searchParams))
  }, [searchParams])

  useEffect(() => {
    if (!showMobileFilters) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showMobileFilters])

  useEffect(() => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      const next = debouncedSearch.trim()
      const cur = p.get('search') || ''
      if (next === cur) return p
      if (next) p.set('search', next)
      else p.delete('search')
      p.delete('page')
      return p
    }, { replace: true })
  }, [debouncedSearch, setSearchParams])

  const catalogQuery = useQuery({
    queryKey: [
      'medicines-catalog',
      {
        filters,
        search: debouncedSearch.trim(),
        sort: sortBy,
        page,
      },
    ],
    queryFn: async () => {
      const result = await productsService.getFilter({
        search: debouncedSearch.trim() || undefined,
        dosageForm: filters.dosageForm.length ? filters.dosageForm : undefined,
        availability: filters.availability.length ? filters.availability : undefined,
        country: filters.country.length ? filters.country : undefined,
        therapeuticAreas: filters.therapeuticAreas.length ? filters.therapeuticAreas : undefined,
        manufacturer: filters.manufacturer.length ? filters.manufacturer : undefined,
        categoryIds: filters.categoryIds.length ? filters.categoryIds : undefined,
        certification: filters.certification.length ? filters.certification : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        moq: filters.minMoq || undefined,
        category: filters.categorySlug || undefined,
        sort: sortBy !== 'relevance' ? sortBy : undefined,
        page,
        limit: PAGE_SIZE,
      })
      const rows = result?.data ?? []
      return {
        products: rows.map(transformProduct),
        total: result?.total ?? 0,
        page: result?.page ?? page,
        totalPages: Math.max(1, result?.totalPages ?? 1),
      }
    },
    enabled: !filtersLoading,
  })

  const products = catalogQuery.data?.products ?? []
  const totalPages = catalogQuery.data?.totalPages ?? 1
  const safePage = catalogQuery.data?.page ?? page

  const updateUrl = useCallback(
    (nextFilters, nextSearch, nextSort, nextPage = 1) => {
      const params = buildSearchParams(nextFilters, nextSearch, nextSort, nextPage)
      setSearchParams(params, { replace: true })
    },
    [setSearchParams],
  )

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key] || []
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      const nextFilters = { ...prev, [key]: next }
      updateUrl(nextFilters, debouncedSearch, sortBy, 1)
      return nextFilters
    })
  }

  const setCategorySlug = (slug) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, categorySlug: slug || '' }
      updateUrl(nextFilters, debouncedSearch, sortBy, 1)
      return nextFilters
    })
  }

  const setPriceRange = (minPrice, maxPrice) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, minPrice: minPrice ?? '', maxPrice: maxPrice ?? '' }
      updateUrl(nextFilters, debouncedSearch, sortBy, 1)
      return nextFilters
    })
  }

  const setMinMoq = (minMoq) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, minMoq: minMoq ?? '' }
      updateUrl(nextFilters, debouncedSearch, sortBy, 1)
      return nextFilters
    })
  }

  const handleSearchChange = (value) => {
    setSearchInput(value)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    updateUrl(filters, debouncedSearch, value, 1)
  }

  const handleResetFilters = () => {
    const empty = {
      dosageForm: [],
      country: [],
      therapeuticAreas: [],
      manufacturer: [],
      availability: [],
      categoryIds: [],
      certification: [],
      minPrice: '',
      maxPrice: '',
      minMoq: '',
      categorySlug: '',
    }
    setFilters(empty)
    setSearchInput('')
    setSortBy('relevance')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const clearCategories = () => {
    setFilters((prev) => {
      const next = { ...prev, categoryIds: [], categorySlug: '' }
      updateUrl(next, debouncedSearch, sortBy, 1)
      return next
    })
  }

  const clearCertifications = () => {
    setFilters((prev) => {
      const next = { ...prev, certification: [] }
      updateUrl(next, debouncedSearch, sortBy, 1)
      return next
    })
  }

  const clearCountries = () => {
    setFilters((prev) => {
      const next = { ...prev, country: [] }
      updateUrl(next, debouncedSearch, sortBy, 1)
      return next
    })
  }

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeFiltersCount = useMemo(() => {
    let n = 0
    n += filters.dosageForm.length
    n += filters.country.length
    n += filters.therapeuticAreas.length
    n += filters.manufacturer.length
    n += filters.availability.length
    n += filters.categoryIds.length
    n += filters.certification.length
    if (filters.minPrice) n += 1
    if (filters.maxPrice) n += 1
    if (filters.minMoq) n += 1
    if (filters.categorySlug) n += 1
    if (debouncedSearch?.trim()) n += 1
    return n
  }, [filters, debouncedSearch])

  const filterOnlyCount = useMemo(() => {
    let n = 0
    n += filters.dosageForm.length
    n += filters.country.length
    n += filters.therapeuticAreas.length
    n += filters.manufacturer.length
    n += filters.availability.length
    n += filters.categoryIds.length
    n += filters.certification.length
    if (filters.minPrice) n += 1
    if (filters.maxPrice) n += 1
    if (filters.minMoq) n += 1
    if (filters.categorySlug) n += 1
    return n
  }, [filters])

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product } })
  }
  const handleViewDetails = (product) => {
    navigate(`/medicines/${product.slug || product.id}`)
  }

  const goPage = (p) => {
    const next = Math.max(1, Math.min(totalPages, p))
    updateUrl(filters, debouncedSearch, sortBy, next)
  }

  const loading = catalogQuery.isPending
  const error = catalogQuery.isError
  const errMessage =
    catalogQuery.error?.response?.data?.message ||
    catalogQuery.error?.message ||
    'Something went wrong. Please try again.'

  if (filtersLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50">
        <Loading message="Loading filters..." fullScreen={false} />
      </div>
    )
  }

  const meta = filterMetadata || {
    dosageForm: [],
    availability: [],
    country: [],
    therapeuticAreas: [],
    manufacturer: [],
    categories: [],
  }

  return (
    <div className="min-h-screen bg-[#f1f4f8] text-slate-900 antialiased">
      <MedicinesListingToolbar
        searchQuery={searchInput}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        view={view}
        onViewChange={setView}
        onOpenFilters={() => setShowMobileFilters(true)}
        activeFiltersCount={filterOnlyCount}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:flex lg:gap-8 lg:px-8 lg:pb-16 lg:pt-8">
        <MedicinesSidebar
          meta={meta}
          filters={filters}
          toggleFilter={toggleFilter}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          onClearCategories={clearCategories}
          onClearCountries={clearCountries}
          onCategorySlugChange={setCategorySlug}
          onPriceRangeChange={setPriceRange}
          onMinMoqChange={setMinMoq}
          onClearCertifications={clearCertifications}
          showMobileFilters={showMobileFilters}
          onCloseMobileFilters={() => setShowMobileFilters(false)}
          dosageLabels={DOSAGE_LABELS}
          availabilityLabels={AVAILABILITY_LABELS}
        />

        <div className="mt-6 min-w-0 flex-1 lg:mt-0">
          <h1 className="sr-only">Browse pharmaceutical products</h1>
          {loading ? (
            <div className="rounded-2xl border border-slate-300/60 bg-[#e8ecf2] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:p-5">
              <MedicineCardSkeleton count={8} />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-slate-300/60 bg-white py-16 shadow-sm">
              <ErrorState
                message={errMessage}
                onRetry={() => catalogQuery.refetch()}
                retry="Retry"
              />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="rounded-2xl border border-slate-300/60 bg-[#e8ecf2] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-5">
                <MedicinesProductGrid
                  products={products}
                  view={view}
                  onSendRFQ={handleSendRFQ}
                  onViewDetails={handleViewDetails}
                />
              </div>
              {totalPages > 1 && (
                <nav
                  className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-slate-300/50 pt-6"
                  aria-label="Products pagination"
                >
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => goPage(safePage - 1)}
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
                    onClick={() => goPage(safePage + 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-300/60 bg-white py-16 shadow-sm">
              <EmptyState
                icon={Package}
                title="No products found. Try different filters."
                description=""
                actionLabel="Clear All Filters"
                onAction={handleResetFilters}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Medicines
