import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllSuppliers, approveSupplier, rejectSupplier } from '@/services/suppliers.service'
import {
  Search,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  TrendingUp,
  Users,
  Clock,
  FileCheck,
  Award,
  Plus,
  Download,
  Send,
  Filter,
  ArrowRight,
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle, Section, SectionTitle, SectionSubtitle } from '@/components/ui/panel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'

// Using real API data

const getStatusVariant = (status) => {
  switch (status) {
    case 'verified':
      return 'success'
    case 'pending':
      return 'warning'
    default:
      return 'default'
  }
}

const getPerformanceBadge = (performance) => {
  switch (performance) {
    case 'excellent':
      return { label: 'Excellent', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' }
    case 'good':
      return { label: 'Good', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' }
    case 'average':
      return { label: 'Average', color: 'text-amber-400', bgColor: 'bg-amber-500/10' }
    default:
      return { label: 'Poor', color: 'text-red-400', bgColor: 'bg-red-500/10' }
  }
}

const getDaysAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

export default function Suppliers() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRows, setSelectedRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [actionLoading, setActionLoading] = useState(null)
  const [confirm, setConfirm] = useState(null) // { type: 'approve'|'reject', id }
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    setError(null)
    loadSuppliers()
  }, [statusFilter, page])

  useEffect(() => {
    const handleError = () => {
      setError('An unexpected error occurred. Please refresh the page.')
      setLoading(false)
    }
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllSuppliers({ 
        page,
        limit,
        isVerified: statusFilter === 'verified' ? true : statusFilter === 'pending' ? false : undefined 
      })
      
      const suppliersData = response?.suppliers || response?.data?.suppliers || response || []
      if (!Array.isArray(suppliersData)) {
        setSuppliers([])
        return
      }
      setSuppliers(suppliersData)
      const pag = response?.pagination || response?.data?.pagination
      if (pag) setTotal(pag.total ?? suppliersData.length)
      else setTotal(suppliersData.length)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load suppliers'
      setError(errorMessage)
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const transformSupplier = (supplier) => {
    try {
      // Use isVerified for status, not isActive
      const status = supplier?.isVerified ? 'verified' : 'pending'
      const quotesSubmitted = supplier?._count?.rfqResponses || 0
      const totalProducts = supplier?._count?.products || 0
      
      // Calculate RFQs participated (count distinct RFQ IDs from responses)
      // This is approximate - ideally we'd count distinct RFQs
      const rfqsParticipated = quotesSubmitted > 0 ? Math.ceil(quotesSubmitted / 1.5) : 0 // Approximate
      
      // Calculate response rate
      const responseRate = rfqsParticipated > 0 
        ? Math.round((quotesSubmitted / rfqsParticipated) * 100 * 10) / 10 
        : 0
      
      return {
        id: supplier?.id || '',
        companyName: supplier?.companyName || 'Unknown',
        email: supplier?.email || supplier?.user?.email || '',
        phone: supplier?.phone || supplier?.user?.phone || '',
        country: supplier?.country || '',
        status,
        rfqsParticipated,
        quotesSubmitted,
        totalValue: 0, // TODO: Calculate from actual orders
        responseRate: Math.min(responseRate, 100), // Cap at 100%
        winRate: 0, // TODO: Calculate from actual data
        avgQuoteTime: 'N/A', // TODO: Calculate from actual data
        lastActive: supplier?.updatedAt || supplier?.createdAt || new Date().toISOString(),
        performance: responseRate >= 90 ? 'excellent' : responseRate >= 70 ? 'good' : responseRate >= 50 ? 'average' : 'poor',
      }
    } catch (err) {
      // Return safe default values
      return {
        id: supplier?.id || '',
        companyName: supplier?.companyName || 'Unknown',
        email: supplier?.email || supplier?.user?.email || '',
        phone: supplier?.phone || supplier?.user?.phone || '',
        country: supplier?.country || '',
        status: 'pending',
        rfqsParticipated: 0,
        quotesSubmitted: 0,
        totalValue: 0,
        responseRate: 0,
        winRate: 0,
        avgQuoteTime: 'N/A',
        lastActive: supplier?.updatedAt || supplier?.createdAt || new Date().toISOString(),
        performance: 'poor',
      }
    }
  }

  const transformedSuppliers = Array.isArray(suppliers) 
    ? suppliers.map(transformSupplier).filter(s => s && s.id) // Filter out invalid suppliers
    : []

  const filteredSuppliers = transformedSuppliers.filter((supplier) => {
    try {
      if (!supplier || !supplier.id) return false
      
      const matchesSearch = !searchQuery || 
        (supplier.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (supplier.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (supplier.country?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
      return matchesSearch && matchesStatus
    } catch (err) {
      return false
    }
  })

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredSuppliers.map(supplier => supplier.id))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id])
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }

  const handleApprove = (id) => setConfirm({ type: 'approve', id })
  const handleReject = (id) => setConfirm({ type: 'reject', id })

  const runApprove = async (id) => {
    try {
      setActionLoading(id)
      await approveSupplier(id)
      await loadSuppliers()
      toast.success('Supplier approved successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve supplier')
      throw err
    } finally {
      setActionLoading(null)
    }
  }
  const runReject = async (id) => {
    try {
      setActionLoading(id)
      await rejectSupplier(id)
      await loadSuppliers()
      toast.success('Supplier rejected successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject supplier')
      throw err
    } finally {
      setActionLoading(null)
    }
  }

  const onConfirmAction = async () => {
    if (!confirm) return
    const { type, id } = confirm
    if (type === 'approve') await runApprove(id)
    else if (type === 'reject') await runReject(id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <div className="text-muted-foreground">Loading suppliers...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg font-semibold">Error loading suppliers</div>
          <div className="text-muted-foreground text-sm">{error}</div>
          <Button 
            onClick={() => {
              setError(null)
              loadSuppliers()
            }}
            variant="outline"
            size="sm"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <Section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <SectionTitle>Supplier Network</SectionTitle>
              <SectionSubtitle>Manage and monitor supplier performance</SectionSubtitle>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-indigo-500 to-cyan-500"
                onClick={() => navigate('/suppliers/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Supplier
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast.info('Export functionality coming soon')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Section>

        {/* Filters */}
        <Panel>
          <PanelContent className="py-3">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 text-sm bg-slate-800/50 border-slate-700"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                  className="h-9 text-xs"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'verified' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('verified')}
                  size="sm"
                  className="h-9 text-xs"
                >
                  Verified
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('pending')}
                  size="sm"
                  className="h-9 text-xs"
                >
                  Pending
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between"
              >
                <p className="text-xs text-muted-foreground">
                  {selectedRows.length} supplier{selectedRows.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => toast.info(`Send RFQ to ${selectedRows.length} supplier(s) – coming soon`)}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Send RFQ
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={() => toast.info('Export functionality coming soon')}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                </div>
              </motion.div>
            )}
          </PanelContent>
        </Panel>

        {/* Suppliers Table */}
        <Panel>
          <PanelHeader>
            <PanelTitle>All Suppliers ({filteredSuppliers.length})</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-2">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 px-3 py-2 text-[10px] uppercase text-muted-foreground font-semibold border-b border-slate-800">
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedRows.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="col-span-3">Company</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Response Rate</div>
                <div className="col-span-1">Win Rate</div>
                <div className="col-span-1">Avg Time</div>
                <div className="col-span-1">Total Value</div>
                <div className="col-span-1">RFQs</div>
                <div className="col-span-1">Quotes</div>
                <div className="col-span-1">Last Active</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>

              {/* Data Rows */}
              {filteredSuppliers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No suppliers found</p>
                  {searchQuery && (
                    <p className="text-xs mt-2">Try adjusting your search or filters</p>
                  )}
                </div>
              ) : (
                filteredSuppliers.map((supplier, index) => {
                const performanceBadge = getPerformanceBadge(supplier.performance)
                return (
                  <motion.div
                    key={supplier.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-3 py-3 rounded bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-800/50 group"
                  >
                    <div className="col-span-1 flex items-center">
                      <Checkbox
                        checked={selectedRows.includes(supplier.id)}
                        onCheckedChange={(checked) => handleSelectRow(supplier.id, checked)}
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-sm">{supplier.companyName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{supplier.country}</div>
                    </div>
                    <div className="col-span-1">
                      <Badge variant={getStatusVariant(supplier.status)} className="text-[10px] px-1.5 py-0">
                        {supplier.status === 'verified' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Verified
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm font-semibold text-emerald-400">{supplier.responseRate}%</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm font-semibold">{supplier.winRate}%</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm font-semibold">{supplier.avgQuoteTime}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm font-semibold">${(supplier.totalValue / 1000000).toFixed(1)}M</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm font-semibold">{supplier.rfqsParticipated}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-sm font-semibold">{supplier.quotesSubmitted}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1.5">
                        <Activity className={`w-3 h-3 ${getDaysAgo(supplier.lastActive) === 'Today' ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                        <span className="text-xs text-muted-foreground">{getDaysAgo(supplier.lastActive)}</span>
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => navigate(`/suppliers/${supplier.id}`)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {supplier.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-400 hover:text-emerald-300"
                            onClick={() => handleApprove(supplier.id)}
                            disabled={actionLoading === supplier.id}
                          >
                            {actionLoading === supplier.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400 hover:text-red-300"
                            onClick={() => handleReject(supplier.id)}
                            disabled={actionLoading === supplier.id}
                          >
                            {actionLoading === supplier.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              }))}
            </div>
            {total > 0 && (
              <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / limit))}</span>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page * limit >= total}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </PanelContent>
        </Panel>

        <ConfirmModal
          open={!!confirm}
          onOpenChange={(open) => !open && setConfirm(null)}
          title={confirm?.type === 'approve' ? 'Approve supplier' : 'Reject supplier'}
          message={confirm?.type === 'approve'
            ? 'Are you sure you want to approve this supplier? They will be able to participate in RFQs.'
            : 'Are you sure you want to reject this supplier? They will be marked inactive.'}
          confirmLabel={confirm?.type === 'approve' ? 'Approve' : 'Reject'}
          variant={confirm?.type === 'reject' ? 'destructive' : 'default'}
          onConfirm={onConfirmAction}
        />
      </div>
    </div>
  )
}
