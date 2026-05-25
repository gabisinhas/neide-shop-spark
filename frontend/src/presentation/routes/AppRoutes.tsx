import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotFound from '../pages/NotFound';
import OrdersPage from '../pages/account/OrdersPage';
import ProfilePage from '../pages/account/ProfilePage';
import AdminLayout from '../pages/admin/products/AdminLayout';
import AdminOrdersPage from '../pages/admin/orders/AdminOrdersPage';
import AdminProductCreatePage from '../pages/admin/products/AdminProductCreatePage';
import AdminProductListPage from '../pages/admin/products/AdminProductListPage';
import AdminUsersPage from '../pages/admin/users/AdminUsersPage';
import AuthPage from '../pages/auth/AuthPage';
import GoogleAuthCallbackPage from '../pages/auth/GoogleAuthCallbackPage';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import Index from '../pages/home/Index';
import { ProtectedRoute } from './ProtectedRoute';
import { APP_ROUTES } from './paths';

export function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path={APP_ROUTES.home} element={<Index />} />
        <Route path={APP_ROUTES.auth} element={<AuthPage />} />
        <Route path={APP_ROUTES.googleAuthCallback} element={<GoogleAuthCallbackPage />} />
        <Route
          path={APP_ROUTES.checkout}
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.profile}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.orders}
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.admin}
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminProductListPage />} />
          <Route path="produtos" element={<AdminProductListPage />} />
          <Route path="produtos/novo" element={<AdminProductCreatePage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route
            path="usuarios"
            element={
              <ProtectedRoute requireSuperAdmin>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
