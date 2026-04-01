import { useState } from 'react'
import { ShieldCheck, CheckCircle, Building2, Award, FileText } from 'lucide-react'

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    productType: 'All Types',
    country: 'All Countries',
    certification: 'All Certifications',
    dosageForm: 'All Forms',
  })

  const trustBadges = [
    { Icon: ShieldCheck, label: 'GMP Verified' },
    { Icon: CheckCircle, label: 'QA Approved' },
    { Icon: Building2, label: 'LC Ready' },
    { Icon: Award, label: 'ISO Certified' },
    { Icon: FileText, label: 'Audit Trail' },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    // Search functionality would go here
  }

  return (
    <section className="relative overflow-hidden pt-32 pb-24 text-center text-white bg-gradient-to-br from-blue-700 via-indigo-700 to-cyan-600">
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      {/* Large Soft Radial Glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -z-10 transform translate-x-1/4 -translate-y-1/4" aria-hidden="true"></div>

      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute top-20 right-20 text-9xl font-bold text-white select-none">
          PHARMTRADE
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Headline */}
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight max-w-4xl mx-auto leading-tight">
          Sourcing Made Simple
        </h1>

        {/* Subtext */}
        <p className="text-lg text-blue-100 mt-6 max-w-2xl mx-auto leading-relaxed">
          Find verified manufacturers, exporters, and suppliers worldwide. Secure transactions. Export-ready compliance automation.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <button 
            className="bg-white text-blue-700 px-6 py-3 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            aria-label="Find pharmaceutical products"
          >
            Find Products
          </button>
          <button 
            className="border-2 border-white/70 text-white px-6 py-3 rounded-lg hover:bg-white/10 hover:border-white transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
            aria-label="List your pharmaceutical products"
          >
            List Your Products
          </button>
        </div>

        {/* Trust Badges Row */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-12 text-blue-100" role="list" aria-label="Platform trust indicators">
          {trustBadges.map((badge) => {
            const IconComponent = badge.Icon
            return (
              <div
                key={badge.label}
                className="flex items-center gap-2"
                role="listitem"
              >
                <IconComponent className="w-5 h-5 text-cyan-300 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="static md:absolute md:bottom-[-60px] md:left-1/2 md:-translate-x-1/2 w-full max-w-5xl mx-auto px-6 z-20 mt-16 md:mt-0">
        <div className="bg-white rounded-xl shadow-2xl border border-blue-100 p-6 relative z-20">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Input Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1 relative">
                <label htmlFor="search-input" className="sr-only">
                  Search for drugs, APIs, companies, or categories
                </label>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search drug, API, company, or category"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 outline-none text-slate-700 placeholder-slate-400 text-base rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-label="Search input"
                />
              </div>
              <button 
                type="submit"
                className="h-14 w-full rounded-lg bg-neutral-900 px-8 font-medium text-white shadow-md transition-all duration-200 hover:bg-neutral-800 active:bg-black focus:outline-none focus:ring-2 focus:ring-neutral-900/40 focus:ring-offset-2 md:w-auto"
                aria-label="Submit search"
              >
                Search
              </button>
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'productType', label: 'Product Type', value: filters.productType },
                { key: 'country', label: 'Country', value: filters.country },
                { key: 'certification', label: 'Certification', value: filters.certification },
                { key: 'dosageForm', label: 'Dosage Form', value: filters.dosageForm },
              ].map((filter) => (
                <div key={filter.key} className="relative">
                  <label htmlFor={`filter-${filter.key}`} className="sr-only">
                    {filter.label}
                  </label>
                  <select
                    id={`filter-${filter.key}`}
                    value={filter.value}
                    onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-slate-600 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    aria-label={filter.label}
                  >
                    <option value={filter.value}>{filter.value}</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" aria-hidden="true">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
