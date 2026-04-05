import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Package, Loader2, ArrowUpRight } from 'lucide-react'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { useCurrency } from '../../contexts/CurrencyContext'
import { buyerPortalService } from '../../services/buyer-portal.service'

function Orders() {
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await buyerPortalService.listOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-600">Orders created from checkout appear here</p>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white py-12">
          <Loading message="Loading orders..." />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-slate-200 bg-white py-12">
          <ErrorState message={error} onRetry={load} retry="Retry" />
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Tracking</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{o.supplier?.companyName || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {formatPrice(Number(o.totalAmount), o.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{o.status}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {o.shipmentDetail?.trackingNumber || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {o.rfqId ? (
                        <Link
                          to={`/buyer/rfqs/${o.rfqId}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          RFQ
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white py-12">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you complete checkout and an order is recorded, it will show up here."
          />
        </div>
      )}
    </div>
  )
}

export default Orders
