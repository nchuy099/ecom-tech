import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Role } from './types';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/storefront/CartDrawer';
import { AdminLayout } from './components/layout/AdminLayout';

// Storefront pages
import { HomePage } from './pages/storefront/HomePage';
import { CatalogPage } from './pages/storefront/CatalogPage';
import { ProductDetailPage } from './pages/storefront/ProductDetailPage';
import { CartPage } from './pages/storefront/CartPage';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { OrderHistoryPage } from './pages/storefront/OrderHistoryPage';
import { OrderDetailPage } from './pages/storefront/OrderDetailPage';
import { ProfilePage } from './pages/storefront/ProfilePage';
import { NotificationsPage } from './pages/storefront/NotificationsPage';

// Admin pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminWarehousesPage } from './pages/admin/AdminWarehousesPage';
import { AdminShipmentsPage } from './pages/admin/AdminShipmentsPage';

// Shipper pages
import { ShipperDashboardPage } from './pages/shipper/ShipperDashboardPage';

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Storefront layout wrapper with Sticky Navbar and Footer
const StorefrontLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <CartDrawer />
    </div>
  );
};

const getRoleHome = (role: Role | 'GUEST') => {
  if (role === 'ADMIN' || role === 'WAREHOUSE_STAFF') return '/admin';
  if (role === 'SHIPPER') return '/shipper';
  return '/';
};

const StorefrontAccess: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  if (isAuthenticated && (role === 'ADMIN' || role === 'WAREHOUSE_STAFF' || role === 'SHIPPER')) {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  return <StorefrontLayout />;
};

const CustomerOnly: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'CUSTOMER') {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  return <Outlet />;
};

const RequireRoles: React.FC<{ allowedRoles: Role[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role as Role)) {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  return <>{children}</>;
};

const RoleFallback: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? getRoleHome(role) : '/'} replace />;
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* Storefront Layout */}
                <Route element={<StorefrontAccess />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  <Route element={<CustomerOnly />}>
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/orders" element={<OrderHistoryPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                  </Route>
                </Route>

                {/* Admin Layout */}
                <Route
                  path="/admin"
                  element={
                    <RequireRoles allowedRoles={['ADMIN', 'WAREHOUSE_STAFF']}>
                      <AdminLayout>
                        <AdminDashboardPage />
                      </AdminLayout>
                    </RequireRoles>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <RequireRoles allowedRoles={['ADMIN', 'WAREHOUSE_STAFF']}>
                      <AdminLayout>
                        <AdminProductsPage />
                      </AdminLayout>
                    </RequireRoles>
                  }
                />
                <Route
                  path="/admin/warehouses"
                  element={
                    <RequireRoles allowedRoles={['ADMIN', 'WAREHOUSE_STAFF']}>
                      <AdminLayout>
                        <AdminWarehousesPage />
                      </AdminLayout>
                    </RequireRoles>
                  }
                />
                <Route
                  path="/admin/shipments"
                  element={
                    <RequireRoles allowedRoles={['ADMIN', 'WAREHOUSE_STAFF']}>
                      <AdminLayout>
                        <AdminShipmentsPage />
                      </AdminLayout>
                    </RequireRoles>
                  }
                />

                {/* Shipper Portal */}
                <Route
                  path="/shipper"
                  element={
                    <RequireRoles allowedRoles={['SHIPPER']}>
                      <ShipperDashboardPage />
                    </RequireRoles>
                  }
                />

                <Route path="*" element={<RoleFallback />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
