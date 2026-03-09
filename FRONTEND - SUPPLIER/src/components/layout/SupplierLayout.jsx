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
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { logoutSupplier } from '@/services/auth.service'
import { getAssignedRFQs, getMyResponses } from '@/services/rfq.service'

export default function SupplierLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logoutSupplier()
    navigate('/login')
  }

  useEffect(() => {
    loadNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Close notification dropdown when clicking outside
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

      // New RFQs assigned
      rfqsList.forEach(rfq => {
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

      // RFQ Response updates
      responsesList.forEach(response => {
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

      // Sort by timestamp (newest first)
      newNotifications.sort((a, b) => b.timestamp - a.timestamp)
      setNotifications(newNotifications.slice(0, 10)) // Limit to 10 most recent
    } catch (error) {
      console.error('Failed to load notifications:', error)
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
    { path: '/supplier/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/supplier/dashboard" className="flex items-center ml-2 lg:ml-0">
                <span className="text-xl font-semibold text-gray-900">Supplier Portal</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative"
                >
                  <Bell className="h-5 w-5" />
                  {hasUnread && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {notificationOpen && (
                  <Card className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden z-50 shadow-lg">
                    <CardContent className="p-0">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {hasUnread && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {loadingNotifications ? (
                          <div className="p-8 text-center text-gray-500">
                            <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
                            <p className="text-sm">Loading notifications...</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {notifications.map((notification) => {
                              const Icon = notification.icon
                              const timeAgo = getTimeAgo(notification.timestamp)
                              return (
                                <button
                                  key={notification.id}
                                  onClick={() => handleNotificationClick(notification.link)}
                                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 p-2 rounded-full ${
                                      notification.color === 'green' ? 'bg-green-100 text-green-600' :
                                      notification.color === 'red' ? 'bg-red-100 text-red-600' :
                                      'bg-blue-100 text-blue-600'
                                    }`}>
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900">
                                        {notification.title}
                                      </p>
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {timeAgo}
                                      </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200">
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
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white border-r border-gray-200
            transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 transition-transform duration-200 ease-in-out
            pt-16 lg:pt-0
          `}
        >
          <nav className="h-full px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
