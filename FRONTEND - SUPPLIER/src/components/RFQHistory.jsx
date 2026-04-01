import { useEffect, useState } from 'react'
import { Clock, CheckCircle2, XCircle, Send, FileText, Package, AlertCircle } from 'lucide-react'
import api from '../services/api'

const actionConfig = {
  RFQ_CREATED: {
    label: 'RFQ Created',
    icon: FileText,
    color: 'text-foreground',
    dot: 'bg-muted-foreground',
  },
  SUPPLIER_SUBMITTED: {
    label: 'You Submitted Quotation',
    icon: Package,
    color: 'text-primary',
    dot: 'bg-primary',
  },
  ADMIN_APPROVED: {
    label: 'Admin Approved Your Quotation',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  SENT_TO_BUYER: {
    label: 'Sent To Buyer',
    icon: Send,
    color: 'text-primary',
    dot: 'bg-primary',
  },
  BUYER_ACCEPTED: {
    label: 'Buyer Accepted Your Quotation',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  BUYER_REJECTED: {
    label: 'Buyer Rejected Quotation',
    icon: XCircle,
    color: 'text-destructive',
    dot: 'bg-destructive',
  },
  ORDER_CREATED: {
    label: 'Order Created',
    icon: Package,
    color: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
}

const roleConfig = {
  ADMIN: 'Admin',
  BUYER: 'Buyer',
  VENDOR: 'You',
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
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-muted/50 p-2">
          <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">RFQ History</h3>
          <p className="text-xs text-muted-foreground">Track this RFQ lifecycle</p>
        </div>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 animate-spin" aria-hidden />
          Loading history...
        </div>
      )}
      {error && !loading && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <div>
              <p className="mb-1 font-medium">No activity yet</p>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90">This RFQ was just assigned.</p>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-xs text-muted-foreground">No history entries yet.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-4">
          {items.map((entry, index) => {
            const cfg = actionConfig[entry.action] || actionConfig.RFQ_CREATED
            const Icon = cfg.icon
            return (
              <div key={entry.id || index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  {index !== items.length - 1 && <div className="mt-1 flex-1 w-px bg-border" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3 w-3 ${cfg.color}`} aria-hidden />
                      <span className="text-xs font-medium text-foreground">{cfg.label}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {roleConfig[entry.actorRole] || entry.actorRole}
                    </span>
                    {entry.note && (
                      <span className="text-[11px] text-muted-foreground">{entry.note}</span>
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
