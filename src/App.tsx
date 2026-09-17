import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
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
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              {/* Global floating dev switcher and cart drawer */}
              <RoleSwitcher />
              <CartDrawer />

              <Routes>
                {/* Storefront Layout */}
                <Route element={<StorefrontLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrderHistoryPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Admin Layout */}
                <Route
                  path="/admin"
                  element={
                    <AdminLayout>
                      <AdminDashboardPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <AdminLayout>
                      <AdminProductsPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/warehouses"
                  element={
                    <AdminLayout>
                      <AdminWarehousesPage />
                    </AdminLayout>
                  }
                />
                <Route
                  path="/admin/shipments"
                  element={
                    <AdminLayout>
                      <AdminShipmentsPage />
                    </AdminLayout>
                  }
                />

                {/* Shipper Portal */}
                <Route path="/shipper" element={<ShipperDashboardPage />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
