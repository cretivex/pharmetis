import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, User, ChevronDown, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { logout } from '@/services/auth.service'
import { getUnreadCount } from '@/services/notifications.service'
import { useAuth } from '@/contexts/AuthContext'

const POLL_INTERVAL_MS = 30000

export default function Navbar({ sidebarWidth = 280 }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const userMenuRef = useRef(null)

  const refreshNotificationCount = async () => {
    try {
      const count = await getUnreadCount()
      setNotificationCount(Math.min(99, count))
    } catch {
      setNotificationCount(0)
    }
  }

  useEffect(() => {
    refreshNotificationCount()
    const interval = setInterval(refreshNotificationCount, POLL_INTERVAL_MS)
    const onUpdated = () => refreshNotificationCount()
    window.addEventListener('notifications-updated', onUpdated)
    return () => {
      clearInterval(interval)
      window.removeEventListener('notifications-updated', onUpdated)
    }
  }, [])

  const handleLogout = () => {
    logout()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const leftOffset = typeof sidebarWidth === 'number' ? sidebarWidth : 280
  return (
    <header
      className="fixed top-0 right-0 h-16 bg-slate-900/95 border-b border-slate-800 z-30 flex items-center justify-between px-6 transition-[left] duration-300 ease-out"
      style={{ left: leftOffset, right: 0 }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search RFQs, suppliers, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 h-9 text-sm focus:ring-primary/20 transition-shadow"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button 
          className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {notificationCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {notificationCount}
            </Badge>
          )}
        </button>

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium">{user?.fullName || 'Admin User'}</div>
              <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">{user?.email || '—'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-lg shadow-2xl border border-slate-800 p-1">
              <DropdownMenuItem className="text-sm">Profile</DropdownMenuItem>
              <DropdownMenuItem className="text-sm">Account Settings</DropdownMenuItem>
              <div className="h-px bg-slate-800 my-1" />
              <DropdownMenuItem 
                className="text-sm text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
