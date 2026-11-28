import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  PackageCheck,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  X,
  Loader2,
  XCircle
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
  menunggu_verifikasi: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Menunggu Pembayaran' },
  lunas: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Pembayaran Lunas' },
  ditolak: { bg: 'bg-red-50 text-red-800 border-red-200', label: 'Pembayaran Ditolak' },
  kedaluwarsa: { bg: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Kedaluwarsa' }
};

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const showSuccessNotice = searchParams.get('success');
  const recentOrderId = searchParams.get('order_id');

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

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

  const handleCancelOrder = async (order) => {
    const orderLabel = order.kode_pesanan || `#${order.id_pesanan}`;
    if (!window.confirm(`Yakin ingin membatalkan pesanan ${orderLabel}?`)) {
      return;
    }

    setCancellingId(order.id_pesanan);
    setActionNotice(null);

    try {
      const res = await orderService.cancelOrder(order.id_pesanan);
      const updatedOrder = res?.data || { ...order, status_pesanan: 'dibatalkan' };

      setOrders(prev =>
        prev.map(o => (o.id_pesanan === order.id_pesanan ? updatedOrder : o))
      );

      // Sinkronkan juga jika pesanan tersimpan di guest_orders localStorage
      const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      if (guestOrders.length > 0) {
        const nextGuestOrders = guestOrders.map(go =>
          go.id_pesanan === order.id_pesanan ? { ...go, status_pesanan: 'dibatalkan' } : go
        );
        localStorage.setItem('guest_orders', JSON.stringify(nextGuestOrders));
      }

      setActionNotice({
        type: 'success',
        text: res?.message || `Pesanan ${orderLabel} berhasil dibatalkan.`
      });
    } catch (err) {
      console.error('Gagal membatalkan pesanan:', err);
      setActionNotice({
        type: 'error',
        text: err.response?.data?.message || 'Gagal membatalkan pesanan. Silakan coba lagi.'
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Action Notice */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-soft animate-fadeIn text-xs ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{actionNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Success banner if redirected from checkout */}
      {showSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl flex items-start gap-3.5 shadow-soft animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="block font-bold text-sm text-emerald-950">
              Pesanan Buket Berhasil Dibuat! {recentOrderId ? `(ID Pesanan: #${recentOrderId})` : ''}
            </strong>
            <p className="text-emerald-800 leading-relaxed">
              Terima kasih! Pesanan buket Anda telah tersimpan di sistem kami. Silakan selesaikan pembayaran sesuai metode yang Anda pilih.
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
            const methodLabel = (order.motode_pembayaran || order.metode_pembayaran || order.payment_method?.nama_metode || '').toLowerCase();
            const isCod = methodLabel.includes('cod') || methodLabel.includes('tunai') || methodLabel.includes('tempat');
            const isCancelled = order.status_pesanan === 'dibatalkan';
            const canCancel = order.status_pesanan === 'baru' && order.status_pembayaran !== 'lunas';
            const canPayOnline = !isCod && !isCancelled && order.status_pembayaran !== 'lunas';

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
                    {canPayOnline && (
                      <Link
                        to={`/pembayaran/${order.id_pesanan}`}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Bayar Sekarang</span>
                      </Link>
                    )}

                    {isCod && !isCancelled && order.status_pembayaran !== 'lunas' && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bayar Tunai saat Terima (COD)</span>
                      </span>
                    )}

                    {order.status_pembayaran === 'lunas' && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Pembayaran Lunas</span>
                      </span>
                    )}

                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancellingId === order.id_pesanan}
                        onClick={() => handleCancelOrder(order)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {cancellingId === order.id_pesanan ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>Batalkan Pesanan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
