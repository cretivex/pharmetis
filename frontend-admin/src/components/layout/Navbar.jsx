import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, User, ChevronDown, LogOut, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { logout } from '@/services/auth.service'
import { getUnreadCount } from '@/services/notifications.service'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

const POLL_INTERVAL_MS = 30000

export default function Navbar({ sidebarWidth = 280, isDesktop = true, onOpenMobileMenu }) {
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
  const headerLeft = isDesktop ? leftOffset : 0

  return (
    <header
      className="fixed right-0 top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md transition-[left] duration-300 ease-out sm:px-6"
      style={{ left: headerLeft }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {!isDesktop ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 lg:hidden"
            onClick={onOpenMobileMenu}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}
        <div className="hidden max-w-xl flex-1 md:block">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search RFQs, suppliers, products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-border/50 bg-muted/30 pl-10 text-sm placeholder:text-muted-foreground/80"
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center p-0 text-[10px]"
            >
              {notificationCount}
            </Badge>
          ) : null}
        </button>

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted sm:px-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 shadow-sm ring-1 ring-primary/25">
              <User className="h-4 w-4 text-primary-foreground" aria-hidden />
            </div>
            <div className="hidden text-left md:block">
              <div className="max-w-[140px] truncate text-xs font-semibold text-foreground">
                {user?.fullName || 'Admin'}
              </div>
              <div className="max-w-[140px] truncate text-[10px] text-muted-foreground">{user?.email || '—'}</div>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" aria-hidden />
          </button>

          {userMenuOpen ? (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/60 bg-popover p-1 shadow-shell ring-1 ring-border/40">
              <DropdownMenuItem className="cursor-pointer rounded-lg text-sm focus:bg-muted">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg text-sm focus:bg-muted">
                Account settings
              </DropdownMenuItem>
              <div className="my-1 h-px bg-border/60" />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
