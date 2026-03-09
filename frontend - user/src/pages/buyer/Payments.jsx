import { useState, useEffect } from 'react'
import { CreditCard, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { useCurrency } from '../../contexts/CurrencyContext'

function Payments() {
  const { formatPrice } = useCurrency()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      setPayments([])
    } catch (err) {
      setError(err.message || 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
      'ESCROWED': { color: 'bg-blue-100 text-blue-700', icon: CreditCard, label: 'Escrowed' },
      'RELEASED': { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Released' },
      'FAILED': { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
    }
    const statusInfo = statusMap[status] || { color: 'bg-slate-100 text-slate-700', icon: CreditCard, label: status }
    const Icon = statusInfo.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Payments</h1>
        <p className="text-slate-600">Track your payment transactions and escrow status</p>
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
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Escrow Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-blue-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        #{payment.orderId}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {payment.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {formatPrice(payment.amount, payment.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentStatusBadge(payment.escrowStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">—</td>
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
            title="No payments found"
            description="Your payment history will appear here"
          />
        </div>
      )}
    </div>
  )
}

export default Payments
