import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Package, Calendar, CheckCircle2, AlertCircle, Search, CheckCircle, XCircle, ArrowRight, Shield, Lock, Eye } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import { productsService } from '../services/products.service.js'
import { suppliersService } from '../services/suppliers.service.js'
import { rfqService } from '../services/rfq.service.js'
import { authService } from '../services/auth.service.js'
import { validation } from '../utils/validation.js'
import { useProfileCompletion } from '../contexts/ProfileCompletionContext'

function SendRFQ() {
  const navigate = useNavigate()
  const location = useLocation()
  const productFromLocation = location.state?.product
  const supplierFromLocation = location.state?.supplier
  const quantityInputRef = useRef(null)
  const { complete: profileComplete, missingFields, isBuyer } = useProfileCompletion()
  const profileBlockSubmit = isBuyer && !profileComplete

  // Check authentication and role
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: '/send-rfq' } })
      return
    }
    
    const user = authService.getCurrentUser()
    if (user && user.role !== 'BUYER') {
      setError(`You need a BUYER account to submit RFQs. Your current role is: ${user.role}.`)
    }
  }, [navigate])

  const [formData, setFormData] = useState({
    expectedDeliveryDate: '',
    destinationCountry: '',
    specialRequirements: '',
    contactEmail: '',
    contactPhone: '',
  })

  const [items, setItems] = useState(
    productFromLocation
      ? [
          {
            id: 1,
            productId: productFromLocation.id,
            productName: productFromLocation.name,
            quantity: '',
            unit: 'units',
          },
        ]
      : [
          {
            id: 1,
            productId: null,
            productName: '',
            quantity: '',
            unit: 'units',
          },
        ]
  )

  const [showAvailableProducts, setShowAvailableProducts] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [availableProducts, setAvailableProducts] = useState([])
  const [availableSuppliers, setAvailableSuppliers] = useState([])
  const [selectedSupplier, setSelectedSupplier] = useState(supplierFromLocation || null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [productsLoading, setProductsLoading] = useState(false)
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [touchedFields, setTouchedFields] = useState({})

  const loadSupplierProducts = async (supplierId) => {
    try {
      setProductsLoading(true)
      const result = await suppliersService.getProducts(supplierId, { limit: 100 })
      const productsData = result.data?.products || result.products || []
      setAvailableProducts(productsData)
    } catch (err) {
      setAvailableProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  // Load available products and suppliers
  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierProducts(selectedSupplier.id)
      setAvailableSuppliers([selectedSupplier])
    } else {
      loadProducts()
      loadSuppliers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplier])

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      const result = await productsService.getAll({ limit: 100 })
      const productsData = result.data?.products || result.products || []
      setAvailableProducts(productsData)
    } catch (err) {
      setAvailableProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      setSuppliersLoading(true)
      const result = await suppliersService.getAll({ limit: 10, isVerified: true })
      const suppliersData = result.data?.suppliers || result.suppliers || []
      const transformedSuppliers = suppliersData.map(supplier => {
        let certTypes = []
        if (supplier.certifications && Array.isArray(supplier.certifications)) {
          certTypes = supplier.certifications.map(c => {
            if (typeof c === 'string') return c
            return c.type || c.certificationType || 'Certified'
          })
        }
        return {
          ...supplier,
          certifications: certTypes
        }
      })
      setAvailableSuppliers(transformedSuppliers)
    } catch (err) {
      setAvailableSuppliers([])
    } finally {
      setSuppliersLoading(false)
    }
  }

  // Filter available products
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery) return availableProducts
    const query = productSearchQuery.toLowerCase()
    return availableProducts.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.manufacturer?.toLowerCase().includes(query) ||
        product.country?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query)
    )
  }, [productSearchQuery, availableProducts])

  // Validation using shared helpers
  const validationErrors = useMemo(() => {
    const errors = {}
    items.forEach((item) => {
      const productErr = validation.required(item.productName, 'Product name')
      if (productErr) errors[`product_${item.id}`] = productErr
      const qtyErr = validation.positiveNumber(item.quantity, 'Quantity')
      if (qtyErr) errors[`quantity_${item.id}`] = qtyErr
    })
    const deliveryErr = validation.dateRequired(formData.expectedDeliveryDate, 'Expected delivery date')
    if (deliveryErr) errors.deliveryDate = deliveryErr
    const countryErr = validation.required(formData.destinationCountry, 'Destination country')
    if (countryErr) errors.destinationCountry = countryErr
    return errors
  }, [items, formData])

  const user = authService.getCurrentUser()
  const hasValidRole = user && user.role === 'BUYER'
  const isValid = Object.keys(validationErrors).length === 0 && hasValidRole
  const totalUnits = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0)

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      productName: '',
      quantity: '',
      unit: 'units',
    }
    setItems([...items, newItem])
    // Auto-focus quantity after animation
    setTimeout(() => {
      const quantityInputs = document.querySelectorAll('input[type="number"]')
      if (quantityInputs.length > 0) {
        quantityInputs[quantityInputs.length - 1]?.focus()
      }
    }, 100)
  }

  const handleRemoveItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const handleItemChange = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    // Mark field as touched
    setTouchedFields({ ...touchedFields, [`${field}_${id}`]: true })
  }

  const handleFieldBlur = (fieldName) => {
    setTouchedFields({ ...touchedFields, [fieldName]: true })
  }

  const handleAddProductFromList = (product) => {
    setItems([
      ...items,
      {
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        quantity: '',
        unit: 'units',
      },
    ])
    setShowAvailableProducts(false)
    setProductSearchQuery('')
    // Auto-focus quantity
    setTimeout(() => {
      const quantityInputs = document.querySelectorAll('input[type="number"]')
      if (quantityInputs.length > 0) {
        quantityInputs[quantityInputs.length - 1]?.focus()
      }
    }, 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (profileBlockSubmit) {
      setError(`Complete your profile before submitting an RFQ. Missing: ${missingFields.join(', ')}.`)
      return
    }
    if (!isValid) {
      // Mark all fields as touched to show errors
      const allTouched = {}
      items.forEach(item => {
        allTouched[`product_${item.id}`] = true
        allTouched[`quantity_${item.id}`] = true
      })
      allTouched.deliveryDate = true
      allTouched.destinationCountry = true
      setTouchedFields(allTouched)
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const contactInfo = formData.contactEmail || formData.contactPhone 
        ? `\nContact: ${formData.contactEmail || ''} ${formData.contactPhone || ''}` 
        : ''
      
      const notes = [
        formData.specialRequirements,
        formData.destinationCountry ? `Destination Country: ${formData.destinationCountry}` : '',
        contactInfo
      ].filter(Boolean).join('\n') || null

      // Calculate expiresAt (30 days from now) and expectedDelivery (from form)
      const now = new Date()
      const expiresAt = new Date(now)
      expiresAt.setDate(expiresAt.getDate() + 30) // RFQ expires 30 days from now

      // For expectedDelivery, ensure it's at least tomorrow to pass validation
      let expectedDelivery = null
      if (formData.expectedDeliveryDate) {
        const deliveryDate = new Date(formData.expectedDeliveryDate)
        // Set to end of day to ensure it's in the future
        deliveryDate.setHours(23, 59, 59, 999)
        // If date is today or in the past, set to tomorrow
        if (deliveryDate <= now) {
          deliveryDate.setDate(deliveryDate.getDate() + 1)
        }
        expectedDelivery = deliveryDate.toISOString()
      }

      const rfqData = {
        title: `RFQ - ${items.length} product(s)`,
        notes: notes,
        expiresAt: expiresAt.toISOString(), // Must be in the future
        expectedDelivery: expectedDelivery, // Must be in the future if provided
        items: items.map(item => ({
          productId: item.productId || null,
          productName: item.productName,
          quantity: String(item.quantity), // Ensure quantity is a string as per validation
          unit: item.unit || 'units',
          notes: null
        }))
      }

      const result = await rfqService.create(rfqData)
      
      // Success animation
      navigate('/my-rfqs', { state: { submitted: true, rfqId: result.id } })
    } catch (err) {
      // Extract detailed error message from response
      let errorMessage = 'Failed to submit RFQ. Please try again.'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }
      
      // Handle 403 Forbidden - likely role mismatch
      if (err.response?.status === 403) {
        const currentUser = authService.getCurrentUser()
        if (currentUser && currentUser.role !== 'BUYER') {
          errorMessage = `Access denied. You need a BUYER account to submit RFQs. Your current role is: ${currentUser.role}.`
        } else if (errorMessage.includes('Insufficient permissions')) {
          errorMessage = `Access denied. BUYER account required. ${errorMessage}`
        }
      }
      
      // If validation errors, show them
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors
        if (Array.isArray(validationErrors)) {
          errorMessage = validationErrors.map(e => e.message || e).join(', ')
        } else if (typeof validationErrors === 'object') {
          errorMessage = Object.values(validationErrors).flat().join(', ')
        }
      }
      
      setError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header Section */}
          <div className="mb-8">
            <Link
              to="/medicines"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
                Create Request for Quotation
              </h1>
              <p className="text-lg text-slate-600 mb-4">
                Send a structured request to verified pharmaceutical suppliers.
              </p>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified suppliers only</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-900">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Secure communication</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-900">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Admin reviewed</span>
                </div>
              </div>
            </div>
          </div>

          {profileBlockSubmit && (
            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Complete your profile to submit RFQs</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Add the missing details in Settings: {missingFields.join(', ')}.
                  </p>
                </div>
              </div>
              <Link
                to="/settings?tab=profile"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors shrink-0"
              >
                Complete Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="grid lg:grid-cols-10 gap-6">
            {/* Left Side - RFQ Builder (70%) */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Products Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-blue-200/80 p-8 shadow-soft"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-1">
                        <Package className="w-5 h-5 text-primary" />
                        Products
                      </h2>
                      <p className="text-sm text-slate-600">
                        Add products to your RFQ request
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAvailableProducts(!showAvailableProducts)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Browse
                    </button>
                  </div>

                  {/* Available Products Dropdown */}
                  <AnimatePresence>
                    {showAvailableProducts && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200"
                      >
                        <div className="mb-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                              type="text"
                              value={productSearchQuery}
                              onChange={(e) => setProductSearchQuery(e.target.value)}
                              placeholder="Search products..."
                              className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {productsLoading ? (
                            <p className="text-sm text-slate-600 text-center py-4">Loading products...</p>
                          ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => handleAddProductFromList(product)}
                                className="w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-primary hover:bg-primary/5 transition-colors"
                              >
                                <div className="font-medium text-slate-900">{product.name}</div>
                                <div className="text-xs text-slate-600 mt-1">
                                  {product.manufacturer || product.supplier?.companyName || 'N/A'} • {product.country || product.supplier?.country || 'N/A'}
                                </div>
                              </button>
                            ))
                          ) : (
                            <p className="text-sm text-slate-600 text-center py-4">No products found</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Product Items */}
                  <div className="space-y-4 mb-6">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex gap-4 items-start p-4 bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 min-w-0">
                              <input
                                type="text"
                                value={item.productName}
                                onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                onBlur={() => handleFieldBlur(`product_${item.id}`)}
                                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Product name"
                              />
                              {touchedFields[`product_${item.id}`] && validationErrors[`product_${item.id}`] && (
                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {validationErrors[`product_${item.id}`]}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2 min-w-0">
                              <input
                                ref={index === items.length - 1 ? quantityInputRef : null}
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = e.target.value
                                  if (val === '' || parseFloat(val) > 0) {
                                    handleItemChange(item.id, 'quantity', val)
                                  }
                                }}
                                onBlur={() => handleFieldBlur(`quantity_${item.id}`)}
                                className="w-20 min-w-0 flex-shrink-0 px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Qty"
                                min="1"
                                step="1"
                              />
                              <select
                                value={item.unit}
                                onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                className="min-w-0 flex-1 w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              >
                                <option value="units">Units</option>
                                <option value="boxes">Boxes</option>
                                <option value="bottles">Bottles</option>
                                <option value="kg">KG</option>
                                <option value="liters">Liters</option>
                              </select>
                            </div>
                            {touchedFields[`quantity_${item.id}`] && validationErrors[`quantity_${item.id}`] && (
                              <p className="md:col-span-3 mt-1 text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {validationErrors[`quantity_${item.id}`]}
                              </p>
                            )}
                          </div>
                          
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              title="Remove product"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </motion.div>

                {/* Delivery & Location Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-blue-200/80 p-8 shadow-soft"
                >
                  <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-6">
                    <Calendar className="w-5 h-5 text-primary" />
                    Delivery & Location
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        value={formData.expectedDeliveryDate}
                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                        onBlur={() => handleFieldBlur('deliveryDate')}
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                        className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                      {touchedFields.deliveryDate && validationErrors.deliveryDate && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.deliveryDate}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-600">
                        Delivery date must be in the future
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Destination Country
                      </label>
                      <select
                        value={formData.destinationCountry}
                        onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                        onBlur={() => handleFieldBlur('destinationCountry')}
                        className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="DE">Germany</option>
                        <option value="IN">India</option>
                        <option value="CN">China</option>
                        <option value="FR">France</option>
                        <option value="CA">Canada</option>
                      </select>
                      {touchedFields.destinationCountry && validationErrors.destinationCountry && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors.destinationCountry}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Contact & Notes Section (Collapsed by default) */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-blue-200/80 shadow-soft overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setShowContactDetails(!showContactDetails)}
                    className="w-full px-8 py-4 flex items-center justify-between text-left hover:bg-blue-50/50 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-900">
                      Add additional contact details (optional)
                    </span>
                    <motion.div
                      animate={{ rotate: showContactDetails ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {showContactDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-8 pb-8 space-y-6"
                      >
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                              Additional Email
                            </label>
                            <input
                              type="email"
                              value={formData.contactEmail}
                              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              placeholder="additional@email.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={formData.contactPhone}
                              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                              placeholder="+1 234 567 8900"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-900 mb-2">
                            Special Requirements
                          </label>
                          <textarea
                            value={formData.specialRequirements}
                            onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
                            placeholder="Any special requirements, certifications needed, or additional information..."
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Right Side - Sticky Summary Panel (30%) */}
            <aside className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-blue-200/80 p-6 shadow-soft sticky top-24">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">RFQ Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                    <span className="text-sm text-slate-600">Products</span>
                    <span className="text-sm font-semibold text-slate-900">{items.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                    <span className="text-sm text-slate-600">Total Units</span>
                    <span className="text-sm font-semibold text-slate-900">{totalUnits || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                    <span className="text-sm text-slate-600">Destination</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formData.destinationCountry || '—'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-blue-200">
                    <span className="text-sm text-slate-600">Delivery</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formData.expectedDeliveryDate 
                        ? new Date(formData.expectedDeliveryDate).toLocaleDateString() 
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Validation Status */}
                <div className={`mb-6 p-4 rounded-xl border ${isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isValid ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">Ready to submit</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">Missing required fields</span>
                      </>
                    )}
                  </div>
                  {!isValid && (
                    <p className="text-xs text-amber-600 mt-1">
                      Please complete all required fields above
                    </p>
                  )}
                </div>

                {/* Role Warning */}
                {user && !hasValidRole && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> You must login as a Buyer or Admin to submit RFQs. Your current account role is: <strong>{user.role}</strong>.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={profileBlockSubmit || !isValid || submitting}
                  className="w-full px-6 py-4 bg-blue-700 text-white font-semibold rounded-xl hover:bg-blue-800 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit RFQ
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </aside>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}

export default SendRFQ
