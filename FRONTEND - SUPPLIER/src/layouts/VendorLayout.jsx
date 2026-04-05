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
  Moon,
  MessageSquare
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import PageContainer from '@/components/layout/PageContainer'
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
    navigate('/supplier/login', {
      state: { message: 'You have been signed out.', toastVariant: 'info' },
    })
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!sidebarOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sidebarOpen])

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
    { path: '/supplier/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/supplier/products', icon: Package, label: 'My Products' },
    { path: '/supplier/profile', icon: User, label: 'Profile' }
  ]

  const NavLinks = ({ onNavigate }) => (
    <>
      <p className="mb-3 px-3 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</p>
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.path === '/supplier/rfqs'
              ? location.pathname.startsWith('/supplier/rfqs')
              : location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`
                relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'}
              `}
            >
              {isActive ? (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" aria-hidden />
              ) : null}
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )

  return (
    <div className="flex min-h-[100dvh] min-h-screen flex-col overflow-hidden bg-muted/25 text-foreground dark:bg-background lg:h-[100dvh]">
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/90 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sm:h-16 sm:px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="shrink-0 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/supplier/dashboard" className="group flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-xs font-bold text-primary-foreground shadow-sm ring-1 ring-primary/20 transition group-hover:shadow-md">
              P
            </span>
            <span className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
              Supplier
            </span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Notifications"
              aria-expanded={notificationOpen}
            >
              <Bell className="h-5 w-5" />
              {hasUnread ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
              ) : null}
            </button>
            {notificationOpen ? (
              <Card className="fixed right-3 top-16 z-[60] w-[min(20rem,calc(100vw-1.5rem))] max-h-[min(24rem,calc(100dvh-5rem))] overflow-hidden shadow-lg sm:absolute sm:right-0 sm:top-full sm:mt-2 sm:w-80">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b border-border/50 p-4">
                    <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                    {hasUnread ? (
                      <span className="rounded-full bg-destructive/10 px-2 py-1 text-xs text-destructive">
                        {unreadCount} new
                      </span>
                    ) : null}
                  </div>
                  <div className="max-h-72 overflow-y-auto overscroll-contain">
                    {loadingNotifications ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Clock className="mx-auto mb-2 h-6 w-6 animate-spin" />
                        <p className="text-sm">Loading...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
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
                              type="button"
                              onClick={() => handleNotificationClick(notification.link)}
                              className="w-full p-4 text-left transition-colors hover:bg-muted/40"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex-shrink-0 rounded-xl p-2 ${
                                    notification.color === 'green'
                                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                      : notification.color === 'red'
                                        ? 'bg-destructive/10 text-destructive'
                                        : 'bg-primary/10 text-primary'
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-foreground">{notification.title}</p>
                                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
                                  <p className="mt-1 text-xs text-muted-foreground/80">{timeAgo}</p>
                                </div>
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <div className="border-t border-border/50 p-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationOpen(false)
                          navigate('/supplier/rfqs')
                        }}
                        className="w-full text-center text-sm text-primary hover:underline"
                      >
                        View All RFQs
                      </button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted/80"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="hidden text-muted-foreground hover:text-foreground hover:bg-muted/80 sm:inline-flex"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`
            fixed inset-y-0 left-0 z-40 flex w-64 max-w-[min(20rem,calc(100vw-1rem))] flex-col overflow-y-auto overflow-x-hidden overscroll-contain border-r border-border/60 bg-sidebar/98 px-4 py-6 shadow-xl backdrop-blur-xl transition-transform duration-200 ease-out
            lg:sticky lg:top-0 lg:z-0 lg:h-full lg:max-w-none lg:translate-x-0 lg:shrink-0 lg:shadow-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            pt-[calc(3.5rem+env(safe-area-inset-top,0px))] lg:pt-6
          `}
        >
          <NavLinks onNavigate={() => setSidebarOpen(false)} />
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain lg:flex lg:flex-col">
          <div className="min-h-0 flex-1">
            <PageContainer>{children}</PageContainer>
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
