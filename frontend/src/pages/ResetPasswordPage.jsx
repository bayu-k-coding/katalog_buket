import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Countdown timer redirect ke login setelah sukses
  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/login', { replace: true });
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token || !email) {
      setErrorMessage('Tautan reset kata sandi tidak valid. Pastikan token dan email lengkap.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setIsSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.token?.[0] || 'Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
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
            Atur Kata Sandi Baru
          </h2>
          <p className="text-xs text-textMuted max-w-xs mx-auto">
            {email ? `Memperbarui kata sandi untuk akun ${email}` : 'Masukkan kata sandi baru Anda di bawah ini'}
          </p>
        </div>

        {/* Validasi Kelengkapan Parameter URL */}
        {(!token || !email) && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Tautan Tidak Lengkap</p>
              <p className="mt-0.5">
                Tautan yang Anda buka tidak memiliki parameter token atau email yang valid. Silakan lakukan permohonan tautan baru.
              </p>
              <Link to="/forgot-password" className="font-bold text-primary underline mt-2 inline-block">
                Minta Tautan Reset Baru &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Tampilan Jika Berhasil */}
        {isSuccess ? (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-base">Kata Sandi Berhasil Diperbarui!</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Kata sandi baru Anda telah aktif. Anda akan dialihkan secara otomatis ke halaman login dalam <strong>{countdown} detik</strong>...
              </p>
            </div>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Form Input Sandi Baru */
          <>
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Gagal Mengubah Kata Sandi</p>
                  <p className="text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ulangi Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token || !email}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Kata Sandi...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Kata Sandi Baru</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-textMuted hover:text-primary font-medium transition-colors"
              >
                Batal dan kembali ke halaman login
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ResetPasswordPage;
