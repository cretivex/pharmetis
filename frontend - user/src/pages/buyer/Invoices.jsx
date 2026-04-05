import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Download, ArrowUpRight } from 'lucide-react'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import ErrorState from '../../components/ui/ErrorState'
import { useCurrency } from '../../contexts/CurrencyContext'
import { buyerPortalService } from '../../services/buyer-portal.service'

function Invoices() {
  const { formatPrice } = useCurrency()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await buyerPortalService.listInvoices()
      setInvoices(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e.message || 'Failed to load invoices')
      setInvoices([])
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
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Invoices</h1>
        <p className="text-slate-600">Invoices issued when payments are confirmed</p>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white py-12">
          <Loading message="Loading invoices..." />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-slate-200 bg-white py-12">
          <ErrorState message={error} onRetry={load} retry="Retry" />
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500">Issued</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">{inv.supplier?.companyName || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      {formatPrice(Number(inv.amount), inv.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{inv.status}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                      {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {inv.fileUrl ? (
                          <a
                            href={inv.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4" />
                            PDF
                          </a>
                        ) : null}
                        {inv.rfqId ? (
                          <Link
                            to={`/buyer/rfqs/${inv.rfqId}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                          >
                            RFQ
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && !error && invoices.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white py-12">
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Invoices are generated when a payment is confirmed."
          />
        </div>
      )}
    </div>
  )
}

export default Invoices
