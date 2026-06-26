import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import OauthSuccessPage from './pages/OauthSuccessPage'
import TwoFactorPage from './pages/TwoFactorPage'
import AccountPage from './pages/AccountSetupPage'
import ProtectedRoute from './utils/ProtectedRoute'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import { AdminDashboardPage } from './pages/AdminDashboard'
import { AdminProductsPage } from './pages/AdminProductPage'
import { AdminBrandsPage } from './pages/AdminBrandPage'
import { AdminCategoriesPage } from './pages/AdminCategoriesPage'
import { AdminProductItemsPage } from './pages/AdminProductItemsPage'
import AdminDeliveryOptionsPage from './pages/AdminDeliveryOptions'
import AdminOrdersPage from './pages/AdminOrdersPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdminReviewsPage from './pages/AdminReviewPage'
import AboutPage from './pages/AboutPage'
import TermsPage from './pages/TermsAndConditions'
import FaqPage from './pages/FaqPage'
import ContactSupportPage from './pages/ContactSupportPage'
import SupportAdminPage from './pages/SupportAdminPage'
import { Outlet } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth-success" element={<OauthSuccessPage />} />
      <Route path="/two-factor" element={<TwoFactorPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment/:orderId" element={<PaymentPage />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
      <Route path="/orders" element={<MyOrdersPage />} />
      <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:slug" element={<ProductDetailsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/contact" element={<ContactSupportPage />} />

      //ADMIN
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Outlet />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/products" element={<AdminProductsPage />} />
        <Route path="/admin/brands" element={<AdminBrandsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/products/:id/items" element={<AdminProductItemsPage />} />
        <Route path="/admin/delivery-options" element={<AdminDeliveryOptionsPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/reviews" element={<AdminReviewsPage />} />
      </Route>

      //SUPPORT
      <Route path="/support-admin" element={
        <ProtectedRoute allowedRoles={['SUPPORT']}>
          <SupportAdminPage />
        </ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}