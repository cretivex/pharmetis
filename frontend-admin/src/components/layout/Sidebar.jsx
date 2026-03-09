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
    items: [
      { icon: BarChart3, label: 'Analytics', path: '/analytics', badgeKey: null },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Shield, label: 'Audit Log', path: '/audit-log', badgeKey: null },
      { icon: Settings, label: 'Settings', path: '/settings', badgeKey: null },
    ],
  },
]

export default function Sidebar({ collapsed = false, onToggleCollapsed }) {
  const { canAccessSettings } = useAuth()
  const location = useLocation()
  const [counts, setCounts] = useState({
    rfqs: 0,
    quotations: 0,
    suppliers: 0
  })

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
    return () => { delete window.refreshSidebarCounts }
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

  const width = collapsed ? 72 : 280
  return (
    <aside
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-slate-900/95 border-r border-slate-800 transition-[width] duration-300 ease-out"
      style={{ width }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base">Pharmetis</span>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Command Center</div>
            </div>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mx-auto">
            <Zap className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => onToggleCollapsed?.()}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Menu Groups */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuGroups.map((group, groupIndex) => {
          const GroupIcon = getGroupIcon(group.label)
          const visibleItems = group.items.filter(
            (item) => item.path !== '/settings' || canAccessSettings()
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={group.label} className={cn('mb-4', groupIndex === 0 && 'mt-0')}>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  className="px-4 mb-2"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GroupIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                </motion.div>
              )}
              <div className="space-y-0.5 px-2">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                  const badgeCount = item.badgeKey ? counts[item.badgeKey] ?? 0 : null
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded transition-all group relative",
                        isActive
                          ? "bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-500"
                          : "text-muted-foreground hover:bg-slate-800 hover:text-foreground transition-colors"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-indigo-400")} />
                      {!collapsed && (
                        <>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: collapsed ? 0 : 1 }}
                            className="text-sm font-medium flex-1"
                          >
                            {item.label}
                          </motion.span>
                          {badgeCount !== null && badgeCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                              {badgeCount}
                            </Badge>
                          )}
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

      {/* System Status */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: collapsed ? 0 : 1 }}
          className="p-4 border-t border-slate-800"
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">System Active</span>
          </div>
        </motion.div>
      )}
    </aside>
  )
}
