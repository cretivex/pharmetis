import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Upload, Loader2, DollarSign, Calendar, Clock, 
  FileText, AlertCircle, Save, Send, CheckCircle2,
  Building2, Calculator, X, Package, AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getRFQById, submitRFQResponse, getMyResponses, resubmitQuotation, submitNegotiationResponse } from '@/services/rfq.service'
import { RFQHistory } from '@/components/RFQHistory'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Format currency
const formatCurrency = (value) => {
  if (!value || value === 0 || isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Format number input as currency
const formatCurrencyInput = (value) => {
  if (!value) return ''
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return num.toFixed(2)
}

export default function RFQResponse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rfq, setRfq] = useState(null)
  const [items, setItems] = useState([])
  const [attachments, setAttachments] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const [existingResponseId, setExistingResponseId] = useState(null)
  const [myResponse, setMyResponse] = useState(null)
  const [isResubmit, setIsResubmit] = useState(false)
  const [revisionNote, setRevisionNote] = useState(null)
  const [showCounterModal, setShowCounterModal] = useState(false)
  const [counterPriceInput, setCounterPriceInput] = useState('')
  const [submittingNegotiation, setSubmittingNegotiation] = useState(false)

  const [notes, setNotes] = useState('')

  /** After first successful submit, line items are read-only (admin may return RFQ for resubmit). */
  const quoteFormLocked = useMemo(() => {
    if (!myResponse) return false
    if (isResubmit) return false
    if (myResponse.status === 'DRAFT') return false
    return true
  }, [myResponse, isResubmit])

  // Debounced items for calculations
  const debouncedItems = useDebounce(items, 300)

  const loadRFQ = useCallback(async () => {
    if (!id) {
      setError('RFQ ID is required')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setRfq(null)
      
      const data = await getRFQById(id)
      
      if (!data) {
        setError('RFQ not found')
        setLoading(false)
        return
      }

      const itemsList = Array.isArray(data?.items) ? data.items : []
      if (!data || itemsList.length === 0) {
        setError(itemsList.length === 0 ? 'RFQ has no items. Please contact the buyer.' : 'Invalid RFQ data.')
        setLoading(false)
        return
      }

      setRfq({ ...data, items: itemsList })

      let myResponseForRfq = null
      try {
        const myResponses = await getMyResponses()
        const list = Array.isArray(myResponses) ? myResponses : []
        myResponseForRfq = list.find(r => (r.rfqId || r.rfq?.id) === id)
      } catch (_) {}

      setMyResponse(myResponseForRfq || null)
      const canResubmit =
        myResponseForRfq &&
        ['SENT_BACK_TO_SUPPLIER', 'REJECTED', 'REVISION_REQUESTED'].includes(myResponseForRfq.status)
      const quoteLockedForLoad =
        myResponseForRfq &&
        !canResubmit &&
        myResponseForRfq.status &&
        myResponseForRfq.status !== 'DRAFT'
      const needsNegotiationResponse = myResponseForRfq && ['NEGOTIATION_SENT_TO_SUPPLIER', 'SENT_BACK_TO_SUPPLIER'].includes(myResponseForRfq.status) && !myResponseForRfq.supplierNegotiationResponse
      if (canResubmit) {
        setExistingResponseId(myResponseForRfq.id)
        setIsResubmit(true)
        if (myResponseForRfq.revisionNote) setRevisionNote(myResponseForRfq.revisionNote)
      } else if (needsNegotiationResponse) {
        setExistingResponseId(myResponseForRfq.id)
      }
      
      const rfqItems = itemsList
        .filter(item => item && (item.id || item.productName || item.product?.name))
      
      const existingItems =
        (canResubmit || quoteLockedForLoad) &&
        Array.isArray(myResponseForRfq.items) &&
        myResponseForRfq.items.length > 0
          ? myResponseForRfq.items
          : null

      const initialItems = rfqItems.map((item, index) => {
        const rfqItemId = item.id || item.product?.id
        const existing = existingItems && existingItems.find(e => (e.rfqItemId || e.id) === rfqItemId)
        const quantity = existing?.quantity ?? item.quantity ?? '1'
        const unit = existing?.unit ?? item.unit ?? 'units'
        const unitPrice = existing?.unitPrice != null ? String(existing.unitPrice) : ''
        const taxPct = existing?.taxPercent != null ? String(existing.taxPercent) : '0'
        const leadTime = existing?.leadTime ?? ''
        const qtyNum = parseFloat(quantity) || 0
        const priceNum = parseFloat(unitPrice) || 0
        const taxNum = parseFloat(taxPct) || 0
        const subtotal = priceNum * qtyNum
        const taxAmount = (subtotal * taxNum) / 100
        const total = subtotal + taxAmount
        return {
          ...item,
          id: item.id || `item-${index}`,
          rfqItemId: item.id || `item-${index}`,
          productId: item.productId || item.product?.id || null,
          productName: item.productName || item.product?.name || 'Product',
          quantity,
          unit,
          unitPrice,
          taxPercent: taxPct,
          leadTime,
          subtotal,
          taxAmount,
          total,
          notes: existing?.notes ?? '',
        }
      })
      
      if (initialItems.length === 0) {
        setError('RFQ has no valid items. Please contact the buyer.')
        setLoading(false)
        return
      }
      
      if (canResubmit && myResponseForRfq.notes) {
        setNotes(myResponseForRfq.notes || '')
      }
      
      setItems(initialItems)
      setLoading(false)
    } catch (error) {
      console.error('[RFQResponse] Load RFQ error:', error)
      
      let errorMessage = 'Failed to load RFQ'
      
      if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'You do not have access to this RFQ. This RFQ may not have been sent to you.'
      } else if (error.response?.status === 404) {
        errorMessage = error.response?.data?.message || 'RFQ not found. It may have been deleted or you may not have access.'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setRfq(null)
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadRFQ()
    }
  }, [id, loadRFQ])

  useEffect(() => {
    if (rfq?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date()
        const expiry = new Date(rfq.expiresAt)
        const diff = expiry - now
        
        if (diff <= 0) {
          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
          clearInterval(interval)
          return
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        
        setTimeRemaining({ days, hours, minutes, seconds, expired: false })
      }, 1000)
      
      return () => clearInterval(interval)
    }
  }, [rfq?.expiresAt])

  // Memoized calculations
  const totals = useMemo(() => {
    if (!debouncedItems || debouncedItems.length === 0) {
      return { subtotal: 0, taxTotal: 0, grandTotal: 0 }
    }
    const subtotal = debouncedItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
    const taxTotal = debouncedItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0)
    const grandTotal = subtotal + taxTotal
    return { subtotal, taxTotal, grandTotal }
  }, [debouncedItems])

  // Calculate average lead time
  const averageLeadTime = useMemo(() => {
    const itemLeadTimes = items
      .filter(item => item.leadTime && item.leadTime.trim() !== '')
      .map(item => {
        const match = item.leadTime.match(/(\d+)/)
        return match ? parseInt(match[1]) : null
      })
      .filter(time => time !== null)
    
    if (itemLeadTimes.length === 0) return null
    const avg = itemLeadTimes.reduce((sum, time) => sum + time, 0) / itemLeadTimes.length
    return Math.round(avg)
  }, [items])

  const updateItem = useCallback((index, field, value) => {
    setItems(prev => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        [field]: value,
      }
      
      // Recalculate totals
      const quantity = parseFloat(updated[index].quantity) || 0
      const unitPrice = parseFloat(updated[index].unitPrice) || 0
      const taxPercent = parseFloat(updated[index].taxPercent) || 0
      
      const subtotal = unitPrice * quantity
      const taxAmount = (subtotal * taxPercent) / 100
      const total = subtotal + taxAmount
      
      updated[index].subtotal = subtotal
      updated[index].taxAmount = taxAmount
      updated[index].total = total
      
      return updated
    })
  }, [])

  const getItemValidationErrors = useCallback((item, index) => {
    const errors = []
    if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) {
      errors.push('Unit price is required')
    }
    if (item.taxPercent === '' || item.taxPercent === null || item.taxPercent === undefined) {
      errors.push('Tax % is required')
    }
    return errors
  }, [])

  const getValidationStatus = useMemo(() => {
    const itemErrors = items.reduce((acc, item, index) => {
      const errors = getItemValidationErrors(item, index)
      if (errors.length > 0) acc.push({ item: index + 1, errors })
      return acc
    }, [])

    const incompleteItems = itemErrors.length

    return {
      itemErrors,
      incompleteItems,
      isValid: incompleteItems === 0
    }
  }, [items, getItemValidationErrors])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveDraft = async () => {
    if (quoteFormLocked) return
    setSaving(true)
    setError(null)
    
    try {
      // Save draft logic
      setSuccess('Draft saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitClick = () => {
    if (quoteFormLocked) {
      setError('This quotation is locked. You cannot submit again.')
      return
    }
    if (!getValidationStatus.isValid) {
      setError('Please complete all required fields before submitting')
      return
    }
    setShowConfirmModal(true)
  }

  const handleNegotiationResponse = async (action, counterPrice = null) => {
    if (!existingResponseId) return
    setSubmittingNegotiation(true)
    setError(null)
    try {
      const payload = { action }
      if (action === 'COUNTER' && counterPrice != null) payload.counterPrice = counterPrice
      await submitNegotiationResponse(existingResponseId, payload)
      setShowCounterModal(false)
      setCounterPriceInput('')
      setSuccess('Negotiation response submitted successfully.')
      await loadRFQ()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit negotiation response')
    } finally {
      setSubmittingNegotiation(false)
    }
  }

  const handleConfirmSubmit = async () => {
    if (quoteFormLocked) return
    setShowConfirmModal(false)
    setSubmitting(true)
    setError(null)

    try {
      const responseData = {
        items: items.map(item => ({
          rfqItemId: item.id,
          productId: item.productId || item.product?.id,
          productName: item.productName || item.product?.name || 'Product',
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: item.total || 0,
          leadTime: item.leadTime,
          taxPercent: parseFloat(item.taxPercent) || 0,
          notes: item.notes || ''
        })),
        totalAmount: totals.grandTotal,
        currency: 'USD',
        notes: notes,
        attachments: attachments
      }

      if (existingResponseId && isResubmit) {
        await resubmitQuotation(existingResponseId, responseData)
        navigate('/supplier/rfqs', { state: { message: 'Quotation resubmitted successfully. Awaiting admin review.' } })
      } else {
        await submitRFQResponse(id, responseData)
        navigate('/supplier/rfqs', { state: { message: 'Quote submitted successfully' } })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading RFQ details…</p>
      </div>
    )
  }

  if (error && !rfq) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <h3 className="mb-1 font-medium text-destructive">Error loading RFQ</h3>
              <p className="text-sm text-destructive/90">{error}</p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/supplier/rfqs')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to RFQs
          </Button>
        </div>
      </div>
    )
  }

  if (!rfq || !items || items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="mb-4 text-muted-foreground">Unable to load RFQ data</p>
        <Button variant="outline" onClick={() => navigate('/supplier/rfqs')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to RFQs
        </Button>
      </div>
    )
  }

  const buyerName = rfq?.buyer?.fullName || rfq?.buyer?.companyName || 'Buyer'
  const destination = rfq?.deliveryCountry || rfq?.destinationCountry || (rfq?.expectedDelivery ? 'See delivery date' : '—')
  const deadline = rfq?.expiresAt ? new Date(rfq.expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '—'

  return (
    <div className="space-y-6 pb-8">
      {/* Sticky RFQ Context Header */}
      <div className="sticky top-0 z-40 -mx-4 border-b border-border bg-background/95 px-4 py-4 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/supplier/rfqs')}
              className="shrink-0 border-border bg-muted/30 text-foreground hover:bg-muted"
              aria-label="Back to RFQs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold text-foreground">
                  RFQ #{id ? id.slice(0, 8).toUpperCase() : 'N/A'}
                </span>
                <span className="text-muted-foreground/60" aria-hidden>
                  •
                </span>
                <span className="text-sm text-muted-foreground">
                  Buyer: <span className="font-medium text-foreground">{buyerName}</span>
                </span>
                <span className="text-muted-foreground/60" aria-hidden>
                  •
                </span>
                <span className="text-sm text-muted-foreground">
                  Destination: <span className="font-medium text-foreground">{destination}</span>
                </span>
                <span className="text-muted-foreground/60" aria-hidden>
                  •
                </span>
                <span className="text-sm text-muted-foreground">
                  Deadline: <span className="font-medium text-foreground">{deadline}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {timeRemaining && !timeRemaining.expired && (
                <Badge variant="outline" className="px-3 py-1">
                  <Clock className="h-3 w-3 mr-1.5" />
                  {timeRemaining.days}d {timeRemaining.hours}h remaining
                </Badge>
              )}
              {rfq?.status && (
                <Badge 
                  variant={rfq.status === 'SENT' ? 'default' : 'secondary'}
                  title={
                    rfq.status === 'SENT' ? 'Awaiting your response' :
                    rfq.status === 'OPEN' ? 'RFQ is open for responses' :
                    rfq.status === 'QUOTED' ? 'Quotations received' :
                    rfq.status === 'COMPLETED' ? 'RFQ completed' :
                    rfq.status
                  }
                >
                  {rfq.status === 'SENT' ? 'Awaiting Response' : rfq.status}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {quoteFormLocked && (
        <div className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">
          <p className="font-semibold">Quotation submitted — editing locked</p>
          <p className="mt-1 text-muted-foreground">
            You can only submit one quotation per RFQ. If the admin returns it for revision, you will be able to resubmit
            from this page.
          </p>
        </div>
      )}

      {isResubmit && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Revision requested – please update your quotation and resubmit.</p>
          {revisionNote && (
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">Message: {revisionNote}</p>
          )}
        </div>
      )}

      {/* Your Quote – always visible when supplier has a response (original quote never hidden during negotiation) */}
      {myResponse && (
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <DollarSign className="h-4 w-4" />
              Your Quote
            </CardTitle>
            <CardDescription>
              The price you quoted for this RFQ. This remains visible regardless of negotiation status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(parseFloat(myResponse.supplierPrice ?? myResponse.totalAmount ?? 0))}
            </p>
            {myResponse.status && (
              <p className="text-xs text-muted-foreground mt-2">Status: <span className="font-medium">{myResponse.status}</span></p>
            )}
          </CardContent>
        </Card>
      )}

      {myResponse && (myResponse.status === 'NEGOTIATION_SENT_TO_SUPPLIER' || myResponse.status === 'SENT_BACK_TO_SUPPLIER') && (myResponse.requestedPrice != null || myResponse.requestedSupplierPrice != null || myResponse.buyerRequestedPrice != null || myResponse.negotiationMessage) && !myResponse.supplierNegotiationResponse && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <DollarSign className="h-4 w-4" />
              Buyer Negotiation Request
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Respond to the buyer&apos;s price request below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              <span className="text-muted-foreground">Your Original Quote: </span>
              <span className="font-semibold">{formatCurrency(parseFloat(myResponse.supplierPrice ?? myResponse.totalAmount ?? 0))}</span>
            </p>
            {(myResponse.requestedSupplierPrice != null || myResponse.requestedPrice != null || myResponse.buyerRequestedPrice != null) && (
              <p className="text-sm">
                <span className="text-muted-foreground">Buyer Requested Price (target for you): </span>
                <span className="font-semibold">{formatCurrency(parseFloat(myResponse.requestedSupplierPrice ?? myResponse.requestedPrice ?? myResponse.buyerRequestedPrice))}</span>
              </p>
            )}
            {myResponse.negotiationMessage && (
              <div>
                <Label className="text-xs text-muted-foreground">Buyer message</Label>
                <p className="mt-1 rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground">
                  {myResponse.negotiationMessage}
                </p>
              </div>
            )}
            {myResponse.supplierNegotiationResponse ? (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  You responded: {(myResponse.supplierNegotiationResponse === 'ACCEPT' || myResponse.supplierNegotiationResponse === 'ACCEPTED')
                    ? 'Accepted requested price'
                    : (myResponse.supplierNegotiationResponse === 'COUNTER' || myResponse.supplierNegotiationResponse === 'COUNTERED') && myResponse.supplierCounterPrice != null
                      ? `Counter offer: ${formatCurrency(parseFloat(myResponse.supplierCounterPrice))}`
                      : 'Rejected'}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleNegotiationResponse('ACCEPT')}
                  disabled={submittingNegotiation}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submittingNegotiation ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Accept Requested Price
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCounterModal(true)}
                  disabled={submittingNegotiation}
                >
                  Send Counter Offer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => handleNegotiationResponse('REJECT')}
                  disabled={submittingNegotiation}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject Negotiation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showCounterModal} onOpenChange={setShowCounterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Counter offer</DialogTitle>
            <DialogDescription>Enter your counter price to send to the buyer.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="counterPrice">Counter price ({myResponse?.currency || 'USD'})</Label>
              <Input
                id="counterPrice"
                type="number"
                step="0.01"
                min="0"
                value={counterPriceInput}
                onChange={(e) => setCounterPriceInput(e.target.value)}
                placeholder="0.00"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounterModal(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const num = parseFloat(counterPriceInput)
                if (isNaN(num) || num <= 0) {
                  setError('Please enter a valid positive counter price')
                  return
                }
                handleNegotiationResponse('COUNTER', num)
              }}
              disabled={submittingNegotiation}
            >
              {submittingNegotiation ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit counter offer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        {/* Left Column - Quote Builder */}
        <div className="space-y-6">
          {/* RFQ Details & Buyer Requirements */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden />
                RFQ Details & Buyer Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">RFQ Title</Label>
                <p className="font-semibold text-foreground">{rfq.title || 'Untitled RFQ'}</p>
              </div>

              {rfq.notes && (
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Buyer Notes & Requirements</Label>
                  <p className="whitespace-pre-wrap rounded-lg border border-border/60 bg-muted/35 p-3 text-sm leading-relaxed text-foreground/95 dark:bg-muted/20">
                    {rfq.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-2">
                {rfq.expectedDelivery && (
                  <div>
                    <Label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" aria-hidden />
                      Expected Delivery Date
                    </Label>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(rfq.expectedDelivery).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    RFQ Created
                  </Label>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(rfq.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items & Pricing - Card Layout */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <Calculator className="h-5 w-5 text-muted-foreground" aria-hidden />
                Items & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <fieldset
                disabled={quoteFormLocked}
                className="min-w-0 space-y-6 border-0 p-0 disabled:opacity-90 [&:disabled_*]:cursor-not-allowed"
              >
              {items.map((item, index) => {
                const itemErrors = getItemValidationErrors(item, index)
                return (
                  <div key={item.id || index}>
                    <div className="space-y-4 rounded-xl border border-border/60 bg-muted/25 p-5 dark:bg-muted/15">
                      <div>
                        <h4 className="mb-1 font-semibold text-foreground">
                          {item.product?.name || item.productName || 'Product'}
                        </h4>
                        <p className="mb-2 text-sm text-muted-foreground">
                          Requested:{' '}
                          <span className="font-medium text-foreground">
                            {item.quantity} {item.unit}
                          </span>
                        </p>
                        {item.product?.price && (
                          <p className="text-xs text-muted-foreground">
                            Reference Price:{' '}
                            <span className="font-medium text-foreground">{formatCurrency(item.product.price)}</span>
                          </p>
                        )}
                        {item.notes && (
                          <div className="mt-2 rounded-lg border border-primary/25 bg-primary/10 p-2 dark:bg-primary/15">
                            <p className="text-xs text-foreground">
                              <span className="font-medium">Buyer Note:</span> {item.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <Label className="mb-1.5 block text-xs text-muted-foreground">Unit Price *</Label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                              onBlur={(e) => {
                                const formatted = formatCurrencyInput(e.target.value)
                                updateItem(index, 'unitPrice', formatted)
                              }}
                              placeholder="0.00"
                              className="h-10 border-border bg-background pl-7 text-sm text-foreground"
                            />
                          </div>
                          {itemErrors.some((e) => e.includes('Unit price')) && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Unit price is required</p>
                          )}
                        </div>

                        <div>
                          <Label className="mb-1.5 block text-xs text-muted-foreground">Tax % *</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={item.taxPercent}
                              onChange={(e) => updateItem(index, 'taxPercent', e.target.value)}
                              placeholder="0"
                              className="h-10 border-border bg-background pr-8 text-sm text-foreground"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              %
                            </span>
                          </div>
                          {itemErrors.some((e) => e.includes('Tax')) && (
                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Tax % is required</p>
                          )}
                        </div>

                        <div>
                          <Label className="mb-1.5 block text-xs text-muted-foreground">
                            Item Lead Time <span className="text-muted-foreground/70">(optional)</span>
                          </Label>
                          <Input
                            type="text"
                            value={item.leadTime}
                            onChange={(e) => updateItem(index, 'leadTime', e.target.value)}
                            placeholder="e.g., 30 days"
                            className="h-10 border-border bg-background text-sm text-foreground"
                          />
                        </div>
                      </div>

                      <div className="border-t border-border pt-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="ml-2 font-semibold tabular-nums text-foreground">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tax:</span>
                            <span className="ml-2 font-semibold tabular-nums text-foreground">
                              {formatCurrency(item.taxAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <span className="ml-2 font-semibold tabular-nums text-primary">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && <div className="h-4" />}
                  </div>
                )
              })}
              </fieldset>
            </CardContent>
          </Card>

          {/* Attachments - Drag & Drop */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <Upload className="h-5 w-5 text-muted-foreground" aria-hidden />
                Attachments
              </CardTitle>
              <CardDescription>Drop compliance certificates, price sheets, etc.</CardDescription>
            </CardHeader>
            <CardContent>
              <fieldset disabled={quoteFormLocked} className="min-w-0 border-0 p-0 disabled:opacity-90">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border/80 bg-muted/30 dark:bg-muted/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden />
                <p className="mb-2 text-sm text-muted-foreground">
                  Drag and drop files here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-medium text-primary underline-offset-2 hover:text-primary/90 hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, XLS, XLSX (max 10MB per file)</p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/25 p-3 dark:bg-muted/15"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <span className="text-sm text-foreground">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              </fieldset>
            </CardContent>
          </Card>

          {/* Message to Admin */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-foreground">Message to Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <fieldset disabled={quoteFormLocked} className="min-w-0 border-0 p-0 disabled:opacity-90">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a brief message to the admin about this quotation (optional)..."
                rows={4}
                className="text-sm"
              />
              </fieldset>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Smart Summary Panel (Sticky) */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <DollarSign className="h-5 w-5 text-muted-foreground" aria-hidden />
                  Quote Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium tabular-nums text-foreground">{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium tabular-nums text-foreground">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-medium tabular-nums text-foreground">{formatCurrency(totals.taxTotal)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3">
                    <span className="font-semibold text-foreground">Grand Total:</span>
                    <span className="text-xl font-bold tabular-nums text-primary">{formatCurrency(totals.grandTotal)}</span>
                  </div>
                </div>

                {averageLeadTime && (
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Average Lead Time:</span>
                      <span className="font-medium tabular-nums text-foreground">{averageLeadTime} days</span>
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-semibold text-foreground">Completion Status:</p>
                  <div className="space-y-1.5">
                    {getValidationStatus.incompleteItems === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        Items priced
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {getValidationStatus.incompleteItems} item{getValidationStatus.incompleteItems > 1 ? 's' : ''} incomplete
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RFQ History */}
            <RFQHistory rfqId={rfq?.id} />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleSaveDraft}
                disabled={saving || quoteFormLocked}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              <Button
                className="h-11 w-full"
                onClick={handleSubmitClick}
                disabled={submitting || !getValidationStatus.isValid || quoteFormLocked}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isResubmit ? 'Resubmitting...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isResubmit ? 'Resubmit quotation' : 'Submit Quote'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Quote Submission</DialogTitle>
            <DialogDescription>
              You are about to submit this quote. After submission, your response is locked for this RFQ until the admin
              returns it for revision (if needed).
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grand Total:</span>
                  <span className="font-semibold tabular-nums text-foreground">{formatCurrency(totals.grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-semibold tabular-nums text-foreground">{items.length}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSubmit}>Confirm & Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
