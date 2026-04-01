import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import AdminLayout from '@/layouts/AdminLayout'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'
import Dashboard from '@/pages/dashboard/Dashboard'
import RFQList from '@/pages/rfqs/RFQList'
import RFQDetail from '@/pages/rfqs/RFQDetail'
import Suppliers from '@/pages/suppliers/Suppliers'
import Quotations from '@/pages/rfqs/Quotations'
import AdminQuotationDetail from '@/pages/rfqs/AdminQuotationDetail'
import AdminBuyers from '@/pages/buyers/AdminBuyers'
import BuyerDetail from '@/pages/buyers/BuyerDetail'
import Products from '@/pages/products/Products'
import ProductNew from '@/pages/products/ProductNew'
import ProductEdit from '@/pages/products/ProductEdit'
import Settings from '@/pages/settings/Settings'
import Notifications from '@/pages/notifications/Notifications'
import NotFound from '@/pages/NotFound'
import Unauthorized from '@/pages/Unauthorized'

const SupplierDetail = lazy(() => import('@/pages/suppliers/SupplierDetail'))
const Analytics = lazy(() => import('@/pages/analytics/Analytics'))
const AuditLog = lazy(() => import('@/pages/audit-log/AuditLog'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  )
}

const LOGIN_PATH = '/login'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={LOGIN_PATH} element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rfq" element={<RFQList />} />
        <Route path="rfq/:id" element={<RFQDetail />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/:id" element={<Suspense fallback={<PageFallback />}><SupplierDetail /></Suspense>} />
        <Route path="quotations" element={<Quotations />} />
        <Route path="quotations/:id" element={<AdminQuotationDetail />} />
        <Route path="buyers" element={<AdminBuyers />} />
        <Route path="buyers/:id" element={<BuyerDetail />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<ProductNew />} />
        <Route path="products/:id/edit" element={<ProductEdit />} />
        <Route path="analytics" element={<Suspense fallback={<PageFallback />}><Analytics /></Suspense>} />
        <Route path="audit-log" element={<Suspense fallback={<PageFallback />}><AuditLog /></Suspense>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
