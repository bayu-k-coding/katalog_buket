import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  UploadCloud,
  Check,
  X,
  Loader2,
  Copy,
  QrCode,
  Building2,
  Banknote,
  Image as ImageIcon
} from 'lucide-react';
import { orderService } from '../services/api';
import { formatRupiah } from '../components/ProductCard';

const statusBadgeStyles = {
  baru: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Pesanan Diterima', icon: Clock },
  diproses: { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Sedang Dirangkai', icon: Clock },
  dikirim: { bg: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Sedang Dikirim', icon: Truck },
  selesai: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Selesai', icon: CheckCircle2 },
  dibatalkan: { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Dibatalkan', icon: AlertCircle }
};

const paymentStatusStyles = {
  belum_bayar: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Belum Bayar' },
  menunggu_verifikasi: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Menunggu Verifikasi Admin' },
  lunas: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Pembayaran Lunas' },
  ditolak: { bg: 'bg-red-50 text-red-800 border-red-200', label: 'Bukti Ditolak' },
  kedaluwarsa: { bg: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Kedaluwarsa' }
};

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const showSuccessNotice = searchParams.get('success');
  const recentOrderId = searchParams.get('order_id');

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal upload bukti bayar
  const [uploadModalOrder, setUploadModalOrder] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getMyOrders();
      let list = res?.data || [];

      // Gabungkan dengan pesanan lokal jika guest checkout
      const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      if (guestOrders.length > 0) {
        const existingIds = new Set(list.map(o => o.id_pesanan));
        for (const go of guestOrders) {
          if (!existingIds.has(go.id_pesanan)) {
            list.unshift(go);
            existingIds.add(go.id_pesanan);
          }
        }
      }

      setOrders(list);
    } catch (e) {
      console.warn('Gagal mengambil daftar pesanan:', e);
      const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      setOrders(guestOrders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenUploadModal = (order) => {
    setUploadModalOrder(order);
    setProofFile(null);
    setProofPreview(null);
    setUploadSuccess('');
    setUploadError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Ukuran gambar maksimal 5 MB.');
        return;
      }
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
      setUploadError('');
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!uploadModalOrder) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const formData = new FormData();
      if (proofFile) {
        formData.append('bukti_pembayaran', proofFile);
      }

      const res = await orderService.uploadProof(uploadModalOrder.id_pesanan, formData);

      setUploadSuccess('Bukti transfer berhasil dikirim. Admin akan segera memverifikasi pesanan Anda.');

      // Update state lokal
      setOrders(prev =>
        prev.map(o =>
          o.id_pesanan === uploadModalOrder.id_pesanan
            ? { ...o, status_pembayaran: 'menunggu_verifikasi', bukti_pembayaran: res?.data?.bukti_pembayaran || o.bukti_pembayaran }
            : o
        )
      );

      setTimeout(() => {
        setUploadModalOrder(null);
      }, 1500);
    } catch (err) {
      console.error('Gagal mengunggah bukti:', err);
      setUploadError(err.response?.data?.message || 'Gagal mengirimkan bukti pembayaran.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success banner if redirected from checkout */}
      {showSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex items-start gap-3.5 shadow-soft animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="block font-bold text-sm text-emerald-950">
              Pesanan Buket Berhasil Dibuat! {recentOrderId ? `(ID Pesanan: #${recentOrderId})` : ''}
            </strong>
            <p className="text-emerald-800 leading-relaxed">
              Terima kasih! Pesanan buket Anda telah tersimpan di sistem kami. Silakan selesaikan pembayaran sesuai metode yang Anda pilih dan konfirmasikan di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">Pesanan Saya</h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Pantau status perakitan, konfirmasi pembayaran, dan pengiriman pesanan buket Anda
          </p>
        </div>

        <Link
          to="/katalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-sm transition-all self-start sm:self-auto"
        >
          <span>Pesan Buket Lain</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-primary gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs font-semibold text-textMuted">Memuat riwayat pesanan buket...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-borderMuted/40 text-center max-w-md mx-auto shadow-soft space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h3 className="font-playfair font-bold text-xl text-gray-900">Belum Ada Riwayat Pesanan</h3>
          <p className="text-xs text-textMuted leading-relaxed">
            Anda belum memiliki pesanan aktif. Temukan rangkaian buket wisuda, buket uang, dan kado terbaik di katalog kami.
          </p>
          <Link
            to="/katalog"
            className="inline-block px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm"
          >
            Mulai Pesan Buket Sekarang
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-5">
          {orders.map((order) => {
            const badge = statusBadgeStyles[order.status_pesanan] || statusBadgeStyles.baru;
            const payBadge = paymentStatusStyles[order.status_pembayaran] || paymentStatusStyles.belum_bayar;
            const BadgeIcon = badge.icon;
            const isCod = order.motode_pembayaran?.toLowerCase().includes('cod') || order.motode_pembayaran?.toLowerCase().includes('tempat');
            const canUploadProof = !isCod && order.status_pembayaran !== 'lunas';

            return (
              <div
                key={order.id_pesanan}
                className="bg-white rounded-3xl border border-borderMuted/40 shadow-soft p-5 sm:p-6 transition-all hover:border-primary/40 space-y-4"
              >
                {/* Order header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-gray-900">
                        {order.kode_pesanan || `ORD-${order.id_pesanan}`}
                      </span>
                      <span className="block text-[11px] text-textMuted">
                        Waktu pemesanan: {order.tanggal_pesanan ? new Date(order.tanggal_pesanan).toLocaleString('id-ID') : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Pesanan */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{badge.label}</span>
                    </span>

                    {/* Status Pembayaran */}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${payBadge.bg}`}>
                      <span>{payBadge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="space-y-2.5 py-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 font-semibold">
                          {item.product?.nama_produk || item.nama_produk || 'Buket Eksklusif'}
                        </span>
                        <span className="text-textMuted">× {item.jumlah}</span>
                      </div>
                      <span className="font-bold text-gray-900">
                        {formatRupiah(item.subtotal || (item.harga_satuan * item.jumlah))}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Catatan jika ada */}
                {order.catatan && (
                  <div className="bg-[#FBF9F6] p-3 rounded-xl border border-borderMuted/30 text-[11px] text-gray-700">
                    <span className="font-semibold text-gray-900">Catatan/Ucapan: </span>
                    <span>{order.catatan}</span>
                  </div>
                )}

                {/* Order footer row */}
                <div className="pt-3 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-xs space-y-1">
                    <div className="text-textMuted">
                      <span>Metode Pembayaran: </span>
                      <strong className="text-gray-900">{order.motode_pembayaran || order.metode_pembayaran || 'Transfer Bank'}</strong>
                    </div>
                    <div className="text-textMuted">
                      <span>Penerima: </span>
                      <span className="text-gray-800 font-medium">{order.nama_penerima} ({order.telp_penerima})</span>
                    </div>
                    <div className="text-primary font-bold text-base pt-0.5">
                      Total: {formatRupiah(order.total_harga)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {order.status_pembayaran !== 'lunas' && (
                      <Link
                        to={`/pembayaran/${order.id_pesanan}`}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Bayar via Payment Gateway</span>
                      </Link>
                    )}

                    {canUploadProof && (
                      <button
                        type="button"
                        onClick={() => handleOpenUploadModal(order)}
                        className="px-3 py-2 rounded-xl bg-white border border-borderMuted/60 text-gray-700 hover:text-primary hover:border-primary text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{order.status_pembayaran === 'menunggu_verifikasi' ? 'Kirim Ulang Bukti' : 'Unggah Bukti Manual'}</span>
                      </button>
                    )}

                    {isCod && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bayar Tunai saat Terima (COD)</span>
                      </span>
                    )}

                    {order.status_pembayaran === 'lunas' && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Lunas Terverifikasi</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Upload Bukti Transfer */}
      {uploadModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-elevated border border-borderMuted/40">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-playfair font-bold text-lg text-gray-900">
                  Konfirmasi Pembayaran
                </h3>
                <p className="text-[11px] text-textMuted">
                  Kode: {uploadModalOrder.kode_pesanan || `#${uploadModalOrder.id_pesanan}`} • {formatRupiah(uploadModalOrder.total_harga)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">{uploadSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-700">
                    Foto Bukti Struk Transfer / Tangkapan Layar (Screenshot)
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {proofPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-borderMuted/60 bg-gray-50 p-2 text-center">
                      <img
                        src={proofPreview}
                        alt="Preview Bukti"
                        className="max-h-48 mx-auto rounded-xl object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProofFile(null);
                          setProofPreview(null);
                        }}
                        className="mt-2 text-xs text-rose-600 hover:underline font-semibold"
                      >
                        Ganti Foto
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-primary/30 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-colors bg-primary/5 hover:bg-primary/10"
                    >
                      <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-800">Klik untuk Pilih Gambar Bukti</p>
                      <p className="text-[11px] text-textMuted mt-1">Format JPG, PNG, atau WEBP (Maksimal 5 MB)</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2 disabled:bg-gray-400"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirimkan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Kirim Bukti Pembayaran</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
