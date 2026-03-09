import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Package,
  CheckCircle2,
  Clock,
  Send,
  CheckSquare,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getRFQById, sendRFQToSuppliers } from '@/services/rfq.service'
import { RFQHistory } from '@/components/RFQHistory'
import { getAllSuppliers as getAllSuppliersService } from '@/services/suppliers.service'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'

export default function RFQDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [rfq, setRfq] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSuppliers, setSelectedSuppliers] = useState([])
  const [sending, setSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [confirmSend, setConfirmSend] = useState(false)

  useEffect(() => {
    loadRFQ()
    loadSuppliers()
  }, [id])

  const loadRFQ = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRFQById(id)
      setRfq(data)
      // Do not pre-select suppliers who already received RFQ; only unsent can be selected
      setSelectedSuppliers([])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load RFQ details')
    } finally {
      setLoading(false)
    }
  }

  const loadSuppliers = async () => {
    try {
      const response = await getAllSuppliersService({ limit: 100 })
      const suppliersData = response.suppliers || []
      setSuppliers(suppliersData)
    } catch (err) {
    }
  }

  const sentSupplierIds = new Set((rfq?.assignedSuppliers || []).map(a => a.supplierId))
  const supplierResponseStatus = (rfq?.responses || []).reduce((acc, r) => {
    acc[r.supplierId] = r.status
    return acc
  }, {})

  const toggleSupplier = (supplierId) => {
    if (sentSupplierIds.has(supplierId)) return
    setSelectedSuppliers(prev =>
      prev.includes(supplierId)
        ? prev.filter(sid => sid !== supplierId)
        : [...prev, supplierId]
    )
  }

  const canResend = (supplierId) =>
    sentSupplierIds.has(supplierId) && supplierResponseStatus[supplierId] === 'NEGOTIATION_REQUESTED'

  const handleResend = async (supplierId) => {
    try {
      setSending(true)
      setError(null)
      await sendRFQToSuppliers(id, [supplierId])
      if (window.refreshSidebarCounts) window.refreshSidebarCounts()
      toast.success('RFQ resent to supplier')
      await loadRFQ()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend RFQ')
      toast.error(err.response?.data?.message || 'Failed to resend RFQ')
    } finally {
      setSending(false)
    }
  }

  const handleSendToSuppliers = async () => {
    setConfirmSend(false)
    if (selectedSuppliers.length === 0) {
      setError('Please select at least one supplier')
      toast.warning('Please select at least one supplier')
      return
    }

    try {
      setSending(true)
      setError(null)
      setSuccessMessage(null)
      await sendRFQToSuppliers(id, selectedSuppliers)
      if (window.refreshSidebarCounts) window.refreshSidebarCounts()
      toast.success(`RFQ sent to ${selectedSuppliers.length} supplier(s) successfully`)
      await loadRFQ()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send RFQ to suppliers')
      toast.error(err.response?.data?.message || 'Failed to send RFQ to suppliers')
    } finally {
      setSending(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading RFQ details...</p>
        </div>
      </div>
    )
  }

  if (error || !rfq) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'RFQ not found'}</p>
          <Button onClick={() => navigate('/rfq')}>Back to RFQ List</Button>
        </div>
      </div>
    )
  }

  const buyer = rfq.buyer || {}
  const items = rfq.items || []
  const timeline = [
    { status: 'Created', date: rfq.createdAt ? new Date(rfq.createdAt).toLocaleString() : 'N/A', description: 'RFQ created by buyer' },
    ...(rfq.status === 'SENT' ? [{ status: 'Sent', date: rfq.updatedAt ? new Date(rfq.updatedAt).toLocaleString() : 'N/A', description: 'RFQ sent to suppliers' }] : []),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/rfq')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">RFQ Details</h1>
          <p className="text-muted-foreground">RFQ ID: {rfq.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <Badge variant={(rfq.status === 'RESPONDED' || (rfq.status === 'SENT' && (rfq.responses?.length ?? 0) > 0)) ? 'success' : rfq.status === 'SENT' ? 'info' : 'outline'}>
          {(rfq.status === 'SENT' && (rfq.responses?.length ?? 0) > 0) ? 'RESPONDED' : rfq.status}
        </Badge>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div className="text-sm text-emerald-300 flex-1">{successMessage}</div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-400 hover:text-emerald-300" onClick={() => setSuccessMessage(null)}>
            ×
          </Button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="text-sm text-red-300 flex-1">{error}</div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={() => setError(null)}>
            ×
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Buyer Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Buyer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                  <p className="font-medium">{buyer.companyName || buyer.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Contact Name</p>
                  <p className="font-medium">{buyer.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="font-medium">{buyer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </p>
                  <p className="font-medium">{buyer.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Country
                  </p>
                  <p className="font-medium">{buyer.country || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RFQ Items */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                RFQ Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit || 'units'}</TableCell>
                        <TableCell className="text-muted-foreground">{item.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No items found</p>
              )}
            </CardContent>
          </Card>

          {/* Supplier Responses - same card/table pattern as RFQ Items */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Supplier Responses ({(rfq.responses?.length ?? 0)})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(rfq.responses && rfq.responses.length > 0) ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supplier Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Lead Time</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfq.responses.map((response) => {
                      const supplierName = response.supplier?.companyName || '—'
                      const rawAmount = response.totalAmount
                      const price = rawAmount != null ? (typeof rawAmount === 'object' && rawAmount !== null && typeof rawAmount.toString === 'function' ? rawAmount.toString() : String(rawAmount)) : '—'
                      const leadTime = response.items?.length > 0 ? response.items.map((i) => i.leadTime || '—').filter(Boolean).join(', ') || '—' : '—'
                      const message = response.notes || '—'
                      return (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">{supplierName}</TableCell>
                          <TableCell>{price}</TableCell>
                          <TableCell className="text-muted-foreground">{leadTime}</TableCell>
                          <TableCell className="text-muted-foreground">{message}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No supplier responses yet</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {rfq.notes && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{rfq.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Supplier Selection */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send to Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suppliers.length > 0 ? (
                <>
                  {suppliers.map((supplier) => {
                    const sent = sentSupplierIds.has(supplier.id)
                    return (
                      <div
                        key={supplier.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                      >
                        {sent ? (
                          <span className="flex items-center gap-2 text-emerald-400 text-sm font-medium shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                            RFQ Sent
                          </span>
                        ) : (
                          <Checkbox
                            checked={selectedSuppliers.includes(supplier.id)}
                            onCheckedChange={() => toggleSupplier(supplier.id)}
                          />
                        )}
                        <label className={`flex-1 ${sent ? 'cursor-default' : 'cursor-pointer'}`}>
                          <p className="font-medium">{supplier.companyName}</p>
                          {supplier.country && (
                            <p className="text-sm text-muted-foreground">{supplier.country}</p>
                          )}
                        </label>
                        {canResend(supplier.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={sending}
                            onClick={() => handleResend(supplier.id)}
                          >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Resend'}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                  <Button 
                    className="w-full mt-4" 
                    disabled={selectedSuppliers.length === 0 || sending}
                    onClick={() => selectedSuppliers.length > 0 && setConfirmSend(true)}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to {selectedSuppliers.length} Supplier(s)
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">No suppliers available</p>
              )}
            </CardContent>
          </Card>

          {/* RFQ History */}
          <RFQHistory rfqId={rfq.id} />

          {/* Dates */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="font-medium">{rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              {rfq.expiresAt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Expires</p>
                  <p className="font-medium text-amber-400">{new Date(rfq.expiresAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <ConfirmModal
            open={confirmSend}
            onOpenChange={setConfirmSend}
            title="Send RFQ to suppliers"
            message={`Send this RFQ to ${selectedSuppliers.length} selected supplier(s)?`}
            confirmLabel="Send"
            variant="default"
            onConfirm={handleSendToSuppliers}
          />
        </div>
      </div>
    </div>
  )
}
