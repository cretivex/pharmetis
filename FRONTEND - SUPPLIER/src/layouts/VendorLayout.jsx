import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Package,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { logoutSupplier } from '@/services/auth.service'
import { getAssignedRFQs, getMyResponses } from '@/services/rfq.service'

export default function VendorLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logoutSupplier()
    navigate('/supplier/login')
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true)
      const [assignedRFQs, responses] = await Promise.all([
        getAssignedRFQs().catch(() => []),
        getMyResponses().catch(() => [])
      ])
      const rfqsList = Array.isArray(assignedRFQs) ? assignedRFQs : (assignedRFQs?.rfqs || assignedRFQs || [])
      const responsesList = Array.isArray(responses) ? responses : (responses || [])
      const newNotifications = []
      rfqsList.forEach((rfq) => {
        newNotifications.push({
          id: `rfq-${rfq.id}`,
          type: 'new_rfq',
          title: 'New RFQ Assigned',
          message: rfq.title || 'Untitled RFQ',
          timestamp: new Date(rfq.createdAt),
          link: `/supplier/rfqs/${rfq.id}`,
          icon: FileText,
          color: 'blue'
        })
      })
      responsesList.forEach((response) => {
        if (response.isAccepted) {
          newNotifications.push({
            id: `response-accepted-${response.id}`,
            type: 'response_accepted',
            title: 'RFQ Response Accepted',
            message: `Your response to "${response.rfq?.title || 'RFQ'}" has been accepted`,
            timestamp: new Date(response.updatedAt || response.createdAt),
            link: `/supplier/rfqs/${response.rfqId}`,
            icon: CheckCircle2,
            color: 'green'
          })
        } else if (response.rfq?.status === 'REJECTED') {
          newNotifications.push({
            id: `response-rejected-${response.id}`,
            type: 'response_rejected',
            title: 'RFQ Response Rejected',
            message: `Your response to "${response.rfq?.title || 'RFQ'}" was not selected`,
            timestamp: new Date(response.updatedAt || response.createdAt),
            link: `/supplier/rfqs/${response.rfqId}`,
            icon: XCircle,
            color: 'red'
          })
        }
      })
      newNotifications.sort((a, b) => b.timestamp - a.timestamp)
      setNotifications(newNotifications.slice(0, 10))
    } catch {
      setNotifications([])
    } finally {
      setLoadingNotifications(false)
    }
  }

  const unreadCount = notifications.length
  const hasUnread = unreadCount > 0

  const handleNotificationClick = (link) => {
    setNotificationOpen(false)
    navigate(link)
  }

  const navItems = [
    { path: '/supplier/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/supplier/rfqs', icon: FileText, label: 'RFQs' },
    { path: '/supplier/products', icon: Package, label: 'My Products' },
    { path: '/supplier/profile', icon: User, label: 'Profile' }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="h-16 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/supplier/dashboard" className="flex items-center">
            <span className="text-lg font-semibold tracking-tight text-foreground">Vendor Portal</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
              )}
            </button>
            {notificationOpen && (
              <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-[0_6px_30px_rgba(0,0,0,0.05)] border border-border/50 rounded-2xl">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                    {hasUnread && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
                        <p className="text-sm">Loading...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {notifications.map((notification) => {
                          const Icon = notification.icon
                          const timeAgo = getTimeAgo(notification.timestamp)
                          return (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification.link)}
                              className="w-full p-4 text-left hover:bg-muted/40 transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex-shrink-0 p-2 rounded-xl ${
                                    notification.color === 'green'
                                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                      : notification.color === 'red'
                                        ? 'bg-destructive/10 text-destructive'
                                        : 'bg-primary/10 text-primary'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                                  <p className="text-xs text-muted-foreground/80 mt-1">{timeAgo}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-border/50">
                      <button
                        onClick={() => {
                          setNotificationOpen(false)
                          navigate('/supplier/rfqs')
                        }}
                        className="text-sm text-primary hover:underline w-full text-center"
                      >
                        View All RFQs
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted/80 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground hover:bg-muted/80">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`
            fixed lg:flex flex-col w-64 px-6 py-8
            bg-card/80 backdrop-blur-xl
            border-r border-border/50
            shadow-[0_0_40px_rgba(0,0,0,0.04)]
            inset-y-0 left-0 z-40
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-200 ease-in-out
            pt-20 lg:pt-8
            hidden lg:flex
          `}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Mobile sidebar drawer (same style as desktop when open) */}
        <aside
          className={`
            fixed top-0 left-0 z-40 w-64 h-full
            bg-card/95 backdrop-blur-xl border-r border-border/50
            shadow-[0_0_40px_rgba(0,0,0,0.08)]
            pt-20 px-6 py-8
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            transition-transform duration-200 ease-in-out
            lg:hidden
          `}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0 lg:ml-64">
          <div className="max-w-7xl mx-auto px-8 py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function getTimeAgo(date) {
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}
