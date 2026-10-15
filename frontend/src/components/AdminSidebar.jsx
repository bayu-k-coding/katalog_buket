import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Package,
  ShoppingBag,
  Store,
  Users,
  ShieldCheck,
  ArrowLeft,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard Ringkas', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Pesanan Masuk', path: '/admin/pesanan', icon: ShoppingBag, badge: 'Baru' },
    { name: 'Produk Buket', path: '/admin/produk', icon: Package },
    { name: 'Kategori Buket', path: '/admin/kategori', icon: Layers },
    { name: 'Profil Toko', path: '/admin/profil-toko', icon: Store },
    { name: 'Kelola Pengguna', path: '/admin/pengguna', icon: Users, badge: 'Super' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-white border-r border-borderMuted/40 flex flex-col h-screen sticky top-0 shadow-sm shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-borderMuted/30">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-playfair font-bold text-xl shadow-sm">
            IB
          </div>
          <div>
            <h2 className="font-playfair font-bold text-lg text-gray-900 leading-tight">
              Intan Buket
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary">
              <ShieldCheck className="w-3 h-3" />
              <span>Backoffice Panel</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Admin User Info Card */}
      <div className="px-5 py-3 bg-[#FBF9F6] border-b border-borderMuted/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs shrink-0">
          {user?.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-gray-900 truncate">{user?.nama_lengkap || 'Admin'}</p>
          <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase text-secondary bg-secondary/10">
            {user?.role || 'admin'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-textMuted px-3 mb-2">
          Menu Backoffice
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-gray-600 hover:bg-[#F5F3F0] hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-textMuted'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-primary-light text-primary'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Actions: Kembali ke Storefront & Logout */}
      <div className="p-4 border-t border-borderMuted/30 bg-[#FBF9F6] space-y-2">
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-borderMuted/60 text-xs font-semibold text-gray-800 rounded-xl hover:border-primary hover:text-primary transition-colors shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Storefront</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
