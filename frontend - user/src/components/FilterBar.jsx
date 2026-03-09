import { useState } from 'react'
import { X, MapPin, ShieldCheck, Pill, Package, CheckCircle2, Filter, ChevronDown } from 'lucide-react'

function FilterBar({ filters, onFilterChange, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const activeFiltersCount = Object.values(filters).filter(
    (value) => value !== 'All' && value !== ''
  ).length

  const countryMap = {
    All: 'All Countries',
    IN: 'India',
    US: 'United States',
    DE: 'Germany',
    GB: 'United Kingdom',
    CN: 'China',
  }

  const certificationMap = {
    All: 'All Certifications',
    'WHO-GMP': 'WHO-GMP',
    FDA: 'FDA',
    ISO: 'ISO 9001',
    GMP: 'GMP',
  }

  const dosageFormMap = {
    All: 'All Forms',
    Tablet: 'Tablet',
    Capsule: 'Capsule',
    Injection: 'Injection',
    Syrup: 'Syrup',
    API: 'API',
  }

  const moqMap = {
    All: 'All MOQ',
    '0-1000': '0 - 1,000 units',
    '1000-10000': '1,000 - 10,000 units',
    '10000+': '10,000+ units',
  }

  const availabilityMap = {
    All: 'All Availability',
    'In Stock': 'In Stock',
    'Made to Order': 'Made to Order',
  }

  const handleRemoveFilter = (filterKey) => {
    onFilterChange(filterKey, 'All')
  }

  const getActiveFilterChips = () => {
    const chips = []
    if (filters.country !== 'All') {
      chips.push({ key: 'country', label: countryMap[filters.country], value: filters.country })
    }
    if (filters.certification !== 'All') {
      chips.push({ key: 'certification', label: certificationMap[filters.certification], value: filters.certification })
    }
    if (filters.dosageForm !== 'All') {
      chips.push({ key: 'dosageForm', label: dosageFormMap[filters.dosageForm], value: filters.dosageForm })
    }
    if (filters.moq !== 'All') {
      chips.push({ key: 'moq', label: moqMap[filters.moq], value: filters.moq })
    }
    if (filters.availability !== 'All') {
      chips.push({ key: 'availability', label: availabilityMap[filters.availability], value: filters.availability })
    }
    return chips
  }

  const activeChips = getActiveFilterChips()

  return (
    <div className="w-full bg-white border border-blue-100 rounded-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Filter Header */}
        <div className="flex items-center justify-between py-4 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Filter className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Advanced Filters</h3>
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="md:hidden flex items-center gap-1.5 px-4 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                {isExpanded ? 'Collapse' : 'Expand'}
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
        </div>

        {/* Filter Controls */}
        <div className={`${isExpanded ? 'block' : 'hidden'} md:block py-4`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Country Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  Country
                </label>
                <select
                  value={filters.country}
                  onChange={(e) => onFilterChange('country', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors"
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
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Certification
                </label>
                <select
                  value={filters.certification}
                  onChange={(e) => onFilterChange('certification', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors"
                >
                  <option value="All">All Certifications</option>
                  <option value="WHO-GMP">WHO-GMP</option>
                  <option value="FDA">FDA</option>
                  <option value="ISO">ISO 9001</option>
                  <option value="GMP">GMP</option>
                </select>
              </div>

              {/* Dosage Form Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <Pill className="w-3.5 h-3.5" />
                  Dosage Form
                </label>
                <select
                  value={filters.dosageForm}
                  onChange={(e) => onFilterChange('dosageForm', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors"
                >
                  <option value="All">All Forms</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Injection">Injection</option>
                  <option value="Syrup">Syrup</option>
                  <option value="API">API</option>
                </select>
              </div>

              {/* MOQ Range Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <Package className="w-3.5 h-3.5" />
                  MOQ Range
                </label>
                <select
                  value={filters.moq}
                  onChange={(e) => onFilterChange('moq', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors"
                >
                  <option value="All">All MOQ</option>
                  <option value="0-1000">0 - 1,000 units</option>
                  <option value="1000-10000">1,000 - 10,000 units</option>
                  <option value="10000+">10,000+ units</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => onFilterChange('availability', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300 transition-colors"
                >
                  <option value="All">All Availability</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Made to Order">Made to Order</option>
                </select>
              </div>
            </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
            <div className="py-3 border-t border-blue-50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500 mr-1">Active Filters:</span>
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() => handleRemoveFilter(chip.key)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                  >
                    {chip.label}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
        )}
      </div>
    </div>
  )
}

export default FilterBar
