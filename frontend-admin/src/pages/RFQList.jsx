import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllRFQs, deleteRFQ, sendRFQToSuppliers } from '@/services/rfq.service'
import {
  Search,
  Filter,
  Eye,
  Send,
  MoreVertical,
  Calendar,
  User,
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  X,
  Check,
  Download,
  Plus,
  ArrowRight,
  Trash2,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'

// Pipeline statuses will be calculated dynamically

function PipelineStatus({ status, isActive, onClick, totalCount }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        isActive
          ? 'border-primary/50 bg-primary/10'
          : 'border-border/40 hover:border-primary/30'
      }`}
    >
      <div className={`text-2xl font-bold ${status.color}`}>{status.count}</div>
      <div className="text-xs font-medium text-muted-foreground">{status.label}</div>
      <Progress
        value={totalCount > 0 ? (status.count / totalCount) * 100 : 0}
        className="w-full h-1"
      />
    </button>
  )
}

function KPICard({ label, value, icon: Icon, color, bgColor, trend, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="glass-card rounded-2xl border-2 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-0 group-hover:opacity-10 transition-opacity`} />
        <CardContent className="pt-6 relative">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${bgColor} group-hover:scale-110 transition-transform`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className={`text-2xl font-bold mb-1 ${color}`}>{value}</div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RFQRow({ rfq, index, isSelected, onToggleSelect, onDelete, onSend, actionLoading }) {
  const navigate = useNavigate()

  const getStatusConfig = (status) => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Draft', variant: 'outline', color: 'text-slate-400' }
      case 'SENT':
        return { label: 'Sent', variant: 'info', color: 'text-indigo-400' }
      case 'PENDING':
        return { label: 'Awaiting Quotes', variant: 'warning', color: 'text-amber-400' }
      case 'RESPONDED':
        return { label: 'Responded', variant: 'success', color: 'text-emerald-400' }
      case 'ACCEPTED':
        return { label: 'Accepted', variant: 'success', color: 'text-green-400' }
      case 'REJECTED':
        return { label: 'Rejected', variant: 'destructive', color: 'text-red-400' }
      case 'EXPIRED':
        return { label: 'Expired', variant: 'outline', color: 'text-muted-foreground' }
      default:
        return { label: status, variant: 'outline', color: '' }
    }
  }

  const statusConfig = getStatusConfig(rfq.status)
  const hasUrgency = rfq.daysUntilExpiry !== null && rfq.daysUntilExpiry <= 7 && rfq.daysUntilExpiry > 0
  const noSuppliers = rfq.assignedSuppliers === 0 && rfq.status === 'SENT'
  const noResponses = rfq.assignedSuppliers > 0 && rfq.respondedSuppliers === 0 && rfq.status === 'SENT'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="glass-card rounded-xl border border-border/40 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
            />

            {/* RFQ ID & Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {rfq.id}
                    </h3>
                    <Badge variant={statusConfig.variant} className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                    {hasUrgency && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                    {noSuppliers && (
                      <Badge variant="warning" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        No Suppliers
                      </Badge>
                    )}
                    {noResponses && (
                      <Badge variant="warning" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        No Responses
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{rfq.buyerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>{rfq.itemsCount} items</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Created {new Date(rfq.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-6 gap-4 pt-3 border-t border-border/40">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assigned</p>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="font-semibold text-sm">{rfq.assignedSuppliers}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Responded</p>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <p className="font-semibold text-sm text-emerald-400">{rfq.respondedSuppliers}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                  <p className="font-semibold text-sm">${(rfq.totalValue / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Response Rate</p>
                  <p className="font-semibold text-sm">
                    {rfq.assignedSuppliers > 0
                      ? `${Math.round((rfq.respondedSuppliers / rfq.assignedSuppliers) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expires</p>
                  {rfq.daysUntilExpiry !== null ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${hasUrgency ? 'text-red-400' : 'text-muted-foreground'}`} />
                      <p className={`font-semibold text-sm ${hasUrgency ? 'text-red-400' : ''}`}>
                        {rfq.daysUntilExpiry}d
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">N/A</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusConfig.bgColor || 'bg-muted'}`} />
                    <p className="text-sm font-medium">{statusConfig.label}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/rfq/${rfq.id}`)
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/rfq/${rfq.id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {rfq.status === 'DRAFT' && (
                    <DropdownMenuItem
                      onClick={() => onSend(rfq.id)}
                      disabled={actionLoading === rfq.id}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send to Suppliers
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(rfq.id)}
                    disabled={actionLoading === rfq.id}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {noSuppliers && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.info(`Assign suppliers to ${rfq.id}`)
                  }}
                >
                  <Users className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function RFQList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRFQs, setSelectedRFQs] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rfqs, setRfqs] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [confirm, setConfirm] = useState(null) // { type: 'delete'|'bulk-delete'|'send'|'bulk-send', id?: string }
  const toast = useToast()
  const itemsPerPage = 10

  useEffect(() => {
    loadRFQs()
  }, [currentPage, statusFilter])

  const loadRFQs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllRFQs({ page: currentPage, limit: itemsPerPage, status: statusFilter !== 'all' ? statusFilter : undefined })
      const rfqsData = response.rfqs || []
      setRfqs(rfqsData)
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1)
        setTotalCount(response.pagination.total || 0)
      } else {
        setTotalCount(rfqsData.length)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load RFQs')
      setRfqs([])
    } finally {
      setLoading(false)
    }
  }

  const onConfirmAction = async () => {
    if (!confirm) return
    try {
      if (confirm.type === 'delete' && confirm.id) {
        setActionLoading(confirm.id)
        await deleteRFQ(confirm.id)
        await loadRFQs()
        if (window.refreshSidebarCounts) window.refreshSidebarCounts()
      } else if (confirm.type === 'bulk-delete') {
        setActionLoading('bulk-delete')
        for (const id of selectedRFQs) await deleteRFQ(id)
        setSelectedRFQs([])
        await loadRFQs()
        if (window.refreshSidebarCounts) window.refreshSidebarCounts()
      } else if (confirm.type === 'send' && confirm.id) {
        setActionLoading(confirm.id)
        await sendRFQToSuppliers(confirm.id, [])
        await loadRFQs()
        if (window.refreshSidebarCounts) window.refreshSidebarCounts()
        toast.success('RFQ sent to suppliers')
      } else if (confirm.type === 'bulk-send') {
        setActionLoading('bulk-send')
        const count = selectedRFQs.length
        for (const rfqId of selectedRFQs) await sendRFQToSuppliers(rfqId, [])
        setSelectedRFQs([])
        await loadRFQs()
        if (window.refreshSidebarCounts) window.refreshSidebarCounts()
        toast.success(`${count} RFQ(s) sent to suppliers`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const transformRFQ = (rfq) => {
    const buyerName = rfq.buyer?.fullName || rfq.buyer?.email || 'Unknown Buyer'
    const itemsCount = rfq.items?.length || 0
    const responsesCount = rfq._count?.responses ?? rfq.responses?.length ?? 0
    const expiresAt = rfq.expiresAt ? new Date(rfq.expiresAt) : null
    const now = new Date()
    let daysUntilExpiry = expiresAt ? Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)) : null
    if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
      daysUntilExpiry = 0
    }
    
    // Calculate total value from items (use product price if available)
    const totalValue = rfq.items?.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity || 0)
      const price = item.product?.price ? parseFloat(item.product.price.toString()) : 0
      const itemValue = quantity * price
      return sum + itemValue
    }, 0) || 0

    return {
      id: rfq.id,
      buyerName,
      itemsCount,
      status: rfq.status,
      createdAt: rfq.createdAt,
      expiresAt: rfq.expiresAt,
      totalValue,
      assignedSuppliers: responsesCount,
      respondedSuppliers: responsesCount,
      daysUntilExpiry,
    }
  }

  const transformedRFQs = rfqs.map(transformRFQ)

  // Client-side search filtering (server-side pagination already applied)
  const filteredRFQs = transformedRFQs.filter((rfq) => {
    const matchesSearch = searchQuery === '' || 
      rfq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Use filtered results for display
  const paginatedRFQs = filteredRFQs

  const toggleSelectRFQ = (rfqId) => {
    setSelectedRFQs(prev =>
      prev.includes(rfqId)
        ? prev.filter(id => id !== rfqId)
        : [...prev, rfqId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRFQs.length === paginatedRFQs.length) {
      setSelectedRFQs([])
    } else {
      setSelectedRFQs(paginatedRFQs.map(r => r.id))
    }
  }

  const totalActiveRFQs = transformedRFQs.filter(r => r.status !== 'EXPIRED' && r.status !== 'DRAFT' && r.status !== 'REJECTED').length
  const totalPipelineValue = transformedRFQs.reduce((sum, r) => sum + r.totalValue, 0)
  const avgResponseTime = '2.4h' // TODO: Calculate from backend
  const expiringSoonCount = transformedRFQs.filter(r => r.daysUntilExpiry !== null && r.daysUntilExpiry <= 7 && r.daysUntilExpiry > 0).length
  const conversionRate = transformedRFQs.length > 0 
    ? Math.round((transformedRFQs.filter(r => r.respondedSuppliers > 0).length / transformedRFQs.length) * 100 * 10) / 10
    : 0

  const kpis = [
    {
      label: 'Total Active RFQs',
      value: totalActiveRFQs,
      icon: FileText,
      color: 'text-indigo-400',
      bgColor: 'from-indigo-500/20 to-indigo-600/10',
      trend: 12.5,
    },
    {
      label: 'Pipeline Value',
      value: `$${(totalPipelineValue / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'from-emerald-500/20 to-emerald-600/10',
      trend: 18.3,
    },
    {
      label: 'Avg Response Time',
      value: avgResponseTime,
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'from-cyan-500/20 to-cyan-600/10',
    },
    {
      label: 'Expiring Soon',
      value: expiringSoonCount,
      icon: AlertCircle,
      color: 'text-red-400',
      bgColor: 'from-red-500/20 to-red-600/10',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/10',
      trend: 5.2,
    },
  ]

  const pipelineStatuses = [
    { id: 'DRAFT', label: 'Draft', count: transformedRFQs.filter(r => r.status === 'DRAFT').length, color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
    { id: 'SENT', label: 'Sent', count: transformedRFQs.filter(r => r.status === 'SENT').length, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10' },
    { id: 'RESPONDED', label: 'Responded', count: transformedRFQs.filter(r => r.status === 'RESPONDED').length, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { id: 'ACCEPTED', label: 'Accepted', count: transformedRFQs.filter(r => r.status === 'ACCEPTED').length, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { id: 'REJECTED', label: 'Rejected', count: transformedRFQs.filter(r => r.status === 'REJECTED').length, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    { id: 'EXPIRED', label: 'Expired', count: transformedRFQs.filter(r => r.status === 'EXPIRED').length, color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-muted-foreground">Loading RFQs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Layered Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(6,182,212,0.08),transparent_50%)]" />

      <div className="relative z-10 space-y-6 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              RFQ Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Procurement control center for all request for quotations
            </p>
          </div>
          <Button 
            className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 rounded-xl"
            onClick={() => navigate('/rfq/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New RFQ
          </Button>
        </motion.div>

        {/* RFQ Pipeline Strip */}
        <Card className="glass-card rounded-2xl border-2 border-border/40">
          <CardHeader>
            <CardTitle className="text-xl">RFQ Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {pipelineStatuses.map((status) => (
                <PipelineStatus
                  key={status.id}
                  status={status}
                  isActive={statusFilter === status.id}
                  onClick={() => setStatusFilter(status.id === statusFilter ? 'all' : status.id)}
                  totalCount={transformedRFQs.length}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map((kpi, index) => (
            <KPICard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
              bgColor={kpi.bgColor}
              trend={kpi.trend}
              index={index}
            />
          ))}
        </div>

        {/* Filters & Search */}
        <Card className="glass-card rounded-2xl border-2 border-border/40">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by RFQ ID or buyer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                  className="rounded-xl"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'SENT' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('SENT')}
                  size="sm"
                  className="rounded-xl"
                >
                  Sent
                </Button>
                <Button
                  variant={statusFilter === 'RESPONDED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('RESPONDED')}
                  size="sm"
                  className="rounded-xl"
                >
                  Responded
                </Button>
                <Button
                  variant={statusFilter === 'EXPIRED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('EXPIRED')}
                  size="sm"
                  className="rounded-xl"
                >
                  Expired
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRFQs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between"
              >
                <p className="text-sm text-muted-foreground">
                  {selectedRFQs.length} RFQ{selectedRFQs.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => setConfirm({ type: 'bulk-send' })}
                    disabled={actionLoading === 'bulk-send'}
                  >
                    {actionLoading === 'bulk-send' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send to Suppliers
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl"
                    onClick={() => toast.info('Export functionality coming soon')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl text-destructive"
                    onClick={() => setConfirm({ type: 'bulk-delete' })}
                    disabled={actionLoading === 'bulk-delete'}
                  >
                    {actionLoading === 'bulk-delete' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Delete Selected
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* RFQ List */}
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex items-center gap-4 px-2">
            <Checkbox
              checked={selectedRFQs.length === paginatedRFQs.length && paginatedRFQs.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <div className="flex-1 grid grid-cols-6 gap-4 text-xs font-medium text-muted-foreground">
              <div>RFQ ID</div>
              <div>Buyer</div>
              <div>Suppliers</div>
              <div>Value</div>
              <div>Expires</div>
              <div>Status</div>
            </div>
            <div className="w-32" />
          </div>

          {/* RFQ Rows */}
          {paginatedRFQs.length > 0 ? (
            paginatedRFQs.map((rfq, index) => (
              <RFQRow
                key={rfq.id}
                rfq={rfq}
                index={index}
                isSelected={selectedRFQs.includes(rfq.id)}
                onToggleSelect={() => toggleSelectRFQ(rfq.id)}
                onDelete={(id) => setConfirm({ type: 'delete', id })}
                onSend={(id) => setConfirm({ type: 'send', id })}
                actionLoading={actionLoading}
              />
            ))
          ) : (
            <Card className="glass-card rounded-2xl">
              <CardContent className="pt-12 pb-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No RFQs found</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="glass-card rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} RFQs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="rounded-xl w-10"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <ConfirmModal
          open={!!confirm}
          onOpenChange={(open) => !open && setConfirm(null)}
          title={
            confirm?.type === 'delete' ? 'Delete RFQ' :
            confirm?.type === 'bulk-delete' ? 'Delete RFQs' :
            confirm?.type === 'bulk-send' ? 'Send RFQs to suppliers' : 'Send to suppliers'
          }
          message={
            confirm?.type === 'delete'
              ? `Are you sure you want to delete RFQ ${confirm.id}? This cannot be undone.`
              : confirm?.type === 'bulk-delete'
                ? `Delete ${selectedRFQs.length} RFQ(s)? This cannot be undone.`
                : confirm?.type === 'bulk-send'
                  ? `Send ${selectedRFQs.length} RFQ(s) to suppliers?`
                  : `Send RFQ ${confirm?.id} to suppliers?`
          }
          confirmLabel={confirm?.type === 'send' || confirm?.type === 'bulk-send' ? 'Send' : 'Delete'}
          variant={confirm?.type === 'send' || confirm?.type === 'bulk-send' ? 'default' : 'destructive'}
          onConfirm={onConfirmAction}
        />
      </div>
    </div>
  )
}
