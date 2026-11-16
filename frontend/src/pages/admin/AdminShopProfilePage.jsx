import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  Phone,
  Mail,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
  Loader2,
  RefreshCw,
  Sparkles,
  Building2
} from 'lucide-react';
import { shopProfileService } from '../../services/api';
import { useShopProfile } from '../../context/ShopProfileContext';

const AdminShopProfilePage = () => {
  const { updateShopProfile } = useShopProfile();
  // Data state
  const [formData, setFormData] = useState({
    nama_toko: '',
    deskripsi: '',
    alamat: '',
    jam_buka: '',
    no_kontak: '',
    email_toko: '',
    logo: null
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  // Logo file upload states
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeExistingLogo, setRemoveExistingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch shop profile from backend API
  const fetchProfile = async () => {
    setInitialLoading(true);
    setErrorMsg('');
    try {
      const res = await shopProfileService.get();
      const data = res?.data || {};

      setFormData({
        nama_toko: data.nama_toko || 'Intan Buket',
        deskripsi: data.deskripsi || '',
        alamat: data.alamat || '',
        jam_buka: data.jam_buka || '08.00 - 21.00 WIB',
        no_kontak: data.no_kontak || '',
        email_toko: data.email_toko || '',
        logo: data.logo || null
      });

      setLogoPreview(data.logo || null);
      setSelectedFile(null);
      setRemoveExistingLogo(false);
      if (data.updated_at) {
        setLastUpdated(data.updated_at);
      }
    } catch (err) {
      console.error('Gagal mengambil data profil toko:', err);
      setErrorMsg('Gagal memuat profil toko dari server. Menggunakan data cadangan.');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // File logo selection handler
  const handleLogoSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors((prev) => ({
        ...prev,
        logo: ['File logo harus berupa format gambar (JPG, PNG, WEBP, atau SVG).']
      }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        logo: ['Ukuran file logo maksimal 2 MB.']
      }));
      return;
    }

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.logo;
      return next;
    });

    setSelectedFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setRemoveExistingLogo(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleLogoSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleLogoSelect(file);
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setLogoPreview(null);
    setRemoveExistingLogo(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler: kirim FormData ke backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFormErrors({});

    // Validasi lokal sederhana
    const errors = {};
    if (!formData.nama_toko.trim()) {
      errors.nama_toko = ['Nama toko wajib diisi.'];
    }
    if (!formData.no_kontak.trim()) {
      errors.no_kontak = ['Nomor kontak / WhatsApp resmi wajib diisi.'];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('nama_toko', formData.nama_toko.trim());
      submitData.append('no_kontak', formData.no_kontak.trim());
      if (formData.email_toko?.trim()) submitData.append('email_toko', formData.email_toko.trim());
      if (formData.jam_buka?.trim()) submitData.append('jam_buka', formData.jam_buka.trim());
      if (formData.alamat?.trim()) submitData.append('alamat', formData.alamat.trim());
      if (formData.deskripsi?.trim()) submitData.append('deskripsi', formData.deskripsi.trim());

      if (selectedFile) {
        submitData.append('logo', selectedFile);
      } else if (removeExistingLogo) {
        submitData.append('hapus_logo', '1');
      }

      const res = await shopProfileService.update(submitData);

      if (res?.data) {
        updateShopProfile(res.data);
        setFormData((prev) => ({
          ...prev,
          nama_toko: res.data.nama_toko || prev.nama_toko,
          no_kontak: res.data.no_kontak || prev.no_kontak,
          email_toko: res.data.email_toko || prev.email_toko,
          jam_buka: res.data.jam_buka || prev.jam_buka,
          alamat: res.data.alamat || prev.alamat,
          deskripsi: res.data.deskripsi || prev.deskripsi,
          logo: res.data.logo || null
        }));
        setLogoPreview(res.data.logo || null);
        setSelectedFile(null);
        setRemoveExistingLogo(false);
        setLastUpdated(res.data.updated_at || new Date().toISOString());
      }

      setSuccessMsg(res?.message || 'Profil toko berhasil diperbarui ke database.');
    } catch (err) {
      console.error('Gagal menyimpan profil toko:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        const msg = err.response?.data?.message || 'Gagal menyimpan profil toko ke server.';
        setErrorMsg(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Pengaturan Profil Toko
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola informasi identitas, logo, kontak, dan jam operasional butik
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProfile}
          disabled={initialLoading}
          className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-borderMuted/60 text-xs font-semibold text-gray-700 rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
          title="Muat ulang data dari server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${initialLoading ? 'animate-spin text-primary' : ''}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Toast Alert Success */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Toast Alert Error */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs font-semibold">{errorMsg}</span>
        </div>
      )}

      {initialLoading ? (
        <div className="bg-white p-16 rounded-3xl border border-borderMuted/30 shadow-soft flex flex-col items-center justify-center gap-3 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-semibold text-textMuted">Memuat profil toko dari database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Form: Input data riil profil toko */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/30 shadow-soft space-y-6"
          >
            {/* Section 1: Identitas & Logo Toko */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <Store className="w-4 h-4 text-primary" />
                <h2 className="font-playfair font-bold text-base text-gray-900">
                  Identitas & Logo Butik
                </h2>
              </div>

              {/* Nama Toko */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Toko / Butik *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="nama_toko"
                    required
                    maxLength={100}
                    value={formData.nama_toko}
                    onChange={handleChange}
                    placeholder="Contoh: Intan Buket"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                      formErrors.nama_toko
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                        : 'border-borderMuted/60 focus:border-primary'
                    }`}
                  />
                </div>
                {formErrors.nama_toko && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.nama_toko[0]}</p>
                )}
              </div>

              {/* Upload Logo Toko */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Logo Toko
                </label>

                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {logoPreview ? (
                  /* Pratinjau Logo Aktif */
                  <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-borderMuted/60 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-borderMuted/40 overflow-hidden flex items-center justify-center shrink-0 shadow-xs p-1">
                      <img
                        src={logoPreview}
                        alt="Logo Butik"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-900 truncate block">
                          {selectedFile ? selectedFile.name : 'Logo toko saat ini'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            selectedFile
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {selectedFile ? 'File Baru' : 'Tersimpan'}
                        </span>
                      </div>

                      <p className="text-[11px] text-textMuted">
                        {selectedFile
                          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Siap disimpan`
                          : 'Logo ini tampil di navbar, footer, dan kartu identitas toko.'}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-borderMuted/60 hover:border-primary text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Ganti Logo</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Logo</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dropzone area bila belum ada logo */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                      isDragging
                        ? 'border-primary bg-primary-subtle/40 scale-[0.99]'
                        : 'border-borderMuted/80 hover:border-primary/80 bg-[#FAF8F5] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-borderMuted/40 text-primary flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-5 h-5" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Klik untuk memilih logo butik, atau seret file ke sini
                      </p>
                      <p className="text-[11px] text-textMuted mt-0.5">
                        Mendukung format gambar PNG, JPG, WEBP, atau SVG (Maks. 2 MB)
                      </p>
                    </div>
                  </div>
                )}

                {formErrors.logo && (
                  <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.logo[0]}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: Kontak & Operasional */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <Phone className="w-4 h-4 text-primary" />
                <h2 className="font-playfair font-bold text-base text-gray-900">
                  Kontak & Jam Operasional
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nomor Kontak / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nomor WhatsApp / Telepon *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="no_kontak"
                      required
                      maxLength={16}
                      value={formData.no_kontak}
                      onChange={handleChange}
                      placeholder="0812-3456-7890"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                        formErrors.no_kontak
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                          : 'border-borderMuted/60 focus:border-primary'
                      }`}
                    />
                  </div>
                  {formErrors.no_kontak && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.no_kontak[0]}</p>
                  )}
                </div>

                {/* Email Toko */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Alamat Email Resmi Toko
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email_toko"
                      maxLength={100}
                      value={formData.email_toko}
                      onChange={handleChange}
                      placeholder="info@intanbuket.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                        formErrors.email_toko
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                          : 'border-borderMuted/60 focus:border-primary'
                      }`}
                    />
                  </div>
                  {formErrors.email_toko && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.email_toko[0]}</p>
                  )}
                </div>

                {/* Jam Operasional */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Jam Buka Operasional
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="jam_buka"
                      maxLength={11}
                      value={formData.jam_buka}
                      onChange={handleChange}
                      placeholder="08.00-21.00"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                        formErrors.jam_buka
                          ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                          : 'border-borderMuted/60 focus:border-primary'
                      }`}
                    />
                  </div>
                  {formErrors.jam_buka && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.jam_buka[0]}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Alamat & Deskripsi */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="font-playfair font-bold text-base text-gray-900">
                  Alamat Fisik & Deskripsi
                </h2>
              </div>

              {/* Alamat Fisik */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Alamat Lengkap Toko Fisik
                </label>
                <textarea
                  rows={2}
                  name="alamat"
                  maxLength={60}
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Contoh: Jl. Raya Pendidikan No. 45, Madiun"
                  className={`w-full p-3 rounded-xl border text-xs focus:outline-none transition-colors leading-relaxed ${
                    formErrors.alamat
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                      : 'border-borderMuted/60 focus:border-primary'
                  }`}
                />
                {formErrors.alamat && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.alamat[0]}</p>
                )}
              </div>

              {/* Deskripsi Toko */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Deskripsi Singkat Butik
                </label>
                <textarea
                  rows={3}
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Ceritakan tentang layanan buket bunga, buket uang, kualitas bahan, dan nilai butik Anda..."
                  className="w-full p-3 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              {lastUpdated && (
                <span className="text-[11px] text-textMuted">
                  Diperbarui: {new Date(lastUpdated).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Perubahan</span>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Live Storefront Preview Card */}
          <div className="lg:col-span-5 space-y-5 sticky top-8">
            <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-borderMuted/40 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-borderMuted/30 pb-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <span>Pratinjau Kartu Toko</span>
                </div>
                <span className="text-[10px] text-textMuted bg-white px-2 py-0.5 rounded-full border border-borderMuted/40">
                  Live Preview
                </span>
              </div>

              {/* Brand Header */}
              <div className="flex items-center gap-3.5">
                {logoPreview ? (
                  <div className="w-14 h-14 rounded-2xl bg-white border border-borderMuted/40 overflow-hidden flex items-center justify-center shrink-0 shadow-xs p-1">
                    <img
                      src={logoPreview}
                      alt={formData.nama_toko || 'Logo'}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-playfair font-bold text-xl shadow-sm shrink-0">
                    IB
                  </div>
                )}
                <div>
                  <h3 className="font-playfair font-bold text-lg text-gray-900 leading-tight">
                    {formData.nama_toko || 'Nama Toko Anda'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs text-secondary font-medium">
                      Buka: {formData.jam_buka || '08.00 - 21.00 WIB'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <p className="text-xs text-textMuted leading-relaxed border-t border-b border-gray-200/50 py-3 line-clamp-3">
                {formData.deskripsi || 'Deskripsi butik bunga Anda akan tampil di sini untuk memberikan informasi profil kepada para pelanggan.'}
              </p>

              {/* Info Kontak Ringkas */}
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug">{formData.alamat || 'Alamat fisik toko belum diisi'}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-gray-900">{formData.no_kontak || '08xxxxxxxxxx'}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-textMuted">{formData.email_toko || 'email@toko.com'}</span>
                </div>
              </div>

              {/* Simulasi Tombol WhatsApp Pelanggan */}
              <div className="pt-2">
                <div className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hubungi via WhatsApp</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminShopProfilePage;
