import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, User, FileText, ShoppingCart, Bookmark, LogOut, Settings, Bell, AlertTriangle } from 'lucide-react'
import { authService } from '../services/auth.service.js'
import { notificationsService } from '../services/notifications.service.js'
import NotificationDropdown from './NotificationDropdown.jsx'
import { useProfileCompletion } from '../contexts/ProfileCompletionContext'

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const profileDropdownRef = useRef(null)
  const notificationRef = useRef(null)

  // Get login state from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true'
  })

  // Load unread notification count
  useEffect(() => {
    if (isLoggedIn && authService.isAuthenticated()) {
      loadUnreadCount()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    } else {
      setUnreadCount(0)
    }
  }, [isLoggedIn])

  const loadUnreadCount = async () => {
    try {
      if (!authService.isAuthenticated()) return
      const count = await notificationsService.getUnreadCount()
      setUnreadCount(count)
    } catch (err) {
      // Silently fail - user might not be authenticated
    }
  }

  // Listen for storage changes (when user logs in/out)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true')
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('loginStateChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('loginStateChange', handleStorageChange)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Close profile dropdown when clicking outside
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
    { path: '/medicines', label: 'Medicines' },
    { path: '/suppliers', label: 'Suppliers' },
    { path: '/about', label: 'About Us' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo - no box, no border */}
        <Link
          to="/"
          className="flex items-center flex-shrink-0 hover:opacity-90 transition-opacity duration-200 focus:outline-none border-0 shadow-none ring-0"
          aria-label="Pharmetis Home"
        >
          <img
            src="/logo.svg"
            alt="Pharmetis"
            className="h-[4.75rem] w-auto object-contain border-0"
          />
        </Link>

        {/* Desktop Navigation - Center */}
        <nav
          className="hidden md:flex items-center space-x-8 flex-1 justify-center"
          aria-label="Main navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-200 focus:outline-none rounded-lg px-3 py-1.5 border-0 shadow-none ${
                isActive(link.path)
                  ? 'text-white bg-primary'
                  : 'text-slate-600 hover:text-primary hover:bg-blue-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side - Login/Profile + Send RFQ */}
        <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
          {isLoggedIn ? (
            <>
              {/* Notification Icon */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationDropdownOpen(!isNotificationDropdownOpen)
                    setIsProfileDropdownOpen(false)
                  }}
                  className="relative p-2 text-slate-600 hover:text-primary hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                  aria-label="Notifications"
                  aria-expanded={isNotificationDropdownOpen}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
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

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    setIsNotificationDropdownOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg relative"
                  aria-label="User profile menu"
                  aria-expanded={isProfileDropdownOpen}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                  {showProfileIncompleteBadge && (
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500 text-white" title="Complete your profile">
                      <AlertTriangle className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-blue-100 py-2 z-50">
                    <Link
                      to="/my-rfqs"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-primary transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <FileText className="w-4 h-4" />
                      My RFQs
                    </Link>
                    <Link
                      to="/saved-products"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-primary transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Bookmark className="w-4 h-4" />
                      Liked Products
                    </Link>
                    <div className="border-t border-blue-100 my-1"></div>
                    {showProfileIncompleteBadge && (
                      <Link
                        to="/settings?tab=profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Complete Profile
                      </Link>
                    )}
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-primary transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="border-t border-blue-100 my-1"></div>
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false)
                        authService.logout()
                        setIsLoggedIn(false)
                        navigate('/')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
            >
              Login
            </Link>
          )}
          
          {/* Send RFQ Button */}
          <Link to="/send-rfq" className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg">
            <button
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-sm"
              aria-label="Send RFQ"
            >
              Send RFQ
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-600 hover:text-primary hover:bg-blue-50 transition-colors p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-blue-100 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <nav className="flex flex-col space-y-1" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2.5 text-base font-medium transition-colors duration-200 rounded-lg focus:outline-none ${
                    isActive(link.path)
                      ? 'text-white bg-primary'
                      : 'text-slate-600 hover:text-primary hover:bg-blue-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-blue-100">
              {isLoggedIn ? (
                <>
                  {/* Mobile Notification Button */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      // Small delay to allow mobile menu to close, then open dropdown
                      setTimeout(() => {
                        setIsNotificationDropdownOpen(true)
                      }, 100)
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-slate-600 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-blue-50 relative"
                  >
                    <Bell className="w-4 h-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  <Link
                    to="/my-rfqs"
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-slate-600 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-blue-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FileText className="w-4 h-4" />
                    My RFQs
                  </Link>
                  <Link
                    to="/saved-products"
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-slate-600 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-blue-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bookmark className="w-4 h-4" />
                    Liked Products
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-slate-600 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-blue-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-blue-100 my-1"></div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      authService.logout()
                      setIsLoggedIn(false)
                      navigate('/')
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-red-600 hover:text-red-700 transition-colors duration-200 rounded-lg hover:bg-red-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-2.5 text-base font-medium text-slate-600 hover:text-primary transition-colors duration-200 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
              
              {/* Send RFQ Button - Mobile */}
              <Link 
                to="/send-rfq" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
              >
                <button
                  className="w-full px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-sm"
                  aria-label="Send RFQ"
                >
                  Send RFQ
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
