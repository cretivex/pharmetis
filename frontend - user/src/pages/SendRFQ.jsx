import { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  X,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  Shield,
  Lock,
  ChevronDown,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Container from '../components/ui/Container'
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
            productId: '',
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [productsLoading, setProductsLoading] = useState(false)
  const [suppliersLoading, setSuppliersLoading] = useState(false)
  const [showContactDetails, setShowContactDetails] = useState(false)
  const [touchedFields, setTouchedFields] = useState({})

  useEffect(() => {
    const draft = location.state?.rfqDraft
    if (draft?.specialRequirements?.trim()) {
      setFormData((prev) =>
        prev.specialRequirements?.trim()
          ? prev
          : { ...prev, specialRequirements: draft.specialRequirements.trim() }
      )
    }
  }, [location.state?.rfqDraft])

  const loadSupplierProducts = async (supplierId) => {
    try {
      setProductsLoading(true)
      const result = await suppliersService.getProducts(supplierId, { limit: 100 })
      const productsData = result?.products || result?.data?.products || []
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
      const productsData = result?.products || result?.data?.products || []
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
    const source = availableProducts.filter((product) => product?.availability !== 'OUT_OF_STOCK')
    if (!productSearchQuery) return source
    const query = productSearchQuery.toLowerCase()
    return source.filter(
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
      const productErr = validation.required(item.productId, 'Product')
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
      productId: '',
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
    setItems(items.map((item) => {
      if (item.id !== id) return item
      if (field === 'productId') {
        const selected = availableProducts.find((p) => p.id === value)
        return { ...item, productId: value, productName: selected?.name || '' }
      }
      return { ...item, [field]: value }
    }))
    // Mark field as touched
    setTouchedFields({ ...touchedFields, [`${field}_${id}`]: true })
  }

  const handleFieldBlur = (fieldName) => {
    setTouchedFields({ ...touchedFields, [fieldName]: true })
  }

  const handleAddProductFromList = (product) => {
    if (product?.availability === 'OUT_OF_STOCK') return
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
          productId: item.productId,
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

  const inputBase =
    'w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10'
  const labelBase = 'mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500'
  const cardBase =
    'rounded-[1.25rem] border border-zinc-200/90 bg-white p-6 shadow-[0_1px_0_rgba(9,9,11,0.04)] ring-1 ring-zinc-950/[0.03] sm:p-8'

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-50 pt-24 pb-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(520px,55vh)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(9,9,11,0.06),transparent)]"
        aria-hidden
      />
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-6xl"
        >
          <Link
            to="/medicines"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shadow-sm">
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </span>
            Back to catalog
          </Link>

          <header className="mb-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-zinc-700" />
              New RFQ
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl md:text-[2.5rem] md:leading-[1.1]">
              Request for quotation
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-600">
              Structured inquiry for verified suppliers—clear line items, delivery window, and destination in one
              secure flow.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { icon: CheckCircle2, text: 'Verified network', className: 'text-emerald-600' },
                { icon: Shield, text: 'Encrypted handoff', className: 'text-zinc-700' },
                { icon: Lock, text: 'Compliance-ready', className: 'text-zinc-700' },
              ].map(({ icon: Icon, text, className }) => (
                <span
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm"
                >
                  <Icon className={`h-3.5 w-3.5 ${className}`} strokeWidth={2} />
                  {text}
                </span>
              ))}
            </div>
          </header>

          {profileBlockSubmit && (
            <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertCircle className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-amber-950">Finish your buyer profile</p>
                  <p className="mt-1 text-sm text-amber-900/80">
                    Required before RFQs: {missingFields.join(', ')}.
                  </p>
                </div>
              </div>
              <Link
                to="/settings?tab=profile"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800"
              >
                Open settings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(320px,34%)] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              {/* Line items */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cardBase}
              >
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                        <Package className="h-4 w-4" strokeWidth={2} />
                      </span>
                      Line items
                    </h2>
                    <p className="mt-1.5 text-sm text-zinc-500">Select catalog products and specify quantity & unit.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAvailableProducts(!showAvailableProducts)}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-white"
                  >
                    <Search className="h-4 w-4 text-zinc-600" />
                    Browse catalog
                  </button>
                </div>

                <AnimatePresence>
                  {showAvailableProducts && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 ring-1 ring-zinc-950/[0.03]"
                    >
                      <div className="relative mb-3">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          placeholder="Search by product, manufacturer, or region…"
                          className={`${inputBase} pl-10`}
                        />
                      </div>
                      <div className="max-h-56 space-y-1.5 overflow-y-auto pr-0.5">
                        {productsLoading ? (
                          <p className="py-6 text-center text-sm text-zinc-500">Loading products…</p>
                        ) : filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => handleAddProductFromList(product)}
                              className="w-full rounded-xl border border-transparent bg-white p-3 text-left transition hover:border-zinc-200 hover:shadow-sm"
                            >
                              <div className="font-medium text-zinc-900">{product.name}</div>
                              <div className="mt-0.5 text-xs text-zinc-500">
                                {product.manufacturer || product.supplier?.companyName || '—'} ·{' '}
                                {product.country || product.supplier?.country || '—'}
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="py-6 text-center text-sm text-zinc-500">No products match your search.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mb-6 space-y-3">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className="group relative flex gap-3 rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-4 transition hover:border-zinc-300 hover:bg-white sm:gap-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1 grid grid-cols-1 gap-3 md:grid-cols-12 md:gap-4">
                          <div className="min-w-0 md:col-span-6">
                            <label className={`${labelBase} normal-case tracking-normal text-zinc-600`}>Product</label>
                            <select
                              value={item.productId || ''}
                              onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                              onBlur={() => handleFieldBlur(`product_${item.id}`)}
                              className={inputBase}
                            >
                              <option value="">Select product from catalog</option>
                              {filteredProducts.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                            {touchedFields[`product_${item.id}`] && validationErrors[`product_${item.id}`] && (
                              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                {validationErrors[`product_${item.id}`]}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 md:col-span-6">
                            <div className="w-24 shrink-0">
                              <label className={`${labelBase} normal-case tracking-normal text-zinc-600`}>Qty</label>
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
                                className={inputBase}
                                placeholder="0"
                                min="1"
                                step="1"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <label className={`${labelBase} normal-case tracking-normal text-zinc-600`}>Unit</label>
                              <select
                                value={item.unit}
                                onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                                className={inputBase}
                              >
                                <option value="units">Units</option>
                                <option value="boxes">Boxes</option>
                                <option value="bottles">Bottles</option>
                                <option value="kg">KG</option>
                                <option value="liters">Liters</option>
                              </select>
                            </div>
                          </div>
                          {touchedFields[`quantity_${item.id}`] && validationErrors[`quantity_${item.id}`] && (
                            <p className="md:col-span-12 flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              {validationErrors[`quantity_${item.id}`]}
                            </p>
                          )}
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="absolute right-2 top-2 rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 sm:static sm:self-start"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-800 transition hover:text-zinc-950"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white">
                    <Plus className="h-4 w-4" />
                  </span>
                  Add another line
                </button>
              </motion.div>

              {/* Delivery */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={cardBase}
              >
                <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-800">
                    <Calendar className="h-4 w-4" strokeWidth={2} />
                  </span>
                  Delivery window
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className={labelBase}>Expected delivery</label>
                    <input
                      type="date"
                      value={formData.expectedDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                      onBlur={() => handleFieldBlur('deliveryDate')}
                      min={new Date().toISOString().split('T')[0]}
                      className={inputBase}
                    />
                    {touchedFields.deliveryDate && validationErrors.deliveryDate && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.deliveryDate}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-zinc-500">Must be a future date for supplier planning.</p>
                  </div>
                  <div>
                    <label className={labelBase}>Destination country</label>
                    <select
                      value={formData.destinationCountry}
                      onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                      onBlur={() => handleFieldBlur('destinationCountry')}
                      className={inputBase}
                    >
                      <option value="">Select country</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="IN">India</option>
                      <option value="CN">China</option>
                      <option value="FR">France</option>
                      <option value="CA">Canada</option>
                    </select>
                    {touchedFields.destinationCountry && validationErrors.destinationCountry && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.destinationCountry}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Optional details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${cardBase} overflow-hidden p-0`}
              >
                <button
                  type="button"
                  onClick={() => setShowContactDetails(!showContactDetails)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-zinc-50 sm:px-8"
                >
                  <span className="text-sm font-semibold text-zinc-900">Optional — contact &amp; notes</span>
                  <motion.div animate={{ rotate: showContactDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5 text-zinc-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showContactDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-6 border-t border-zinc-100 px-6 pb-8 pt-2 sm:px-8"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className={labelBase}>Additional email</label>
                          <input
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            className={inputBase}
                            placeholder="procurement@company.com"
                          />
                        </div>
                        <div>
                          <label className={labelBase}>Phone</label>
                          <input
                            type="tel"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            className={inputBase}
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelBase}>Special requirements</label>
                        <textarea
                          value={formData.specialRequirements}
                          onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                          rows={4}
                          className={`${inputBase} resize-none`}
                          placeholder="COA, cold chain, labeling, pharmacopoeia, or other specs…"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 rounded-2xl border border-red-200/90 bg-red-50/90 p-4 text-red-800 shadow-sm"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium leading-snug">{error}</p>
                </motion.div>
              )}
            </div>

            <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[1.25rem] border border-zinc-200/90 bg-white/90 p-6 shadow-[0_12px_40px_-12px_rgba(9,9,11,0.12)] ring-1 ring-zinc-950/[0.04] backdrop-blur-md sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-zinc-900">Summary</h2>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                    Draft
                  </span>
                </div>

                <dl className="space-y-4 border-b border-zinc-100 pb-6">
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-zinc-500">Line items</dt>
                    <dd className="font-semibold tabular-nums text-zinc-900">{items.length}</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-zinc-500">Total units</dt>
                    <dd className="font-semibold tabular-nums text-zinc-900">{totalUnits || 0}</dd>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-zinc-500">Destination</dt>
                    <dd className="max-w-[55%] text-right font-medium text-zinc-900">
                      {formData.destinationCountry || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 text-sm">
                    <dt className="text-zinc-500">Delivery</dt>
                    <dd className="font-medium text-zinc-900">
                      {formData.expectedDeliveryDate
                        ? new Date(formData.expectedDeliveryDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </dd>
                  </div>
                </dl>

                <div
                  className={`mb-6 mt-6 rounded-2xl border p-4 ${
                    isValid ? 'border-emerald-200/90 bg-emerald-50/80' : 'border-amber-200/90 bg-amber-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-900">Ready to send</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-900">Complete required fields</span>
                      </>
                    )}
                  </div>
                  {!isValid && (
                    <p className="mt-2 text-xs leading-relaxed text-amber-800/90">
                      Select catalog products, quantities, delivery date, and country.
                    </p>
                  )}
                </div>

                {user && !hasValidRole && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950">
                    <strong className="font-semibold">Role:</strong> Buyer account required to submit. Yours:{' '}
                    <strong>{user.role}</strong>.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={profileBlockSubmit || !isValid || submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                      />
                      Sending…
                    </>
                  ) : (
                    <>
                      Submit RFQ
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </>
                  )}
                </button>
                <p className="mt-4 text-center text-[11px] leading-relaxed text-zinc-500">
                  By submitting you agree our team may share this request with matching verified suppliers.
                </p>
              </div>
            </aside>
          </form>
        </motion.div>
      </Container>
    </div>
  )
}

export default SendRFQ
