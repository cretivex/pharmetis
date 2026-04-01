import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  Database,
  RefreshCw,
  Shield,
  Users,
  Package,
  Settings,
  Activity,
  Lock,
  Sparkles,
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle, Section, SectionTitle, SectionSubtitle } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { StatusDot } from '@/components/dashboard/StatusDot'
import { getDashboardStats, getDashboardMonitoring } from '@/services/dashboard.service.js'
import { getSystemMetrics } from '@/services/system.service.js'
import { checkHealth } from '@/services/health.service'
import { reportError } from '@/utils/errorReporter'
import { cn } from '@/lib/utils'

function formatRelativeTime(date) {
  if (!date) return ''
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return date.toLocaleDateString()
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-24 rounded-2xl bg-muted/40" />
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/40" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-muted/30" />
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [stats, setStats] = useState({
    kpis: {
      activeRFQs: 0,
      pipelineValue: 0,
      avgQuoteTime: '0h',
      conversionRate: 0,
      expiringSoon: 0,
    },
    urgencyAlerts: {
      expiring: 0,
      noSuppliers: 0,
      pendingReview: 0,
      inactive: 0,
    },
    activeRFQs: [],
    financialMetrics: {
      totalPipeline: 0,
      avgQuoteValue: 0,
      totalSavings: 0,
      conversionRate: 0,
    },
    supplierHealth: [],
  })

  const [health, setHealth] = useState({ healthy: null, latency: null, loading: true })
  const [monitoring, setMonitoring] = useState({
    userActivityCount: 0,
    pendingApprovals: 0,
    systemLoad: 0,
    errorRate: 0,
    dbConnectionCount: 0,
    authFailures24h: 0,
  })
  const [systemMetrics, setSystemMetrics] = useState(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDashboardStats()

      if (!data) {
        throw new Error('No data received from server')
      }

      setStats({
        kpis: data.kpis || {
          activeRFQs: 0,
          pipelineValue: 0,
          avgQuoteTime: '0h',
          conversionRate: 0,
          expiringSoon: 0,
        },
        urgencyAlerts: data.urgencyAlerts || {
          expiring: 0,
          noSuppliers: 0,
          pendingReview: 0,
          inactive: 0,
        },
        activeRFQs: data.activeRFQs || [],
        financialMetrics: data.financialMetrics || {
          totalPipeline: 0,
          avgQuoteValue: 0,
          totalSavings: 0,
          conversionRate: 0,
        },
        supplierHealth: data.supplierHealth || [],
      })
      setLastUpdated(new Date())
    } catch (err) {
      reportError(err, { context: 'Dashboard.loadDashboardData' })
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data'
      setError(errorMessage)
      setStats({
        kpis: { activeRFQs: 0, pipelineValue: 0, avgQuoteTime: '0h', conversionRate: 0, expiringSoon: 0 },
        urgencyAlerts: { expiring: 0, noSuppliers: 0, pendingReview: 0, inactive: 0 },
        activeRFQs: [],
        financialMetrics: { totalPipeline: 0, avgQuoteValue: 0, totalSavings: 0, conversionRate: 0 },
        supplierHealth: [],
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  useEffect(() => {
    let cancelled = false
    checkHealth().then((result) => {
      if (!cancelled) {
        setHealth((h) => ({ ...h, healthy: result.healthy, latency: result.latency, loading: false }))
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    getDashboardMonitoring().then((data) => setMonitoring(data))
  }, [])

  useEffect(() => {
    getSystemMetrics().then((data) => setSystemMetrics(data))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => getSystemMetrics().then((data) => setSystemMetrics(data)), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      checkHealth().then((result) => {
        setHealth((h) => ({ ...h, healthy: result.healthy, latency: result.latency }))
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${Number(value || 0).toFixed(0)}`
  }

  const quickActions = [
    { label: 'RFQs', desc: 'Requests & workflow', icon: FileText, path: '/rfq', accent: 'primary' },
    { label: 'Suppliers', desc: 'Vendor network', icon: Users, path: '/suppliers', accent: 'violet' },
    { label: 'Buyers', desc: 'Buyer accounts', icon: Users, path: '/buyers', accent: 'cyan' },
    { label: 'Products', desc: 'Catalog oversight', icon: Package, path: '/products', accent: 'emerald' },
    { label: 'Analytics', desc: 'Usage & trends', icon: BarChart3, path: '/analytics', accent: 'amber' },
    { label: 'Settings', desc: 'Platform config', icon: Settings, path: '/settings', accent: 'rose' },
  ]

  const urgencyAlerts = [
    {
      type: 'expiring',
      count: stats.urgencyAlerts.expiring,
      label: 'RFQs expiring in 7 days',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/25',
    },
    {
      type: 'no_suppliers',
      count: stats.urgencyAlerts.noSuppliers,
      label: 'RFQs without assigned suppliers',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/25',
    },
    {
      type: 'pending_review',
      count: stats.urgencyAlerts.pendingReview,
      label: 'Quotations pending review',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/25',
    },
    {
      type: 'inactive',
      count: stats.urgencyAlerts.inactive,
      label: 'Suppliers inactive 30+ days',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/40',
      borderColor: 'border-border/60',
    },
  ]

  const financialMetrics = [
    { label: 'Total pipeline', value: formatCurrency(stats.financialMetrics.totalPipeline) },
    { label: 'Avg quote value', value: formatCurrency(stats.financialMetrics.avgQuoteValue) },
    { label: 'Total savings', value: formatCurrency(stats.financialMetrics.totalSavings) },
    { label: 'Conversion rate', value: `${stats.financialMetrics.conversionRate}%` },
  ]

  const systemMetricEntries =
    systemMetrics && typeof systemMetrics === 'object'
      ? Object.entries(systemMetrics)
          .filter(([, v]) => v !== null && v !== undefined && v !== '')
          .slice(0, 6)
      : []

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" aria-hidden />
          <p className="font-medium text-foreground">Could not load Super Admin dashboard</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-6" onClick={() => loadDashboardData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const cardRow =
    'rounded-xl border border-border/40 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/30'

  return (
    <div>
      <div className="min-w-0 max-w-[var(--dash-max-content)]">
        {/* —— Hero: Super Admin scope —— */}
        <header className="mb-8 flex flex-col gap-6 border-b border-border/40 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="border border-primary/25 bg-primary/15 px-2.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-primary"
              >
                <Shield className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
                Super Admin
              </Badge>
              <span className="text-2xs text-muted-foreground">Full platform control</span>
            </div>
            <SectionTitle className="text-balance text-3xl sm:text-4xl">Marketplace command center</SectionTitle>
            <SectionSubtitle className="mt-2 text-base">
              Multi-vendor RFQ operations, financial exposure, and platform health in one scalable view — built
              for operators and engineering.
            </SectionSubtitle>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {lastUpdated ? (
              <p className="text-center text-2xs text-muted-foreground sm:text-right">
                Data refreshed {formatRelativeTime(lastUpdated)}
              </p>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => loadDashboardData()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </header>

        {/* —— Quick actions (conversion + navigation) —— */}
        <Section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <h3 className="text-sm font-semibold text-foreground">Quick actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action, i) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.path}
                  type="button"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(action.path)}
                  className={cn(
                    'group flex flex-col items-start rounded-2xl border border-border/50 bg-card/40 p-4 text-left shadow-sm transition-all duration-200 hover:border-primary/35 hover:bg-card/70 hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  )}
                >
                  <div
                    className={cn(
                      'mb-3 flex h-9 w-9 items-center justify-center rounded-lg ring-1',
                      action.accent === 'primary' && 'bg-primary/15 text-primary ring-primary/25',
                      action.accent === 'violet' && 'bg-violet-500/15 text-violet-400 ring-violet-500/25',
                      action.accent === 'cyan' && 'bg-cyan-500/15 text-cyan-400 ring-cyan-500/25',
                      action.accent === 'emerald' && 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25',
                      action.accent === 'amber' && 'bg-amber-500/15 text-amber-400 ring-amber-500/25',
                      action.accent === 'rose' && 'bg-rose-500/15 text-rose-400 ring-rose-500/25'
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{action.label}</span>
                  <span className="mt-0.5 text-2xs text-muted-foreground">{action.desc}</span>
                </motion.button>
              )
            })}
          </div>
        </Section>

        {/* —— KPI row — enterprise metrics —— */}
        <Section className="mb-10">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Marketplace KPIs</h3>
              <p className="text-2xs text-muted-foreground">Live aggregates · expandable in future API versions</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
            <MetricCard
              index={0}
              icon={FileText}
              label="Active RFQs"
              value={stats.kpis.activeRFQs.toString()}
              accent="primary"
            />
            <MetricCard
              index={1}
              icon={DollarSign}
              label="Pipeline value"
              value={formatCurrency(stats.kpis.pipelineValue)}
              accent="emerald"
            />
            <MetricCard
              index={2}
              icon={Clock}
              label="Avg quote time"
              value={stats.kpis.avgQuoteTime}
              accent="cyan"
            />
            <MetricCard
              index={3}
              icon={TrendingUp}
              label="Conversion rate"
              value={`${stats.kpis.conversionRate}%`}
              accent="violet"
            />
            <MetricCard
              index={4}
              icon={AlertCircle}
              label="Expiring soon"
              value={stats.kpis.expiringSoon.toString()}
              hint="Within policy window"
              accent="rose"
              className="col-span-2 xl:col-span-1"
            />
          </div>
        </Section>

        {/* —— Platform health strip —— */}
        <Section className="mb-10">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">Platform & security</h3>
            <p className="text-2xs text-muted-foreground">Operational signals for Super Admin oversight</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="border-border/50 bg-card/40">
              <PanelHeader className="py-3">
                <PanelTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Activity className="h-4 w-4 text-primary" aria-hidden />
                  API & gateway
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="space-y-3 pt-0">
                <StatusDot
                  ok={health.healthy}
                  label="Health check"
                  detail={
                    health.loading
                      ? 'Checking…'
                      : health.latency != null
                        ? `${health.latency}ms`
                        : '—'
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <StatusDot
                    ok={monitoring.errorRate < 1}
                    label="Error rate"
                    detail={`${monitoring.errorRate}%`}
                    className="flex-1"
                  />
                </div>
              </PanelContent>
            </Panel>

            <Panel className="border-border/50 bg-card/40">
              <PanelHeader className="py-3">
                <PanelTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Database className="h-4 w-4 text-primary" aria-hidden />
                  Infrastructure
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="grid grid-cols-2 gap-3 pt-0">
                <div className={cardRow}>
                  <p className="text-2xs text-muted-foreground">DB connections</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">{monitoring.dbConnectionCount}</p>
                </div>
                <div className={cardRow}>
                  <p className="text-2xs text-muted-foreground">System load</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">{monitoring.systemLoad}%</p>
                </div>
              </PanelContent>
            </Panel>

            <Panel className="border-border/50 bg-card/40">
              <PanelHeader className="py-3">
                <PanelTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" aria-hidden />
                  Access & activity
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="grid grid-cols-1 gap-3 pt-0 sm:grid-cols-3 lg:grid-cols-1">
                <div className={cardRow}>
                  <p className="text-2xs text-muted-foreground">Pending approvals</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">{monitoring.pendingApprovals}</p>
                </div>
                <div className={cardRow}>
                  <p className="text-2xs text-muted-foreground">Auth failures (24h)</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">{monitoring.authFailures24h}</p>
                </div>
                <div className={cardRow}>
                  <p className="text-2xs text-muted-foreground">User activity</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">{monitoring.userActivityCount}</p>
                </div>
              </PanelContent>
            </Panel>
          </div>

          {systemMetricEntries.length > 0 ? (
            <Panel className="mt-4 border-dashed border-border/60 bg-muted/20">
              <PanelHeader className="py-3">
                <PanelTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Extended system metrics
                </PanelTitle>
              </PanelHeader>
              <PanelContent className="pt-0">
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {systemMetricEntries.map(([key, val]) => (
                    <div key={key} className="rounded-lg border border-border/40 bg-background/50 px-3 py-2">
                      <dt className="text-2xs font-medium uppercase tracking-wide text-muted-foreground">{key}</dt>
                      <dd className="mt-0.5 truncate font-mono text-sm text-foreground">{String(val)}</dd>
                    </div>
                  ))}
                </dl>
              </PanelContent>
            </Panel>
          ) : null}
        </Section>

        {/* —— Urgency —— */}
        <div className="mb-10">
          <Panel className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
            <PanelHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" aria-hidden />
                  <PanelTitle className="text-rose-200">Attention required</PanelTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-rose-200 hover:bg-rose-500/10" onClick={() => navigate('/rfq')}>
                  Open RFQs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </PanelHeader>
            <PanelContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {urgencyAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.type}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn('rounded-xl border p-4', alert.borderColor, alert.bgColor)}
                  >
                    <p className={cn('text-3xl font-bold tabular-nums', alert.color)}>{alert.count}</p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{alert.label}</p>
                  </motion.div>
                ))}
              </div>
            </PanelContent>
          </Panel>
        </div>

        {/* —— Active RFQs —— */}
        <div className="mb-10">
          <Panel>
            <PanelHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PanelTitle>Active RFQs</PanelTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/rfq')}>
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </PanelHeader>
            <PanelContent>
              <div className="-mx-5 overflow-x-auto px-5">
                {stats.activeRFQs.length === 0 ? (
                  <p className="py-10 text-center text-sm text-muted-foreground">No active RFQs in this view.</p>
                ) : (
                  <div className="min-w-[720px] space-y-2">
                    {stats.activeRFQs.map((rfq, index) => (
                      <motion.div
                        key={rfq.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex flex-wrap items-center gap-4 rounded-xl border border-border/40 bg-muted/15 px-4 py-3 transition-colors hover:bg-muted/25"
                      >
                        <div className="min-w-[140px] flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-semibold text-foreground">{rfq.id}</span>
                            <Badge
                              variant={
                                rfq.status === 'EXPIRING'
                                  ? 'destructive'
                                  : rfq.status === 'RESPONDED'
                                    ? 'success'
                                    : 'warning'
                              }
                              className="text-[10px]"
                            >
                              {rfq.status}
                            </Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{rfq.buyer}</p>
                        </div>
                        <div className="grid flex-1 grid-cols-2 gap-4 text-xs sm:grid-cols-4 lg:grid-cols-5 lg:gap-6">
                          <div>
                            <p className="text-muted-foreground">Value</p>
                            <p className="font-semibold tabular-nums">${(rfq.value / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Suppliers</p>
                            <p className="font-semibold tabular-nums">{rfq.suppliers}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Responses</p>
                            <p className="font-semibold tabular-nums text-emerald-400">{rfq.responses}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expires</p>
                            <p
                              className={cn(
                                'font-semibold tabular-nums',
                                rfq.expiresIn !== null && rfq.expiresIn <= 7 && 'text-rose-400'
                              )}
                            >
                              {rfq.expiresIn !== null ? `${rfq.expiresIn}d` : '—'}
                            </p>
                          </div>
                          <div className="col-span-2 flex items-center justify-end sm:col-span-1 lg:col-span-1">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/rfq/${rfq.id}`)}>
                              Open
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </PanelContent>
          </Panel>
        </div>

        {/* —— Financial + suppliers —— */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <Panel>
            <PanelHeader>
              <PanelTitle>Financial performance</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <div className="grid grid-cols-2 gap-4">
                {financialMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-xl border border-border/40 bg-muted/20 p-4"
                  >
                    <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{metric.label}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{metric.value}</p>
                  </motion.div>
                ))}
              </div>
            </PanelContent>
          </Panel>

          <Panel>
            <PanelHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <PanelTitle>Supplier health</PanelTitle>
                <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate('/suppliers')}>
                  Network
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </PanelHeader>
            <PanelContent>
              {stats.supplierHealth.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No supplier rows returned.</p>
              ) : (
                <div className="space-y-2">
                  {stats.supplierHealth.map((supplier, index) => (
                    <motion.div
                      key={supplier.id ?? `supplier-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex flex-col gap-3 rounded-xl border border-border/40 bg-muted/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {supplier.status === 'active' ? (
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" aria-hidden />
                        ) : (
                          <XCircle className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
                        )}
                        <span className="font-medium text-foreground">{supplier.name}</span>
                      </div>
                      <div className="flex gap-8 text-xs">
                        <div>
                          <p className="text-muted-foreground">Response rate</p>
                          <p className="font-semibold tabular-nums">{supplier.responseRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last active</p>
                          <p className="font-semibold">{supplier.lastActive}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </PanelContent>
          </Panel>
        </div>

      </div>
    </div>
  )
}
