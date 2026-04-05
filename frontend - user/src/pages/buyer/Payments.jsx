import { useState, useEffect, useCallback } from 'react'
import { CreditCard, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { useCurrency } from '../../contexts/CurrencyContext'
import { paymentService } from '../../services/payment.service'

function mapRow(p) {
  const supplier =
    p?.quotation?.supplier?.companyName || p?.quotation?.supplier?.name || '—'
  const rfqLabel = p?.rfq?.rfqNumber || p?.rfq?.title || p?.rfqId || '—'
  const status = p?.status || 'PENDING'
  let escrowLabel = 'Pending'
  if (status === 'PAID') escrowLabel = 'Completed'
  else if (status === 'PARTIAL') escrowLabel = 'Partial'
  else if (status === 'FAILED') escrowLabel = 'Failed'
  else if (status === 'REFUNDED') escrowLabel = 'Refunded'

  return {
    id: p.id,
    orderId: rfqLabel,
    rfqId: p.rfqId,
    supplier,
    amount: Number(p.amount),
    currency: p.currency || 'USD',
    paymentMethod: p.gateway ? `${p.paymentType || ''} · ${p.gateway}`.trim() : p.paymentType || '—',
    escrowStatus: escrowLabel,
    rawStatus: status,
    date: p.confirmedAt || p.createdAt,
  }
}

function Payments() {
  const { formatPrice } = useCurrency()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentService.list({ page: 1, limit: 100 })
      const items = Array.isArray(data?.items) ? data.items : data?.data?.items || []
      setPayments(items.map(mapRow))
    } catch (err) {
      setError(err.message || 'Failed to load payments')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  const getPaymentStatusBadge = (rawStatus) => {
    const statusMap = {
      PENDING: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
      PARTIAL: { color: 'bg-blue-100 text-blue-700', icon: CreditCard, label: 'Partial' },
      PAID: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Paid' },
      FAILED: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
      REFUNDED: { color: 'bg-slate-100 text-slate-700', icon: XCircle, label: 'Refunded' },
    }
    const statusInfo = statusMap[rawStatus] || {
      color: 'bg-slate-100 text-slate-700',
      icon: CreditCard,
      label: rawStatus,
    }
    const Icon = statusInfo.icon
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusInfo.color}`}
      >
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Payments</h1>
        <p className="text-slate-600">Track your payment transactions and status</p>
      </div>

      {loading && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <Loading message="Loading payments..." />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <ErrorState message={error} onRetry={loadPayments} retry="Retry" />
        </div>
      )}

      {!loading && !error && payments.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">RFQ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Type / gateway</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="transition-colors hover:bg-blue-50/70">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      #{payment.orderId}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{payment.supplier}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {formatPrice(payment.amount, payment.currency)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{payment.paymentMethod}</td>
                    <td className="whitespace-nowrap px-6 py-4">{getPaymentStatusBadge(payment.rawStatus)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {payment.date ? new Date(payment.date).toLocaleString() : '—'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        to={`/buyer/rfqs/${payment.rfqId}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View RFQ
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && payments.length === 0 && (
        <div className="rounded-xl border border-blue-200 bg-white py-12">
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments you make after accepting a quotation will appear here."
          />
        </div>
      )}
    </div>
  )
}

export default Payments
