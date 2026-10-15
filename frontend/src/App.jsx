import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminSidebar from './components/AdminSidebar';

// Storefront Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Admin Backoffice Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminShopProfilePage from './pages/admin/AdminShopProfilePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

// Storefront Layout Wrapper
const StorefrontLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-[#1B1C1A]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Admin Backoffice Layout Wrapper
const AdminLayout = () => {
  return (
    <div className="min-h-screen flex bg-[#FBF9F6] text-[#1B1C1A]">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Storefront Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/katalog" element={<CatalogPage />} />
              <Route path="/katalog/:id" element={<ProductDetailPage />} />
              <Route path="/keranjang" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/pesanan-saya" element={<OrdersPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Admin Backoffice Routes (Protected by AdminRoute) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="pesanan" element={<AdminOrdersPage />} />
                <Route path="produk" element={<AdminProductsPage />} />
                <Route path="kategori" element={<AdminCategoriesPage />} />
                <Route path="profil-toko" element={<AdminShopProfilePage />} />
                <Route path="pengguna" element={<AdminUsersPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
