import React, { useState } from 'react';
import {
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  AlertCircle,
  FileText,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { mockOrders } from '../../services/mockData';
import { formatRupiah } from '../../components/ProductCard';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(mockOrders[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status_pesanan === filterStatus;
  });

  const handleUpdateOrderStatus = (status) => {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id_pesanan === selectedOrder.id_pesanan
          ? { ...o, status_pesanan: status }
          : o
      )
    );
    setSelectedOrder((prev) => ({ ...prev, status_pesanan: status }));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Pesanan Masuk
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Pantau pembayaran otomatis payment gateway dan perbarui status pengerjaan serta pengiriman buket
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1 rounded-2xl border border-borderMuted/30">
          {['all', 'baru', 'diproses', 'dikirim', 'selesai'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st === 'all' ? 'Semua' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Orders Table (Left) + Detail & Action Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F6] border-b border-gray-100 text-textMuted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-4">Kode & Tanggal</th>
                  <th className="px-5 py-4">Pelanggan</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id_pesanan === order.id_pesanan;
                  return (
                    <tr
                      key={order.id_pesanan}
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-subtle/40' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-gray-900 block">{order.kode_pesanan}</span>
                        <span className="text-[11px] text-textMuted">{order.tanggal_pesanan}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 block">{order.pelanggan || order.nama_penerima}</span>
                        <span className="text-[11px] text-textMuted">{order.metode_pembayaran}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-primary">
                        {formatRupiah(order.total_harga)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status_pesanan === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status_pesanan === 'dikirim'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status_pesanan}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-2.5 py-1 text-primary hover:bg-primary-subtle rounded-lg text-xs font-semibold"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detail & Actions Panel */}
        {selectedOrder ? (
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-borderMuted/30 shadow-soft space-y-6 sticky top-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-playfair font-bold text-lg text-gray-900">
                  Detail {selectedOrder.kode_pesanan}
                </h3>
                <span className="text-xs text-textMuted">{selectedOrder.tanggal_pesanan}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                Lunas (Gateway)
              </span>
            </div>

            {/* Recipient and Address Info */}
            <div className="space-y-2 text-xs bg-[#FBF9F6] p-4 rounded-2xl border border-borderMuted/30">
              <p><strong>Penerima:</strong> {selectedOrder.nama_penerima} ({selectedOrder.telp_penerima})</p>
              <p><strong>Alamat:</strong> {selectedOrder.alamat_pengiriman}</p>
              {selectedOrder.catatan && (
                <p><strong>Catatan:</strong> <span className="text-primary italic">&quot;{selectedOrder.catatan}&quot;</span></p>
              )}
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-700">Rincian Item:</h4>
              <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <span>{item.nama_produk} × {item.jumlah}</span>
                    <span className="font-bold text-gray-900">
                      {formatRupiah(item.subtotal || item.harga_satuan * item.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-bold">
                <span>Total Pesanan</span>
                <span className="text-primary text-sm">{formatRupiah(selectedOrder.total_harga)}</span>
              </div>
            </div>

            {/* Payment Gateway Status Card (Menggantikan upload bukti manual) */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi Payment Gateway</span>
              </div>
              <div className="text-xs text-emerald-900 space-y-1">
                <p>Metode: <strong>{selectedOrder.metode_pembayaran}</strong></p>
                <p className="text-[11px] text-emerald-700">Pembayaran telah dikonfirmasi otomatis melalui webhook sistem pembayaran.</p>
              </div>
            </div>

            {/* Workflow status buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-semibold text-xs text-gray-700">Ubah Status Pengiriman:</h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateOrderStatus('diproses')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
                    selectedOrder.status_pesanan === 'diproses'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Diproses
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus('dikirim')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
                    selectedOrder.status_pesanan === 'dikirim'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dikirim
                </button>
                <button
                  onClick={() => handleUpdateOrderStatus('selesai')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
                    selectedOrder.status_pesanan === 'selesai'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Selesai
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-5 bg-white p-12 text-center rounded-3xl border border-borderMuted/30 text-textMuted text-xs">
            Pilih pesanan di tabel sebelah kiri untuk melihat detail.
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrdersPage;
