import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, Package } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { productsService } from '../services/products.service.js'
import { filterService } from '../services/filter.service.js'
import { transformProduct } from '../utils/dataTransform.js'

const AVAILABILITY_LABELS = {
  IN_STOCK: 'In Stock',
  MADE_TO_ORDER: 'Made to Order',
  OUT_OF_STOCK: 'Out of Stock'
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
  OTHER: 'Other'
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
    categoryIds: getArray('categoryIds')
  }
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
  const [filtersError, setFiltersError] = useState(null)
  const [filters, setFilters] = useState(() => parseFiltersFromSearchParams(searchParams))
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'relevance')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    dosageForm: true,
    availability: true,
    country: true,
    therapeuticAreas: true,
    manufacturer: true,
    categories: true
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    filterService
      .getMedicinesFilters()
      .then((data) => {
        setFilterMetadata(data)
        setFiltersError(null)
      })
      .catch(() => {
        setFiltersError('Failed to load filter options')
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
    if (!filterMetadata) return
    loadProducts()
  }, [filterMetadata, filters, searchQuery, sortBy])

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
        limit: 100
      }
      const result = await productsService.getAll(apiFilters)
      const productsData = result.data?.products || result.products || []
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
          const priceA = parseFloat(String(a.price).replace('$', '')) || 0
          const priceB = parseFloat(String(b.price).replace('$', '')) || 0
          return priceA - priceB
        })
        break
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = parseFloat(String(a.price).replace('$', '')) || 0
          const priceB = parseFloat(String(b.price).replace('$', '')) || 0
          return priceB - priceA
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
      categoryIds: []
    }
    setFilters(empty)
    setSearchQuery('')
    setSortBy('relevance')
    setSearchParams(new URLSearchParams(), { replace: true })
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

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product } })
  }
  const handleViewDetails = (product) => {
    navigate(`/medicines/${product.slug}`)
  }

  if (filtersLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <Loading message="Loading filters..." fullScreen={false} />
      </div>
    )
  }

  if (filtersError) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <ErrorState
          message={filtersError}
          onRetry={() => {
            setFiltersLoading(true)
            setFiltersError(null)
            filterService
              .getMedicinesFilters()
              .then((data) => {
                setFilterMetadata(data)
                setFiltersError(null)
              })
              .catch(() => setFiltersError('Failed to load filter options'))
              .finally(() => setFiltersLoading(false))
          }}
          retry="Retry"
        />
      </div>
    )
  }

  const meta = filterMetadata || {
    dosageForm: [],
    availability: [],
    country: [],
    therapeuticAreas: [],
    manufacturer: [],
    categories: []
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-12">
      {/* Header - extra top padding so title clears fixed navbar */}
      <header className="max-w-7xl mx-auto px-6 pr-8 pt-6 pb-8">
        <h1 className="text-3xl font-semibold text-slate-900">All Medicines</h1>
        <p className="text-slate-600 mt-2">Browse our complete catalog of verified pharmaceutical products</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-600 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search medicines, brands, or manufacturers..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-blue-100 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-blue-100 rounded-lg text-sm text-slate-900 hover:bg-blue-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none px-4 py-2 bg-white border border-blue-100 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary pr-8 min-w-[180px]"
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      {/* Content: filters + product grid - pr-8 so scrollbar doesn't cover controls */}
      <div className="max-w-7xl mx-auto px-6 pr-8 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 mt-10">
        <aside
          className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full flex-shrink-0`}
        >
          <div className="bg-white border border-blue-200 rounded-2xl shadow-soft p-6 sticky top-24">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-primary">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-sm text-primary hover:underline transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {meta.dosageForm.length > 0 && (
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={() => toggleSection('dosageForm')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                        Dosage form
                      </span>
                      {expandedSections.dosageForm ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <div className={`transition-all duration-200 ease-in-out overflow-hidden ${expandedSections.dosageForm ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {meta.dosageForm.map((value) => {
                          const isSelected = filters.dosageForm.includes(value)
                          return (
                            <label key={value} className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200 ${isSelected ? 'bg-blue-100 text-primary font-medium' : 'hover:bg-blue-50'}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter('dosageForm', value)}
                                className="h-4 w-4 rounded border-blue-300 accent-primary"
                              />
                              <span className="text-sm">{DOSAGE_LABELS[value] || value}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {meta.availability.length > 0 && (
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={() => toggleSection('availability')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                        Availability
                      </span>
                      {expandedSections.availability ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <div className={`transition-all duration-200 ease-in-out overflow-hidden ${expandedSections.availability ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {meta.availability.map((value) => {
                          const isSelected = filters.availability.includes(value)
                          return (
                            <label key={value} className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200 ${isSelected ? 'bg-blue-100 text-primary font-medium' : 'hover:bg-blue-50'}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter('availability', value)}
                                className="h-4 w-4 rounded border-blue-300 accent-primary"
                              />
                              <span className="text-sm">{AVAILABILITY_LABELS[value] || value}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {meta.country.length > 0 && (
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={() => toggleSection('country')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                        Country
                      </span>
                      {expandedSections.country ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <div className={`transition-all duration-200 ease-in-out overflow-hidden ${expandedSections.country ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {meta.country.map((name) => {
                          const isSelected = filters.country.includes(name)
                          return (
                            <label key={name} className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200 ${isSelected ? 'bg-blue-100 text-primary font-medium' : 'hover:bg-blue-50'}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter('country', name)}
                                className="h-4 w-4 rounded border-blue-300 accent-primary"
                              />
                              <span className="text-sm">{name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {meta.therapeuticAreas.length > 0 && (
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={() => toggleSection('therapeuticAreas')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                        Therapeutic areas
                      </span>
                      {expandedSections.therapeuticAreas ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <div className={`transition-all duration-200 ease-in-out overflow-hidden ${expandedSections.therapeuticAreas ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {meta.therapeuticAreas.map((name) => {
                          const isSelected = filters.therapeuticAreas.includes(name)
                          return (
                            <label key={name} className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200 ${isSelected ? 'bg-blue-100 text-primary font-medium' : 'hover:bg-blue-50'}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter('therapeuticAreas', name)}
                                className="h-4 w-4 rounded border-blue-300 accent-primary"
                              />
                              <span className="text-sm">{name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {meta.manufacturer.length > 0 && (
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={() => toggleSection('manufacturer')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                        Manufacturer
                      </span>
                      {expandedSections.manufacturer ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <div className={`transition-all duration-200 ease-in-out overflow-hidden ${expandedSections.manufacturer ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {meta.manufacturer.map((name) => {
                          const isSelected = filters.manufacturer.includes(name)
                          return (
                            <label key={name} className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200 ${isSelected ? 'bg-blue-100 text-primary font-medium' : 'hover:bg-blue-50'}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter('manufacturer', name)}
                                className="h-4 w-4 rounded border-blue-300 accent-primary"
                              />
                              <span className="text-sm">{name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {meta.categories.length > 0 && (
                  <div className="space-y-5">
                    <button
                      type="button"
                      onClick={() => toggleSection('categories')}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                        Categories
                      </span>
                      {expandedSections.categories ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <div className={`transition-all duration-200 ease-in-out overflow-hidden ${expandedSections.categories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
                        {meta.categories.map((c) => {
                          const isSelected = filters.categoryIds.includes(c.id)
                          return (
                            <label key={c.id} className={`flex items-center gap-2 cursor-pointer rounded-lg px-3 py-2 transition-colors duration-200 ${isSelected ? 'bg-blue-100 text-primary font-medium' : 'hover:bg-blue-50'}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleFilter('categoryIds', c.id)}
                                className="h-4 w-4 rounded border-blue-300 accent-primary"
                              />
                              <span className="text-sm">{c.name}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredAndSortedProducts.length}</span> medicines
              </p>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-blue-200 bg-white py-16">
                <Loading message="Loading products..." />
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-blue-200 bg-white py-16">
                <ErrorState message={error} onRetry={loadProducts} retry="Retry" />
              </div>
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    className="h-full min-h-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      onSendRFQ={() => handleSendRFQ(product)}
                      onViewDetails={() => handleViewDetails(product)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-blue-200 bg-white py-16">
                <EmptyState
                  icon={Package}
                  title="No medicines found"
                  description="Try adjusting your filters or search query"
                  actionLabel="Clear All Filters"
                  onAction={handleResetFilters}
                />
              </div>
            )}
          </main>
      </div>
    </div>
  )
}

export default Medicines
