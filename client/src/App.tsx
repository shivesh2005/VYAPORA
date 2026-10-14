import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Layout } from './components/layout/Layout';

// Public & Catalog Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { PricingPage } from './pages/PricingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BecomeSellerPage } from './pages/BecomeSellerPage';
import { TermsPage, PrivacyPage, ShippingReturnsPage } from './pages/PolicyPages';

// Customer Protected Pages
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';

// Seller Portal Pages
import { SellerDashboardPage } from './pages/SellerDashboardPage';
import { SellerProductsPage } from './pages/SellerProductsPage';
import { SellerOrdersPage } from './pages/SellerOrdersPage';
import { SellerStorePage } from './pages/SellerStorePage';
import { SellerSubscriptionPage } from './pages/SellerSubscriptionPage';

import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminSellersPage } from './pages/AdminSellersPage';
import { AdminProductsPage } from './pages/AdminProductsPage';
import { AdminAIConfigPage } from './pages/AdminAIConfigPage';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Array<'customer' | 'seller' | 'admin'>;
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  {/* Public Discovery Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/assistant" element={<AIAssistantPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/become-seller" element={<BecomeSellerPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/shipping-returns" element={<ShippingReturnsPage />} />

                  {/* Customer Protected Routes */}
                  <Route path="/cart" element={<CartPage />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Seller Protected Routes */}
                  <Route
                    path="/seller/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/products"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerProductsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/orders"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/store"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerStorePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/subscription"
                    element={
                      <ProtectedRoute allowedRoles={['seller', 'admin']}>
                        <SellerSubscriptionPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminUsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/sellers"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminSellersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminProductsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/ai-config"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminAIConfigPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings/ai-provider"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminAIConfigPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  </ThemeProvider>
</QueryClientProvider>
  );
};
export default App;
