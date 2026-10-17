import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Mail,
  Home,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingBag,
  Store,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  ShieldCheck,
  Building,
  Hash,
  Package,
  Layers,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const ProfilePage = ({ isBackoffice = false }) => {
  const { user, updateUser, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if guest
  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isInitializing, isAuthenticated, navigate]);

  const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';

  const [activeTab, setActiveTab] = useState('data-diri'); // 'data-diri' | 'ringkasan'

  // Form State: Data Diri & Alamat
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    alamat: '',
    kota: 'Madiun',
    kode_pos: ''
  });

  // Status submission Data Diri
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

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
    setIsSubmittingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      // Untuk Admin & Superadmin, hanya kirim nama_lengkap dan no_telepon (tanpa kolom alamat)
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

      setProfileSuccess(response?.message || 'Data profil berhasil diperbarui!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      let msg = 'Gagal menyimpan pembaruan profil.';
      if (err.response?.data?.errors) {
        const firstKey = Object.keys(err.response.data.errors)[0];
        msg = err.response.data.errors[firstKey][0];
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setProfileError(msg);
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Superadmin (Owner)
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Admin Toko (Staf)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
            Pelanggan Intan Buket
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-borderMuted/30">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Modul Profil Pengguna
            </span>
            {isBackoffice && (
              <span className="text-[11px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                Backoffice Area
              </span>
            )}
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isAdminOrSuper ? 'Kelola Profil Staf Operasional' : 'Kelola Profil & Alamat Pengiriman'}
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            {isAdminOrSuper
              ? 'Kelola informasi identitas nama lengkap dan nomor kontak operasional untuk pengelolaan pesanan serta pelanggan toko.'
              : 'Perbarui data diri, nomor WhatsApp untuk konfirmasi pesanan, dan alamat tujuan pengiriman buket Anda.'}
          </p>
        </div>

        {isBackoffice || isAdminOrSuper ? (
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-borderMuted/60 rounded-xl text-xs font-semibold text-gray-700 hover:text-primary hover:border-primary transition-all shadow-sm self-start md:self-auto"
          >
            <span>Kembali ke Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            to="/pesanan-saya"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-borderMuted/60 rounded-xl text-xs font-semibold text-gray-700 hover:text-primary hover:border-primary transition-all shadow-sm self-start md:self-auto"
          >
            <ShoppingBag className="w-4 h-4 text-primary" />
            <span>Lihat Pesanan Saya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted/40 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white flex items-center justify-center font-playfair font-bold text-2xl sm:text-3xl shadow-md shrink-0">
            {formData.nama_lengkap ? formData.nama_lengkap.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-playfair font-bold text-xl sm:text-2xl text-gray-900">
                {formData.nama_lengkap || 'Pengguna'}
              </h2>
              {getRoleBadge(user?.role)}
            </div>
            <p className="text-xs sm:text-sm text-textMuted mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              <span>{user?.email || formData.email}</span>
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-textMuted flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-emerald-700">Status Akun Aktif</span>
              </span>
              {!isAdminOrSuper && formData.kota && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Domisili: {formData.kota}</span>
                </span>
              )}
              {isAdminOrSuper && (
                <span className="flex items-center gap-1 text-secondary font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Fokus Operasional & Transaksi</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Info Box */}
        <div className="w-full md:w-auto bg-[#FBF9F6] px-5 py-3.5 rounded-2xl border border-borderMuted/30 flex items-center gap-3 self-start md:self-auto">
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold tracking-wider text-textMuted">Peran Akun</p>
            <p className="text-xs font-bold text-primary mt-0.5 capitalize">{user?.role || 'Pelanggan'}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('data-diri')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'data-diri'
              ? 'bg-primary text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{isAdminOrSuper ? 'Informasi Profil Staf' : 'Informasi Diri & Alamat'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ringkasan')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ringkasan'
              ? 'bg-primary text-white shadow-soft'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{isAdminOrSuper ? 'Pusat Operasional Staf' : 'Ringkasan Akun & Bantuan'}</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI DATA DIRI */}
      {activeTab === 'data-diri' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-6">
            <div>
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                {isAdminOrSuper ? 'Data Profil Staf Toko' : 'Formulir Informasi Data Diri & Alamat'}
              </h3>
              <p className="text-xs text-textMuted mt-1">
                {isAdminOrSuper
                  ? 'Sebagai Admin/Superadmin, profil Anda hanya membutuhkan nama lengkap dan kontak operasional.'
                  : 'Data ini menjadi acuan utama saat pembuatan pesanan dan pengantaran kurir buket di area Madiun.'}
              </p>
            </div>

            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xs font-semibold">{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Alamat Email</span>
                    <span className="text-[10px] text-textMuted font-normal">Permanen / ID Akun</span>
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

                {/* Nomor WhatsApp / Telepon */}
                <div className={isAdminOrSuper ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.no_telepon}
                      onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-textMuted mt-1 block">
                    {isAdminOrSuper
                      ? 'Kontak operasional untuk komunikasi penanganan pesanan buket dan verifikasi pembayaran.'
                      : 'Digunakan untuk konfirmasi pesanan & komunikasi kurir pengantaran.'}
                  </span>
                </div>

                {/* Kolom Alamat, Kota, dan Kode Pos HANYA untuk Pelanggan */}
                {!isAdminOrSuper && (
                  <>
                    {/* Kota / Kabupaten */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Kota / Kabupaten
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.kota}
                          onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                          placeholder="Contoh: Madiun"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Kode Pos */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Kode Pos
                      </label>
                      <div className="relative sm:max-w-xs">
                        <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.kode_pos}
                          onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value })}
                          placeholder="Contoh: 63126"
                          maxLength={10}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    {/* Alamat Lengkap */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Alamat Lengkap Pengiriman
                      </label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          value={formData.alamat}
                          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                          placeholder="Tuliskan nama jalan, nomor rumah, RT/RW, kelurahan, patokan lokasi..."
                          className="w-full p-3.5 rounded-xl border border-borderMuted/60 text-xs text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all leading-relaxed"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="flex items-center gap-2 py-3 px-6 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-hover shadow-soft transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmittingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan Perubahan Data Profil</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-4 space-y-6">
            {isAdminOrSuper ? (
              // Info Box Khusus Admin / Superadmin
              <>
                <div className="bg-[#FBF9F6] p-6 rounded-3xl border border-borderMuted/40 space-y-4">
                  <h4 className="font-playfair font-bold text-sm text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-secondary" />
                    <span>Fokus Operasional Toko</span>
                  </h4>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Sebagai staf operasional, akun Anda tidak memerlukan data alamat pengiriman. Fokus utama Anda adalah memproses pesanan buket yang masuk serta melayani pelanggan secara cepat dan tepat.
                  </p>
                  <div className="p-3.5 bg-white rounded-2xl border border-borderMuted/30 text-xs text-gray-700 space-y-2">
                    <div className="flex items-center gap-2 text-secondary font-bold">
                      <FileCheck className="w-4 h-4" />
                      <span>Akses Tugas Staf</span>
                    </div>
                    <ul className="text-[11px] text-textMuted space-y-1 list-disc list-inside">
                      <li>Verifikasi bukti transfer pembayaran</li>
                      <li>Perbarui status buket (Diproses / Dikirim / Selesai)</li>
                      <li>Kelola stok varian buket di etalase</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft space-y-3">
                  <h4 className="font-playfair font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" />
                    <span>Butik Intan Buket Madiun</span>
                  </h4>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Operasional toko terpusat di butik Madiun. Untuk mengubah informasi jam buka atau alamat butik publik, gunakan menu <Link to="/admin/profil-toko" className="text-primary font-bold hover:underline">Profil Toko</Link>.
                  </p>
                </div>
              </>
            ) : (
              // Info Box Khusus Pelanggan
              <>
                <div className="bg-[#FBF9F6] p-6 rounded-3xl border border-borderMuted/40 space-y-4">
                  <h4 className="font-playfair font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Home className="w-4 h-4 text-primary" />
                    <span>Ketentuan Alamat Pengiriman</span>
                  </h4>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Alamat domisili yang tersimpan pada akun ini akan secara otomatis terisi ketika Anda melanjutkan ke formulir <strong className="text-gray-800">Checkout Pemesanan Buket</strong>.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-borderMuted/30 text-[11px] text-gray-600 space-y-1.5">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Area Pengiriman Utama</span>
                    </div>
                    <p>Madiun Kota, Madiun Kabupaten, Magetan, Ponorogo, dan Ngawi sekitarnya.</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft space-y-3">
                  <h4 className="font-playfair font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-secondary" />
                    <span>Pengambilan Langsung (Pick-up)</span>
                  </h4>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Anda juga dapat mengambil langsung buket pesanan di butik kami di <strong className="text-gray-800">Jl. Raya Pendidikan No. 45, Madiun</strong> tanpa dikenakan biaya ongkos kirim.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: RINGKASAN AKUN & BANTUAN */}
      {activeTab === 'ringkasan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {isAdminOrSuper ? (
            // Card Shortcuts Khusus Admin & Superadmin
            <>
              {/* Card 1: Dashboard */}
              <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft flex flex-col justify-between space-y-4 hover:border-secondary/50 transition-all group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-secondary transition-colors">
                    Dashboard & Ringkasan Penjualan
                  </h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Pantau grafik omset penjualan, total pesanan baru yang masuk, dan buket yang stoknya menipis.
                  </p>
                </div>
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-bold text-secondary hover:text-secondary-hover pt-2"
                >
                  <span>Buka Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card 2: Pesanan Masuk */}
              <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                    Kelola Pesanan Masuk
                  </h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Periksa struk transfer dari pelanggan dan lakukan verifikasi untuk memproses buket.
                  </p>
                </div>
                <Link
                  to="/admin/pesanan"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover pt-2"
                >
                  <span>Buka Pesanan Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card 3: Manajemen Produk */}
              <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft flex flex-col justify-between space-y-4 hover:border-amber-600/50 transition-all group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Package className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-amber-700 transition-colors">
                    Katalog & Stok Buket
                  </h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Tambah varian buket baru, update harga, serta atur ketersediaan buket wisuda dan uang.
                  </p>
                </div>
                <Link
                  to="/admin/produk"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 pt-2"
                >
                  <span>Buka Produk Buket</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </>
          ) : (
            // Card Shortcuts Khusus Pelanggan
            <>
              {/* Card: Pesanan Saya */}
              <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                    Riwayat Pesanan Saya
                  </h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Pantau status pesanan buket Anda, proses verifikasi bukti transfer, dan nomor resi pengiriman.
                  </p>
                </div>
                <Link
                  to="/pesanan-saya"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-hover pt-2"
                >
                  <span>Buka Menu Pesanan Saya</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card: Katalog Buket */}
              <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft flex flex-col justify-between space-y-4 hover:border-primary/50 transition-all group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-amber-700 transition-colors">
                    Jelajah Koleksi Buket
                  </h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Lihat pilihan buket wisuda, buket uang, buket snack, dan bunga kering yang siap dipesan.
                  </p>
                </div>
                <Link
                  to="/katalog"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 pt-2"
                >
                  <span>Buka Katalog Lengkap</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Card: Layanan WhatsApp */}
              <div className="bg-white p-6 rounded-3xl border border-borderMuted/40 shadow-soft flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all group">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="font-playfair font-bold text-base text-gray-900 group-hover:text-emerald-700 transition-colors">
                    Konsultasi Custom via WhatsApp
                  </h3>
                  <p className="text-xs text-textMuted leading-relaxed">
                    Ingin buket kustom dengan tema warna khusus, pecahan nominal uang tertentu, atau kartu ucapan puitis?
                  </p>
                </div>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Intan%20Buket,%20saya%20ingin%20konsultasi%20pemesanan%20buket"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2"
                >
                  <span>Chat Admin Butik (0812-3456-7890)</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};

export default ProfilePage;
