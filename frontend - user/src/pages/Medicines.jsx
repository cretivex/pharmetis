import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import MedicinesListingToolbar from '../components/medicines/MedicinesListingToolbar'
import MedicinesSidebar from '../components/medicines/MedicinesSidebar'
import MedicinesProductGrid from '../components/medicines/MedicinesProductGrid'
import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { productsService } from '../services/products.service.js'
import { filterService } from '../services/filter.service.js'
import { transformProduct } from '../utils/dataTransform.js'

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
  }
}

function parseMoqForSort(moq) {
  if (moq == null || moq === '') return Infinity
  const s = String(moq).toLowerCase()
  if (s.includes('contact')) return Infinity
  const m = s.match(/[\d][\d,]*/)
  if (!m) return Infinity
  return parseInt(m[0].replace(/,/g, ''), 10) || 0
}

function ratingScoreForSort(id) {
  const n = Number(id) || 0
  return 4 + (n % 6) / 10
}

function buildSearchParams(filters, searchQuery, sortBy) {
  const params = new URLSearchParams()
  if (searchQuery && searchQuery.trim()) params.set('search', searchQuery.trim())
  if (sortBy && sortBy !== 'relevance') params.set('sort', sortBy)
  filters.dosageForm.forEach((v) => params.append('dosageForm', v))
  filters.country.forEach((v) => params.append('country', v))
  filters.therapeuticAreas.forEach((v) => params.append('therapeuticAreas', v))
  filters.manufacturer.forEach((v) => params.append('manufacturer', v))
  filters.availability.forEach((v) => params.append('availability', v))
  filters.categoryIds.forEach((v) => params.append('categoryIds', v))
  return params
}

function Medicines() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterMetadata, setFilterMetadata] = useState(null)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [filters, setFilters] = useState(() => parseFiltersFromSearchParams(searchParams))
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'relevance')
  const [view, setView] = useState('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    categories: false,
    country: false,
    dosageForm: false,
    availability: false,
    manufacturer: false,
    therapeuticAreas: false,
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    filterService
      .getMedicinesFilters()
      .then((data) => {
        setFilterMetadata(data)
      })
      .catch(() => {
        // Degrade gracefully: still load products; sidebar uses empty filter lists
        setFilterMetadata({
          dosageForm: [],
          availability: [],
          country: [],
          therapeuticAreas: [],
          manufacturer: [],
          categories: [],
        })
      })
      .finally(() => {
        setFiltersLoading(false)
      })
  }, [])

  useEffect(() => {
    const next = parseFiltersFromSearchParams(searchParams)
    setFilters(next)
    setSearchQuery(searchParams.get('search') || '')
    setSortBy(searchParams.get('sort') || 'relevance')
  }, [searchParams])

  useEffect(() => {
    if (filtersLoading) return
    loadProducts()
  }, [filtersLoading, filters, searchQuery, sortBy])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const apiFilters = {
        search: searchQuery?.trim() || undefined,
        dosageForm: filters.dosageForm.length ? filters.dosageForm : undefined,
        availability: filters.availability.length ? filters.availability : undefined,
        country: filters.country.length ? filters.country : undefined,
        therapeuticAreas: filters.therapeuticAreas.length ? filters.therapeuticAreas : undefined,
        manufacturer: filters.manufacturer.length ? filters.manufacturer : undefined,
        categoryIds: filters.categoryIds.length ? filters.categoryIds : undefined,
        page: 1,
        limit: 100,
      }
      const result = await productsService.getAll(apiFilters)
      const productsData = result?.products || result?.data?.products || []
      setProducts(productsData.map(transformProduct))
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products]
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = Number(a.price) || 0
          const priceB = Number(b.price) || 0
          return priceA - priceB
        })
        break
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = Number(a.price) || 0
          const priceB = Number(b.price) || 0
          return priceB - priceA
        })
        break
      case 'moq-asc':
        filtered.sort(
          (a, b) => parseMoqForSort(a.moq) - parseMoqForSort(b.moq),
        )
        break
      case 'rating-desc':
        filtered.sort(
          (a, b) => ratingScoreForSort(b.id) - ratingScoreForSort(a.id),
        )
        break
      case 'newest':
        filtered.sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
          if (tb !== ta) return tb - ta
          return String(b.id).localeCompare(String(a.id), undefined, { numeric: true })
        })
        break
      case 'name-asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'name-desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      default:
        break
    }
    return filtered
  }, [products, sortBy])

  const updateUrl = (nextFilters, nextSearch, nextSort) => {
    const params = buildSearchParams(nextFilters, nextSearch, nextSort)
    setSearchParams(params, { replace: true })
  }

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key] || []
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      const nextFilters = { ...prev, [key]: next }
      updateUrl(nextFilters, searchQuery, sortBy)
      return nextFilters
    })
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    updateUrl(filters, value, sortBy)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    updateUrl(filters, searchQuery, value)
  }

  const handleResetFilters = () => {
    const empty = {
      dosageForm: [],
      country: [],
      therapeuticAreas: [],
      manufacturer: [],
      availability: [],
      categoryIds: [],
    }
    setFilters(empty)
    setSearchQuery('')
    setSortBy('relevance')
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const clearCategories = () => {
    setFilters((prev) => {
      const next = { ...prev, categoryIds: [] }
      updateUrl(next, searchQuery, sortBy)
      return next
    })
  }

  const clearCountries = () => {
    setFilters((prev) => {
      const next = { ...prev, country: [] }
      updateUrl(next, searchQuery, sortBy)
      return next
    })
  }

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeFiltersCount = useMemo(() => {
    let n = 0
    Object.values(filters).forEach((arr) => {
      n += Array.isArray(arr) ? arr.length : 0
    })
    if (searchQuery?.trim()) n += 1
    return n
  }, [filters, searchQuery])

  const filterOnlyCount = useMemo(() => {
    let n = 0
    Object.values(filters).forEach((arr) => {
      n += Array.isArray(arr) ? arr.length : 0
    })
    return n
  }, [filters])

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product } })
  }
  const handleViewDetails = (product) => {
    navigate(`/medicines/${product.slug || product.id}`)
  }

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
        searchQuery={searchQuery}
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
          showMobileFilters={showMobileFilters}
          onCloseMobileFilters={() => setShowMobileFilters(false)}
          dosageLabels={DOSAGE_LABELS}
          availabilityLabels={AVAILABILITY_LABELS}
        />

        <div className="mt-6 min-w-0 flex-1 lg:mt-0">
          <h1 className="sr-only">Browse pharmaceutical products</h1>
          {loading ? (
            <div className="rounded-2xl border border-slate-300/60 bg-[#e8ecf2] py-16 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
              <Loading message="Loading products..." />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-slate-300/60 bg-white py-16 shadow-sm">
              <ErrorState message={error} onRetry={loadProducts} retry="Retry" />
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="rounded-2xl border border-slate-300/60 bg-[#e8ecf2] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-5">
              <MedicinesProductGrid
                products={filteredAndSortedProducts}
                view={view}
                onSendRFQ={handleSendRFQ}
                onViewDetails={handleViewDetails}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-300/60 bg-white py-16 shadow-sm">
              <EmptyState
                icon={Package}
                title="No medicines found"
                description="Try adjusting your filters or search query"
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
