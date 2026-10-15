import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    alamat: '',
    kota: 'Madiun',
    kode_pos: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        email: user.email || '',
        no_telepon: user.no_telepon || '',
        alamat: user.alamat || '',
        kota: user.kota || 'Madiun',
        kode_pos: user.kode_pos || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSavedSuccess(false);

    try {
      await authService.updateProfile({
        nama_lengkap: formData.nama_lengkap,
        no_telepon: formData.no_telepon,
        alamat: formData.alamat,
        kota: formData.kota,
        kode_pos: formData.kode_pos
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Gagal menyimpan perubahan profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900">Profil & Alamat Pemesan</h1>
        <p className="text-textMuted text-xs sm:text-sm mt-1">
          Informasi data diri dan alamat utama pengiriman buket Anda
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">Perubahan data profil berhasil disimpan!</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-semibold">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Form Grid */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xl">
              {formData.nama_lengkap ? formData.nama_lengkap.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="font-playfair font-bold text-lg text-gray-900">{formData.nama_lengkap || 'Pengguna'}</h2>
              <span className="text-xs text-textMuted">
                {user?.role ? `Peran: ${user.role}` : 'Pelanggan Intan Buket'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Email (Terdaftar)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 bg-gray-50 text-gray-500 text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nomor WhatsApp / Telepon
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.no_telepon}
                  onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Kota / Kabupaten
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.kota}
                  onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Pengiriman Default
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                rows={3}
                placeholder="Alamat domisili lengkap..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Right Action Panel */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-6">
          <h3 className="font-playfair font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">
            Aksi Simpan
          </h3>

          <p className="text-xs text-textMuted leading-relaxed">
            Data alamat dan nomor WhatsApp yang Anda perbarui akan otomatis tersimpan di server dan terisi saat melakukan checkout pesanan berikutnya.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>Simpan Perubahan Profil</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfilePage;
