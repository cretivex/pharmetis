import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRFQResponses, sendQuotationToBuyer, sendNegotiationToSupplier, updateRFQResponse, reviewQuotation } from '@/services/quotations.service'
import { getRFQById } from '@/services/rfq.service'
import {
  Building2,
  DollarSign,
  Clock,
  Eye,
  Send,
  X,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Percent,
  Calculator,
  Package,
  TrendingDown,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'

export default function Quotations() {
  const { rfqId } = useParams()
  const navigate = useNavigate()
  const [selectedQuoteId, setSelectedQuoteId] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerQuote, setDrawerQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rfq, setRfq] = useState(null)
  const [quotations, setQuotations] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [editedItems, setEditedItems] = useState([])
  const [marginPercent, setMarginPercent] = useState(0)
  const [adminNotes, setAdminNotes] = useState('')
  const [confirmApproveSend, setConfirmApproveSend] = useState(false)
  const [confirmRevision, setConfirmRevision] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all') // all | SENT_TO_BUYER | NEGOTIATION_REQUESTED | ACCEPTED | REJECTED
  const toast = useToast()

  useEffect(() => {
    loadData()
  }, [rfqId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (rfqId) {
        const [rfqData, responsesData] = await Promise.all([
          getRFQById(rfqId),
          getRFQResponses(rfqId)
        ])
        setRfq(rfqData)
        setQuotations(responsesData || [])
      } else {
        const responsesData = await getRFQResponses()
        setQuotations(responsesData || [])
        if (responsesData && responsesData.length > 0 && responsesData[0].rfq) {
          setRfq(responsesData[0].rfq)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quotations')
    } finally {
      setLoading(false)
    }
  }

  const transformQuotation = (response) => {
    const supplier = response.supplier || {}
    const items = response.items || []
    const totalPrice = response.totalAmount ? parseFloat(response.totalAmount.toString()) : 0
    const adminFinalPrice = response.adminFinalPrice ? parseFloat(response.adminFinalPrice.toString()) : totalPrice
    const originalPrice = totalPrice
    const requestedPrice = response.buyerRequestedPrice != null ? parseFloat(response.buyerRequestedPrice.toString()) : null

    const rfqCreated = response.rfq?.createdAt ? new Date(response.rfq.createdAt) : new Date()
    const responseCreated = response.createdAt ? new Date(response.createdAt) : new Date()
    const responseTimeMs = responseCreated - rfqCreated
    const responseTimeHours = (responseTimeMs / (1000 * 60 * 60)).toFixed(1)

    const leadTimeDays = items[0]?.leadTime ? parseInt(items[0].leadTime) : null

    return {
      id: response.id,
      supplier: {
        id: supplier.id,
        name: supplier.companyName || 'Unknown Supplier',
      },
      totalPrice,
      adminFinalPrice,
      originalPrice,
      requestedPrice,
      currency: response.currency || 'USD',
      leadTime: leadTimeDays ? `${leadTimeDays} days` : 'N/A',
      leadTimeDays,
      responseTime: `${responseTimeHours}h`,
      status: response.status || 'SUBMITTED',
      items: items.map(item => ({
        id: item.id,
        product: item.productName,
        price: item.totalPrice ? parseFloat(item.totalPrice.toString()) : 0,
        unitPrice: item.unitPrice ? parseFloat(item.unitPrice.toString()) : 0,
        qty: item.quantity || 0,
        leadTime: item.leadTime || null
      })),
      notes: response.notes || '',
      rfqId: response.rfqId,
      raw: response
    }
  }

  const transformedQuotations = quotations.map(transformQuotation)
  // Accepted tab shows BUYER_ACCEPTED and CONFIRMED (buyer accepted = BUYER_ACCEPTED in DB)
  const displayedQuotations = statusFilter === 'all'
    ? transformedQuotations
    : statusFilter === 'BUYER_ACCEPTED'
      ? transformedQuotations.filter(q => q.status === 'BUYER_ACCEPTED' || q.status === 'CONFIRMED')
      : transformedQuotations.filter(q => q.status === statusFilter)
  const lowestPrice = displayedQuotations.length > 0
    ? Math.min(...displayedQuotations.map(q => q.totalPrice))
    : 0
  const fastestDelivery = displayedQuotations.length > 0
    ? Math.min(...displayedQuotations.map(q => q.leadTimeDays || Infinity))
    : Infinity

  const handleSendNegotiationToSupplier = async (quotationId) => {
    try {
      setActionLoading('send-negotiation-' + quotationId)
      setErrorMessage(null)
      await sendNegotiationToSupplier(quotationId)
      if (window.refreshSidebarCounts) window.refreshSidebarCounts()
      toast.success('Negotiation sent to supplier')
      await loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send negotiation to supplier')
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewDetails = (quote) => {
    setDrawerQuote(quote)
    setEditedItems(quote.items.map(item => ({
      ...item,
      originalUnitPrice: item.unitPrice,
      editedUnitPrice: item.unitPrice,
      margin: 0,
      finalUnitPrice: item.unitPrice,
      finalTotalPrice: item.price
    })))
    setAdminNotes(quote.raw.adminNotes || '')
    setMarginPercent(0)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setDrawerQuote(null)
    setEditedItems([])
    setMarginPercent(0)
    setAdminNotes('')
  }

  const updateItemPrice = (index, price) => {
    if (drawerQuote?.status === 'SENT_TO_BUYER') return
    const updated = [...editedItems]
    const editPrice = parseFloat(price) || 0
    updated[index] = {
      ...updated[index],
      editedUnitPrice: editPrice
    }
    recalculateItem(updated[index])
    setEditedItems(updated)
  }

  const updateMargin = (index, margin) => {
    if (drawerQuote?.status === 'SENT_TO_BUYER') return
    const updated = [...editedItems]
    const marginValue = parseFloat(margin) || 0
    updated[index] = {
      ...updated[index],
      margin: marginValue
    }
    recalculateItem(updated[index])
    setEditedItems(updated)
  }

  const recalculateItem = (item) => {
    const editPrice = item.editedUnitPrice || item.originalUnitPrice
    const margin = parseFloat(item.margin) || 0
    item.finalUnitPrice = editPrice * (1 + margin / 100)
    const quantity = parseFloat(item.qty) || 1
    item.finalTotalPrice = item.finalUnitPrice * quantity
  }

  const applyGlobalMargin = () => {
    if (!marginPercent || marginPercent === 0) {
      return
    }
    const updated = editedItems.map(item => {
      const editPrice = item.editedUnitPrice || item.originalUnitPrice
      const margin = parseFloat(marginPercent) || 0
      const finalUnitPrice = editPrice * (1 + margin / 100)
      const quantity = parseFloat(item.qty) || 1
      const finalTotalPrice = finalUnitPrice * quantity
      return {
        ...item,
        margin: marginPercent,
        finalUnitPrice: finalUnitPrice,
        finalTotalPrice: finalTotalPrice
      }
    })
    setEditedItems(updated)
  }

  const calculateFinalTotal = () => {
    return editedItems.reduce((sum, item) => sum + (item.finalTotalPrice || 0), 0)
  }

  const handleRequestRevision = async () => {
    try {
      setActionLoading('revision')
      setErrorMessage(null)
      await reviewQuotation(drawerQuote.id, 'REJECT', adminNotes || 'Please revise your quotation')
      if (window.refreshSidebarCounts) window.refreshSidebarCounts()
      toast.success('Revision requested successfully')
      await loadData()
      closeDrawer()
      setConfirmRevision(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request revision')
    } finally {
      setActionLoading(null)
    }
  }

  const handleApproveAndSend = async () => {
    try {
      setActionLoading('approve-send')
      setErrorMessage(null)
      
      const finalTotal = calculateFinalTotal()
      const editedData = {
        items: editedItems.map(item => ({
          productId: item.productId,
          productName: item.productName || item.product,
          quantity: item.quantity || item.qty,
          unit: item.unit,
          finalUnitPrice: item.finalUnitPrice,
          finalTotalPrice: item.finalTotalPrice,
          leadTime: item.leadTime,
          notes: item.notes
        })),
        totalAmount: finalTotal,
        marginPercent: marginPercent || 0,
        currency: drawerQuote.currency || 'USD',
        validity: drawerQuote.validity,
        notes: drawerQuote.notes,
        adminNotes: adminNotes
      }
      
      // First approve the quotation if not already approved
      if (drawerQuote.status !== 'ACCEPTED' && drawerQuote.status !== 'SENT_TO_BUYER') {
        await reviewQuotation(drawerQuote.id, 'APPROVE', adminNotes)
        // Refresh sidebar counts
        if (window.refreshSidebarCounts) {
          window.refreshSidebarCounts()
        }
      }
      
      // Then send to buyer
      await sendQuotationToBuyer(drawerQuote.id, editedData)
      // Refresh sidebar counts
      if (window.refreshSidebarCounts) {
        window.refreshSidebarCounts()
      }
      
      toast.success('Quotation approved and sent to buyer successfully')
      await loadData()
      closeDrawer()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve and send quotation')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSendToBuyer = async () => {
    if (!selectedQuoteId) {
      setErrorMessage('Please select a quotation first')
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }
    
    const quote = transformedQuotations.find(q => q.id === selectedQuoteId)
    if (!quote) return
    
    handleViewDetails(quote)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      case 'ACCEPTED':
      case 'SENT_TO_BUYER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'NEGOTIATION_REQUESTED':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'NEGOTIATION_SENT_TO_SUPPLIER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'SUPPLIER_COUNTER_OFFER':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'REVISION_REQUESTED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'REJECTED':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusLabel = (status) => {
    if (status === 'REVISION_REQUESTED') return 'Revision Requested'
    if (status === 'NEGOTIATION_REQUESTED') return 'Negotiation Requested'
    if (status === 'NEGOTIATION_SENT_TO_SUPPLIER') return 'Negotiation Sent to Supplier'
    if (status === 'SUPPLIER_COUNTER_OFFER') return 'Supplier Counter Offer'
    return status?.replace(/_/g, ' ') || status
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-slate-400">Loading quotations...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  if (transformedQuotations.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No quotations found</p>
          {rfqId && (
            <Button onClick={() => navigate('/rfq')} className="mt-4">
              Back to RFQs
            </Button>
          )}
        </div>
      </div>
    )
  }

  const selectedQuote = transformedQuotations.find(q => q.id === selectedQuoteId)

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="p-6">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div className="text-sm text-emerald-300 flex-1">{successMessage}</div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-400 hover:text-emerald-300" onClick={() => setSuccessMessage(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="text-sm text-red-300 flex-1">{errorMessage}</div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={() => setErrorMessage(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Quotation Comparison</h1>
            <p className="text-sm text-slate-400 mt-2">Compare supplier quotes and select the best option</p>
          </div>
          <div className="flex items-center gap-4">
            {selectedQuote && (
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">Selected Supplier</div>
                <div className="text-sm font-semibold text-slate-200">{selectedQuote.supplier.name}</div>
              </div>
            )}
            <Button
              onClick={handleSendToBuyer}
              disabled={!selectedQuoteId}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Send to Buyer
            </Button>
          </div>
        </div>

        {/* Filter Tabs: All, Sent to Buyer, Negotiations, Approved, Rejected */}
        <div className="mb-6 flex gap-2 border-b border-slate-800">
          {[
            { id: 'all', label: 'All' },
            { id: 'SENT_TO_BUYER', label: 'Sent to Buyer' },
            { id: 'NEGOTIATION_REQUESTED', label: 'Negotiations' },
            { id: 'BUYER_ACCEPTED', label: 'Accepted' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                statusFilter === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Comparison Table Card */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#1e293b] border-b border-slate-800 hover:bg-[#1e293b]">
                <TableHead className="w-12 text-slate-300"></TableHead>
                <TableHead className="text-slate-300">Supplier Name</TableHead>
                <TableHead className="text-right text-slate-300">Original Price</TableHead>
                <TableHead className="text-right text-slate-300">Buyer Requested Price</TableHead>
                <TableHead className="text-center text-slate-300">Lead Time</TableHead>
                <TableHead className="text-center text-slate-300">Status</TableHead>
                <TableHead className="text-center text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedQuotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    No quotations match this filter.
                  </TableCell>
                </TableRow>
              ) : displayedQuotations.map((quote) => {
                const isLowestPrice = quote.totalPrice === lowestPrice
                const isFastestDelivery = quote.leadTimeDays === fastestDelivery
                const isSelected = quote.id === selectedQuoteId
                
                return (
                  <TableRow
                    key={quote.id}
                    className={`cursor-pointer border-b border-slate-800/50 ${
                      isSelected 
                        ? 'bg-indigo-500/10 hover:bg-indigo-500/15' 
                        : isLowestPrice 
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10' 
                        : 'hover:bg-slate-800/30'
                    }`}
                    onClick={() => setSelectedQuoteId(quote.id)}
                  >
                    <TableCell className="text-slate-300">
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedQuoteId(quote.id)}
                        className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-700 focus:ring-indigo-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-200">{quote.supplier.name}</span>
                        {isLowestPrice && (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Best Price
                          </Badge>
                        )}
                        {isFastestDelivery && (
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Fastest Delivery
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold text-slate-100">
                        {quote.currency} {quote.originalPrice != null ? quote.originalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-slate-300">
                        {quote.requestedPrice != null ? `${quote.currency} ${quote.requestedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm text-slate-300">{quote.leadTime}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusBadgeClass(quote.status)}>
                        {getStatusLabel(quote.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {quote.status === 'NEGOTIATION_REQUESTED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                            disabled={actionLoading === 'send-negotiation-' + quote.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSendNegotiationToSupplier(quote.id)
                            }}
                          >
                            {actionLoading === 'send-negotiation-' + quote.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-1" />
                                Send to Supplier
                              </>
                            )}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(quote)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Right Side Drawer */}
      {drawerOpen && drawerQuote && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={closeDrawer}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#111827] border-l border-slate-800 shadow-xl z-50 overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#1e293b]">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Quotation Details</h2>
                <p className="text-sm text-slate-400 mt-1">{drawerQuote.supplier.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeDrawer} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Margin Control */}
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="global-margin" className="text-slate-300">Global Margin (%)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="global-margin"
                        type="number"
                        value={marginPercent}
                        onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                        className="w-32 bg-slate-900 border-slate-700 text-slate-100"
                        disabled={drawerQuote?.status === 'SENT_TO_BUYER'}
                      />
                      <Button 
                        onClick={applyGlobalMargin} 
                        size="sm" 
                        variant="outline" 
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        disabled={drawerQuote?.status === 'SENT_TO_BUYER'}
                      >
                        <Calculator className="w-4 h-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Items</h3>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#1e293b] border-slate-800">
                        <TableHead className="text-slate-300">Product</TableHead>
                        <TableHead className="text-right text-slate-300">Qty</TableHead>
                        <TableHead className="text-right text-slate-300">Unit Price</TableHead>
                        <TableHead className="text-right text-slate-300">Margin %</TableHead>
                        <TableHead className="text-right text-slate-300">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedItems.map((item, index) => (
                        <TableRow key={item.id || index} className="border-slate-800 hover:bg-slate-800/30">
                          <TableCell className="font-medium text-slate-200">{item.product}</TableCell>
                          <TableCell className="text-right text-slate-300">{item.qty}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={item.editedUnitPrice}
                              onChange={(e) => updateItemPrice(index, e.target.value)}
                              className="w-24 ml-auto bg-slate-900 border-slate-700 text-slate-100"
                              disabled={drawerQuote?.status === 'SENT_TO_BUYER'}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              value={item.margin}
                              onChange={(e) => updateMargin(index, e.target.value)}
                              className="w-20 ml-auto bg-slate-900 border-slate-700 text-slate-100"
                              disabled={drawerQuote?.status === 'SENT_TO_BUYER'}
                            />
                          </TableCell>
                          <TableCell className="text-right font-semibold text-slate-100">
                            {item.finalTotalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-slate-400 mb-1">Final Total</div>
                    <div className="text-2xl font-bold text-slate-100">
                      {drawerQuote.currency} {calculateFinalTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes" className="text-slate-300">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-2 bg-slate-900 border-slate-700 text-slate-100"
                  rows={4}
                  placeholder="Add notes for this quotation..."
                  disabled={drawerQuote?.status === 'SENT_TO_BUYER'}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <Button
                  variant="outline"
                  onClick={() => setConfirmRevision(true)}
                  disabled={actionLoading !== null}
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  {actionLoading === 'revision' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  )}
                  Request Revision
                </Button>
                <Button
                  onClick={() => setConfirmApproveSend(true)}
                  disabled={actionLoading !== null}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white"
                >
                  {actionLoading === 'approve-send' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Approve & Send to Buyer
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmApproveSend}
        onOpenChange={setConfirmApproveSend}
        title="Approve & send to buyer"
        message="Approve this quotation and send it to the buyer? They will be able to accept or decline."
        confirmLabel="Approve & Send"
        variant="default"
        onConfirm={handleApproveAndSend}
      />
      <ConfirmModal
        open={confirmRevision}
        onOpenChange={setConfirmRevision}
        title="Request revision"
        message="Request revision from supplier? They will need to resubmit the quotation."
        confirmLabel="Request revision"
        variant="default"
        onConfirm={handleRequestRevision}
      />
    </div>
  )
}
