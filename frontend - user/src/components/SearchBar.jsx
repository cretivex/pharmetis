import { useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

const SEARCH_TYPE_CHIPS = [
  { value: 'product', label: 'Product Name' },
  { value: 'api', label: 'API Name' },
  { value: 'brand', label: 'Brand Name' },
  { value: 'therapeutic', label: 'Therapeutic Area' },
  { value: 'manufacturer', label: 'Manufacturer' },
]

function SearchBar({ value, onChange, searchType, onSearchTypeChange, onSearchSubmit, onSearch }) {
  const [internalQuery, setInternalQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const isControlled = value !== undefined && onChange !== undefined
  const query = isControlled ? value : internalQuery
  const setQuery = isControlled ? onChange : setInternalQuery

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    if (onSearchSubmit) {
      setIsSearching(true)
      try {
        onSearchSubmit()
      } finally {
        setIsSearching(false)
      }
      return
    }

    setIsSearching(true)
    try {
      onSearch && (await onSearch(query))
    } finally {
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    setShowSuggestions(false)
    onSearch && onSearch('')
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setShowSuggestions(val.length > 0)
  }

  const handleSuggestionClick = (suggestion) => {
    const term = suggestion.includes(': ') ? suggestion.split(': ').slice(1).join(': ').trim() : suggestion
    setQuery(term)
    setShowSuggestions(false)
    if (onSearchSubmit) {
      onSearchSubmit(term, searchType)
    } else if (onSearch) {
      onSearch(term)
    }
  }

  // Mock suggestions - in production, these would come from API
  const suggestions = query.length > 0 ? [
    `Product: ${query}`,
    `API: ${query}`,
    `Brand: ${query}`,
    `Therapeutic: ${query}`,
    `Manufacturer: ${query}`
  ].slice(0, 5) : []

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none z-10">
          {isSearching ? (
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" strokeWidth={2} />
          ) : (
            <Search className="w-6 h-6 text-slate-400" strokeWidth={2} />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search by product name, API name, brand, therapeutic area, or manufacturer..."
          className="w-full h-16 pl-16 pr-24 text-lg text-slate-900 bg-white border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 shadow-lg transition-all duration-200"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-20 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors duration-200"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-2xl bg-neutral-900 px-8 font-medium text-white transition-colors duration-200 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-400"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Search'
          )}
        </button>

        {/* Dropdown Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white border-2 border-blue-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-6 py-3 text-left hover:bg-blue-50 transition-colors duration-150 border-b border-blue-50 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-700">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {(onSearchTypeChange != null && searchType != null) ? (
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-slate-600">
          {SEARCH_TYPE_CHIPS.map(({ value: chipValue, label }) => {
            const isActive = searchType === chipValue
            return (
              <button
                key={chipValue}
                type="button"
                onClick={() => onSearchTypeChange(chipValue)}
                className={`px-3 py-1 rounded-full border transition-colors duration-200 ${
                  isActive
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-sm text-slate-600">
          <span className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">Product Name</span>
          <span className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">API Name</span>
          <span className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">Brand Name</span>
          <span className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">Therapeutic Area</span>
          <span className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">Manufacturer</span>
        </div>
      )}
    </form>
  )
}

export default SearchBar
