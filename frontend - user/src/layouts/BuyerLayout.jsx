import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  Building2,
  MessageSquare,
  CreditCard,
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

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/buyer/dashboard' },
  { icon: FileText, label: 'RFQs', path: '/buyer/rfqs' },
  { icon: Building2, label: 'Suppliers', path: '/buyer/suppliers' },
  { icon: MessageSquare, label: 'Messages', path: '/buyer/messages' },
  { icon: CreditCard, label: 'Payments', path: '/buyer/payments' },
  { icon: User, label: 'Profile', path: '/buyer/profile' },
  { icon: Settings, label: 'Settings', path: '/buyer/settings' },
];

function BuyerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loading message="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-700/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white border-r border-blue-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-blue-200/30">
            <div className="flex items-center justify-between">
              <img src="/logo.svg" alt="Pharmetis" className="h-[4.75rem] w-auto object-contain" />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-slate-900" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 border-l-4 border-accent'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-blue-200 space-y-2">
            <div className="px-4 py-2 text-sm">
              <p className="font-medium text-slate-900">{user.email}</p>
              <p className="text-xs text-slate-600 capitalize">Buyer</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-blue-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-slate-900" />
            </button>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-slate-900" />
                ) : (
                  <Sun className="w-5 h-5 text-slate-900" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default BuyerLayout;
