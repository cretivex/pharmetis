import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Download, Filter } from 'lucide-react'
import { getAuditLogs, getAuditLogMeta } from '@/services/audit-logs.service'
import { reportError } from '@/utils/errorReporter'

function formatTimestamp(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString()
}

function exportToCSV(logs, columns) {
  const headers = columns.map((c) => c.label).join(',')
  const escape = (v) => (v == null ? '' : `"${String(v).replace(/"/g, '""')}"`)
  const rows = logs.map((row) =>
    columns.map((c) => escape(row[c.key])).join(',')
  )
  return [headers, ...rows].join('\n')
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ actions: [], resources: [] })
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    resource: '',
    dateFrom: '',
    dateTo: '',
  })
  const [appliedFilters, setAppliedFilters] = useState({})

  const loadMeta = useCallback(async () => {
    try {
      const data = await getAuditLogMeta()
      setMeta(data)
    } catch (err) {
      reportError(err, { context: 'AuditLog.loadMeta' })
      setMeta({ actions: [], resources: [] })
    }
  }, [])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: appliedFilters.page ?? pagination.page,
        limit: appliedFilters.limit ?? pagination.limit,
        ...(appliedFilters.user && { user: appliedFilters.user }),
        ...(appliedFilters.action && { action: appliedFilters.action }),
        ...(appliedFilters.resource && { resource: appliedFilters.resource }),
        ...(appliedFilters.dateFrom && { dateFrom: appliedFilters.dateFrom }),
        ...(appliedFilters.dateTo && { dateTo: appliedFilters.dateTo }),
      }
      const data = await getAuditLogs(params)
      setLogs(data.logs || [])
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
    } catch (err) {
      reportError(err, { context: 'AuditLog.loadLogs' })
      setLogs([])
      setPagination((p) => ({ ...p, total: 0, totalPages: 0 }))
    } finally {
      setLoading(false)
    }
  }, [appliedFilters])

  useEffect(() => {
    loadMeta()
  }, [loadMeta])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const handleApplyFilters = () => {
    setAppliedFilters({
      ...filters,
      page: 1,
      limit: pagination.limit,
    })
  }

  const handlePageChange = (page) => {
    setAppliedFilters((prev) => ({ ...prev, page }))
  }

  const handleLimitChange = (limit) => {
    setAppliedFilters((prev) => ({ ...prev, limit, page: 1 }))
    setPagination((p) => ({ ...p, limit }))
  }

  const displayUser = (row) => row.userEmail || row.userId || '—'

  const handleExportCSV = () => {
    const columns = [
      { key: 'createdAt', label: 'Time' },
      { key: 'userDisplay', label: 'User' },
      { key: 'userRole', label: 'Role' },
      { key: 'action', label: 'Action' },
      { key: 'resourceType', label: 'Resource' },
      { key: 'resourceId', label: 'Resource ID' },
      { key: 'ipAddress', label: 'IP address' },
    ]
    const rows = logs.map((r) => ({
      ...r,
      createdAt: formatTimestamp(r.createdAt),
      userDisplay: displayUser(r),
    }))
    const csv = exportToCSV(rows, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = [
    { key: 'createdAt', label: 'Time' },
    { key: 'userDisplay', label: 'User' },
    { key: 'userRole', label: 'Role' },
    { key: 'action', label: 'Action' },
    { key: 'resourceType', label: 'Resource' },
    { key: 'resourceId', label: 'Resource ID' },
    { key: 'ipAddress', label: 'IP address' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">System and admin action history</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={logs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="border border-border/50 rounded-xl bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">User</Label>
              <Input
                placeholder="Search by user..."
                value={filters.user}
                onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}
                className="h-9 border border-border/50 bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Action</Label>
              <select
                value={filters.action}
                onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
                className="h-9 w-full rounded-md border border-border/50 bg-muted/30 px-3 text-sm"
              >
                <option value="">All</option>
                {meta.actions?.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Resource</Label>
              <select
                value={filters.resource}
                onChange={(e) => setFilters((f) => ({ ...f, resource: e.target.value }))}
                className="h-9 w-full rounded-md border border-border/50 bg-muted/30 px-3 text-sm"
              >
                <option value="">All</option>
                {meta.resources?.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                className="h-9 border border-border/50 bg-muted/30"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                className="h-9 border border-border/50 bg-muted/30"
              />
            </div>
          </div>
          <Button size="sm" onClick={handleApplyFilters}>
            Apply filters
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-border/50 rounded-xl bg-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Activity log</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={logs.map((r) => ({ ...r, userDisplay: displayUser(r) }))}
            keyId="id"
            page={pagination.page}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            loading={loading}
            emptyMessage="No audit entries match your filters."
            renderCell={(row, key) => {
              if (key === 'createdAt') return formatTimestamp(row.createdAt)
              if (key === 'userDisplay') return displayUser(row)
              const v = row[key]
              return v != null ? String(v) : '—'
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
