import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, CheckCircle2, XCircle, Eye, Calendar, X, Package, MapPin, Mail, Phone, MessageSquare, DollarSign, CreditCard, Loader2 } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Container from '../components/ui/Container'
import Button from '../components/ui/Button'
import Loading from '../components/ui/Loading'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { rfqService } from '../services/rfq.service.js'
import { authService } from '../services/auth.service.js'
import { RFQHistory } from '../components/RFQHistory.jsx'
import RequestPriceModal from '../components/RequestPriceModal.jsx'
import { useCurrency } from '../contexts/CurrencyContext'
import { transformRFQ } from '../utils/dataTransform.js'

function MyRFQs() {
  const location = useLocation()
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState('All')
  const [rfqs, setRfqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRFQ, setSelectedRFQ] = useState(null)
  const [rfqDetails, setRfqDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };
  const [processingPayment, setProcessingPayment] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [success, setSuccess] = useState(null)
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    loadRFQs()
      
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get('payment') === 'success') {
      const rfqId = searchParams.get('rfqId')
      if (rfqId) {
        setSuccess('Payment completed successfully! Your order is now being processed.')
        setTimeout(() => {
          setSuccess(null)
          navigate('/my-rfqs', { replace: true })
        }, 5000)
      }
    }
  }, [filterStatus, location.search, navigate])

  const loadRFQs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Map display status to backend status
      const statusMap = {
        'All': undefined,
        'Open': 'OPEN',
        'Pending': 'SENT',
        'Quoted': 'QUOTED',
        'Negotiation': 'NEGOTIATION',
        'Confirmed': 'CONFIRMED',
        // For "Accepted", we want to keep showing the RFQ through the whole
        // buyer flow (awaiting payment, in progress, shipped, completed),
        // so we don't filter by a single backend status here. We'll do
        // client-side filtering for that tab instead.
        'Accepted': undefined,
        'In Progress': 'IN_PROGRESS',
        'Shipped': 'SHIPPED',
        'Completed': 'COMPLETED',
        'Rejected': 'REJECTED',
        'Expired': 'EXPIRED',
        'Cancelled': 'CANCELLED'
      }
      
      const filters = {
        status: statusMap[filterStatus],
        page: 1,
        limit: 100
      }
      
      const result = await rfqService.getAll(filters)
      
      if (!Array.isArray(result)) {
        setRfqs([])
        return
      }
      
      const transformed = result.map(transformRFQ)
      setRfqs(transformed)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load RFQs')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (rfq) => {
    setSelectedRFQ(rfq)
    setRfqDetails(null)
    setLoadingDetails(true)
    setError(null)
    
    try {
      const details = await rfqService.getById(rfq.id)
      
      if (!details || !details.id) {
        setError('RFQ not found')
        setRfqDetails(null)
        return
      }
      
      setRfqDetails(details)
      setError(null)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load RFQ details'
      setError(errorMessage)
      setRfqDetails(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCloseModal = () => {
    setSelectedRFQ(null)
    setRfqDetails(null)
    setSuccess(null)
  }

  const handlePayment = async (paymentType, amount = null) => {
    if (!rfqDetails || !selectedRFQ) return
    if (processingPayment) return

    try {
      setProcessingPayment(true)
      setError(null)

      const paymentData = {
        paymentType,
        ...(amount && { amount: parseFloat(amount) })
      }

      const result = await rfqService.processPayment(selectedRFQ.id, paymentData)

      setSuccess(`Payment processed successfully! ${paymentType === 'FULL' ? 'Full payment completed.' : `Advance payment of ${amount} processed.`}`)
      await handleViewDetails(selectedRFQ)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process payment'
      setError(errorMessage)
      
      if (err.response?.status === 400) {
        setProcessingPayment(false)
        return
      }
    } finally {
      setProcessingPayment(false)
    }
  }

  const handleApproveQuotation = async () => {
    if (!rfqDetails?.selectedQuotation?.id) return
    if (!window.confirm('Are you sure you want to accept this quotation?')) return

    try {
      setProcessingAction(true)
      setError(null)
      await rfqService.acceptQuotation(rfqDetails.selectedQuotation.id)
      setSelectedRFQ(null)
      setRfqDetails(null)
      setShowAcceptConfirmation(true)
      await loadRFQs()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to accept quotation')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRejectQuotation = async () => {
    if (!rfqDetails?.selectedQuotation?.id) return
    if (!window.confirm('Are you sure you want to reject this quotation?')) return

    try {
      setProcessingAction(true)
      setError(null)
      await rfqService.rejectQuotation(rfqDetails.selectedQuotation.id)
      setSelectedRFQ(null)
      setRfqDetails(null)
      setSuccess('Quotation rejected successfully!')
      await loadRFQs()
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reject quotation')
    } finally {
      setProcessingAction(false)
    }
  }

  const handleRequestLowerPrice = async (requestedPrice, message = null) => {
    const quotationId = rfqDetails?.selectedQuotation?.id
    if (!quotationId) return
    try {
      setProcessingAction(true)
      setError(null)
      setIsPriceModalOpen(false)
      await rfqService.requestLowerPrice(quotationId, {
        requestedPrice: Number(requestedPrice),
        message: message ?? null
      })
      setSelectedRFQ(null)
      setRfqDetails(null)
      setSuccess('Price negotiation requested. Waiting for supplier response.')
      await loadRFQs()
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request lower price')
    } finally {
      setProcessingAction(false)
    }
  }

  // Map backend status to display status
  const getDisplayStatus = (status) => {
    const statusMap = {
      'DRAFT': 'Draft',
      'OPEN': 'Open',
      'SENT': 'Pending',
      'RESPONDED': 'Quoted',
      'QUOTED': 'Quoted',
      'NEGOTIATION': 'Negotiation',
      'CONFIRMED': 'Confirmed',
      'AWAITING_PAYMENT': 'Awaiting Payment',
      'QUOTATION_ACCEPTED': 'Quotation Accepted',
      'IN_PROGRESS': 'In Progress',
      'SHIPPED': 'Shipped',
      'COMPLETED': 'Completed',
      'ACCEPTED': 'Accepted',
      'REJECTED': 'Rejected',
      'EXPIRED': 'Expired',
      'CANCELLED': 'Cancelled'
    }
    return statusMap[status] || status
  }

  const getStatusIcon = (status) => {
    const displayStatus = getDisplayStatus(status)
    switch (displayStatus) {
      case 'Draft':
      case 'Pending':
        return <Clock className="w-4 h-4 text-amber-500" />
      case 'Quoted':
      case 'RESPONDED':
        return <FileText className="w-4 h-4 text-blue-500" />
      case 'Accepted':
      case 'Quotation Accepted':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'Rejected':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'Expired':
        return <XCircle className="w-4 h-4 text-slate-500" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status)
    switch (displayStatus) {
      case 'Draft':
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Quoted':
      case 'RESPONDED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Awaiting Payment':
      case 'Quotation Accepted':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Expired':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  // Filter RFQs based on selected status
  const filteredRFQs = filterStatus === 'All'
    ? rfqs
    : rfqs.filter((rfq) => {
        // For the "Accepted" tab, keep showing the RFQ through the whole
        // post-acceptance flow so it doesn't disappear when payment/order
        // is in progress or completed.
        if (filterStatus === 'Accepted') {
          const acceptedFlowStatuses = [
            'AWAITING_PAYMENT',
            'QUOTATION_ACCEPTED',
            'IN_PROGRESS',
            'SHIPPED',
            'COMPLETED',
            'ACCEPTED'
          ]
          return acceptedFlowStatuses.includes(rfq.status)
        }

        const displayStatus = getDisplayStatus(rfq.status)
        return displayStatus.toLowerCase() === filterStatus.toLowerCase()
      })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 pb-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
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
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">My RFQs</h1>
                <p className="text-slate-600">Track and manage your Request for Quotations</p>
              </div>
            </div>
            {location.state?.submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl shadow-sm"
              >
                <p className="text-sm text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  RFQ submitted successfully! You will receive quotes from suppliers soon.
                </p>
              </motion.div>
            )}

            {/* Quotation action response – shown after Accept / Reject / Request Lower Price (modal is closed) */}
            {success && !selectedRFQ && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <p className="text-sm font-medium text-emerald-900">{success}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 flex flex-wrap gap-2"
          >
            {['All', 'Pending', 'Quoted', 'Accepted', 'Rejected', 'Expired'].map((status) => (
              <motion.button
                key={status}
                onClick={() => setFilterStatus(status)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-blue-50 border border-blue-200 shadow-sm'
                }`}
              >
                {status}
              </motion.button>
            ))}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="rounded-xl border border-blue-200 bg-white py-16">
              <Loading message="Loading RFQs..." />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="rounded-xl border border-blue-200 bg-white py-16">
              <ErrorState message={error} onRetry={loadRFQs} retry="Retry" />
            </div>
          )}

          {/* RFQs List */}
          {!loading && !error && filteredRFQs.length > 0 && (
            <div className="space-y-4">
              {filteredRFQs.map((rfq, index) => {
                // Get first item for display (or combine all items)
                const firstItem = rfq.items?.[0]
                const allItems = rfq.items || []
                const totalQuantity = allItems.reduce((sum, item) => {
                  const qty = parseInt(item.quantity) || 0
                  return sum + qty
                }, 0)
                const displayStatus = getDisplayStatus(rfq.status)
                
                return (
                  <motion.div
                    key={rfq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100/50 p-6 shadow-lg shadow-blue-100/50 hover:shadow-xl hover:shadow-blue-200/50 transition-all hover:-translate-y-1"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            {getStatusIcon(rfq.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {rfq.title || `RFQ - ${allItems.length} product(s)`}
                              </h3>
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  rfq.status
                                )}`}
                              >
                                {getStatusIcon(rfq.status)}
                                {displayStatus}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                              <span className="font-medium text-slate-900 mr-1">RFQ #{rfq.rfqNumber}</span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{rfq.submittedDate}</span>
                              </span>
                              {firstItem && (
                                <span>
                                  {allItems.length > 1 
                                    ? `${allItems.length} products • ${totalQuantity.toLocaleString()} total ${firstItem.unit || 'units'}`
                                    : `Quantity: ${firstItem.quantity} ${firstItem.unit || 'units'}`
                                  }
                                </span>
                              )}
                              <span className="text-blue-700 font-medium">
                                {rfq.responses || 0} {rfq.responses === 1 ? 'Response' : 'Responses'}
                              </span>
                              {rfq.hasAcceptedQuotation && (
                                <span className="text-emerald-700 font-medium flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  {rfq.acceptedResponses || 1} Accepted
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex items-center gap-2"
                          onClick={() => handleViewDetails(rfq)}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredRFQs.length === 0 && (
            <div className="rounded-xl border border-blue-200 bg-white py-16">
              <EmptyState
                icon={FileText}
                title="No RFQs found"
                description={
                  filterStatus === 'All'
                    ? "You haven't submitted any RFQs yet"
                    : `No RFQs with status "${filterStatus}"`
                }
                actionLabel="Create New RFQ"
                onAction={() => navigate('/send-rfq')}
              />
            </div>
          )}
        </motion.div>
      </Container>

      {/* RFQ Details Modal */}
      <AnimatePresence>
        {selectedRFQ && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-700/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-blue-100 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">RFQ Details</h2>
                  <p className="text-sm text-slate-600 mt-1">RFQ #{selectedRFQ.rfqNumber}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {loadingDetails ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading RFQ details...</p>
                  </div>
                ) : rfqDetails ? (
                  <div className="space-y-6">
                    {/* RFQ Overview */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {rfqDetails.title || 'Untitled RFQ'}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Submitted: {formatDate(rfqDetails.createdAt)}
                            </span>
                            {rfqDetails.expiresAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Expires: {formatDate(rfqDetails.expiresAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                            rfqDetails.status
                          )}`}
                        >
                          {getStatusIcon(rfqDetails.status)}
                          {getDisplayStatus(rfqDetails.status)}
                        </span>
                      </div>
                    </div>

                    {/* RFQ History */}
                    <div>
                      <RFQHistory rfqId={rfqDetails.id} />
                    </div>

                    {/* Payment Section */}
                    {rfqDetails.status === 'AWAITING_PAYMENT' && (
                      <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-6 h-6 text-amber-700" />
                          <h4 className="text-xl font-semibold text-amber-900">Payment Required</h4>
                        </div>
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                              <p className="font-semibold text-slate-900 text-lg">
                                {formatPrice(rfqDetails.totalAmount, rfqDetails.selectedQuotation?.currency)}
                              </p>
                            </div>
                            {rfqDetails.paymentStatus === 'PARTIAL' && (
                              <>
                                <div>
                                  <p className="text-sm text-slate-600 mb-1">Paid Amount</p>
                                  <p className="font-semibold text-emerald-700 text-lg">
                                    {formatPrice(rfqDetails.paidAmount, rfqDetails.selectedQuotation?.currency)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-600 mb-1">Remaining Balance</p>
                                  <p className="font-semibold text-amber-700 text-lg">
                                    {formatPrice(rfqDetails.remainingAmount, rfqDetails.selectedQuotation?.currency)}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              variant="primary"
                              onClick={() => handlePayment('FULL')}
                              disabled={processingPayment}
                              className="flex items-center gap-2"
                            >
                              {processingPayment ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4" />
                                  Pay Full Amount
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                const advanceAmount = rfqDetails.totalAmount ? (parseFloat(rfqDetails.totalAmount) * 0.3).toFixed(2) : 0
                                handlePayment('ADVANCE', advanceAmount)
                              }}
                              disabled={processingPayment}
                              className="flex items-center gap-2"
                            >
                              {processingPayment ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <DollarSign className="w-4 h-4" />
                                  Pay 30% Advance
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quotation accepted – agent will contact (no payment required) */}
                    {rfqDetails.status === 'QUOTATION_ACCEPTED' && (
                      <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-6 h-6 text-green-700" />
                          <h4 className="text-xl font-semibold text-green-900">Quotation accepted</h4>
                        </div>
                        <p className="text-green-800">
                          Our agent will contact you within 24 hours to finalize the order.
                        </p>
                      </div>
                    )}

                    {/* Payment Status */}
                    {rfqDetails.paymentStatus === 'PARTIAL' && rfqDetails.status !== 'AWAITING_PAYMENT' && rfqDetails.status !== 'QUOTATION_ACCEPTED' && (
                      <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-6 h-6 text-blue-700" />
                          <h4 className="text-xl font-semibold text-blue-900">Payment Status: Partial</h4>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                              <p className="font-semibold text-slate-900">
                                {formatPrice(rfqDetails.totalAmount, rfqDetails.selectedQuotation?.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Paid Amount</p>
                              <p className="font-semibold text-emerald-700">
                                {formatPrice(rfqDetails.paidAmount, rfqDetails.selectedQuotation?.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Remaining Balance</p>
                              <p className="font-semibold text-amber-700">
                                {formatPrice(rfqDetails.remainingAmount, rfqDetails.selectedQuotation?.currency)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            onClick={() => handlePayment('REMAINING')}
                            disabled={processingPayment}
                            className="mt-4 flex items-center gap-2"
                          >
                            {processingPayment ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                Pay Remaining Balance
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {rfqDetails.paymentStatus === 'PAID' && (
                      <div className="mb-6 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                          <h4 className="text-lg font-semibold text-emerald-900">Payment Completed</h4>
                        </div>
                        <p className="text-sm text-emerald-700 mt-2">
                          Full payment of {formatPrice(rfqDetails.totalAmount, rfqDetails.selectedQuotation?.currency)} has been processed.
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {success && (
                      <div className="mb-6 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                          <p className="text-sm font-medium text-emerald-900">{success}</p>
                        </div>
                      </div>
                    )}

                    {/* Approved Quotation */}
                    {rfqDetails.selectedQuotation && (
                      <div className="mb-6 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                          <h4 className="text-xl font-semibold text-emerald-900">Approved Quotation</h4>
                        </div>
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Supplier</p>
                              <p className="font-semibold text-slate-900">
                                {rfqDetails.selectedQuotation.supplier?.companyName || 'N/A'}
                              </p>
                              {rfqDetails.selectedQuotation.supplier?.country && (
                                <p className="text-sm text-slate-600">
                                  {rfqDetails.selectedQuotation.supplier.country}
                                  {rfqDetails.selectedQuotation.supplier.city && `, ${rfqDetails.selectedQuotation.supplier.city}`}
                                </p>
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                              <p className="font-semibold text-emerald-700 text-lg">
                                {formatPrice(rfqDetails.selectedQuotation.finalPrice, rfqDetails.selectedQuotation?.currency)}
                              </p>
                            </div>
                            {rfqDetails.selectedQuotation.validity && (
                              <div>
                                <p className="text-sm text-slate-600 mb-1">Validity</p>
                                <p className="font-medium text-slate-900">
                                  {formatDate(rfqDetails.selectedQuotation.validity)}
                                </p>
                              </div>
                            )}
                            {rfqDetails.selectedQuotation.createdAt && (
                              <div>
                                <p className="text-sm text-slate-600 mb-1">Submitted</p>
                                <p className="font-medium text-slate-900">
                                  {formatDate(rfqDetails.selectedQuotation.createdAt)}
                                </p>
                              </div>
                            )}
                          </div>
                          {rfqDetails.selectedQuotation.notes && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-sm text-slate-600 mb-1">Notes</p>
                              <p className="text-slate-700 whitespace-pre-wrap">{rfqDetails.selectedQuotation.notes}</p>
                            </div>
                          )}
                          {/* Approve/Reject/Request Lower Price – hide when negotiation already requested */}
                          {rfqDetails.selectedQuotation.status === 'SENT_TO_BUYER' && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-sm text-slate-600 mb-3">Review the quotation and proceed with approval to make payment.</p>
                              <div className="flex flex-wrap gap-3">
                                <Button
                                  type="button"
                                  variant="primary"
                                  onClick={handleApproveQuotation}
                                  disabled={processingAction}
                                  className="flex items-center gap-2"
                                >
                                  {processingAction ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      Accept Quotation
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={handleRejectQuotation}
                                  disabled={processingAction}
                                  className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  {processingAction ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4" />
                                      Reject Quotation
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsPriceModalOpen(true)}
                                  disabled={processingAction}
                                  className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                                >
                                  <DollarSign className="w-4 h-4" />
                                  Request Lower Price
                                </Button>
                              </div>
                            </div>
                          )}
                          {rfqDetails.selectedQuotation.status === 'BUYER_ACCEPTED' && rfqDetails.status !== 'AWAITING_PAYMENT' && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="font-medium">Quotation accepted. Please proceed with payment below.</p>
                              </div>
                            </div>
                          )}
                          {rfqDetails.selectedQuotation.status === 'BUYER_ACCEPTED' && rfqDetails.status === 'AWAITING_PAYMENT' && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="font-medium">Quotation accepted. Please proceed with payment in the Payment section below.</p>
                              </div>
                            </div>
                          )}
                          {rfqDetails.selectedQuotation.status === 'NEGOTIATION_REQUESTED' && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-amber-700 rounded-lg bg-amber-50 border border-amber-200 p-3">
                                <DollarSign className="w-5 h-5 shrink-0" />
                                <div>
                                  <p className="font-medium">Price negotiation requested. Waiting for supplier response.</p>
                                  {rfqDetails.selectedQuotation.buyerRequestedPrice && (
                                    <p className="text-sm text-amber-600 mt-1">
                                      Your requested price: {formatPrice(rfqDetails.selectedQuotation.buyerRequestedPrice, rfqDetails.selectedQuotation?.currency)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-emerald-700" />
                            Quoted Products ({rfqDetails.selectedQuotation.items?.length || 0})
                          </h5>
                          <div className="space-y-3">
                            {rfqDetails.selectedQuotation.items && rfqDetails.selectedQuotation.items.length > 0 ? (
                              rfqDetails.selectedQuotation.items.map((item, index) => (
                                <div
                                  key={item.id || index}
                                  className="bg-white border border-emerald-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm">
                                          {index + 1}
                                        </span>
                                        <h5 className="font-semibold text-slate-900">{item.productName}</h5>
                                      </div>
                                      <div className="ml-11 space-y-1 text-sm text-slate-600">
                                        <div className="flex items-center gap-4 flex-wrap">
                                          <span>Quantity: <strong>{item.quantity}</strong> {item.unit || 'units'}</span>
                                          {item.unitPrice && (
                                            <span>Unit Price: <strong>{formatPrice(item.unitPrice, rfqDetails.selectedQuotation?.currency)}</strong></span>
                                          )}
                                          {item.totalPrice && (
                                            <span className="text-emerald-700 font-semibold">Total: {formatPrice(item.totalPrice, rfqDetails.selectedQuotation?.currency)}</span>
                                          )}
                                        </div>
                                        {item.leadTime && (
                                          <p className="text-slate-600">Lead Time: <strong>{item.leadTime}</strong></p>
                                        )}
                                        {item.notes && (
                                          <p className="text-slate-500 italic">{item.notes}</p>
                                        )}
                                        {item.product && (
                                          <Link
                                            to={`/medicines/${item.product.slug}`}
                                            className="text-blue-700 hover:text-blue-800 font-medium inline-block mt-1"
                                          >
                                            View Product →
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-500 text-center py-4">No items found</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* RFQ Items */}
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-700" />
                        Requested Products ({rfqDetails.items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {rfqDetails.items && rfqDetails.items.length > 0 ? (
                          rfqDetails.items.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="bg-white border border-blue-100 rounded-lg p-4 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                      {index + 1}
                                    </span>
                                    <h5 className="font-semibold text-slate-900">{item.productName}</h5>
                                  </div>
                                  <div className="ml-11 space-y-1 text-sm text-slate-600">
                                    <div className="flex items-center gap-4">
                                      <span>Quantity: <strong>{item.quantity}</strong> {item.unit || 'units'}</span>
                                      {item.product && (
                                        <Link
                                          to={`/medicines/${item.product.slug}`}
                                          className="text-blue-700 hover:text-blue-800 font-medium"
                                        >
                                          View Product →
                                        </Link>
                                      )}
                                    </div>
                                    {item.notes && (
                                      <p className="text-slate-500 italic">{item.notes}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 text-center py-4">No items found</p>
                        )}
                      </div>
                    </div>

                    {/* Notes & Additional Info */}
                    {rfqDetails.notes && (
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-blue-700" />
                          Notes & Requirements
                        </h4>
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <p className="text-slate-700 whitespace-pre-wrap">{rfqDetails.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Accepted Quotations */}
                    {rfqDetails.responses && rfqDetails.responses.filter(r => r.isAccepted).length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                          Accepted Quotations ({rfqDetails.responses.filter(r => r.isAccepted).length})
                        </h4>
                        <div className="space-y-3">
                          {rfqDetails.responses
                            .filter(response => response.isAccepted)
                            .map((response, index) => (
                              <div
                                key={response.id || index}
                                className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 hover:border-emerald-400 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                                      <h5 className="font-semibold text-slate-900 text-lg">
                                        {response.supplier?.companyName || 'Supplier'}
                                      </h5>
                                    </div>
                                    <div className="ml-7 space-y-1">
                                      {response.supplier?.country && (
                                        <p className="text-sm text-slate-600 flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          {response.supplier.country}
                                          {response.supplier.city && `, ${response.supplier.city}`}
                                        </p>
                                      )}
                                      {response.totalAmount && (
                                        <p className="text-base font-semibold text-emerald-700 mt-2">
                                          Total Amount: {formatPrice(response.totalAmount, response.currency)}
                                        </p>
                                      )}
                                      {response.validity && (
                                        <p className="text-sm text-slate-600 flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          Validity: {formatDate(response.validity)}
                                        </p>
                                      )}
                                      {response.createdAt && (
                                        <p className="text-sm text-slate-600 flex items-center gap-1">
                                          <Clock className="w-4 h-4" />
                                          Submitted: {formatDate(response.createdAt)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-300">
                                    Accepted
                                  </span>
                                </div>
                                {response.notes && (
                                  <div className="mt-3 pt-3 border-t border-emerald-200">
                                    <p className="text-sm text-slate-600 mb-1 font-medium">Notes:</p>
                                    <p className="text-slate-700 whitespace-pre-wrap text-sm">{response.notes}</p>
                                  </div>
                                )}
                                {response.items && response.items.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-emerald-200">
                                    <p className="text-sm text-slate-600 mb-2 font-medium">Items ({response.items.length}):</p>
                                    <div className="space-y-2">
                                      {response.items.slice(0, 3).map((item, itemIndex) => (
                                        <div key={item.id || itemIndex} className="bg-white rounded-lg p-2 border border-emerald-100">
                                          <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                                          <div className="flex gap-4 text-xs text-slate-600 mt-1">
                                            <span>Qty: {item.quantity} {item.unit || 'units'}</span>
                                            {item.unitPrice && (
                                              <span>Price: {formatPrice(item.unitPrice, response.currency)}</span>
                                            )}
                                            {item.totalPrice && (
                                              <span className="text-emerald-700 font-medium">
                                                Total: {formatPrice(item.totalPrice, response.currency)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                      {response.items.length > 3 && (
                                        <p className="text-xs text-slate-500 italic">+ {response.items.length - 3} more items</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Other Responses (Pending) */}
                    {rfqDetails.responses && rfqDetails.responses.filter(r => !r.isAccepted).length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-700" />
                          Pending Responses ({rfqDetails.responses.filter(r => !r.isAccepted).length})
                        </h4>
                        <div className="space-y-3">
                          {rfqDetails.responses
                            .filter(response => !response.isAccepted)
                            .map((response, index) => (
                              <div
                                key={response.id || index}
                                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-semibold text-slate-900 mb-1">
                                      {response.supplier?.companyName || 'Supplier'}
                                    </h5>
                                    <p className="text-sm text-slate-600">
                                      {response.supplier?.country || ''}
                                    </p>
                                    {response.totalAmount && (
                                      <p className="text-sm font-medium text-blue-700 mt-2">
                                        Total: {formatPrice(response.totalAmount, response.currency)}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                                    Pending
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">Failed to load RFQ details</p>
                    <Button variant="outline" onClick={() => handleViewDetails(selectedRFQ)} className="mt-4">
                      Retry
                    </Button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-blue-100 p-6 flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
                {(() => {
                  const currentUser =
                    (authService.getCurrentUser && authService.getCurrentUser()) ||
                    (authService.getUser && authService.getUser()) ||
                    null
                  const role = currentUser?.role
                  const status = rfqDetails?.status

                    if (role === 'BUYER') {
                    if (status === 'AWAITING_BUYER' || status === 'QUOTED') {
                      const quotationStatus = rfqDetails?.selectedQuotation?.status
                      const negotiationRequested = quotationStatus === 'NEGOTIATION_REQUESTED' || rfqDetails?.selectedQuotation?.negotiationRequested === true
                      if (negotiationRequested) {
                        return (
                          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
                            <DollarSign className="w-4 h-4" />
                            Price negotiation requested. Waiting for supplier response.
                          </span>
                        )
                      }
                      return (
                        <>
                          <Button
                            type="button"
                            variant="primary"
                            onClick={handleApproveQuotation}
                            disabled={processingAction}
                            className="flex items-center gap-2"
                          >
                            {processingAction ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Accept &amp; Proceed
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPriceModalOpen(true)}
                            disabled={processingAction}
                            className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            <DollarSign className="w-4 h-4" />
                            Request Lower Price
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRejectQuotation}
                            disabled={processingAction}
                            className="flex items-center gap-2 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            {processingAction ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Reject
                              </>
                            )}
                          </Button>
                        </>
                      )
                    }

                    if (status === 'COMPLETED') {
                      return (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                          Order Created
                        </span>
                      )
                    }

                    if (status === 'REJECTED') {
                      return (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                          Rejected
                        </span>
                      )
                    }
                  }

                  // ADMIN / SUPPLIER: view only (no extra footer actions)
                  return null
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <RequestPriceModal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        onSubmit={handleRequestLowerPrice}
        submitting={processingAction}
        currentPrice={
          rfqDetails?.selectedQuotation
            ? parseFloat(
                rfqDetails.selectedQuotation.finalPrice ||
                  rfqDetails.selectedQuotation.adminFinalPrice ||
                  rfqDetails.selectedQuotation.totalAmount ||
                  0
              )
            : 0
        }
        currency={rfqDetails?.selectedQuotation?.currency || 'USD'}
      />

      {/* Quotation accepted confirmation modal – no payment redirect */}
      <AnimatePresence>
        {showAcceptConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowAcceptConfirmation(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Quotation accepted</h3>
              <p className="text-slate-600 mb-6 whitespace-pre-line">
                Thank you for accepting the quotation.{'\n'}
                Our agent will contact you within 24 hours{'\n'}
                to finalize the order.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowAcceptConfirmation(false)
                    navigate('/my-rfqs')
                  }}
                  className="flex-1"
                >
                  Go to Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAcceptConfirmation(false)
                    navigate('/buyer/dashboard')
                  }}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyRFQs
