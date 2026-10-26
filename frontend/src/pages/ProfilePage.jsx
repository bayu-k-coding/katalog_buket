import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Hash,
  Lock,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const ProfilePage = () => {
  const { user, updateUser, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if guest
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

  // Form State: Data Diri & Alamat
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    alamat: '',
    kota: 'Madiun',
    kode_pos: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Form State: Ubah Kata Sandi
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        nama_lengkap: user.nama_lengkap || user.nama_pelanggan || '',
        email: user.email || '',
        no_telepon: user.no_telepon || '',
        alamat: user.alamat || '',
        kota: user.kota || 'Madiun',
        kode_pos: user.kode_pos || ''
      });
    }
  }, [user]);

  // Submit Handler: Update Data Profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // Staf admin hanya kirim nama dan telepon; pelanggan menyertakan alamat
      const payload = isAdminOrSuper
        ? {
            nama_lengkap: formData.nama_lengkap,
            no_telepon: formData.no_telepon
          }
        : {
            nama_lengkap: formData.nama_lengkap,
            no_telepon: formData.no_telepon,
            alamat: formData.alamat,
            kota: formData.kota,
            kode_pos: formData.kode_pos
          };

      const response = await authService.updateProfile(payload);

      if (response?.user) {
        updateUser(response.user);
      }

      setProfileSuccess(response?.message || 'Data profil berhasil diperbarui.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      let msg = 'Gagal menyimpan perubahan profil.';
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        msg = err.response.data.errors[firstKey][0];
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setProfileError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Ubah Kata Sandi
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.password.length < 6) {
      setPasswordError('Kata sandi baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (passwordData.current_password === passwordData.password) {
      setPasswordError('Kata sandi baru harus berbeda dari kata sandi saat ini.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await authService.changePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation
      });

      setPasswordSuccess(response?.message || 'Kata sandi akun Anda berhasil diperbarui.');
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      let msg = 'Gagal memperbarui kata sandi akun.';
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        msg = err.response.data.errors[firstKey][0];
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setPasswordError(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
            <ShieldCheck className="w-3 h-3 text-purple-700" />
            <span>Superadmin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
            <ShieldCheck className="w-3 h-3 text-blue-700" />
            <span>Admin Toko</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
            Pelanggan
          </span>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn py-2 sm:py-4">
      {/* Page Title */}
      <div>
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Profil Akun
        </h1>
        <p className="text-textMuted text-xs sm:text-sm mt-1">
          {isAdminOrSuper
            ? 'Kelola informasi identitas, kontak, dan keamanan sandi akun Anda'
            : 'Kelola data diri, alamat pengiriman, dan keamanan sandi akun Anda'}
        </p>
      </div>

      {/* Alert Notifikasi Profil */}
      {profileSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="text-xs font-semibold">{profileError}</span>
        </div>
      )}

      {/* Profile Summary Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-borderMuted/40 shadow-soft flex items-center gap-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-white flex items-center justify-center font-playfair font-bold text-xl sm:text-2xl shadow-sm shrink-0">
          {formData.nama_lengkap ? formData.nama_lengkap.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-playfair font-bold text-lg sm:text-xl text-gray-900 truncate">
              {formData.nama_lengkap || 'Pengguna'}
            </h2>
            {getRoleBadge(user?.role)}
          </div>
          <p className="text-xs text-textMuted mt-1 flex items-center gap-1.5 truncate">
            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{user?.email || formData.email}</span>
          </p>
        </div>
      </div>

      {/* Form Data Diri Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-borderMuted/40 shadow-soft">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-playfair font-bold text-base sm:text-lg text-gray-900">
              Informasi Data Diri
            </h2>
            <p className="text-xs text-textMuted">
              {isAdminOrSuper
                ? 'Kelola informasi identitas nama dan kontak Anda'
                : 'Kelola informasi identitas dan alamat pengiriman pesanan'}
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Nama lengkap Anda"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/40 bg-gray-50 text-gray-500 text-xs cursor-not-allowed select-none"
                />
              </div>
            </div>

            {/* Nomor Telepon / WhatsApp */}
            <div className={isAdminOrSuper ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                No. Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.no_telepon}
                  onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                  placeholder="081234567890"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Kolom Khusus Pelanggan */}
            {!isAdminOrSuper && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kota / Kabupaten
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.kota}
                      onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                      placeholder="Contoh: Madiun"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kode Pos
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.kode_pos}
                      onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value })}
                      placeholder="Contoh: 63126"
                      maxLength={10}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Alamat Lengkap Pengiriman
                  </label>
                  <textarea
                    rows={3}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan lokasi..."
                    className="w-full p-3.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors leading-relaxed"
                  />
                </div>
              </>
            )}
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Form Ubah Kata Sandi Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-borderMuted/40 shadow-soft">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <KeyRound className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="font-playfair font-bold text-base sm:text-lg text-gray-900">
              Ubah Sandi Akun
            </h2>
            <p className="text-xs text-textMuted">
              Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan akses
            </p>
          </div>
        </div>

        {/* Alert Notifikasi Password */}
        {passwordSuccess && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-semibold">{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-4">
            {/* Kata Sandi Saat Ini */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kata Sandi Saat Ini *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Ulangi Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Sandi...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Ubah Kata Sandi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
