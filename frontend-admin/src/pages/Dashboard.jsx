import { useState, useEffect } from 'react'
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
  Wifi,
  BarChart3,
  Loader2,
  AlertTriangle,
  Database,
} from 'lucide-react'
import { Panel, PanelHeader, PanelContent, PanelTitle, Section, SectionTitle, SectionSubtitle } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDashboardStats, getDashboardMonitoring } from '@/services/dashboard.service.js'
import { getSystemMetrics } from '@/services/system.service.js'
import { checkHealth } from '@/services/health.service'
import { reportError } from '@/utils/errorReporter'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    kpis: {
      activeRFQs: 0,
      pipelineValue: 0,
      avgQuoteTime: '0h',
      conversionRate: 0,
      expiringSoon: 0
    },
    urgencyAlerts: {
      expiring: 0,
      noSuppliers: 0,
      pendingReview: 0,
      inactive: 0
    },
    activeRFQs: [],
    financialMetrics: {
      totalPipeline: 0,
      avgQuoteValue: 0,
      totalSavings: 0,
      conversionRate: 0
    },
    supplierHealth: []
  })

  const [health, setHealth] = useState({ healthy: null, latency: null, loading: true })
  const [latencyHistory, setLatencyHistory] = useState([])
  const [monitoring, setMonitoring] = useState({
    userActivityCount: 0,
    pendingApprovals: 0,
    systemLoad: 0,
    errorRate: 0,
    dbConnectionCount: 0,
    authFailures24h: 0,
  })
  const [systemMetrics, setSystemMetrics] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    let cancelled = false
    checkHealth().then((result) => {
      if (!cancelled) {
        setHealth((h) => ({ ...h, healthy: result.healthy, latency: result.latency, loading: false }))
        setLatencyHistory((prev) => [...prev.slice(-9), result.latency].filter(Boolean))
      }
    })
    return () => { cancelled = true }
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
        setLatencyHistory((prev) => [...prev.slice(-9), result.latency].filter(Boolean))
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
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
          expiringSoon: 0
        },
        urgencyAlerts: data.urgencyAlerts || {
          expiring: 0,
          noSuppliers: 0,
          pendingReview: 0,
          inactive: 0
        },
        activeRFQs: data.activeRFQs || [],
        financialMetrics: data.financialMetrics || {
          totalPipeline: 0,
          avgQuoteValue: 0,
          totalSavings: 0,
          conversionRate: 0
        },
        supplierHealth: data.supplierHealth || []
      })
    } catch (err) {
      reportError(err, { context: 'Dashboard.loadDashboardData' })
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load dashboard data'
      setError(errorMessage)
      
      // Set empty state on error
      setStats({
        kpis: { activeRFQs: 0, pipelineValue: 0, avgQuoteTime: '0h', conversionRate: 0, expiringSoon: 0 },
        urgencyAlerts: { expiring: 0, noSuppliers: 0, pendingReview: 0, inactive: 0 },
        activeRFQs: [],
        financialMetrics: { totalPipeline: 0, avgQuoteValue: 0, totalSavings: 0, conversionRate: 0 },
        supplierHealth: []
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const kpis = [
    {
      label: 'Active RFQs',
      value: stats.kpis.activeRFQs.toString(),
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      color: 'text-indigo-400',
    },
    {
      label: 'Pipeline Value',
      value: formatCurrency(stats.kpis.pipelineValue),
      change: '+18.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-400',
    },
    {
      label: 'Avg Quote Time',
      value: stats.kpis.avgQuoteTime,
      change: '-5.2%',
      trend: 'down',
      icon: Clock,
      color: 'text-cyan-400',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.kpis.conversionRate}%`,
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-400',
    },
    {
      label: 'Expiring Soon',
      value: stats.kpis.expiringSoon.toString(),
      change: null,
      trend: null,
      icon: AlertCircle,
      color: 'text-red-400',
    },
  ]

  const urgencyAlerts = [
    {
      type: 'expiring',
      count: stats.urgencyAlerts.expiring,
      label: 'RFQs expiring in 7 days',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
    },
    {
      type: 'no_suppliers',
      count: stats.urgencyAlerts.noSuppliers,
      label: 'RFQs with no suppliers assigned',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
    {
      type: 'pending_review',
      count: stats.urgencyAlerts.pendingReview,
      label: 'Quotations pending review',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
    },
    {
      type: 'inactive',
      count: stats.urgencyAlerts.inactive,
      label: 'Suppliers inactive >30 days',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/30',
    },
  ]

  const financialMetrics = [
    { 
      label: 'Total Pipeline', 
      value: formatCurrency(stats.financialMetrics.totalPipeline), 
      change: '+18.3%', 
      trend: 'up' 
    },
    { 
      label: 'Avg Quote Value', 
      value: formatCurrency(stats.financialMetrics.avgQuoteValue), 
      change: '+5.7%', 
      trend: 'up' 
    },
    { 
      label: 'Total Savings', 
      value: formatCurrency(stats.financialMetrics.totalSavings), 
      change: '+12.1%', 
      trend: 'up' 
    },
    { 
      label: 'Conversion Rate', 
      value: `${stats.financialMetrics.conversionRate}%`, 
      change: '+5.2%', 
      trend: 'up' 
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    )
  }

  const cardBase = 'rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/8 transition-all duration-200'

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="p-6">
        {/* Page Header */}
        <Section>
          <SectionTitle>Command Center</SectionTitle>
          <SectionSubtitle>Real-time procurement operations overview</SectionSubtitle>
        </Section>

        {/* 1. Primary metrics – 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-5 ${cardBase}`}
              >
                <div className={`p-2.5 rounded-xl bg-slate-800/50 ${kpi.bgColor || ''}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs uppercase text-muted-foreground mb-1">{kpi.label}</div>
                  <div className={`text-3xl font-semibold ${kpi.color}`}>{kpi.value}</div>
                  {kpi.change && (
                    <div className={`text-xs mt-0.5 ${kpi.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {kpi.change}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 2. System metrics – secondary section */}
        <div className="mt-10">
          <SectionTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">System metrics</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`flex items-center gap-4 p-5 ${cardBase}`}>
              <BarChart3 className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase text-muted-foreground">API latency</div>
                <div className="text-3xl font-semibold text-foreground mt-0.5">
                  {health.loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground inline" />
                  ) : latencyHistory.length > 0 ? (
                    <>{health.latency ?? '—'}ms</>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-4 p-5 ${cardBase}`}>
              <Database className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-xs uppercase text-muted-foreground">DB connections</div>
                <div className="text-3xl font-semibold text-foreground mt-0.5">{monitoring.dbConnectionCount}</div>
              </div>
            </div>
            <div className={`flex items-center gap-4 p-5 ${cardBase}`}>
              <AlertTriangle className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-xs uppercase text-muted-foreground">Error rate</div>
                <div className="text-3xl font-semibold text-foreground mt-0.5">{monitoring.errorRate}%</div>
              </div>
            </div>
            <div className={`flex items-center gap-4 p-5 ${cardBase}`}>
              <Wifi className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div className="text-xs uppercase text-muted-foreground">System load</div>
                <div className="text-3xl font-semibold text-foreground mt-0.5">{monitoring.systemLoad}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Urgency Alerts */}
        <div className="mt-10">
          <Panel className="bg-red-500/10 border border-red-500/20 rounded-2xl overflow-hidden">
            <PanelHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <PanelTitle className="text-red-400">Urgency Alerts</PanelTitle>
                </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={() => navigate('/rfq')}
              >
                View All
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="grid grid-cols-4 gap-4">
              {urgencyAlerts.map((alert, index) => (
                <motion.div
                  key={alert.type}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded border ${alert.borderColor} ${alert.bgColor}`}
                >
                  <div className={`text-2xl font-bold mb-1 ${alert.color}`}>{alert.count}</div>
                  <div className="text-xs text-muted-foreground">{alert.label}</div>
                </motion.div>
              ))}
            </div>
          </PanelContent>
        </Panel>
        </div>

        {/* Active RFQ Table */}
        <div className="mt-10">
        <Panel className={`${cardBase} border-slate-800/50`}>
          <PanelHeader>
            <div className="flex items-center justify-between">
              <PanelTitle>Active RFQs</PanelTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-white/5 transition-colors" onClick={() => navigate('/rfq')}>
                View All
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-2">
              {stats.activeRFQs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No active RFQs</div>
              ) : (
                stats.activeRFQs.map((rfq, index) => (
                <motion.div
                  key={rfq.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm">{rfq.id}</span>
                      <Badge
                        variant={rfq.status === 'EXPIRING' ? 'destructive' : rfq.status === 'RESPONDED' ? 'success' : 'warning'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {rfq.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{rfq.buyer}</div>
                  </div>
                  <div className="grid grid-cols-5 gap-4 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-0.5">Value</div>
                      <div className="font-semibold">${(rfq.value / 1000).toFixed(0)}K</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-0.5">Suppliers</div>
                      <div className="font-semibold">{rfq.suppliers}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-0.5">Responses</div>
                      <div className="font-semibold text-emerald-400">{rfq.responses}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-0.5">Expires</div>
                      <div className={`font-semibold ${rfq.expiresIn !== null && rfq.expiresIn <= 7 ? 'text-red-400' : ''}`}>
                        {rfq.expiresIn !== null ? `${rfq.expiresIn}d` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => navigate(`/rfq/${rfq.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </PanelContent>
        </Panel>
        </div>

        {/* Financial Performance */}
        <div className="mt-10">
        <Panel className={`${cardBase} border-slate-800/50`}>
          <PanelHeader>
            <PanelTitle>Financial Performance</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <div className="grid grid-cols-4 gap-4">
              {financialMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md hover:bg-white/8 transition-all duration-200`}
                >
                  <div className="text-xs uppercase text-muted-foreground mb-2">{metric.label}</div>
                  <div className="text-3xl font-semibold mb-1">{metric.value}</div>
                  <div className={`text-[10px] ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {metric.change}
                  </div>
                </motion.div>
              ))}
            </div>
          </PanelContent>
        </Panel>
        </div>

        {/* Supplier Health Overview */}
        <div className="mt-10">
        <Panel className={`${cardBase} border-slate-800/50`}>
          <PanelHeader>
            <div className="flex items-center justify-between">
              <PanelTitle>Supplier Health</PanelTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs hover:bg-white/5 transition-colors" onClick={() => navigate('/suppliers')}>
                View All
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </PanelHeader>
          <PanelContent>
            <div className="space-y-2">
              {stats.supplierHealth.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No supplier data</div>
              ) : (
                stats.supplierHealth.map((supplier, index) => (
                <motion.div
                  key={supplier.id ?? `supplier-${index}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {supplier.status === 'active' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="font-medium text-sm">{supplier.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-xs">
                    <div>
                      <div className="text-muted-foreground mb-0.5">Response Rate</div>
                      <div className="font-semibold">{supplier.responseRate}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-0.5">Last Active</div>
                      <div className="font-semibold">{supplier.lastActive}</div>
                    </div>
                  </div>
                </motion.div>
                ))
              )}
            </div>
          </PanelContent>
        </Panel>
        </div>
      </div>
    </div>
  )
}
