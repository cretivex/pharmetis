import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Users,
  FileCheck,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  Network,
  Brain,
  Cog,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getDashboardCounts } from '@/services/dashboard.service'
import { useAuth } from '@/contexts/AuthContext'

const menuGroups = [
  {
    label: 'Operations',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', badgeKey: null },
      { icon: FileText, label: 'RFQs', path: '/rfq', badgeKey: 'rfqs' },
      { icon: FileCheck, label: 'Quotations', path: '/quotations', badgeKey: 'quotations' },
    ],
  },
  {
    label: 'Network',
    items: [
      { icon: Users, label: 'Suppliers', path: '/suppliers', badgeKey: 'suppliers' },
      { icon: Users, label: 'Buyers', path: '/buyers', badgeKey: null },
      { icon: Package, label: 'Products', path: '/products', badgeKey: null },
    ],
  },
  {
    label: 'Intelligence',
    items: [{ icon: BarChart3, label: 'Analytics', path: '/analytics', badgeKey: null }],
  },
  {
    label: 'System',
    items: [
      { icon: Shield, label: 'Audit Log', path: '/audit-log', badgeKey: null },
      { icon: Settings, label: 'Settings', path: '/settings', badgeKey: null },
    ],
  },
]

export default function Sidebar({
  collapsed = false,
  onToggleCollapsed,
  mobileOpen = false,
  onCloseMobile,
  isDesktop = true,
}) {
  const { canAccessSettings } = useAuth()
  const location = useLocation()
  const [counts, setCounts] = useState({
    rfqs: 0,
    quotations: 0,
    suppliers: 0,
  })

  const showLabels = isDesktop ? !collapsed : true
  const width = isDesktop ? (collapsed ? 72 : 280) : 280

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await getDashboardCounts()
        setCounts(data || { rfqs: 0, quotations: 0, suppliers: 0 })
      } catch {
        setCounts({ rfqs: 0, quotations: 0, suppliers: 0 })
      }
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    window.refreshSidebarCounts = async () => {
      try {
        const data = await getDashboardCounts()
        setCounts(data || { rfqs: 0, quotations: 0, suppliers: 0 })
      } catch {
        // ignore
      }
    }
    return () => {
      delete window.refreshSidebarCounts
    }
  }, [])

  const getGroupIcon = (label) => {
    switch (label) {
      case 'Operations':
        return Activity
      case 'Network':
        return Network
      case 'Intelligence':
        return Brain
      case 'System':
        return Cog
      default:
        return Activity
    }
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border/60 bg-sidebar transition-[width,transform] duration-300 ease-out',
        !isDesktop && (mobileOpen ? 'translate-x-0 shadow-shell' : '-translate-x-full'),
        isDesktop && 'translate-x-0'
      )}
      style={{ width }}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border/60 px-2">
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center',
            showLabels ? 'justify-start gap-2.5' : 'justify-center'
          )}
        >
          {showLabels ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex min-w-0 items-center gap-2.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-glow ring-1 ring-primary/30">
                <Zap className="h-5 w-5 text-primary-foreground" aria-hidden />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                  Pharmetis
                </span>
                <span className="text-2xs font-medium uppercase tracking-wider text-sidebar-foreground">
                  Command
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-600 shadow-glow ring-1 ring-primary/30">
              <Zap className="h-5 w-5 text-primary-foreground" aria-hidden />
            </div>
          )}
        </div>
        {isDesktop ? (
          <button
            type="button"
            onClick={() => onToggleCollapsed?.()}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin">
        {menuGroups.map((group, groupIndex) => {
          const GroupIcon = getGroupIcon(group.label)
          const visibleItems = group.items.filter(
            (item) => item.path !== '/settings' || canAccessSettings()
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={group.label} className={cn('mb-4', groupIndex === 0 && 'mt-0')}>
              {showLabels && (
                <div className="mb-2 px-4">
                  <div className="flex items-center gap-2">
                    <GroupIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    <span className="text-2xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-0.5 px-2">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                  const badgeCount = item.badgeKey ? (counts[item.badgeKey] ?? 0) : null

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => !isDesktop && onCloseMobile?.()}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                        isActive
                          ? 'bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20'
                          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                      )}
                    >
                      {isActive ? (
                        <span
                          className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-primary"
                          aria-hidden
                        />
                      ) : null}
                      <Icon
                        className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : 'opacity-90')}
                        aria-hidden
                      />
                      {showLabels && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {badgeCount !== null && badgeCount > 0 ? (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px] tabular-nums">
                              {badgeCount}
                            </Badge>
                          ) : null}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {showLabels ? (
        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-2xs font-semibold uppercase tracking-wider text-emerald-400">
              Systems operational
            </span>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
