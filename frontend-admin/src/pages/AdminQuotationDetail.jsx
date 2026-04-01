import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Send,
  Edit,
  Save,
  X,
  FileText,
  Building2,
  DollarSign,
  Percent,
  Calculator,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  MessageSquare,
  Package
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmModal } from '@/components/Modal'
import { useToast } from '@/components/ui/ToastProvider'
import { getRFQResponseById, reviewQuotation, sendQuotationToBuyer, sendBackToSupplier, updateRFQResponse } from '@/services/quotations.service'

export default function AdminQuotationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quotation, setQuotation] = useState(null)
  const [editedItems, setEditedItems] = useState([])
  const [marginPercent, setMarginPercent] = useState(0)
  const [adminNotes, setAdminNotes] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // 'approve' | 'reject' | 'revision'
  const toast = useToast()

  useEffect(() => {
    loadQuotation()
  }, [id])

  const loadQuotation = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRFQResponseById(id)
      setQuotation(data)
      setEditedItems(data.items?.map(item => ({
        ...item,
        originalUnitPrice: parseFloat(item.unitPrice) || 0,
        editedUnitPrice: parseFloat(item.unitPrice) || 0,
        margin: 0,
        finalUnitPrice: parseFloat(item.unitPrice) || 0,
        finalTotalPrice: parseFloat(item.totalPrice) || 0
      })) || [])
      setAdminNotes(data.adminNotes || '')
      setMarginPercent(0)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quotation')
    } finally {
      setLoading(false)
    }
  }

  const updateItemPrice = (index, price) => {
    if (quotation?.status === 'SENT_TO_BUYER') return
    const updated = [...editedItems]
    const editPrice = parseFloat(price) || 0
    updated[index] = {
      ...updated[index],
      editedUnitPrice: editPrice
    }
    // Recalculate with existing margin
    recalculateItem(updated[index])
    setEditedItems(updated)
  }

  const updateMargin = (index, margin) => {
    if (quotation?.status === 'SENT_TO_BUYER') return
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
    const quantity = parseFloat(item.quantity) || 1
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
      const quantity = parseFloat(item.quantity) || 1
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

  const calculateTotals = () => {
    const subtotal = editedItems.reduce((sum, item) => sum + (item.finalTotalPrice || 0), 0)
    const originalTotal = editedItems.reduce((sum, item) => sum + (item.originalUnitPrice * (parseFloat(item.quantity) || 1)), 0)
    const marginTotal = subtotal - originalTotal
    return { subtotal, originalTotal, marginTotal }
  }

  const runApprove = async () => {
    setSaving(true)
    setError(null)
    await reviewQuotation(id, 'APPROVE', adminNotes)
    toast.success('Quotation approved successfully')
    await loadQuotation()
    if (window.refreshSidebarCounts) window.refreshSidebarCounts()
    setSaving(false)
  }
  const runReject = async () => {
    setSaving(true)
    setError(null)
    await reviewQuotation(id, 'REJECT', adminNotes)
    toast.success('Quotation rejected successfully')
    await loadQuotation()
    if (window.refreshSidebarCounts) window.refreshSidebarCounts()
    setSaving(false)
  }
  const runRequestRevision = async () => {
    setSaving(true)
    setError(null)
    await reviewQuotation(id, 'REJECT', adminNotes || 'Please revise your quotation')
    toast.success('Revision requested successfully')
    await loadQuotation()
    if (window.refreshSidebarCounts) window.refreshSidebarCounts()
    setSaving(false)
  }

  const handleConfirmAction = async () => {
    try {
      if (confirmAction === 'approve') await runApprove()
      else if (confirmAction === 'reject') await runReject()
      else if (confirmAction === 'revision') await runRequestRevision()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Action failed')
      toast.error(err.response?.data?.message || err.message || 'Action failed')
    }
  }

  const handleSaveEdits = async () => {
    try {
      setSaving(true)
      setError(null)
      const { subtotal } = calculateTotals()
      const updatedItems = editedItems.map(item => {
        const editPrice = item.editedUnitPrice || item.originalUnitPrice
        const margin = parseFloat(item.margin) || 0
        const finalUnitPrice = editPrice * (1 + margin / 100)
        const quantity = parseFloat(item.quantity) || 1
        const finalTotalPrice = finalUnitPrice * quantity
        
        return {
          id: item.id,
          editedUnitPrice: editPrice,
          margin: margin,
          unitPrice: finalUnitPrice,
          totalPrice: finalTotalPrice
        }
      })
      
      const response = await updateRFQResponse(id, {
        items: updatedItems,
        totalAmount: subtotal,
        adminNotes
      })
      
      if (response) {
        setQuotation(response)
        const updatedItemsState = (response.items || []).map(item => {
          const savedItem = updatedItems.find(ui => ui.id === item.id)
          const originalPrice = savedItem?.editedUnitPrice || parseFloat(item.unitPrice) || 0
          const margin = savedItem?.margin || 0
          const finalPrice = parseFloat(item.unitPrice) || 0
          const finalTotal = parseFloat(item.totalPrice) || 0
          
          return {
            ...item,
            id: item.id,
            rfqItemId: item.rfqItemId || item.id,
            productId: item.productId || item.product?.id,
            productName: item.productName || item.product?.name || 'Product',
            quantity: item.quantity || '1',
            unit: item.unit || 'units',
            originalUnitPrice: originalPrice,
            editedUnitPrice: originalPrice,
            margin: margin,
            finalUnitPrice: finalPrice,
            finalTotalPrice: finalTotal,
            subtotal: finalTotal,
            taxAmount: 0,
            total: finalTotal,
            leadTime: item.leadTime,
            notes: item.notes
          }
        })
        setEditedItems(updatedItemsState)
        setAdminNotes(response.adminNotes || '')
      }
      
      toast.success('Changes saved successfully')
      setEditMode(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes')
      toast.error(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const [confirmSend, setConfirmSend] = useState(false)
  const [confirmSendBack, setConfirmSendBack] = useState(false)
  const [confirmSendRevised, setConfirmSendRevised] = useState(false)

  const handleSendBackToSupplier = async () => {
    setConfirmSendBack(false)
    try {
      setSaving(true)
      setError(null)
      await sendBackToSupplier(id)
      toast.success('Quotation sent back to supplier successfully')
      await loadQuotation()
      if (window.refreshSidebarCounts) window.refreshSidebarCounts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send back to supplier')
      toast.error(err.response?.data?.message || 'Failed to send back to supplier')
    } finally {
      setSaving(false)
    }
  }

  const handleSendToBuyer = async () => {
    try {
      setSaving(true)
      setError(null)
      const { subtotal } = calculateTotals()
      const totalAmount = (quotation.supplierNegotiationResponse === 'ACCEPTED' && (quotation.adminFinalPrice != null || quotation.buyerRequestedPrice != null))
        ? parseFloat(quotation.adminFinalPrice ?? quotation.buyerRequestedPrice ?? 0)
        : subtotal
      const editedData = {
        items: editedItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.finalUnitPrice,
          totalPrice: item.finalTotalPrice,
          leadTime: item.leadTime,
          notes: item.notes
        })),
        totalAmount,
        currency: quotation.currency || 'USD',
        validity: quotation.validity,
        notes: quotation.notes
      }
      await sendQuotationToBuyer(id, editedData)
      toast.success('Quotation sent to buyer successfully')
      await loadQuotation()
      if (window.refreshSidebarCounts) window.refreshSidebarCounts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send quotation')
      toast.error(err.response?.data?.message || 'Failed to send quotation')
    } finally {
      setSaving(false)
    }
  }

  const runSendToBuyer = () => handleSendToBuyer()

  const handleSendRevisedToBuyer = async () => {
    try {
      setSaving(true)
      setError(null)
      const counterTotal = parseFloat(quotation.supplierCounterPrice ?? 0)
      const editedData = {
        items: editedItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.finalUnitPrice,
          totalPrice: item.finalTotalPrice,
          leadTime: item.leadTime,
          notes: item.notes
        })),
        totalAmount: counterTotal,
        currency: quotation.currency || 'USD',
        validity: quotation.validity,
        notes: quotation.notes
      }
      await sendQuotationToBuyer(id, editedData)
      toast.success('Revised quotation sent to buyer successfully')
      await loadQuotation()
      if (window.refreshSidebarCounts) window.refreshSidebarCounts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send revised quotation')
      toast.error(err.response?.data?.message || 'Failed to send revised quotation')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Quotation not found</p>
          <Button onClick={() => navigate('/quotations')} className="mt-4">
            Back to Quotations
          </Button>
        </div>
      </div>
    )
  }

  const { subtotal, originalTotal, marginTotal } = calculateTotals()
  const statusColors = {
    SUBMITTED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    ADMIN_REVIEW: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
    SENT_TO_BUYER: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    NEGOTIATION_REQUESTED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    REVISION_REQUESTED: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-8">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/quotations')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Quotation Details</h1>
              <p className="text-sm text-muted-foreground">RFQ #{quotation.rfqId?.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
          <Badge className={statusColors[quotation.status] || 'bg-slate-800 text-slate-400'}>
            {quotation.status === 'REVISION_REQUESTED' ? 'Revision Requested' : quotation.status === 'NEGOTIATION_REQUESTED' ? 'Negotiation Requested' : quotation.status?.replace(/_/g, ' ')}
          </Badge>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400 flex-1">{error}</p>
            <Button variant="ghost" size="icon" onClick={() => setError(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-emerald-400 flex-1">{success}</p>
            <Button variant="ghost" size="icon" onClick={() => setSuccess(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {(quotation.status === 'NEGOTIATION_REQUESTED' || quotation.status === 'REVISION_REQUESTED') && (quotation.revisionNote || quotation.negotiationMessage || quotation.buyerRequestedPrice) && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400 text-base">
                <MessageSquare className="h-4 w-4" />
                Buyer requested lower price
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Original Price</Label>
                  <p className="text-sm font-semibold text-foreground">
                    {quotation.currency || 'USD'} {parseFloat(quotation.adminFinalPrice ?? quotation.totalAmount ?? 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Buyer Requested Price</Label>
                  <p className="text-sm font-semibold text-amber-400">
                    {quotation.currency || 'USD'} {parseFloat(quotation.buyerRequestedPrice ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Message</Label>
                <p className="text-sm text-foreground mt-1 bg-card border border-border rounded p-3">
                  {quotation.revisionNote || quotation.negotiationMessage || 'No message'}
                </p>
              </div>
              {quotation.revisionRequestedAt && (
                <p className="text-xs text-muted-foreground">
                  Requested at {new Date(quotation.revisionRequestedAt).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {quotation.status === 'SENT_BACK_TO_SUPPLIER' && (quotation.supplierNegotiationResponse === 'ACCEPTED' || quotation.supplierNegotiationResponse === 'COUNTERED' || quotation.supplierNegotiationResponse === 'REJECTED') && (
          <Card className="border-cyan-500/30 bg-cyan-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-400 text-base">
                <MessageSquare className="h-4 w-4" />
                Supplier response
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quotation.supplierNegotiationResponse === 'ACCEPTED' && (
                <p className="text-sm text-foreground">Supplier accepted buyer&apos;s requested price ({quotation.currency || 'USD'} {parseFloat(quotation.buyerRequestedPrice ?? 0).toFixed(2)}). You can send this quote to the buyer.</p>
              )}
              {quotation.supplierNegotiationResponse === 'COUNTERED' && (
                <p className="text-sm text-foreground">Supplier counter price: <span className="font-semibold text-cyan-400">{quotation.currency || 'USD'} {parseFloat(quotation.supplierCounterPrice ?? 0).toFixed(2)}</span>. Use &quot;Send revised quote to buyer&quot; below to send this price to the buyer.</p>
              )}
              {quotation.supplierNegotiationResponse === 'REJECTED' && (
                <p className="text-sm text-foreground">Supplier declined the buyer&apos;s requested price.</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Supplier Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Company Name</Label>
                    <p className="font-semibold">{quotation.supplier?.companyName || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Country</Label>
                      <p className="text-sm">{quotation.supplier?.country || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">City</Label>
                      <p className="text-sm">{quotation.supplier?.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Items & Pricing
                  </CardTitle>
                  {!editMode && quotation.status !== 'SENT_TO_BUYER' && (
                    <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Prices
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {editMode && (
                  <div className="mb-4 p-4 bg-slate-800/50 rounded-lg space-y-3">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label>Apply Margin % to All Items</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={marginPercent}
                          onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          disabled={quotation.status === 'SENT_TO_BUYER'}
                        />
                      </div>
                      <Button onClick={applyGlobalMargin} variant="outline">
                        Apply
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdits} size="sm" disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                      </Button>
                      <Button onClick={() => { setEditMode(false); loadQuotation(); }} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Original Price</TableHead>
                        {editMode && <TableHead className="text-right">Edit Price</TableHead>}
                        {editMode && <TableHead className="text-right">Margin %</TableHead>}
                        <TableHead className="text-right">Final Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Lead Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedItems.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell className="font-medium">{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="text-right">${item.originalUnitPrice.toFixed(2)}</TableCell>
                          {editMode && (
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.editedUnitPrice}
                                onChange={(e) => updateItemPrice(index, e.target.value)}
                                className="w-24 text-right"
                                disabled={quotation.status === 'SENT_TO_BUYER'}
                              />
                            </TableCell>
                          )}
                          {editMode && (
                            <TableCell>
                              <Input
                                type="number"
                                step="0.1"
                                value={item.margin}
                                onChange={(e) => updateMargin(index, e.target.value)}
                                className="w-20 text-right"
                                disabled={quotation.status === 'SENT_TO_BUYER'}
                              />
                            </TableCell>
                          )}
                          <TableCell className="text-right font-semibold">${item.finalUnitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.finalTotalPrice.toFixed(2)}</TableCell>
                          <TableCell>{item.leadTime || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Total</span>
                    <span>${originalTotal.toFixed(2)}</span>
                  </div>
                  {editMode && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Margin Amount</span>
                      <span className={marginTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        ${marginTotal >= 0 ? '+' : ''}{marginTotal.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-800">
                    <span>Final Total</span>
                    <span className="text-emerald-400">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Supplier Notes</Label>
                  <p className="text-sm bg-slate-800/50 p-3 rounded">{quotation.notes || 'No notes provided'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Currency</Label>
                    <p className="text-sm">{quotation.currency || 'USD'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Validity</Label>
                    <p className="text-sm">{quotation.validity ? new Date(quotation.validity).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={6}
                  className="bg-slate-800/50"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(quotation.status === 'NEGOTIATION_REQUESTED' || quotation.status === 'REVISION_REQUESTED') ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">Buyer requested a lower price. Send the quotation back to the supplier so they can submit an updated quote.</p>
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700"
                      onClick={() => setConfirmSendBack(true)}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Send Back To Supplier
                    </Button>
                  </>
                ) : quotation.status === 'SENT_TO_BUYER' ? (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm font-medium text-blue-300">Sent to Buyer</p>
                    <p className="text-xs text-blue-400/70 mt-1">Waiting for Buyer Decision</p>
                    {quotation.sentToBuyerAt && (
                      <p className="text-xs text-blue-400/50 mt-2">
                        Sent on {new Date(quotation.sentToBuyerAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : quotation.status === 'SENT_BACK_TO_SUPPLIER' && quotation.supplierNegotiationResponse === 'COUNTERED' ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">Supplier sent a counter price. Send this revised quote to the buyer.</p>
                    <Button
                      className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500"
                      onClick={() => setConfirmSendRevised(true)}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Send revised quote to buyer
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => setConfirmAction('approve')}
                      disabled={saving || quotation.status === 'ACCEPTED' || quotation.status === 'SENT_TO_BUYER'}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setConfirmAction('reject')}
                      disabled={saving || quotation.status === 'REJECTED' || quotation.status === 'SENT_TO_BUYER'}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setConfirmAction('revision')}
                      disabled={saving || quotation.status === 'SENT_TO_BUYER'}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Edit className="h-4 w-4 mr-2" />}
                      Request Revision
                    </Button>
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                      onClick={() => setConfirmSend(true)}
                      disabled={saving || quotation.status !== 'ACCEPTED'}
                    >
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                      Send to Buyer
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <ConfirmModal
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={confirmAction === 'approve' ? 'Approve quotation' : confirmAction === 'reject' ? 'Reject quotation' : 'Request revision'}
          message={
            confirmAction === 'approve'
              ? 'Are you sure you want to approve this quotation?'
              : confirmAction === 'reject'
                ? 'Are you sure you want to reject this quotation?'
                : 'Request revision from supplier? They will need to resubmit.'
          }
          confirmLabel={confirmAction === 'approve' ? 'Approve' : confirmAction === 'reject' ? 'Reject' : 'Request revision'}
          variant={confirmAction === 'reject' ? 'destructive' : 'default'}
          onConfirm={handleConfirmAction}
        />
        <ConfirmModal
          open={confirmSend}
          onOpenChange={setConfirmSend}
          title="Send to buyer"
          message="Send this quotation to the buyer? They will be able to accept or decline."
          confirmLabel="Send"
          variant="default"
          onConfirm={runSendToBuyer}
        />
        <ConfirmModal
          open={confirmSendBack}
          onOpenChange={setConfirmSendBack}
          title="Send back to supplier"
          message="Send this quotation back to the supplier? They will be able to submit an updated quotation."
          confirmLabel="Send Back"
          variant="default"
          onConfirm={handleSendBackToSupplier}
        />
        <ConfirmModal
          open={confirmSendRevised}
          onOpenChange={setConfirmSendRevised}
          title="Send revised quote to buyer"
          message="Send the supplier's counter price to the buyer? They will see the revised quotation."
          confirmLabel="Send"
          variant="default"
          onConfirm={async () => {
            setConfirmSendRevised(false)
            await handleSendRevisedToBuyer()
          }}
        />
      </div>
    </div>
  )
}
