import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Trash2, ShoppingCart, Package } from 'lucide-react'
import Container from '../components/ui/Container'
import ProductCard from '../components/ProductCard'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { productsService } from '../services/products.service.js'
import { transformProduct } from '../utils/dataTransform.js'

function SavedProducts() {
  const navigate = useNavigate()
  const [savedProducts, setSavedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    loadSavedProducts()
  }, [])

  const loadSavedProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await productsService.getSavedProducts()
      // Backend returns { success, message, data: products[] }
      const productsData = result.data?.data || result.data || result || []
      const transformedProducts = productsData.map(transformProduct)
      setSavedProducts(transformedProducts)
    } catch (err) {
      setError(err.message || 'Failed to load liked products')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      setRemoving(productId)
      await productsService.unsaveProduct(productId)
      // Remove from local state
      setSavedProducts(savedProducts.filter((p) => p.id !== productId))
    } catch (err) {
      setError(err.message || 'Failed to remove product')
    } finally {
      setRemoving(null)
    }
  }

  const handleClearAll = async () => {
    try {
      setLoading(true)
      // Remove all products one by one
      const removePromises = savedProducts.map(product => 
        productsService.unsaveProduct(product.id)
      )
      await Promise.all(removePromises)
      setSavedProducts([])
    } catch (err) {
      setError(err.message || 'Failed to clear all products')
    } finally {
      setLoading(false)
    }
  }

  const handleSendRFQ = (product) => {
    navigate('/send-rfq', { state: { product } })
  }

  const handleViewDetails = (product) => {
    const productSlug = product.name.toLowerCase().replace(/\s+/g, '-') + '-' + (product.name.match(/\d+mg/i) ? product.name.match(/\d+mg/i)[0].toLowerCase() : '')
    navigate(`/medicines/${productSlug}`)
  }

  if (loading && savedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20 flex items-center justify-center">
        <Loading message="Loading saved products..." fullScreen={false} />
      </div>
    )
  }

  if (error && savedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-20 flex items-center justify-center">
        <ErrorState message={error} onRetry={loadSavedProducts} retry="Retry" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl"></div>
      </div>

      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-4 bg-white rounded-2xl shadow-soft border border-blue-200/80">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-900">Liked Products</h1>
                  <p className="text-slate-600 mt-1 text-sm">Your liked pharmaceutical products for quick access</p>
                </div>
              </div>
            </div>
            {savedProducts.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary"
                  onClick={handleClearAll}
                  disabled={loading}
                  className="flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {loading ? 'Clearing...' : 'Clear All'}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Products Grid */}
          {savedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative"
                >
                  <button
                    onClick={() => handleRemove(product.id)}
                    disabled={removing === product.id}
                    className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove from saved"
                  >
                    {removing === product.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                  <ProductCard
                    product={product}
                    onSendRFQ={handleSendRFQ}
                    onViewDetails={handleViewDetails}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-blue-200/80 bg-white shadow-soft py-16"
            >
              <EmptyState
                icon={Heart}
                title="No liked products"
                description="Like products you're interested in for quick access later"
                actionLabel="Browse Medicines"
                onAction={() => navigate('/medicines')}
              />
            </motion.div>
          )}
        </motion.div>
      </Container>
    </div>
  )
}

export default SavedProducts
