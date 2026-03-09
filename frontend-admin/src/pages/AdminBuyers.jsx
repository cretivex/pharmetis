import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAllBuyers, suspendBuyer, activateBuyer } from '@/services/buyers.service'
import {
  Search,
  User,
  Mail,
  Building2,
  MapPin,
  Eye,
  Ban,
  CheckCircle2,
  DollarSign,
  ShoppingCart,
  Calendar,
  Filter,
  Loader2,
  TrendingUp,
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle, Section, SectionTitle, SectionSubtitle } from '@/components/ui/panel'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'

const getStatusVariant = (status) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'suspended':
      return 'destructive'
    default:
      return 'default'
  }
}

const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export default function AdminBuyers() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [buyers, setBuyers] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [actionLoading, setActionLoading] = useState(null)
  const [confirm, setConfirm] = useState(null) // { type: 'suspend'|'activate', id }
  const toast = useToast()

  useEffect(() => {
    loadBuyers()
  }, [currentPage, statusFilter])

  const loadBuyers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllBuyers({
        page: currentPage,
        limit: 20,
        search: searchQuery,
        status: statusFilter === 'all' ? undefined : statusFilter
      })
      
      const buyersData = response?.buyers || response?.data?.buyers || []
      const paginationData = response?.pagination || response?.data?.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
      
      setBuyers(Array.isArray(buyersData) ? buyersData : [])
      setPagination(paginationData)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load buyers'
      setError(errorMessage)
      setBuyers([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadBuyers()
  }

  const handleSuspend = (id) => setConfirm({ type: 'suspend', id })
  const handleActivate = (id) => setConfirm({ type: 'activate', id })

  const onConfirmAction = async () => {
    if (!confirm) return
    try {
      setActionLoading(confirm.id)
      if (confirm.type === 'suspend') {
        await suspendBuyer(confirm.id)
        toast.success('Buyer suspended successfully')
      } else {
        await activateBuyer(confirm.id)
        toast.success('Buyer activated successfully')
      }
      await loadBuyers()
    } catch (err) {
      toast.error(err.response?.data?.message || (confirm.type === 'suspend' ? 'Failed to suspend buyer' : 'Failed to activate buyer'))
      throw err
    } finally {
      setActionLoading(null)
    }
  }

  const handleView = (id) => {
    navigate(`/buyers/${id}`)
  }

  const filteredBuyers = buyers.filter((buyer) => {
    if (!buyer || !buyer.id) return false
    
    const matchesSearch = !searchQuery || 
      (buyer.fullName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (buyer.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (buyer.companyName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (buyer.country?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || buyer.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <div className="text-muted-foreground">Loading buyers...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-lg font-semibold">Error loading buyers</div>
          <div className="text-muted-foreground text-sm">{error}</div>
          <Button 
            onClick={() => {
              setError(null)
              loadBuyers()
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
              <SectionTitle>Buyer Management</SectionTitle>
              <SectionSubtitle>View and manage all buyers on the platform</SectionSubtitle>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, company, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 bg-slate-900 border-slate-800"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={statusFilter === 'suspended' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('suspended')}
              >
                Suspended
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Panel>
              <PanelContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground text-sm">Total Buyers</div>
                    <div className="text-2xl font-bold mt-1">{pagination.total || 0}</div>
                  </div>
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
              </PanelContent>
            </Panel>
            <Panel>
              <PanelContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground text-sm">Active</div>
                    <div className="text-2xl font-bold mt-1">
                      {buyers.filter(b => b.status === 'active').length}
                    </div>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </PanelContent>
            </Panel>
            <Panel>
              <PanelContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground text-sm">Total Orders</div>
                    <div className="text-2xl font-bold mt-1">
                      {buyers.reduce((sum, b) => sum + (b.totalOrders || 0), 0)}
                    </div>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-cyan-400" />
                </div>
              </PanelContent>
            </Panel>
            <Panel>
              <PanelContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-muted-foreground text-sm">Total Spend</div>
                    <div className="text-2xl font-bold mt-1">
                      {formatCurrency(buyers.reduce((sum, b) => sum + (parseFloat(b.totalSpend) || 0), 0))}
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-amber-400" />
                </div>
              </PanelContent>
            </Panel>
          </div>

          {/* Table */}
          <Panel>
            <PanelHeader>
              <PanelTitle>Buyers ({filteredBuyers.length})</PanelTitle>
            </PanelHeader>
            <PanelContent>
              {filteredBuyers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No buyers found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Company</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Country</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Orders</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Total Spend</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Joined</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBuyers.map((buyer) => (
                        <motion.tr
                          key={buyer.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                                {(buyer.fullName || buyer.email || 'U')[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{buyer.fullName || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span className="text-sm">{buyer.email || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              <span className="text-sm">{buyer.companyName || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{buyer.country || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{buyer.totalOrders || 0}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="font-semibold text-emerald-400">
                              {formatCurrency(buyer.totalSpend || 0)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant={getStatusVariant(buyer.status)}>
                              {buyer.status === 'active' ? 'Active' : 'Suspended'}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">{formatDate(buyer.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(buyer.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {buyer.status === 'active' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSuspend(buyer.id)}
                                  disabled={actionLoading === buyer.id}
                                >
                                  {actionLoading === buyer.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Ban className="w-4 h-4 text-amber-400" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleActivate(buyer.id)}
                                  disabled={actionLoading === buyer.id}
                                >
                                  {actionLoading === buyer.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} buyers
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </PanelContent>
          </Panel>
        </Section>

        <ConfirmModal
          open={!!confirm}
          onOpenChange={(open) => !open && setConfirm(null)}
          title={confirm?.type === 'suspend' ? 'Suspend buyer' : 'Activate buyer'}
          message={confirm?.type === 'suspend'
            ? 'Are you sure you want to suspend this buyer? They will not be able to place orders.'
            : 'Are you sure you want to activate this buyer?'}
          confirmLabel={confirm?.type === 'suspend' ? 'Suspend' : 'Activate'}
          variant={confirm?.type === 'suspend' ? 'destructive' : 'default'}
          onConfirm={onConfirmAction}
        />
      </div>
    </div>
  )
}
