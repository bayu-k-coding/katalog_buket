import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const res = await login(email, password);

    if (res.success) {
      const user = res.user;
      // Redirection otomatis berdasarkan role pengguna
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/katalog';
        navigate(from, { replace: true });
      }
    } else {
      setErrorMessage(res.error || 'Email atau password yang Anda masukkan salah.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-borderMuted/40 shadow-elevated space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-playfair font-bold text-2xl mx-auto border border-primary/20 group-hover:scale-105 transition-transform">
              IB
            </div>
          </Link>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900">
            Masuk ke Akun
          </h2>
          <p className="text-xs text-textMuted max-w-xs mx-auto">
            Selamat datang kembali! Masuk untuk kemudahan belanja & lacak buket
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Gagal Masuk</p>
              <p className="text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan Email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Kata Sandi
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Lupa kata sandi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span>Ingat saya di perangkat ini</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link Register */}
        <div className="space-y-4 pt-1">
          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-gray-400 uppercase font-medium">Atau</span>
          </div>

          <div className="text-center text-xs text-textMuted">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Daftar akun pelanggan baru
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
