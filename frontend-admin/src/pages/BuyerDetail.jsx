import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { reportError } from '@/utils/errorReporter'
import { motion } from 'framer-motion'
import { getBuyerById, getBuyerRFQs, getBuyerPayments } from '@/services/buyers.service'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  FileText,
  CreditCard,
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Panel, PanelHeader, PanelContent, PanelTitle } from '@/components/ui/panel'

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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const rfqStatusColors = {
  DRAFT: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  SUBMITTED: { label: 'Submitted', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  SENT: { label: 'Sent', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  OPEN: { label: 'Open', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  CLOSED: { label: 'Closed', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  EXPIRED: { label: 'Expired', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
}

const paymentStatusColors = {
  PENDING: { label: 'Pending', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  PAID: { label: 'Paid', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  FAILED: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  REFUNDED: { label: 'Refunded', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
}

export default function BuyerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [buyer, setBuyer] = useState(null)
  const [rfqs, setRfqs] = useState([])
  const [payments, setPayments] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      loadBuyerData()
    }
  }, [id])

  const loadBuyerData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [buyerData, rfqsData, paymentsData] = await Promise.all([
        getBuyerById(id),
        getBuyerRFQs(id, { limit: 50 }),
        getBuyerPayments(id, { limit: 50 })
      ])
      
      setBuyer(buyerData)
      setRfqs(rfqsData?.rfqs || [])
      setPayments(paymentsData?.payments || [])
    } catch (err) {
      reportError(err, { context: 'BuyerDetail.loadData' })
      setError(err.response?.data?.message || 'Failed to load buyer details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <div className="text-muted-foreground">Loading buyer details...</div>
        </div>
      </div>
    )
  }

  if (error || !buyer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <div className="text-red-400 text-lg font-semibold">Error loading buyer</div>
          <div className="text-muted-foreground text-sm">{error || 'Buyer not found'}</div>
          <Button onClick={() => navigate('/buyers')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Buyers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/buyers')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{buyer.fullName || 'Buyer'}</h1>
              <p className="text-sm text-muted-foreground">{buyer.email}</p>
            </div>
          </div>
          <Badge variant={buyer.status === 'active' ? 'success' : 'destructive'}>
            {buyer.status === 'active' ? 'Active' : 'Suspended'}
          </Badge>
        </div>

        {/* Profile Summary Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                  {(buyer.fullName || buyer.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{buyer.fullName || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">{buyer.companyName || 'N/A'}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-cyan-400" />
                  {buyer._count?.orders || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total RFQs</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  {buyer._count?.rfqs || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Spend</div>
                <div className="text-2xl font-bold flex items-center gap-2 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                  {formatCurrency(buyer.totalSpend || 0)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-900 border-slate-800">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="rfqs">
              <FileText className="w-4 h-4 mr-2" />
              RFQs ({rfqs.length})
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payments ({payments.length})
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{buyer.email || 'N/A'}</div>
                    </div>
                  </div>
                  {buyer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{buyer.phone}</div>
                      </div>
                    </div>
                  )}
                  {buyer.country && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Location</div>
                        <div className="font-medium">{buyer.city ? `${buyer.city}, ` : ''}{buyer.country}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Company Name</div>
                      <div className="font-medium">{buyer.companyName || 'N/A'}</div>
                    </div>
                  </div>
                  {buyer.companyInfo?.gstNumber && (
                    <div>
                      <div className="text-sm text-muted-foreground">GST Number</div>
                      <div className="font-medium">{buyer.companyInfo.gstNumber}</div>
                    </div>
                  )}
                  {buyer.companyInfo?.drugLicenseNumber && (
                    <div>
                      <div className="text-sm text-muted-foreground">Drug License</div>
                      <div className="font-medium">{buyer.companyInfo.drugLicenseNumber}</div>
                    </div>
                  )}
                  {buyer.companyInfo?.businessType && (
                    <div>
                      <div className="text-sm text-muted-foreground">Business Type</div>
                      <div className="font-medium">{buyer.companyInfo.businessType}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Joined Date</div>
                      <div className="font-medium">{formatDate(buyer.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className={`w-4 h-4 ${buyer.emailVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
                    <div>
                      <div className="text-sm text-muted-foreground">Email Verified</div>
                      <div className="font-medium">{buyer.emailVerified ? 'Verified' : 'Not Verified'}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* RFQs Tab */}
          <TabsContent value="rfqs" className="mt-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>RFQ History</CardTitle>
              </CardHeader>
              <CardContent>
                {rfqs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No RFQs found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">RFQ ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Title</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Items</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfqs.map((rfq) => {
                          const statusConfig = rfqStatusColors[rfq.status] || rfqStatusColors.DRAFT
                          return (
                            <tr key={rfq.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                              <td className="py-4 px-4">
                                <div className="font-medium">{rfq.id.slice(0, 8).toUpperCase()}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm">{rfq.title || 'Untitled RFQ'}</div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="text-sm">{rfq.items?.length || 0} items</div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <Badge className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm text-muted-foreground">{formatDate(rfq.createdAt)}</div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/rfq/${rfq.id}`)}
                                >
                                  View
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No payments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Payment ID</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">RFQ/Order</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Amount</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => {
                          const statusConfig = paymentStatusColors[payment.status] || paymentStatusColors.PENDING
                          return (
                            <tr key={payment.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                              <td className="py-4 px-4">
                                <div className="font-medium">{payment.id.slice(0, 8).toUpperCase()}</div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm">
                                  {payment.rfq?.title || payment.order?.orderNumber || 'N/A'}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="font-semibold text-emerald-400">{formatCurrency(payment.amount || 0)}</div>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <Badge className={`${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-sm text-muted-foreground">{formatDate(payment.createdAt)}</div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
                    <div className="flex-1">
                      <div className="font-medium">Account Created</div>
                      <div className="text-sm text-muted-foreground">{formatDate(buyer.createdAt)}</div>
                    </div>
                  </div>
                  {buyer._count?.orders > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                      <ShoppingCart className="w-4 h-4 text-cyan-400 mt-2" />
                      <div className="flex-1">
                        <div className="font-medium">{buyer._count.orders} Order{buyer._count.orders !== 1 ? 's' : ''} Placed</div>
                        <div className="text-sm text-muted-foreground">Total spend: {formatCurrency(buyer.totalSpend || 0)}</div>
                      </div>
                    </div>
                  )}
                  {buyer._count?.rfqs > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                      <FileText className="w-4 h-4 text-indigo-400 mt-2" />
                      <div className="flex-1">
                        <div className="font-medium">{buyer._count.rfqs} RFQ{buyer._count.rfqs !== 1 ? 's' : ''} Created</div>
                        <div className="text-sm text-muted-foreground">Active buyer on platform</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
