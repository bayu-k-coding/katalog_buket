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
  ShieldCheck
} from 'lucide-react';
import { orderService } from '../services/api';
import { mockOrders } from '../services/mockData';
import { formatRupiah } from '../components/ProductCard';

const statusBadgeStyles = {
  baru: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Pesanan Diterima', icon: Clock },
  diproses: { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Sedang Dirangkai', icon: Clock },
  dikirim: { bg: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Sedang Dikirim', icon: Truck },
  selesai: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Selesai', icon: CheckCircle2 },
  dibatalkan: { bg: 'bg-red-100 text-red-800 border-red-300', label: 'Dibatalkan', icon: AlertCircle }
};

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const showSuccessNotice = searchParams.get('success');

  const [orders, setOrders] = useState(mockOrders);

  useEffect(() => {
    orderService.getMyOrders().then((res) => {
      if (res?.data && res.data.length > 0) {
        setOrders(res.data);
      }
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success banner if redirected from checkout */}
      {showSuccessNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold">Pembayaran Payment Gateway Berhasil!</strong>
            Pesanan buket Anda telah terverifikasi otomatis dan langsung masuk ke antrean perakitan florist kami.
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900">Pesanan Saya</h1>
        <p className="text-textMuted text-xs sm:text-sm mt-1">
          Pantau status perakitan dan pengiriman pesanan buket Anda secara langsung
        </p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => {
          const badge = statusBadgeStyles[order.status_pesanan] || statusBadgeStyles.baru;
          const BadgeIcon = badge.icon;

          return (
            <div
              key={order.id_pesanan}
              className="bg-white rounded-3xl border border-borderMuted/40 shadow-soft p-5 sm:p-6 transition-all hover:border-primary/40 space-y-4"
            >
              {/* Order header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center font-bold text-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-gray-900">
                      {order.kode_pesanan}
                    </span>
                    <span className="block text-[11px] text-textMuted">
                      Waktu pesan: {order.tanggal_pesanan}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                    <BadgeIcon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>
              </div>

              {/* Order items preview */}
              <div className="space-y-2 py-1">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-gray-800 font-medium">
                      {item.nama_produk} <span className="text-textMuted">× {item.jumlah}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatRupiah(item.subtotal || item.harga_satuan * item.jumlah)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order footer row */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="text-textMuted block">
                    Metode: <strong>{order.metode_pembayaran}</strong> | Penerima: {order.nama_penerima}
                  </span>
                  <span className="text-primary font-bold text-sm">
                    Total: {formatRupiah(order.total_harga)}
                  </span>
                </div>

                {/* Status Payment Gateway Verified Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lunas (Payment Gateway)</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
