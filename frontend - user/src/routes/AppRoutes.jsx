import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import BuyerLayout from '../layouts/BuyerLayout';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import RequestAccess from '../pages/RequestAccess';
import Medicines from '../pages/Medicines';
import MedicineDetail from '../pages/MedicineDetail';
import Suppliers from '../pages/Suppliers';
import SupplierDetail from '../pages/SupplierDetail';
import About from '../pages/About';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

import SendRFQ from '../pages/SendRFQ';
import MyRFQs from '../pages/MyRFQs';
import Checkout from '../pages/Checkout';
import Payment from '../pages/Payment';
import SavedProducts from '../pages/SavedProducts';
import Settings from '../pages/Settings';

import Dashboard from '../pages/buyer/Dashboard';
import RFQs from '../pages/buyer/RFQs';
import BuyerSuppliers from '../pages/buyer/Suppliers';
import Messages from '../pages/buyer/Messages';
import Payments from '../pages/buyer/Payments';
import Profile from '../pages/buyer/Profile';
import BuyerSettings from '../pages/buyer/Settings';

function AppRoutes() {
  return (
    <Routes>
      {/* Login & Register: no navbar/footer (standalone SaaS-style pages) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/medicines/:slug" element={<MedicineDetail />} />
        <Route path="/categories" element={<Medicines />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/:slug" element={<SupplierDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/request-access" element={<RequestAccess />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Buyer-only: protected */}
        <Route
          path="/send-rfq"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <SendRFQ />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-rfqs"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <MyRFQs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout/:quotationId"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-products"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <SavedProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyer"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'ADMIN']}>
              <BuyerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/buyer/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rfqs" element={<RFQs />} />
          <Route path="rfqs/:id" element={<MyRFQs />} />
          <Route path="suppliers" element={<BuyerSuppliers />} />
          <Route path="messages" element={<Messages />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<BuyerSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
