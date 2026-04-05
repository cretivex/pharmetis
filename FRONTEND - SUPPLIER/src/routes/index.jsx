import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import VendorLayout from '@/layouts/VendorLayout'

import SupplierLogin from '@/pages/SupplierLogin'
import SupplierRegistration from '@/pages/SupplierRegistration'
import VerifyOTP from '@/pages/VerifyOTP'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'

import Dashboard from '@/pages/dashboard/Dashboard'
import MyProducts from '@/pages/products/MyProducts'
import AddProduct from '@/pages/products/AddProduct'
import EditProduct from '@/pages/products/EditProduct'
import RFQList from '@/pages/rfqs/RFQList'
import RFQResponse from '@/pages/rfqs/RFQResponse'
import Profile from '@/pages/profile/Profile'
import SupplierMessages from '@/pages/SupplierMessages'

import NotFound from '@/pages/NotFound'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/supplier/register" element={<SupplierRegistration />} />
      <Route path="/supplier/verify-otp" element={<VerifyOTP />} />
      <Route path="/supplier/login" element={<SupplierLogin />} />
      <Route path="/supplier/forgot-password" element={<ForgotPassword />} />
      <Route path="/supplier/reset-password" element={<ResetPassword />} />

      <Route
        path="/supplier"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <Dashboard />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/dashboard"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <Dashboard />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/rfqs"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <RFQList />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/rfqs/:id"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <RFQResponse />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/products"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <MyProducts />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/products/new"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <AddProduct />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/products/:id/edit"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <EditProduct />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/profile"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <Profile />
            </VendorLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/supplier/messages"
        element={
          <ProtectedRoute>
            <VendorLayout>
              <SupplierMessages />
            </VendorLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/supplier/login" replace />} />
      <Route path="/login" element={<Navigate to="/supplier/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
