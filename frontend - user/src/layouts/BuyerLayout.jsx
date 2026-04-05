import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  FileText,
  Building2,
  MessageSquare,
  CreditCard,
  ShoppingBag,
  ClipboardList,
  User,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/auth.service';
import Loading from '../components/Loading';
import PageContainer from '../components/layout/PageContainer';

const sidebarItems = [
  { icon: FileText, label: 'RFQs', path: '/buyer/rfqs' },
  { icon: Building2, label: 'Suppliers', path: '/buyer/suppliers' },
  { icon: MessageSquare, label: 'Messages', path: '/buyer/messages' },
  { icon: CreditCard, label: 'Payments', path: '/buyer/payments' },
  { icon: ShoppingBag, label: 'Orders', path: '/buyer/orders' },
  { icon: ClipboardList, label: 'Invoices', path: '/buyer/invoices' },
  { icon: User, label: 'Profile', path: '/buyer/profile' },
  { icon: Settings, label: 'Settings', path: '/buyer/settings' },
];

function BuyerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loading message="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-hidden bg-white lg:h-[100dvh] lg:flex-row">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] transition-opacity lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 max-w-[min(20rem,calc(100vw-1rem))] flex-col border-r border-blue-200 bg-white shadow-xl transition-transform duration-300 ease-out
          lg:static lg:z-0 lg:h-full lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-blue-200/30 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <img
                src="/logo-pharmetis.svg"
                alt="Pharmetis"
                className="h-10 w-auto max-w-[160px] object-contain object-left sm:h-12 sm:max-w-[200px]"
              />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-slate-900" />
              </button>
            </div>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/');

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 sm:px-4 sm:py-3
                    ${
                      isActive
                        ? 'border-l-4 border-accent bg-slate-100 text-slate-900'
                        : 'border-l-4 border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 space-y-2 border-t border-blue-200 p-3 sm:p-4">
            <div className="px-2 py-1 text-sm">
              <p className="truncate font-medium text-slate-900">{user.email}</p>
              <p className="text-xs capitalize text-slate-600">Buyer</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-blue-200 bg-white/95 px-3 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80 sm:px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-slate-900" />
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-slate-900" />
              ) : (
                <Sun className="h-5 w-5 text-slate-900" />
              )}
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
          <PageContainer>
            <Outlet />
          </PageContainer>
        </main>
      </div>
    </div>
  );
}

export default BuyerLayout;
