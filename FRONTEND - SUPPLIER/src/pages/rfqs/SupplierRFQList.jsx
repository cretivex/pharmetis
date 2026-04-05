import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Loader2, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAssignedRFQs, getMyResponses } from '@/services/rfq.service'

export default function SupplierRFQList() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [assignedData, responsesData] = await Promise.all([
        getAssignedRFQs().catch(() => []),
        getMyResponses().catch(() => []),
      ])
      const rfqsList = Array.isArray(assignedData) ? assignedData : assignedData?.rfqs || assignedData || []
      const responsesList = Array.isArray(responsesData) ? responsesData : responsesData || []
      const responded = new Set(responsesList.map((r) => r.rfqId || r.rfq?.id).filter(Boolean))

      const merged = rfqsList.map((rfq) => ({
        ...rfq,
        hasResponse: responded.has(rfq.id),
      }))
      merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      setRows(merged)
    } catch (e) {
      setError(e?.message || 'Failed to load RFQs')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Assigned RFQs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All RFQs assigned to you. Open one to respond or negotiate.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border bg-card">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 font-medium text-foreground">No assigned RFQs</p>
          <p className="mt-1 text-sm text-muted-foreground">New assignments will appear here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">RFQ</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Response</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((rfq) => (
                  <tr key={rfq.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{rfq.title || 'Untitled RFQ'}</div>
                      <div className="text-xs text-muted-foreground">{rfq.rfqNumber || rfq.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="font-normal">
                        {rfq.status || '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {rfq.hasResponse ? (
                        <span className="text-emerald-600">Submitted</span>
                      ) : (
                        <span className="text-amber-600">Pending</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/supplier/rfqs/${rfq.id}`}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        Open
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
