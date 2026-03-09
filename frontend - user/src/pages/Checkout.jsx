import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, AlertCircle, CheckCircle2, 
  MapPin, Package, DollarSign, CreditCard, Truck
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import Textarea from '../components/ui/Textarea'
import Loading from '../components/ui/Loading'
import ErrorState from '../components/ui/ErrorState'
import { checkoutService } from '../services/checkout.service'
import { rfqService } from '../services/rfq.service'
import { validation } from '../utils/validation'
import { useCurrency } from '../contexts/CurrencyContext'

export default function Checkout() {
  const { formatPrice } = useCurrency()
  const { quotationId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quotation, setQuotation] = useState(null)
  const [error, setError] = useState(null)

  // Delivery form state
  const [deliveryForm, setDeliveryForm] = useState({
    fullName: '',
    companyName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: '',
    instructions: ''
  })

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({})
  const [showValidationAlert, setShowValidationAlert] = useState(false)

  useEffect(() => {
    if (quotationId) {
      loadQuotation()
    }
  }, [quotationId])

  const loadQuotation = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await checkoutService.getQuotation(quotationId)
      if (!data) {
        throw new Error('Quotation not found')
      }
      setQuotation(data)
      
      // Pre-fill email from user if available
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.email) {
        setDeliveryForm(prev => ({ ...prev, email: user.email }))
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load quotation')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    const e = deliveryForm
    const req = (fieldName, key) => { const r = validation.required(e[key], fieldName); if (r) errors[key] = r }
    const emailErr = validation.email(e.email); if (emailErr) errors.email = emailErr
    const phoneErr = validation.phone(e.phone); if (phoneErr) errors.phone = phoneErr
    req('Full name', 'fullName')
    req('Address', 'addressLine1')
    req('City', 'city')
    req('State', 'state')
    req('Postal code', 'postalCode')
    req('Country', 'country')
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const scrollToFirstError = (errors) => {
    const firstErrorField = Object.keys(errors)[0]
    if (firstErrorField) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        const element = document.getElementById(firstErrorField)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          setTimeout(() => {
            element.focus()
          }, 300)
        }
      }, 100)
    }
  }

  const handleInputChange = (field, value) => {
    // For phone, allow only digits and common formatting chars
    if (field === 'phone') {
      // Allow digits, spaces, dashes, parentheses, plus sign
      value = value.replace(/[^\d\s\-()\+]/g, '')
    }
    
    setDeliveryForm(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
      // Hide validation alert if all errors are cleared
      if (Object.keys(validationErrors).length === 1) {
        setShowValidationAlert(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form - DO NOT proceed if invalid
    const errors = {}
    
    // Full Name
    if (!deliveryForm.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    
    // Phone - digits only, 10-15 length
    const phoneDigits = deliveryForm.phone.replace(/\D/g, '')
    if (!deliveryForm.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      errors.phone = 'Phone number must be 10-15 digits'
    }
    
    // Email
    if (!deliveryForm.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryForm.email)) {
      errors.email = 'Enter a valid email address'
    }
    
    // Address Line 1
    if (!deliveryForm.addressLine1.trim()) {
      errors.addressLine1 = 'Address is required'
    }
    
    // City
    if (!deliveryForm.city.trim()) {
      errors.city = 'City is required'
    }
    
    // State
    if (!deliveryForm.state.trim()) {
      errors.state = 'State is required'
    }
    
    // Postal Code
    if (!deliveryForm.postalCode.trim()) {
      errors.postalCode = 'Postal code is required'
    }
    
    // Country
    if (!deliveryForm.country.trim()) {
      errors.country = 'Country is required'
    }

    // If form is invalid, show alert and scroll
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setShowValidationAlert(true)
      setError(null) // Clear API errors, show validation errors
      
      // Force a re-render by using a small delay
      setTimeout(() => {
        scrollToFirstError(errors)
      }, 150)
      
      // Ensure alert is visible
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return // DO NOT call API
    }

    // Form is valid - proceed with API call
    setSubmitting(true)
    setError(null)
    setShowValidationAlert(false)

    try {
      const result = await checkoutService.createOrder(quotationId, deliveryForm)
      
      if (result.orderId) {
        // Redirect to payment page
        navigate(`/payment?orderId=${result.orderId}&quotationId=${quotationId}`)
      } else {
        throw new Error('Order creation failed')
      }
    } catch (err) {
      // Handle backend validation errors
      if (err.response?.status === 400) {
        const backendMessage = err.response?.data?.message || ''
        
        // Map backend errors to form fields if possible
        const fieldMapping = {
          'fullName': 'fullName',
          'phone': 'phone',
          'email': 'email',
          'addressLine1': 'addressLine1',
          'city': 'city',
          'state': 'state',
          'postalCode': 'postalCode',
          'country': 'country'
        }
        
        // Try to extract field names from error message
        const backendErrors = {}
        Object.keys(fieldMapping).forEach(field => {
          if (backendMessage.toLowerCase().includes(field.toLowerCase())) {
            backendErrors[fieldMapping[field]] = backendMessage
          }
        })
        
        if (Object.keys(backendErrors).length > 0) {
          setValidationErrors(prev => ({ ...prev, ...backendErrors }))
          setShowValidationAlert(true)
          setTimeout(() => {
            scrollToFirstError(backendErrors)
          }, 50)
        } else {
          // Generic backend error
          setError('Please check your delivery details and try again.')
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create order. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate totals
  const totals = useMemo(() => {
    if (!quotation?.items) return { subtotal: 0, tax: 0, grandTotal: 0 }
    
    const subtotal = quotation.items.reduce((sum, item) => {
      return sum + (parseFloat(item.totalPrice) || 0)
    }, 0)
    
    const tax = quotation.items.reduce((sum, item) => {
      const itemSubtotal = parseFloat(item.totalPrice) || 0
      const taxPercent = parseFloat(item.taxPercent) || 0
      return sum + (itemSubtotal * taxPercent / 100)
    }, 0)
    
    return {
      subtotal,
      tax,
      grandTotal: subtotal + tax
    }
  }, [quotation])

  const isFormValid = useMemo(() => {
    const phoneDigits = deliveryForm.phone.replace(/\D/g, '')
    return deliveryForm.fullName.trim() &&
           deliveryForm.phone.trim() &&
           phoneDigits.length >= 10 &&
           phoneDigits.length <= 15 &&
           deliveryForm.email.trim() &&
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryForm.email) &&
           deliveryForm.addressLine1.trim() &&
           deliveryForm.city.trim() &&
           deliveryForm.state.trim() &&
           deliveryForm.postalCode.trim() &&
           deliveryForm.country.trim()
  }, [deliveryForm])
  
  // Auto-hide validation alert when form becomes valid
  useEffect(() => {
    if (isFormValid && showValidationAlert) {
      setShowValidationAlert(false)
    }
  }, [isFormValid, showValidationAlert])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loading message="Loading quotation details..." />
      </div>
    )
  }

  if (error && !quotation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <ErrorState
          message={error}
          retry="Back to RFQs"
          onRetry={() => navigate('/my-rfqs')}
        />
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Quotation not found</p>
        <Button variant="outline" onClick={() => navigate('/my-rfqs')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to RFQs
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/my-rfqs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to RFQs
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order by providing delivery information</p>
        </div>

        {/* Validation Alert (Amber) */}
        {showValidationAlert && Object.keys(validationErrors).length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                Please complete all required delivery details before proceeding to payment.
              </p>
            </div>
          </div>
        )}

        {/* API Error Alert (Red - only for non-validation errors) */}
        {error && !showValidationAlert && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-8">
          {/* Left Column - Delivery & Payment */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  Delivery Information
                </h2>
              </div>
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm text-gray-700 mb-1.5 block">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={deliveryForm.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`h-10 ${validationErrors.fullName ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                        placeholder="John Doe"
                      />
                      {validationErrors.fullName && (
                        <p className="text-xs text-amber-600 mt-1">{validationErrors.fullName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="companyName" className="text-sm text-gray-700 mb-1.5 block">
                        Company Name <span className="text-gray-400 text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={deliveryForm.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="h-10 border-gray-300"
                        placeholder="Company Inc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-sm text-gray-700 mb-1.5 block">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={deliveryForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`h-10 ${validationErrors.phone ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                        placeholder="+1 234 567 8900"
                      />
                      {validationErrors.phone && (
                        <p className="text-xs text-amber-600 mt-1">{validationErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm text-gray-700 mb-1.5 block">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={deliveryForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`h-10 ${validationErrors.email ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                        placeholder="john@example.com"
                      />
                      {validationErrors.email && (
                        <p className="text-xs text-amber-600 mt-1">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1" className="text-sm text-gray-700 mb-1.5 block">
                      Address Line 1 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="addressLine1"
                      value={deliveryForm.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      className={`h-10 ${validationErrors.addressLine1 ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                      placeholder="123 Main Street"
                    />
                    {validationErrors.addressLine1 && (
                      <p className="text-xs text-amber-600 mt-1">{validationErrors.addressLine1}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="addressLine2" className="text-sm text-gray-700 mb-1.5 block">
                      Address Line 2 <span className="text-gray-400 text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="addressLine2"
                      value={deliveryForm.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      className="h-10 border-gray-300"
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm text-gray-700 mb-1.5 block">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={deliveryForm.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`h-10 ${validationErrors.city ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                        placeholder="New York"
                      />
                      {validationErrors.city && (
                        <p className="text-xs text-amber-600 mt-1">{validationErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="state" className="text-sm text-gray-700 mb-1.5 block">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        value={deliveryForm.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className={`h-10 ${validationErrors.state ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                        placeholder="NY"
                      />
                      {validationErrors.state && (
                        <p className="text-xs text-amber-600 mt-1">{validationErrors.state}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="postalCode" className="text-sm text-gray-700 mb-1.5 block">
                        Postal Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        value={deliveryForm.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className={`h-10 ${validationErrors.postalCode ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                        placeholder="10001"
                      />
                      {validationErrors.postalCode && (
                        <p className="text-xs text-amber-600 mt-1">{validationErrors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-sm text-gray-700 mb-1.5 block">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="country"
                      value={deliveryForm.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className={`h-10 ${validationErrors.country ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : 'border-gray-300'}`}
                      placeholder="United States"
                    />
                    {validationErrors.country && (
                      <p className="text-xs text-amber-600 mt-1">{validationErrors.country}</p>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="pt-4 border-t border-gray-200 space-y-4">
                    <div>
                      <Label htmlFor="taxId" className="text-sm text-gray-700 mb-1.5 block">
                        GST / Tax ID <span className="text-gray-400 text-xs">(optional)</span>
                      </Label>
                      <Input
                        id="taxId"
                        value={deliveryForm.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                        className="h-10 border-gray-300"
                        placeholder="TAX-123456"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instructions" className="text-sm text-gray-700 mb-1.5 block">
                        Special Instructions <span className="text-gray-400 text-xs">(optional)</span>
                      </Label>
                      <Textarea
                        id="instructions"
                        value={deliveryForm.instructions}
                        onChange={(e) => handleInputChange('instructions', e.target.value)}
                        className="border-gray-300"
                        rows={3}
                        placeholder="Any special delivery instructions..."
                      />
                    </div>
                  </div>

                  {/* Payment Method & Submit */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                      <h3 className="font-semibold text-slate-900">Payment Method</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-6">
                      You will be redirected to the payment page after confirming your order.
                    </p>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Confirm & Pay
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          {/* Right Column - Order Summary (Sticky) */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  Order Summary
                </h2>
              </div>
              <div className="space-y-4">
                {/* Status Indicators */}
                <div className="space-y-2 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Quote Accepted</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Delivery details required</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 text-sm">Items</h4>
                  {quotation.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.productName}</p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {item.quantity} {item.unit} × {formatPrice(parseFloat(item.unitPrice) || 0, quotation?.currency)}
                        </p>
                      </div>
                      <p className="font-medium text-slate-900 ml-4">
                        {formatPrice(parseFloat(item.totalPrice) || 0, quotation?.currency)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-slate-900">{formatPrice(totals.subtotal, quotation?.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-slate-900">{formatPrice(totals.tax, quotation?.currency)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-slate-900">Grand Total</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatPrice(totals.grandTotal, quotation?.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">
                    {quotation.currency || 'USD'}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
