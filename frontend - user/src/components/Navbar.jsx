import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  User,
  FileText,
  Bookmark,
  LogOut,
  Settings,
  Bell,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { authService } from '../services/auth.service.js'
import { notificationsService } from '../services/notifications.service.js'
import NotificationDropdown from './NotificationDropdown.jsx'
import { useProfileCompletion } from '../contexts/ProfileCompletionContext'

/** Site-wide nav: solid midnight navy (#050b1d), white type; ghost Send RFQ. */
function Navbar() {
  const authUser = useSelector((state) => state.auth.user)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const profileDropdownRef = useRef(null)
  const notificationRef = useRef(null)

  const isLoggedIn = !!authUser

  useEffect(() => {
    if (isLoggedIn && authService.isAuthenticated()) {
      loadUnreadCount()
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
    setUnreadCount(0)
  }, [isLoggedIn])

  const loadUnreadCount = async () => {
    try {
      if (!authService.isAuthenticated()) return
      const count = await notificationsService.getUnreadCount()
      setUnreadCount(count)
    } catch (_) {}
  }

  useEffect(() => {
    const handleLoginStateChange = () => {
      if (!authService.isAuthenticated()) setUnreadCount(0)
    }
    window.addEventListener('loginStateChange', handleLoginStateChange)
    return () => window.removeEventListener('loginStateChange', handleLoginStateChange)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen || isNotificationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen, isNotificationDropdownOpen])

  const { complete: profileComplete, isBuyer } = useProfileCompletion()
  const showProfileIncompleteBadge = isBuyer && !profileComplete

  const navLinks = [
    { to: '/medicines', label: 'Medicines' },
    { to: '/suppliers', label: 'Suppliers' },
    { to: { pathname: '/', hash: 'compliance' }, label: 'Compliance' },
    {
      to: '/resources',
      label: 'Resources',
      activeMatch: (p) =>
        p === '/resources' ||
        p === '/blog' ||
        p === '/industry-news' ||
        (typeof p === 'string' && p.startsWith('/guides')),
    },
    { to: '/platform', label: 'Platform' },
    { to: '/about', label: 'About Us' },
  ]

  const linkKey = (item) =>
    typeof item.to === 'string' ? item.to : `${item.to.pathname}${item.to.hash || ''}`

  const isNavActive = (item) => {
    if (typeof item.activeMatch === 'function') {
      return item.activeMatch(location.pathname)
    }
    if (typeof item.to === 'string') {
      if (item.to === '/') return location.pathname === '/'
      return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
    }
    const hash = item.to.hash || ''
    const normalized = hash.startsWith('#') ? hash : hash ? `#${hash}` : ''
    return location.pathname === item.to.pathname && (!hash || location.hash === normalized)
  }

  const navLinkClass = (active) =>
    active
      ? 'text-white bg-white/15'
      : 'text-white/95 hover:text-white hover:bg-white/10'

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#050b1d] shadow-[0_4px_24px_rgba(0,0,0,0.45)]">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-5 lg:px-6">
        <Link
          to="/"
          className="flex flex-shrink-0 items-center border-0 shadow-none ring-0 transition-opacity duration-200 hover:opacity-90 focus:outline-none"
          aria-label="Pharmetis Home"
        >
          <img
            src="/logo-pharmetis.svg"
            alt=""
            className="h-18 w-auto max-w-[min(25rem,65vw)] object-contain object-left sm:h-20 sm:max-w-[28rem]"
          />
        </Link>

        <nav
          className="hidden flex-1 items-center justify-center space-x-6 md:flex lg:space-x-8"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={linkKey(link)}
              to={link.to}
              className={`rounded-lg border-0 px-3 py-1.5 text-sm font-medium shadow-none transition-colors duration-200 focus:outline-none ${navLinkClass(
                isNavActive(link),
              )}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-shrink-0 items-center space-x-4 md:flex">
          {isLoggedIn ? (
            <>
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
                    setIsProfileDropdownOpen(false)
                  }}
                  className="relative rounded-lg p-2 text-white/90 transition-colors duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="Notifications"
                  aria-expanded={isNotificationDropdownOpen}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 w-5 translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationDropdown
                  isOpen={isNotificationDropdownOpen}
                  onClose={() => setIsNotificationDropdownOpen(false)}
                  unreadCount={unreadCount}
                  onCountChange={setUnreadCount}
                />
              </div>

              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    setIsNotificationDropdownOpen(false)
                  }}
                  className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white/95 transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
                  aria-label="User profile menu"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                  {showProfileIncompleteBadge && (
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-white"
                      title="Complete your profile"
                    >
                      <AlertTriangle className="h-2.5 w-2.5" />
                    </span>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                    <Link
                      to="/my-rfqs"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-primary"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <FileText className="h-4 w-4" />
                      My RFQs
                    </Link>
                    <Link
                      to="/saved-products"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-primary"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Bookmark className="h-4 w-4" />
                      Liked Products
                    </Link>
                    <div className="my-1 border-t border-blue-100" />
                    {showProfileIncompleteBadge && (
                      <Link
                        to="/settings?tab=profile"
                        className="flex items-center gap-3 bg-yellow-50 px-4 py-2 text-sm text-yellow-700 transition-colors duration-200 hover:bg-yellow-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Complete Profile
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors duration-200 hover:bg-blue-50 hover:text-primary"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="my-1 border-t border-blue-100" />
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false)
                        authService.logout()
                        navigate('/')
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/50 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Login
            </Link>
          )}

          <Link
            to="/send-rfq"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-transparent px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white focus:outline-none focus:ring-2 focus:ring-white/35 focus:ring-offset-2 focus:ring-offset-[#050b1d]"
          >
            Send RFQ
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>

        <button
          className="-mr-2 rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain border-b border-white/10 bg-[#050b1d] shadow-lg">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={linkKey(link)}
                  to={link.to}
                  className={`rounded-lg px-3 py-2.5 text-base font-medium transition-colors duration-200 focus:outline-none ${
                    isNavActive(link)
                      ? 'bg-white/15 text-white'
                      : 'text-white/90 hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex flex-col space-y-3 border-t border-white/10 pt-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setTimeout(() => setIsNotificationDropdownOpen(true), 100)
                    }}
                    className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <Link
                    to="/my-rfqs"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    My RFQs
                  </Link>
                  <Link
                    to="/saved-products"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bookmark className="h-4 w-4" />
                    Liked Products
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      authService.logout()
                      navigate('/')
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-base font-medium text-red-300 transition-colors hover:bg-white/10 hover:text-red-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2.5 text-base font-medium text-white/95 transition-colors hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}

              <Link
                to="/send-rfq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg focus:outline-none focus:ring-2 focus:ring-white/35 focus:ring-offset-2 focus:ring-offset-[#050b1d]"
              >
                <span className="flex w-full items-center justify-center gap-2 rounded-full border border-white/80 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:border-white">
                  Send RFQ
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
