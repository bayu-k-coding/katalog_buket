import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    alamat: '',
    kota: 'Madiun',
    password: '',
    password_confirmation: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validasi dasar
    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Kata sandi minimal terdiri dari 6 karakter.');
      return;
    }

    const res = await register(formData);

    if (res.success) {
      navigate('/katalog', { replace: true });
    } else {
      setErrorMessage(res.error || 'Pendaftaran akun gagal. Silakan periksa kembali data Anda.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl border border-borderMuted/40 shadow-elevated space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-playfair font-bold text-2xl mx-auto border border-primary/20 group-hover:scale-105 transition-transform">
              IB
            </div>
          </Link>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900">
            Daftar Akun Baru
          </h2>
          <p className="text-xs text-textMuted max-w-xs mx-auto">
            Bergabunglah dengan pelanggan Intan Buket untuk kemudahan reservasi & kustomisasi buket
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Gagal Mendaftar</p>
              <p className="text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Register */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Lengkap *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="nama_lengkap"
                required
                value={formData.nama_lengkap}
                onChange={handleChange}
                placeholder="Contoh: Ayu Kartika"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                No. WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="no_telepon"
                  required
                  value={formData.no_telepon}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Pengiriman
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows={2}
                placeholder="Alamat domisili penerima di kota Madiun atau sekitarnya..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kata Sandi *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Ulangi Kata Sandi *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password_confirmation"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="Ulangi kata sandi"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mendaftarkan Akun...</span>
              </>
            ) : (
              <>
                <span>Daftar Akun Pelanggan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-textMuted">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
