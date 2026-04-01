import { useEffect, useState } from 'react'
import { Clock, CheckCircle2, XCircle, Send, FileText, Package, MessageSquare } from 'lucide-react'
import api from '@/services/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const actionConfig = {
  RFQ_CREATED: {
    label: 'RFQ Created',
    icon: FileText,
    color: 'text-slate-200',
    badge: 'bg-slate-700 text-slate-100'
  },
  SUPPLIER_SUBMITTED: {
    label: 'Supplier Submitted Quotation',
    icon: Package,
    color: 'text-blue-200',
    badge: 'bg-blue-500/20 text-blue-200'
  },
  ADMIN_APPROVED: {
    label: 'Admin Approved Quotation',
    icon: CheckCircle2,
    color: 'text-emerald-200',
    badge: 'bg-emerald-500/20 text-emerald-200'
  },
  SENT_TO_BUYER: {
    label: 'Sent To Buyer',
    icon: Send,
    color: 'text-blue-300',
    badge: 'bg-blue-500/20 text-blue-200'
  },
  BUYER_ACCEPTED: {
    label: 'Buyer Accepted Quotation',
    icon: CheckCircle2,
    color: 'text-emerald-300',
    badge: 'bg-emerald-500/20 text-emerald-200'
  },
  BUYER_REJECTED: {
    label: 'Buyer Rejected Quotation',
    icon: XCircle,
    color: 'text-red-300',
    badge: 'bg-red-500/20 text-red-200'
  },
  BUYER_REQUESTED_LOWER_PRICE: {
    label: 'Buyer requested lower price',
    icon: MessageSquare,
    color: 'text-yellow-300',
    badge: 'bg-yellow-500/20 text-yellow-200'
  },
  ORDER_CREATED: {
    label: 'Order Created',
    icon: Package,
    color: 'text-purple-300',
    badge: 'bg-purple-500/20 text-purple-200'
  }
}

const roleConfig = {
  ADMIN: 'Admin',
  BUYER: 'Buyer',
  VENDOR: 'Supplier'
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
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          RFQ History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="w-3 h-3 animate-spin" />
            Loading history...
          </div>
        )}
        {error && !loading && (
          <div className="text-xs text-red-400">{error}</div>
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
                    <div className={`w-6 h-6 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    {index !== items.length - 1 && (
                      <div className="flex-1 w-px bg-slate-800 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-100">
                        {cfg.label}
                      </span>
                      <Badge className={`${cfg.badge} text-[10px] px-2 py-0.5`}>
                        {roleConfig[entry.actorRole] || entry.actorRole}
                      </Badge>
                    </div>
                    {entry.note && (
                      <div className="text-[11px] text-slate-300">
                        {entry.note}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

