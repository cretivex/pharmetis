import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NetworkErrorBanner from '../components/NetworkErrorBanner';
import CookieConsent from '../components/CookieConsent';

function MainLayout() {
  const { pathname } = useLocation();
  /** Home hero already reserves top space (pt-16+); other routes offset below fixed navbar (h-14). */
  const mainPadTop = pathname === '/' ? '' : 'pt-14';

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white">
      <NetworkErrorBanner />
      <Navbar />
      <main className={`min-w-0 flex-grow ${mainPadTop}`}>
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}

export default MainLayout;
