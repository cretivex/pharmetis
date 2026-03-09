import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../SearchBar'
import Button from '../ui/Button'
import { ShieldCheck, Building2, Award, CheckCircle2 } from 'lucide-react'

function BulkHeroSection({ onSearch }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('product')

  const handleSearchSubmit = (overrideQuery, overrideType) => {
    const q = overrideQuery !== undefined ? overrideQuery : searchQuery
    const t = overrideType !== undefined ? overrideType : searchType
    navigate(`/medicines?search=${encodeURIComponent(String(q).trim())}&type=${t}`)
  }

  const handleSendBulkInquiry = () => {
    navigate('/send-rfq')
  }

  const handleBrowseProducts = () => {
    navigate('/medicines')
  }

  return (
    <section className="py-16 md:py-24 bg-white border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                Source Bulk Medicines Directly from Certified Global Manufacturers
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Secure, compliant B2B pharmaceutical sourcing with verified suppliers worldwide.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                searchType={searchType}
                onSearchTypeChange={setSearchType}
                onSearchSubmit={handleSearchSubmit}
                onSearch={onSearch}
              />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button variant="primary" size="lg" onClick={handleSendBulkInquiry}>
                Send Bulk Inquiry
              </Button>
              <Button variant="outline" size="lg" onClick={handleBrowseProducts}>
                Browse Products
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <span>WHO-GMP</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Building2 className="w-5 h-5 text-blue-700" />
                <span>FDA</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Award className="w-5 h-5 text-blue-700" />
                <span>ISO</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Verified Suppliers</span>
              </div>
            </div>
          </div>

          {/* Right Side - Hero Image */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Professional pharmaceutical manufacturing image with gradient overlay */}
              <div className="w-full h-[500px] bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 relative">
                {/* Subtle pattern overlay for depth */}
                <div 
                  className="absolute inset-0 opacity-20 blur-sm"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 100 0 L 0 0 0 100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3C/svg%3E")`
                  }}
                ></div>
                
                {/* Soft blue gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-blue-800/20 to-transparent"></div>
                
                {/* Pharmaceutical manufacturing visual elements */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="text-center text-white/90">
                    <div className="w-40 h-40 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20">
                      <svg
                        className="w-20 h-20 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold mb-2">Global Pharmaceutical Manufacturing</p>
                    <p className="text-sm text-white/80">Certified & Compliant Supply Chain</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BulkHeroSection
