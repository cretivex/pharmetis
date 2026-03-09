import { useState, useEffect } from 'react'
import { Building2, CheckCircle2, MapPin, Package, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import { suppliersService } from '../../services/suppliers.service'

function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCountry, setFilterCountry] = useState('All')
  const [filterCertification, setFilterCertification] = useState('All')

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const response = await suppliersService.getAll({ limit: 100, isVerified: true })
      const suppliersData = response.data?.suppliers || response.suppliers || []
      setSuppliers(suppliersData)
    } catch (_) {
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!supplier.companyName?.toLowerCase().includes(query)) return false
    }
    if (filterCountry !== 'All' && supplier.country !== filterCountry) return false
    if (filterCertification !== 'All') {
      const hasCert = supplier.certifications?.some(cert => 
        cert.toLowerCase().includes(filterCertification.toLowerCase())
      )
      if (!hasCert) return false
    }
    return true
  })

  const uniqueCountries = [...new Set(suppliers.map(s => s.country).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Suppliers</h1>
        <p className="text-slate-600">Browse verified pharmaceutical suppliers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
          />
        </div>
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
        >
          <option value="All">All Countries</option>
          {uniqueCountries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <select
          value={filterCertification}
          onChange={(e) => setFilterCertification(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
        >
          <option value="All">All Certifications</option>
          <option value="WHO-GMP">WHO-GMP</option>
          <option value="FDA">FDA</option>
          <option value="ISO">ISO</option>
        </select>
      </div>

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <Loading message="Loading suppliers..." />
        </div>
      )}

      {!loading && filteredSuppliers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{supplier.companyName}</h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {supplier.country}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {supplier.yearsInBusiness > 0 && (
                    <p className="text-sm text-slate-600">
                      {supplier.yearsInBusiness} years in business
                    </p>
                  )}
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {supplier.totalProducts || 0} products
                  </p>
                </div>

                {supplier.certifications && supplier.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {supplier.certifications.slice(0, 3).map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                <Link
                  to={`/suppliers/${supplier.slug || supplier.id}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}
        </div>
      )}

      {!loading && filteredSuppliers.length === 0 && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <EmptyState
            icon={Building2}
            title="No suppliers found"
            description="Try adjusting your search or filters"
          />
        </div>
      )}
    </div>
  )
}

export default Suppliers
