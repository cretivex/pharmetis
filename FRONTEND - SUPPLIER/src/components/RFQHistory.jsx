import { useEffect, useState } from 'react'
import { Clock, CheckCircle2, XCircle, Send, FileText, Package, AlertCircle } from 'lucide-react'
import api from '../services/api'

const actionConfig = {
  RFQ_CREATED: {
    label: 'RFQ Created',
    icon: FileText,
    color: 'text-slate-700',
    dot: 'bg-slate-400'
  },
  SUPPLIER_SUBMITTED: {
    label: 'You Submitted Quotation',
    icon: Package,
    color: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  ADMIN_APPROVED: {
    label: 'Admin Approved Your Quotation',
    icon: CheckCircle2,
    color: 'text-emerald-700',
    dot: 'bg-emerald-500'
  },
  SENT_TO_BUYER: {
    label: 'Sent To Buyer',
    icon: Send,
    color: 'text-blue-700',
    dot: 'bg-blue-500'
  },
  BUYER_ACCEPTED: {
    label: 'Buyer Accepted Your Quotation',
    icon: CheckCircle2,
    color: 'text-emerald-700',
    dot: 'bg-emerald-500'
  },
  BUYER_REJECTED: {
    label: 'Buyer Rejected Quotation',
    icon: XCircle,
    color: 'text-red-700',
    dot: 'bg-red-500'
  },
  ORDER_CREATED: {
    label: 'Order Created',
    icon: Package,
    color: 'text-purple-700',
    dot: 'bg-purple-500'
  }
}

const roleConfig = {
  ADMIN: 'Admin',
  BUYER: 'Buyer',
  VENDOR: 'You'
}

export function RFQHistory({ rfqId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!rfqId) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/rfqs/${rfqId}/history`)
        const data = response.data?.data || response.data || []
        setItems(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load RFQ history')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [rfqId])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-slate-50">
          <Clock className="w-4 h-4 text-slate-700" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">RFQ History</h3>
          <p className="text-xs text-slate-500">Track this RFQ lifecycle</p>
        </div>
      </div>
      {loading && (
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Clock className="w-3 h-3 animate-spin" />
          Loading history...
        </div>
      )}
      {error && !loading && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">No activity yet</p>
              <p className="text-xs text-amber-700">This RFQ was just assigned.</p>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-xs text-slate-500">No history entries yet.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((entry, index) => {
            const cfg = actionConfig[entry.action] || actionConfig.RFQ_CREATED
            const Icon = cfg.icon
            return (
              <div key={entry.id || index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {index !== items.length - 1 && (
                    <div className="flex-1 w-px bg-slate-200 mt-1" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3 h-3 ${cfg.color}`} />
                      <span className="text-xs font-medium text-slate-900">
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600 border border-slate-200">
                      {roleConfig[entry.actorRole] || entry.actorRole}
                    </span>
                    {entry.note && (
                      <span className="text-[11px] text-slate-600">
                        {entry.note}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

