import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NetworkErrorBanner from '../components/NetworkErrorBanner';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NetworkErrorBanner />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
