import React, { useState, useEffect, useRef } from 'react';
import {
  CreditCard,
  Building2,
  QrCode,
  Banknote,
  Edit,
  Check,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Trash2,
  Loader2,
  RefreshCw,
  Power,
  ShieldCheck,
  ShieldAlert,
  Copy,
  ExternalLink,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { paymentMethodService } from '../../services/api';
import { mockPaymentMethods } from '../../services/mockData';

const AdminPaymentMethodsPage = () => {
  const { isSuperAdmin } = useAuth();

  const [methods, setMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal edit state
  const [editingMethod, setEditingMethod] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    nama_metode: '',
    nomor_rekening: '',
    payment_url: '',
    atas_nama: '',
    keterangan: '',
    instruksi: '',
    status_aktif: true,
  });

  // QRIS file upload states
  const fileInputRef = useRef(null);
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [removeQr, setRemoveQr] = useState(false);

  const fetchMethods = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await paymentMethodService.getAdminAll();
      setMethods(res?.data || []);
    } catch (err) {
      console.warn('Gagal memuat metode pembayaran dari server:', err);
      // Fallback
      paymentMethodService.getAll().then((fallbackRes) => {
        setMethods(fallbackRes?.data || mockPaymentMethods);
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleOpenEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      nama_metode: method.nama_metode || '',
      nomor_rekening: method.nomor_rekening || '',
      payment_url: method.payment_url || '',
      atas_nama: method.atas_nama || '',
      keterangan: method.keterangan || '',
      instruksi: method.instruksi || '',
      status_aktif: Boolean(method.status_aktif)
    });
    setQrFile(null);
    setQrPreview(method.qr_image || null);
    setRemoveQr(false);
    setFormErrors({});
  };

  const handleQrSelect = (file) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran berkas QRIS maksimal 3 MB.');
      return;
    }
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
    setRemoveQr(false);
  };

  const handleToggleStatus = async (method) => {
    setActionLoadingId(method.id_metode);
    try {
      const res = await paymentMethodService.toggleStatus(method.id_metode);
      setMethods(prev =>
        prev.map(m => m.id_metode === method.id_metode ? res.data : m)
      );
      setSuccessMsg(res?.message || 'Status metode pembayaran berhasil diperbarui.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Gagal mengubah status metode:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal mengubah status metode pembayaran.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingMethod) return;

    setFormSubmitting(true);
    setFormErrors({});

    try {
      const submitData = new FormData();
      submitData.append('nama_metode', formData.nama_metode.trim());
      submitData.append('nomor_rekening', formData.nomor_rekening?.trim() || '');
      submitData.append('payment_url', formData.payment_url?.trim() || '');
      submitData.append('atas_nama', formData.atas_nama?.trim() || '');
      submitData.append('keterangan', formData.keterangan?.trim() || '');
      submitData.append('instruksi', formData.instruksi?.trim() || '');
      submitData.append('status_aktif', formData.status_aktif ? '1' : '0');

      if (qrFile) {
        submitData.append('qr_image', qrFile);
      } else if (removeQr) {
        submitData.append('hapus_qr_image', '1');
      }

      const res = await paymentMethodService.update(editingMethod.id_metode, submitData);

      setMethods(prev =>
        prev.map(m => m.id_metode === editingMethod.id_metode ? res.data : m)
      );

      setSuccessMsg(res?.message || 'Metode pembayaran berhasil disimpan.');
      setEditingMethod(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Gagal menyimpan metode:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Gagal memperbarui metode pembayaran.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Metode Pembayaran
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola opsi pembayaran yang tersedia untuk pelanggan
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMethods}
          className="p-2.5 rounded-xl bg-white border border-borderMuted/40 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors shadow-xs flex items-center gap-2 text-xs font-semibold self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Muat Ulang</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-fadeIn text-xs font-semibold shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 animate-fadeIn text-xs font-semibold shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Methods Grid Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-primary gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs text-textMuted font-medium">Memuat pengaturan metode pembayaran...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {methods.map((method) => {
            const isQris = method.nama_metode.toLowerCase().includes('qris');
            const isBri = method.nama_metode.toLowerCase().includes('bri');
            const isBca = method.nama_metode.toLowerCase().includes('bca');
            const isCod = method.nama_metode.toLowerCase().includes('cod') || method.nama_metode.toLowerCase().includes('tempat');

            return (
              <div
                key={method.id_metode}
                className={`bg-white rounded-3xl border shadow-soft p-6 space-y-5 transition-all relative overflow-hidden ${
                  method.status_aktif ? 'border-borderMuted/40 hover:border-primary/40' : 'border-gray-200 opacity-60 bg-gray-50'
                }`}
              >
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FBF9F6] border border-borderMuted/40 flex items-center justify-center shadow-xs">
                      {isQris && <QrCode className="w-6 h-6 text-primary" />}
                      {isBri && <Building2 className="w-6 h-6 text-blue-600" />}
                      {isBca && <CreditCard className="w-6 h-6 text-blue-700" />}
                      {isCod && <Banknote className="w-6 h-6 text-emerald-600" />}
                    </div>
                    <div>
                      <h3 className="font-playfair font-bold text-base text-gray-900">
                        {method.nama_metode}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-0.5 ${
                        method.status_aktif ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {method.status_aktif ? 'Aktif di Checkout' : 'Dinonaktifkan'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(method)}
                    disabled={actionLoadingId === method.id_metode}
                    className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                      method.status_aktif
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                    }`}
                    title={method.status_aktif ? 'Nonaktifkan Metode Ini' : 'Aktifkan Metode Ini'}
                  >
                    <Power className={`w-4 h-4 ${actionLoadingId === method.id_metode ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Account Details Box */}
                <div className="bg-[#FBF9F6] p-4 rounded-2xl border border-borderMuted/30 space-y-2 text-xs">
                  {isQris ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted">Merchant QRIS:</span>
                        <strong className="text-gray-900">{method.atas_nama || 'Intan Buket Madiun'}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted">NMID / ID Toko:</span>
                        <span className="font-mono font-bold text-gray-900">{method.nomor_rekening || 'ID1029384756'}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                        <span className="text-textMuted">Gambar Barcode:</span>
                        {method.qr_image ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Gambar Kustom Terpasang
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">Menggunakan QR Default</span>
                        )}
                      </div>
                    </div>
                  ) : isCod ? (
                    <div className="space-y-1">
                      <p className="text-gray-700"><strong>Tipe Pembayaran:</strong> Bayar Tunai saat Terima (COD)</p>
                      <p className="text-textMuted">{method.keterangan || 'Tanpa transfer di awal.'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted">Nomor Rekening:</span>
                        <span className="font-mono font-bold text-gray-900 text-sm">{method.nomor_rekening || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-textMuted">Atas Nama Rekening:</span>
                        <strong className="text-gray-900">{method.atas_nama || '-'}</strong>
                      </div>
                    </div>
                  )}

                  {method.keterangan && (
                    <p className="text-[11px] text-textMuted pt-1 border-t border-gray-200/60 leading-relaxed">
                      {method.keterangan}
                    </p>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(method)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-borderMuted/60 text-gray-800 hover:text-primary hover:border-primary/40 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Ubah Data Akun & Rekening</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Edit Metode Pembayaran */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-elevated border border-borderMuted/40 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-playfair font-bold text-lg text-gray-900">
                  Ubah {editingMethod.nama_metode}
                </h3>
                <p className="text-[11px] text-textMuted">
                  Perubahan akan langsung berlaku pada alur transaksi pelanggan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingMethod(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Tampilan Metode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_metode}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama_metode: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Input Nomor Rekening atau NMID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {editingMethod.nama_metode.toLowerCase().includes('qris') ? 'NMID / Kode Akun' : 'Nomor Rekening'}
                  </label>
                  <input
                    type="text"
                    value={formData.nomor_rekening}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomor_rekening: e.target.value }))}
                    placeholder="Contoh: 0123-01-098765-50-8"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {editingMethod.nama_metode.toLowerCase().includes('qris') ? 'Nama Merchant QRIS' : 'Atas Nama (Pemilik)'}
                  </label>
                  <input
                    type="text"
                    value={formData.atas_nama}
                    onChange={(e) => setFormData(prev => ({ ...prev, atas_nama: e.target.value }))}
                    placeholder="Contoh: Intan Permata"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tautan / Link URL Pembayaran Langsung (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.payment_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_url: e.target.value }))}
                  placeholder="Contoh: https://link.dana.id/m/intanbuket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary font-mono"
                />
                <p className="text-[10px] text-textMuted mt-1">
                  Jika diisi, pelanggan akan langsung diarahkan ke tautan pembayaran ini.
                </p>
              </div>

              {/* Upload QRIS Image (Khusus QRIS) */}
              {editingMethod.nama_metode.toLowerCase().includes('qris') && (
                <div className="space-y-2 p-4 rounded-2xl bg-[#FBF9F6] border border-borderMuted/40">
                  <label className="block text-xs font-bold text-gray-900">
                    Unggah Gambar / Barcode QRIS Toko
                  </label>
                  <p className="text-[11px] text-textMuted">
                    Unggah gambar kode barcode QRIS resmi toko Anda (JPG, PNG, atau WEBP, maks 3 MB)
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleQrSelect(e.target.files?.[0])}
                    className="hidden"
                  />

                  {qrPreview ? (
                    <div className="text-center p-3 bg-white rounded-xl border border-borderMuted/40 space-y-2">
                      <img
                        src={qrPreview}
                        alt="QRIS Preview"
                        className="max-h-44 mx-auto rounded-lg object-contain"
                      />
                      <div className="flex justify-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary font-semibold hover:underline"
                        >
                          Ganti Gambar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQrFile(null);
                            setQrPreview(null);
                            setRemoveQr(true);
                          }}
                          className="text-rose-600 font-semibold hover:underline"
                        >
                          Hapus Gambar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-primary/30 hover:border-primary rounded-xl p-5 text-center cursor-pointer transition-colors bg-white hover:bg-primary/5"
                    >
                      <UploadCloud className="w-7 h-7 text-primary mx-auto mb-1" />
                      <span className="text-xs font-bold text-gray-800 block">Klik untuk Unggah Kode QRIS</span>
                      <span className="text-[10px] text-textMuted">Format PNG, JPG, atau WEBP</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Keterangan Singkat
                </label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) => setFormData(prev => ({ ...prev, keterangan: e.target.value }))}
                  placeholder="Keterangan yang tampil di bawah pilihan checkout"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Panduan / Langkah Pembayaran (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={formData.instruksi}
                  onChange={(e) => setFormData(prev => ({ ...prev, instruksi: e.target.value }))}
                  placeholder="Instruksi transfer yang akan dibaca pelanggan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="status_aktif"
                  checked={formData.status_aktif}
                  onChange={(e) => setFormData(prev => ({ ...prev, status_aktif: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <label htmlFor="status_aktif" className="text-xs font-semibold text-gray-700 cursor-pointer">
                  Aktifkan metode ini di halaman checkout pelanggan
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingMethod(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2 disabled:bg-gray-400"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentMethodsPage;

