import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  User,
  ChevronDown,
  ChevronUp,
  Award,
  Timer,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CardGrid from '@/components/layout/CardGrid'
import { getAssignedRFQs, getMyResponses, getSupplierRfqs } from '@/services/rfq.service'

export default function SupplierDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rfqs, setRfqs] = useState([])
  const [respondedRfqs, setRespondedRfqs] = useState([])
  const [respondedLoading, setRespondedLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pending' | 'responded'
  const [expandedRFQ, setExpandedRFQ] = useState(null)
  const [stats, setStats] = useState({
    assigned: 0,
    expiringSoon: 0,
    pending: 0,
    revenueThisMonth: 0,
    winRate: 0,
    avgResponseTime: 0,
    revenueYTD: 0
  })

  useEffect(() => {
    loadRFQs()
  }, [])

  useEffect(() => {
    if (activeTab === 'responded') {
      loadRespondedRFQs()
    }
  }, [activeTab])

  const loadRFQs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [assignedData, responsesData] = await Promise.all([
        getAssignedRFQs().catch(err => {
          console.error('Failed to load assigned RFQs:', err)
          return []
        }),
        getMyResponses().catch(err => {
          console.error('Failed to load responses:', err)
          return []
        })
      ])
      
      const rfqsList = Array.isArray(assignedData) ? assignedData : (assignedData?.rfqs || assignedData || [])
      const responsesList = Array.isArray(responsesData) ? responsesData : (responsesData || [])
      
      const responseMap = new Map()
      responsesList.forEach(response => {
        responseMap.set(response.rfqId || response.rfq?.id, response)
      })
      
      const rfqsWithStatus = rfqsList.map(rfq => {
        const hasResponded = responseMap.has(rfq.id)
        const myResponse = responseMap.get(rfq.id)
        
        // Calculate estimated order value from items
        const estimatedValue = rfq.items?.reduce((sum, item) => {
          const quantity = parseFloat(item.quantity) || 0
          const productPrice = item.product?.price || 0
          return sum + (quantity * productPrice)
        }, 0) || 0
        
        // Calculate total quantity
        const totalQuantity = rfq.items?.reduce((sum, item) => {
          return sum + (parseFloat(item.quantity) || 0)
        }, 0) || 0
        
        return {
          ...rfq,
          hasResponded,
          myResponse,
          estimatedValue,
          totalQuantity
        }
      })
      
      setRfqs(rfqsWithStatus)
      
      // Calculate stats
      const now = new Date()
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const expiringSoon = rfqsList.filter(rfq => {
        if (!rfq.expiresAt) return false
        const expiryDate = new Date(rfq.expiresAt)
        return expiryDate > now && expiryDate <= tomorrow && !responseMap.has(rfq.id)
      }).length
      
      const pendingCount = rfqsList.filter(rfq => {
        const myResp = responseMap.get(rfq.id)
        if (!myResp) return true
        return myResp.status === 'NEGOTIATION_SENT_TO_SUPPLIER'
      }).length
      
      // Calculate win rate (accepted / total responses)
      const acceptedResponses = responsesList.filter(r => r.isAccepted || r.status === 'CONFIRMED' || r.status === 'BUYER_ACCEPTED').length
      const winRate = responsesList.length > 0 ? (acceptedResponses / responsesList.length) * 100 : 0
      
      // Calculate average response time
      let avgResponseTime = 0
      if (responsesList.length > 0) {
        const responseTimes = responsesList
          .filter(r => r.rfq?.createdAt && r.createdAt)
          .map(r => {
            const rfqCreated = new Date(r.rfq.createdAt)
            const responseCreated = new Date(r.createdAt)
            return (responseCreated - rfqCreated) / (1000 * 60 * 60) // hours
          })
        if (responseTimes.length > 0) {
          avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        }
      }
      
      // Calculate revenue (from accepted responses)
      const revenueThisMonth = responsesList
        .filter(r => {
          const responseDate = new Date(r.createdAt)
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
          return (r.isAccepted || r.status === 'CONFIRMED' || r.status === 'BUYER_ACCEPTED') && responseDate >= monthStart
        })
        .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0)
      
      const revenueYTD = responsesList
        .filter(r => {
          const responseDate = new Date(r.createdAt)
          const yearStart = new Date(now.getFullYear(), 0, 1)
          return (r.isAccepted || r.status === 'CONFIRMED' || r.status === 'BUYER_ACCEPTED') && responseDate >= yearStart
        })
        .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0)
      
      setStats({
        assigned: rfqsList.length,
        expiringSoon,
        pending: pendingCount,
        revenueThisMonth,
        winRate: Math.round(winRate * 10) / 10,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        revenueYTD
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError(error.response?.data?.message || 'Failed to load dashboard data. Please try again.')
      setRfqs([])
    } finally {
      setLoading(false)
    }
  }

  const loadRespondedRFQs = async () => {
    try {
      setRespondedLoading(true)
      const [respondedData, responsesData] = await Promise.all([
        getSupplierRfqs({ status: 'RESPONDED' }).catch(() => []),
        getMyResponses().catch(() => [])
      ])
      const apiList = Array.isArray(respondedData) ? respondedData : []
      const responsesList = Array.isArray(responsesData) ? responsesData : (responsesData || [])

      const responseMap = new Map()
      responsesList.forEach(r => {
        const rid = r.rfqId || r.rfq?.id
        if (rid) responseMap.set(rid, r)
      })

      // Build a robust RFQ source map:
      // 1) backend responded API
      // 2) currently loaded assigned RFQs
      // 3) RFQ embedded in response payload (if any)
      const rfqSourceMap = new Map()
      apiList.forEach(rfq => {
        if (rfq?.id) rfqSourceMap.set(rfq.id, rfq)
      })
      rfqs.forEach(rfq => {
        if (rfq?.id && !rfqSourceMap.has(rfq.id)) rfqSourceMap.set(rfq.id, rfq)
      })
      responsesList.forEach(resp => {
        const rfq = resp?.rfq
        const rid = resp?.rfqId || rfq?.id
        if (rid && rfq && !rfqSourceMap.has(rid)) {
          rfqSourceMap.set(rid, { ...rfq, id: rid })
        }
      })

      const respondedIds = new Set([
        ...apiList.map(r => r?.id).filter(Boolean),
        ...responsesList.map(r => r?.rfqId || r?.rfq?.id).filter(Boolean)
      ])

      const enriched = [...respondedIds]
        .map((rid) => {
          const rfq = rfqSourceMap.get(rid)
          if (!rfq) return null
          const myResponse = responseMap.get(rid) || null
          const estimatedValue = rfq.items?.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (item.product?.price || 0)), 0) || 0
          const totalQuantity = rfq.items?.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0) || 0
          return {
            ...rfq,
            hasResponded: true,
            myResponse,
            estimatedValue,
            totalQuantity
          }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

      setRespondedRfqs(enriched)
    } catch (e) {
      console.error('Failed to load responded RFQs:', e)
      setRespondedRfqs([])
    } finally {
      setRespondedLoading(false)
    }
  }

  const formatPrice = (val) => {
    if (val == null || val === '') return '—'
    const n = typeof val === 'number' ? val : parseFloat(val)
    return isNaN(n) ? '—' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
  }

  const getStatusBadge = (rfq) => {
    if (rfq.hasResponded) {
      if (rfq.myResponse?.status === 'NEGOTIATION_SENT_TO_SUPPLIER') {
        const reqPrice = rfq.myResponse?.buyerRequestedPrice ?? rfq.myResponse?.requestedPrice
        return (
          <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0">
            Buyer requested lower price{reqPrice != null ? `: ${formatPrice(reqPrice)}` : ''}
          </Badge>
        )
      }
      if (rfq.myResponse?.status === 'SUPPLIER_COUNTER_OFFER') {
        return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">Counter offer sent</Badge>
      }
      if (rfq.myResponse?.status === 'SENT_BACK_TO_SUPPLIER') {
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">Revision requested</Badge>
      }
      if (rfq.myResponse?.isAccepted || rfq.myResponse?.status === 'CONFIRMED' || rfq.myResponse?.status === 'ACCEPTED' || rfq.myResponse?.status === 'BUYER_ACCEPTED') {
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0">Accepted</Badge>
      }
      if (rfq.myResponse?.status === 'REJECTED') {
        return <Badge className="bg-destructive/10 text-destructive border-0">Rejected</Badge>
      }
      return <Badge className="bg-primary/10 text-primary border-0">Responded</Badge>
    }
    if (rfq.expiresAt && new Date(rfq.expiresAt) < new Date()) {
      return <Badge className="bg-destructive/10 text-destructive border-0">Expired</Badge>
    }
    const variants = {
      SENT: 'bg-primary/10 text-primary border-0',
      RESPONDED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-0',
      ACCEPTED: 'bg-green-500/10 text-green-600 dark:text-green-400 border-0',
      REJECTED: 'bg-destructive/10 text-destructive border-0',
      EXPIRED: 'bg-destructive/10 text-destructive border-0',
    }
    return <Badge className={variants[rfq.status] || 'bg-muted text-muted-foreground border-0'}>{rfq.status}</Badge>
  }

  const getExpiryCountdown = (expiresAt) => {
    if (!expiresAt) return null
    
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry - now
    
    if (diff < 0) return 'Expired'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h`
    
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes}m`
  }

  const toggleExpandRFQ = (rfqId) => {
    setExpandedRFQ(expandedRFQ === rfqId ? null : rfqId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="supplier-section-title mb-0">Dashboard</h1>
          <p className="supplier-section-sub">RFQs, responses, and revenue at a glance</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadRFQs}
          disabled={loading}
          className="border-border/50 hover:bg-muted/50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/5 border border-border rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-foreground">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
            ×
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <CardGrid className="sm:gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <div className="supplier-stat-card">
            <div className="relative z-10 flex items-start justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Assigned RFQs</p>
              <FileText className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
            </div>
            <p className="relative z-10 mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{stats.assigned}</p>
            <p className="relative z-10 mt-1 text-xs text-muted-foreground">Total assigned to you</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04 }}>
          <div className="supplier-stat-card">
            <div className="relative z-10 flex items-start justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expiring soon</p>
              <Timer className="h-4 w-4 shrink-0 text-amber-600/90 dark:text-amber-400/90" aria-hidden />
            </div>
            <p className="relative z-10 mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{stats.expiringSoon}</p>
            <p className="relative z-10 mt-1 text-xs text-muted-foreground">Next 24 hours</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.08 }}>
          <div className="supplier-stat-card">
            <div className="relative z-10 flex items-start justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pending responses</p>
              <Clock className="h-4 w-4 shrink-0 text-primary/80" aria-hidden />
            </div>
            <p className="relative z-10 mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{stats.pending}</p>
            <p className="relative z-10 mt-1 text-xs text-muted-foreground">Needs your quote</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.12 }}>
          <div className="supplier-stat-card">
            <div className="relative z-10 flex items-start justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Revenue this month</p>
              <DollarSign className="h-4 w-4 shrink-0 text-emerald-600/90 dark:text-emerald-400/90" aria-hidden />
            </div>
            <p className="relative z-10 mt-3 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
              ${stats.revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="relative z-10 mt-1 text-xs text-muted-foreground">From accepted quotes</p>
          </div>
        </motion.div>
      </CardGrid>

      {/* Recent RFQs */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground mb-1">Recent RFQs</h2>
        <p className="text-sm text-muted-foreground mb-4">RFQs assigned to your company</p>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] sm:flex-wrap sm:overflow-visible">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className={`shrink-0 ${activeTab === 'all' ? '' : 'border-border/50 hover:bg-muted/50'}`}
          >
            All
          </Button>
          <Button
            variant={activeTab === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('pending')}
            className={`shrink-0 ${activeTab === 'pending' ? '' : 'border-border/50 hover:bg-muted/50'}`}
          >
            Pending
          </Button>
          <Button
            variant={activeTab === 'responded' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('responded')}
            className={`shrink-0 ${activeTab === 'responded' ? '' : 'border-border/50 hover:bg-muted/50'}`}
          >
            Responded
          </Button>
        </div>

        {activeTab === 'responded' && respondedLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (() => {
          const displayedList = activeTab === 'all' ? rfqs : activeTab === 'pending' ? rfqs.filter(r => !r.hasResponded || r.myResponse?.status === 'NEGOTIATION_SENT_TO_SUPPLIER') : respondedRfqs
          return displayedList.length === 0 ? (
            activeTab === 'responded' ? (
              <div className="bg-card rounded-2xl p-12 text-center shadow-[0_6px_30px_rgba(0,0,0,0.05)] border border-border/50">
                <FileText className="h-14 w-14 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-foreground font-medium">No responded RFQs yet.</p>
                <p className="text-sm text-muted-foreground mt-2">RFQs you have submitted quotations for will appear here.</p>
              </div>
            ) : (
              <div className="bg-card rounded-2xl p-12 text-center shadow-[0_6px_30px_rgba(0,0,0,0.05)] border border-border/50">
                <FileText className="h-14 w-14 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-foreground font-medium">No RFQs assigned yet</p>
                <p className="text-sm text-muted-foreground mt-2">You'll see RFQs here when they're assigned to you</p>
              </div>
            )
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedList.map((rfq, index) => {
              const isExpanded = expandedRFQ === rfq.id
              const isExpiringSoon = rfq.expiresAt && new Date(rfq.expiresAt) > new Date() && new Date(rfq.expiresAt) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
              return (
                <motion.div
                  key={rfq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/supplier/rfqs/${rfq.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/supplier/rfqs/${rfq.id}`) } }}
                    className={`cursor-pointer rounded-2xl border border-border/50 bg-card p-6 shadow-sm transition-colors hover:border-primary/35 hover:bg-muted/15 dark:shadow-none dark:hover:bg-muted/10 ${isExpiringSoon ? 'ring-1 ring-primary/30' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-foreground truncate">{rfq.title || 'Untitled RFQ'}</h3>
                          {getStatusBadge(rfq)}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{rfq.id.slice(0, 8).toUpperCase()}...</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Products</p>
                        <p className="text-sm font-medium text-foreground mt-0.5">{rfq.items?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Qty</p>
                        <p className="text-sm font-medium text-foreground mt-0.5">{rfq.totalQuantity?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Buyer</p>
                        <p className="text-sm font-medium text-foreground mt-0.5 truncate">{rfq.buyer?.fullName || rfq.buyer?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Est. Value</p>
                        <p className="text-sm font-medium text-foreground mt-0.5">${rfq.estimatedValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
                      </div>
                    </div>
                    {rfq.expiresAt && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Expires</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm font-medium text-foreground">{new Date(rfq.expiresAt).toLocaleDateString()}</p>
                          {getExpiryCountdown(rfq.expiresAt) && (
                            <Badge variant="outline" className={`text-xs ${isExpiringSoon ? 'border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}>
                              {getExpiryCountdown(rfq.expiresAt)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-6">
                      {['SENT_BACK_TO_SUPPLIER', 'REVISION_REQUESTED', 'REJECTED'].includes(rfq.myResponse?.status) ? (
                        <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={() => navigate(`/supplier/rfqs/${rfq.id}`)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resubmit quotation
                        </Button>
                      ) : rfq.hasResponded ? (
                        <Button variant="outline" className="flex-1 border-border/50 hover:bg-muted/50" onClick={() => navigate(`/supplier/rfqs/${rfq.id}`)}>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          View Response
                        </Button>
                      ) : rfq.status === 'SENT' && (!rfq.expiresAt || new Date(rfq.expiresAt) > new Date()) ? (
                        <Button className="flex-1" onClick={() => navigate(`/supplier/rfqs/${rfq.id}`)}>
                          Respond Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1 border-border/50 hover:bg-muted/50" onClick={() => navigate(`/supplier/rfqs/${rfq.id}`)} disabled={rfq.expiresAt && new Date(rfq.expiresAt) < new Date()}>
                          View Details
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleExpandRFQ(rfq.id) }} className="shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">RFQ Items</p>
                              <div className="space-y-2">
                                {rfq.items?.map((item, idx) => (
                                  <div key={idx} className="p-4 bg-muted/40 rounded-xl">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-foreground">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {item.quantity} {item.unit || 'units'}
                                          {item.product?.name && ` • ${item.product.name}`}
                                        </p>
                                      </div>
                                      {item.product?.price && (
                                        <p className="text-sm font-medium text-foreground">
                                          ${(parseFloat(item.quantity) * parseFloat(item.product.price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                      )}
                                    </div>
                                    {item.notes && <p className="text-xs text-muted-foreground mt-2">{item.notes}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                            {rfq.notes && (
                              <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Additional Notes</p>
                                <p className="text-sm text-foreground bg-muted/40 p-4 rounded-xl">{rfq.notes}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Created {new Date(rfq.createdAt).toLocaleDateString()}</span>
                              </div>
                              {rfq.buyer?.email && (
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  <span>{rfq.buyer.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            })}
          </div>
          )
        })()}
      </div>

      {/* Performance Analytics */}
      <div className="bg-card rounded-2xl p-6 shadow-[0_6px_30px_rgba(0,0,0,0.05)] border border-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Performance</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Your business metrics</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Win Rate</p>
            <p className="text-2xl font-semibold text-foreground mt-2">{stats.winRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Accepted / Total quotes</p>
          </div>
          <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Response Time</p>
            <p className="text-2xl font-semibold text-foreground mt-2">{stats.avgResponseTime.toFixed(1)}h</p>
            <p className="text-xs text-muted-foreground mt-1">Time to respond to RFQs</p>
          </div>
          <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue YTD</p>
            <p className="text-2xl font-semibold text-foreground mt-2">
              ${stats.revenueYTD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total revenue year-to-date</p>
          </div>
        </div>
      </div>
    </div>
  )
}
