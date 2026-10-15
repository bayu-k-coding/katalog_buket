import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protection wrapper untuk rute Administrator
 * Mengarahkan pengunjung non-admin atau belum login ke halaman login
 */
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-primary">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-textMuted">Memuat hak akses admin...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login?role=admin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/**
 * Route protection wrapper untuk rute pelanggan terotentikasi
 */
export const CustomerRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3 text-primary">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-textMuted">Memverifikasi akun...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default { AdminRoute, CustomerRoute };
