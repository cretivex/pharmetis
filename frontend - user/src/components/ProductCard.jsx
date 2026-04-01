import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Building2, MapPin, Package, Heart, Share2 } from 'lucide-react'
import Button from './ui/Button'
import { productsService } from '../services/products.service.js'
import { authService } from '../services/auth.service.js'

// Shared saved products cache to avoid multiple API calls
let savedProductsCache = null
let savedProductsCacheTime = 0
const CACHE_DURATION = 30000 // 30 seconds

function ProductCard({ product, onSendRFQ, onViewDetails }) {
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedProducts, setSavedProducts] = useState([])

  // Check if product is saved (optimized with caching)
  useEffect(() => {
    if (authService.isAuthenticated() && product?.id) {
      // Use a debounced check to avoid too many requests
      const timeoutId = setTimeout(() => {
        checkIfSaved()
      }, 100) // Small delay to batch requests
      
      return () => clearTimeout(timeoutId)
    } else {
      setIsSaved(false)
    }
  }, [product?.id])

  const checkIfSaved = async () => {
    try {
      const now = Date.now()
      // Use shared cache if available and not expired
      if (savedProductsCache && (now - savedProductsCacheTime) < CACHE_DURATION) {
        setIsSaved(savedProductsCache.some(p => p.id === product.id))
        setSavedProducts(savedProductsCache)
        return
      }
      
      // Only fetch if cache is expired or doesn't exist
      const result = await productsService.getSavedProducts()
      const saved = Array.isArray(result) ? result : (result.data?.data || result.data || result || [])
      // Update shared cache
      savedProductsCache = saved
      savedProductsCacheTime = now
      setSavedProducts(saved)
      setIsSaved(saved.some(p => p.id === product.id))
    } catch (err) {
      // User might not be logged in or no saved products
      setIsSaved(false)
    }
  }

  const handleSave = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!authService.isAuthenticated()) {
      alert('Please login to like products')
      return
    }

    if (!product?.id) return

    try {
      setSaving(true)
      if (isSaved) {
        await productsService.unsaveProduct(product.id)
        setIsSaved(false)
        setSavedProducts(prev => prev.filter(p => p.id !== product.id))
        // Invalidate cache when saving/unsaving
        savedProductsCache = null
        savedProductsCacheTime = 0
      } else {
        await productsService.saveProduct(product.id)
        setIsSaved(true)
        setSavedProducts(prev => [...prev, product])
        // Invalidate cache when saving/unsaving
        savedProductsCache = null
        savedProductsCacheTime = 0
      }
    } catch (err) {
      alert(err.message || 'Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/medicines/${product.slug || product.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Pharmetis`,
          url: url,
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fallback to copy
          copyToClipboard(url)
        }
      }
    } else {
      // Fallback to copy
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      alert('Link copied to clipboard!')
    }).catch(() => {
      alert('Failed to copy link')
    })
  }
  return (
    <motion.div
      className="relative h-full flex flex-col bg-white border border-blue-200 rounded-2xl overflow-hidden shadow-soft hover:shadow-soft-lg hover:border-blue-300 transition-all duration-300 group"
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Product Image - fixed height so all cards align */}
      <div className="relative w-full h-24 flex-shrink-0 bg-blue-50 overflow-hidden">
        {product.image && product.image !== 'N/A' && !product.image.includes('placeholder') ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${product.image && product.image !== 'N/A' && !product.image.includes('placeholder') ? 'hidden' : ''}`}>
          <div className="text-center">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-xs text-slate-600 font-medium">Pharmaceutical Product</p>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`p-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-blue-200 transition-all duration-200 ${
              isSaved ? 'text-red-600 border-red-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-blue-50'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-label={isSaved ? 'Unlike product' : 'Like product'}
            title={isSaved ? 'Unlike product' : authService.isAuthenticated() ? 'Like product' : 'Login to like'}
          >
            {saving ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current" />
            ) : (
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            )}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-blue-200 text-slate-600 hover:text-slate-900 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            aria-label="Share product"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
        {/* Soft pill badge - premium look */}
        <div className="absolute top-2 left-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              product.availability === 'In Stock'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {product.availability}
          </span>
        </div>
      </div>

      {/* Content - flex-1 so buttons sit at bottom when cards vary */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        <div className="mb-2 flex-shrink-0">
          <h3 className="text-base font-semibold text-slate-900 mb-0.5 leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          {product.brand && product.brand !== 'N/A' && (
            <p className="text-xs text-slate-600">{product.brand}</p>
          )}
        </div>

        <div className="space-y-1.5 mb-2 flex-shrink-0">
          {product.manufacturer && product.manufacturer !== 'N/A' && (
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <div className="flex-1 min-w-0" title={product.manufacturer}>
                <div className="text-[10px] text-slate-600 uppercase tracking-wide">Manufacturer</div>
                <div className="text-xs text-slate-900 truncate">{product.manufacturer}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {product.country && product.country !== 'N/A' && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-600 uppercase tracking-wide">Country</div>
                  <div className="text-xs text-slate-900 truncate">{product.country}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-slate-600 uppercase tracking-wide">MOQ</div>
                <div className="text-xs text-slate-900 truncate">
                  {product.moq && product.moq !== 'N/A' && product.moq !== 'Contact supplier' ? product.moq : 'Available on request'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {product.certifications && product.certifications.length > 0 && (
          <div className="mb-2 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {product.certifications
                .filter(cert => cert && cert !== 'N/A')
                .map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-lg border border-primary/20"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {cert}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-auto flex-shrink-0 pt-0.5">
          <Button
            variant="primary"
            size="sm"
            className="flex-1 min-w-0 text-xs font-medium py-1.5 shadow-sm hover:shadow-md transition-shadow"
            onClick={() => onSendRFQ(product)}
          >
            Send RFQ
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 text-xs font-medium py-1.5 shrink-0"
            onClick={() => onViewDetails(product)}
          >
            Details
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
