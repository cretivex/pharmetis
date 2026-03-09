import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Grid, List, ChevronDown, X } from 'lucide-react'
import SupplierCard from '../components/SupplierCard'
import Container from '../components/ui/Container'
import { suppliersService } from '../services/suppliers.service.js'
import { transformSupplier } from '../utils/dataTransform.js'

function Suppliers() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('relevance')
  const [viewMode, setViewMode] = useState('grid')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    country: 'All',
    certification: 'All',
    yearsInBusiness: 'All',
    totalProducts: 'All',
    verified: 'All',
  })

  useEffect(() => {
    loadSuppliers()
  }, [searchQuery, filters.country, filters.verified])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiFilters = {
        search: searchQuery || undefined,
        country: filters.country !== 'All' ? filters.country : undefined,
        isVerified: filters.verified !== 'All' ? 
          (filters.verified === 'Verified' ? true : false) : undefined,
        page: 1,
        limit: 100
      }

      const result = await suppliersService.getAll(apiFilters)
      // Handle backend response structure: { success, message, data: { suppliers, pagination } }
      const suppliersData = result.data?.suppliers || result.suppliers || []
      const transformed = suppliersData.map(transformSupplier)
      setSuppliers(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort suppliers (client-side filtering for additional filters not supported by API)
  const filteredAndSortedSuppliers = useMemo(() => {
    let filtered = suppliers.filter((supplier) => {
      // Certification filter (client-side)
      if (filters.certification !== 'All') {
        const certs = supplier.certifications || []
        if (!certs.some(cert => 
          cert.toLowerCase().includes(filters.certification.toLowerCase()) ||
          cert === filters.certification
        )) return false
      }

      // Years in Business filter (client-side)
      if (filters.yearsInBusiness !== 'All') {
        const years = supplier.yearsInBusiness || 0
        switch (filters.yearsInBusiness) {
          case '0-5':
            if (years > 5) return false
            break
          case '5-10':
            if (years < 5 || years > 10) return false
            break
          case '10-15':
            if (years < 10 || years > 15) return false
            break
          case '15+':
            if (years < 15) return false
            break
        }
      }

      // Total Products filter (client-side)
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
        }
      }

      return true
    })

    // Sort suppliers
    switch (sortBy) {
      case 'products-high':
        filtered.sort((a, b) => b.totalProducts - a.totalProducts)
        break
      case 'products-low':
        filtered.sort((a, b) => a.totalProducts - b.totalProducts)
        break
      case 'years-high':
        filtered.sort((a, b) => b.yearsInBusiness - a.yearsInBusiness)
        break
      case 'years-low':
        filtered.sort((a, b) => a.yearsInBusiness - b.yearsInBusiness)
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // Relevance (default)
        break
    }

    return filtered
  }, [suppliers, filters, sortBy])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetFilters = () => {
    setFilters({
      country: 'All',
      certification: 'All',
      yearsInBusiness: 'All',
      totalProducts: 'All',
      verified: 'All',
    })
    setSearchQuery('')
  }

  const activeFiltersCount = Object.values(filters).filter((value) => value !== 'All' && value !== '').length

  const handleViewSupplier = (supplier) => {
    navigate(`/suppliers/${supplier.slug}`)
  }

  const handleSendInquiry = (supplier) => {
    navigate('/send-rfq', { state: { supplier } })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading suppliers...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadSuppliers}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-24">
      <Container>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">All Suppliers</h1>
          <p className="text-slate-600">Browse verified pharmaceutical suppliers from around the world</p>
        </motion.div>

        {/* Search and Toolbar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search suppliers, countries, or certifications..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 hover:bg-blue-50 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="products-high">Products: High to Low</option>
                <option value="products-low">Products: Low to High</option>
                <option value="years-high">Experience: Most Years</option>
                <option value="years-low">Experience: Least Years</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-white border border-blue-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-blue-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-blue-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showMobileFilters ? 'block' : 'hidden'
            } lg:block w-full lg:w-64 flex-shrink-0 bg-white rounded-xl border border-blue-100 p-6 h-fit lg:sticky lg:top-24`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Countries</option>
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                  <option value="DE">Germany</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CN">China</option>
                </select>
              </div>

              {/* Certification Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Certification</label>
                <select
                  value={filters.certification}
                  onChange={(e) => handleFilterChange('certification', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Certifications</option>
                  <option value="WHO-GMP">WHO-GMP</option>
                  <option value="FDA">FDA</option>
                  <option value="ISO 9001">ISO 9001</option>
                  <option value="ISO 13485">ISO 13485</option>
                  <option value="GMP">GMP</option>
                  <option value="cGMP">cGMP</option>
                  <option value="EMA">EMA</option>
                  <option value="MHRA">MHRA</option>
                </select>
              </div>

              {/* Years in Business Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Years in Business</label>
                <select
                  value={filters.yearsInBusiness}
                  onChange={(e) => handleFilterChange('yearsInBusiness', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Experience</option>
                  <option value="0-5">0 - 5 years</option>
                  <option value="5-10">5 - 10 years</option>
                  <option value="10-15">10 - 15 years</option>
                  <option value="15+">15+ years</option>
                </select>
              </div>

              {/* Total Products Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Products</label>
                <select
                  value={filters.totalProducts}
                  onChange={(e) => handleFilterChange('totalProducts', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Ranges</option>
                  <option value="0-200">0 - 200 products</option>
                  <option value="200-400">200 - 400 products</option>
                  <option value="400+">400+ products</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Suppliers Grid */}
          <main className="flex-1">
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredAndSortedSuppliers.length}</span> suppliers
              </p>
            </div>

            {/* Suppliers Grid/List */}
            {filteredAndSortedSuppliers.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedSuppliers.map((supplier, index) => (
                    <motion.div
                      key={supplier.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <SupplierCard
                        supplier={supplier}
                        onViewSupplier={handleViewSupplier}
                        onSendInquiry={handleSendInquiry}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedSuppliers.map((supplier, index) => (
                    <motion.div
                      key={supplier.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <SupplierCard
                        supplier={supplier}
                        onViewSupplier={handleViewSupplier}
                        onSendInquiry={handleSendInquiry}
                      />
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-slate-600 mb-2">No suppliers found</p>
                <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  )
}

export default Suppliers
