import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, LogIn, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Katalog Buket', path: '/katalog' },
    { name: 'Pesanan Saya', path: '/pesanan-saya' },
    { name: 'Profil & Alamat', path: '/profil' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tutup menu saat rute berpindah
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#FBF9F6]/95 backdrop-blur-md border-b border-borderMuted/40 transition-all">
      {/* Top announcement bar */}
      <div className="bg-primary text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span>Koleksi Buket Wisuda & Buket Uang Elegan — Intan Buket</span>
        <span className="hidden md:inline font-normal text-white/80">| Pengiriman Cepat Area Madiun & Sekitarnya</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 transition-transform">
              <span className="font-playfair font-bold text-xl">IB</span>
            </div>
            <div>
              <span className="font-playfair font-bold text-2xl tracking-tight text-[#1B1C1A] group-hover:text-primary transition-colors">
                Intan Buket
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-textMuted font-medium">
                Artisanal Florist
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive(link.path)
                    ? 'text-primary font-semibold'
                    : 'text-textMuted hover:text-primary'
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Cart, User Profile / Login */}
          <div className="flex items-center gap-3">

            {/* Cart Button */}
            <Link
              to="/keranjang"
              className="relative p-2.5 text-[#1B1C1A] hover:text-primary rounded-full hover:bg-primary-subtle transition-all"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Dropdown / Login Button */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-borderMuted/60 hover:border-primary/60 bg-white transition-all text-xs font-semibold text-gray-800 shadow-soft"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                    {user?.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.nama_lengkap?.split(' ')[0] || 'Akun'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-elevated border border-borderMuted/40 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.nama_lengkap}</p>
                      <p className="text-[11px] text-textMuted truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {user?.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-secondary font-semibold hover:bg-secondary/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard Admin</span>
                      </Link>
                    )}

                    <Link
                      to="/profil"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Profil & Alamat</span>
                    </Link>

                    <Link
                      to="/pesanan-saya"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                      <span>Pesanan Saya</span>
                    </Link>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  isActive('/login')
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-gray-700 border-borderMuted/60 hover:border-primary hover:text-primary'
                }`}
                title="Halaman Login"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-textMuted hover:text-primary"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-borderMuted/40 px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated && (
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 mb-3">
              <p className="text-xs font-bold text-gray-900">{user?.nama_lengkap}</p>
              <p className="text-[11px] text-textMuted">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                Role: {user?.role}
              </span>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path)
                  ? 'bg-primary-subtle text-primary font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-secondary bg-secondary/10"
            >
              ⚙️ Dashboard Admin
            </Link>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-base font-semibold text-rose-600 hover:bg-rose-50"
            >
              🚪 Keluar (Logout)
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-primary bg-primary-subtle"
            >
              🔑 Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
