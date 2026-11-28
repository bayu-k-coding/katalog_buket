import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  Loader2,
  RefreshCw,
  XCircle,
  X,
  Search,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { orderService } from '../../services/api';
import { useShopProfile } from '../../context/ShopProfileContext';
import { formatRupiah } from '../../components/ProductCard';

const statusBadgeStyles = {
  baru: { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'Baru Masuk', icon: Clock },
  diproses: { bg: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Sedang Dirangkai', icon: Clock },
  dikirim: { bg: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Sedang Dikirim', icon: Truck },
  selesai: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'Selesai', icon: CheckCircle2 },
  dibatalkan: { bg: 'bg-rose-100 text-rose-800 border-rose-300', label: 'Dibatalkan', icon: AlertCircle }
};

const paymentStatusStyles = {
  belum_bayar: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Belum Bayar' },
  menunggu_verifikasi: { bg: 'bg-amber-50 text-amber-800 border-amber-300 font-bold', label: 'Perlu Verifikasi' },
  lunas: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Lunas' },
  ditolak: { bg: 'bg-red-50 text-red-800 border-red-200', label: 'Ditolak' },
  kedaluwarsa: { bg: 'bg-gray-100 text-gray-700 border-gray-300', label: 'Kedaluwarsa' }
};

const AdminOrdersPage = () => {
  const { shopProfile } = useShopProfile();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [zoomProofUrl, setZoomProofUrl] = useState(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getAll();
      const list = res?.data || [];
      setOrders(list);
      if (list.length > 0) {
        setSelectedOrder(prev => {
          if (!prev) return list[0];
          const found = list.find(o => o.id_pesanan === prev.id_pesanan);
          return found || list[0];
        });
      } else {
        setSelectedOrder(null);
      }
    } catch (e) {
      console.warn('Gagal memuat pesanan admin:', e);
      setOrders([]);
      setSelectedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status_pesanan !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (o.kode_pesanan || `#${o.id_pesanan}`).toLowerCase();
      const name = (o.nama_penerima || '').toLowerCase();
      const phone = (o.telp_penerima || '').toLowerCase();
      return code.includes(q) || name.includes(q) || phone.includes(q);
    }
    return true;
  });

  const handleDownloadPdfInvoice = (order) => {
    if (!order) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    const shopName = shopProfile?.nama_toko || 'Intan Buket';
    const orderCode = order.kode_pesanan || `#${order.id_pesanan}`;
    const orderDate = order.tanggal_pesanan
      ? new Date(order.tanggal_pesanan).toLocaleString('id-ID')
      : '-';
    const payLabel = paymentStatusStyles[order.status_pembayaran]?.label || order.status_pembayaran;
    const statusLabel = statusBadgeStyles[order.status_pesanan]?.label || order.status_pesanan;
    const methodLabel = order.motode_pembayaran || order.metode_pembayaran || '-';

    // Header Toko (Kiri) & Meta Nota (Kanan)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(140, 29, 48);
    doc.text(shopName, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(31, 41, 55);
    doc.text('NOTA PESANAN', pageWidth - margin, y, { align: 'right' });

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(75, 85, 99);
    const shopAddrLines = shopProfile?.alamat ? doc.splitTextToSize(shopProfile.alamat, 95) : [];
    if (shopAddrLines.length > 0) {
      doc.text(shopAddrLines, margin, y);
    }
    doc.text(orderCode, pageWidth - margin, y, { align: 'right' });
    doc.text(orderDate, pageWidth - margin, y + 5, { align: 'right' });

    y += Math.max(shopAddrLines.length * 4.5, 5);
    if (shopProfile?.no_kontak) {
      doc.text(`Telp/WA: ${shopProfile.no_kontak}`, margin, y);
    }

    y = Math.max(y + 6, 41);
    doc.setDrawColor(140, 29, 48);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Informasi Penerima & Pembayaran
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(31, 41, 55);
    doc.text('Detail Penerima & Transaksi', margin, y);
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`Penerima          : ${order.nama_penerima || '-'} (${order.telp_penerima || '-'})`, margin, y);
    y += 5;

    const addrLines = doc.splitTextToSize(
      `Alamat            : ${order.alamat_pengiriman || '-'}`,
      contentWidth
    );
    doc.text(addrLines, margin, y);
    y += addrLines.length * 4.8;

    doc.text(`Metode Bayar      : ${methodLabel}`, margin, y);
    y += 5;
    doc.text(`Status Pembayaran : ${payLabel}   |   Status Pesanan: ${statusLabel}`, margin, y);
    y += 5;

    if (order.catatan) {
      const noteLines = doc.splitTextToSize(`Catatan           : "${order.catatan}"`, contentWidth);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 4.8;
    }

    y += 5;

    // Tabel Rincian Item
    doc.setFillColor(245, 242, 238);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    doc.text('PRODUK BUKET', margin + 2, y + 5.5);
    doc.text('QTY', margin + 105, y + 5.5, { align: 'center' });
    doc.text('HARGA', margin + 140, y + 5.5, { align: 'right' });
    doc.text('SUBTOTAL', pageWidth - margin - 2, y + 5.5, { align: 'right' });
    y += 11;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(31, 41, 55);

    (order.items || []).forEach((item) => {
      if (y > 265) {
        doc.addPage();
        y = 20;
      }

      const name = item.product?.nama_produk || item.nama_produk || 'Buket';
      const qty = Number(item.jumlah || 1);
      const price = formatRupiah(item.harga_satuan);
      const subtotal = formatRupiah(item.subtotal || item.harga_satuan * qty);

      const nameLines = doc.splitTextToSize(name, 92);
      doc.text(nameLines, margin + 2, y);
      doc.text(String(qty), margin + 105, y, { align: 'center' });
      doc.text(price, margin + 140, y, { align: 'right' });
      doc.text(subtotal, pageWidth - margin - 2, y, { align: 'right' });

      y += Math.max(nameLines.length * 4.8, 6);
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    });

    y += 3;
    doc.setDrawColor(31, 41, 55);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Total Pembayaran', margin + 2, y);
    doc.setTextColor(140, 29, 48);
    doc.text(formatRupiah(order.total_harga), pageWidth - margin - 2, y, { align: 'right' });

    y += 14;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Terima kasih telah memesan di ${shopName}.`, pageWidth / 2, y, { align: 'center' });

    const safeFileName = `Nota_${String(orderCode).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    doc.save(safeFileName);
  };

  const handleUpdateOrderStatus = async (status) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await orderService.updateStatus(selectedOrder.id_pesanan, status);
      const updatedOrder = res?.data || { ...selectedOrder, status_pesanan: status };

      setOrders(prev =>
        prev.map(o => (o.id_pesanan === selectedOrder.id_pesanan ? updatedOrder : o))
      );
      setSelectedOrder(updatedOrder);
      setSuccessNotice(`Status pesanan berhasil diubah menjadi "${status}".`);
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch (err) {
      console.error('Gagal memperbarui status:', err);
      // Fallback lokal
      setOrders(prev =>
        prev.map(o => (o.id_pesanan === selectedOrder.id_pesanan ? { ...o, status_pesanan: status } : o))
      );
      setSelectedOrder(prev => ({ ...prev, status_pesanan: status }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyPayment = async (statusPembayaran) => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await orderService.verifyPayment(selectedOrder.id_pesanan, statusPembayaran);
      const updatedOrder = res?.data || { ...selectedOrder, status_pembayaran: statusPembayaran };

      setOrders(prev =>
        prev.map(o => (o.id_pesanan === selectedOrder.id_pesanan ? updatedOrder : o))
      );
      setSelectedOrder(updatedOrder);
      setSuccessNotice(`Status pembayaran berhasil diubah menjadi "${statusPembayaran}".`);
      setTimeout(() => setSuccessNotice(''), 3000);
    } catch (err) {
      console.error('Gagal verifikasi pembayaran:', err);
      setOrders(prev =>
        prev.map(o => (o.id_pesanan === selectedOrder.id_pesanan ? { ...o, status_pembayaran: statusPembayaran } : o))
      );
      setSelectedOrder(prev => ({ ...prev, status_pembayaran: statusPembayaran }));
    } finally {
      setIsUpdating(false);
    }
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
            Pantau transaksi buket, kelola status pembayaran, dan proses pesanan masuk
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-white border border-borderMuted/40 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors shadow-xs"
            title="Muat Ulang Pesanan"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1 rounded-2xl border border-borderMuted/30">
            {['all', 'baru', 'diproses', 'dikirim', 'selesai', 'dibatalkan'].map((st) => (
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
      </div>

      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successNotice}</span>
        </div>
      )}

      {/* Main Grid: Orders Table (Left) + Detail & Action Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode pesanan, nama penerima, atau nomor HP..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-borderMuted/40 focus:outline-none focus:border-primary transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-primary gap-2">
              <Loader2 className="w-7 h-7 animate-spin" />
              <span className="text-xs text-textMuted font-medium">Memuat pesanan masuk...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-textMuted text-xs">
              Tidak ada pesanan dengan filter status ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBF9F6] border-b border-gray-100 text-textMuted uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Kode & Tanggal</th>
                    <th className="px-5 py-4">Penerima</th>
                    <th className="px-5 py-4">Total & Metode</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id_pesanan === order.id_pesanan;
                    const badge = statusBadgeStyles[order.status_pesanan] || statusBadgeStyles.baru;
                    const payBadge = paymentStatusStyles[order.status_pembayaran] || paymentStatusStyles.belum_bayar;

                    return (
                      <tr
                        key={order.id_pesanan}
                        onClick={() => setSelectedOrder(order)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary-subtle/40' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-gray-900 block">
                            {order.kode_pesanan || `#${order.id_pesanan}`}
                          </span>
                          <span className="text-[11px] text-textMuted">
                            {order.tanggal_pesanan ? new Date(order.tanggal_pesanan).toLocaleDateString('id-ID') : '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-800 block">{order.nama_penerima}</span>
                          <span className="text-[11px] text-textMuted">{order.telp_penerima}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-primary block">{formatRupiah(order.total_harga)}</span>
                          <span className="text-[10px] text-textMuted block font-medium">
                            {order.motode_pembayaran || order.metode_pembayaran || 'Transfer'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className={`block px-2 py-0.5 rounded-full text-[10px] font-semibold border w-fit ${payBadge.bg}`}>
                              {payBadge.label}
                            </span>
                          </div>
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
          )}
        </div>

        {/* Selected Order Detail & Actions Panel */}
        {selectedOrder ? (() => {
          const selectedIsCod = (() => {
            const label = (
              selectedOrder.motode_pembayaran ||
              selectedOrder.metode_pembayaran ||
              selectedOrder.payment_method?.nama_metode ||
              ''
            ).toLowerCase();
            return label.includes('cod') || label.includes('tunai') || label.includes('tempat');
          })();

          return (
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-borderMuted/30 shadow-soft space-y-6 sticky top-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-playfair font-bold text-lg text-gray-900">
                  Detail {selectedOrder.kode_pesanan || `#${selectedOrder.id_pesanan}`}
                </h3>
                <span className="text-xs text-textMuted">
                  {selectedOrder.tanggal_pesanan ? new Date(selectedOrder.tanggal_pesanan).toLocaleString('id-ID') : '-'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Pembayaran Badge */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${paymentStatusStyles[selectedOrder.status_pembayaran]?.bg || 'bg-gray-100 text-gray-700'}`}>
                  {paymentStatusStyles[selectedOrder.status_pembayaran]?.label || selectedOrder.status_pembayaran}
                </span>

                <button
                  type="button"
                  onClick={() => handleDownloadPdfInvoice(selectedOrder)}
                  title="Unduh Nota Pesanan (PDF)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Nota PDF</span>
                </button>
              </div>
            </div>

            {/* Recipient and Address Info */}
            <div className="space-y-2 text-xs bg-[#FBF9F6] p-4 rounded-2xl border border-borderMuted/30">
              <p><strong>Penerima:</strong> {selectedOrder.nama_penerima} ({selectedOrder.telp_penerima})</p>
              <p><strong>Alamat:</strong> {selectedOrder.alamat_pengiriman}</p>
              <p><strong>Metode Pembayaran:</strong> <span className="font-bold text-primary">{selectedOrder.motode_pembayaran || selectedOrder.metode_pembayaran || 'Transfer Bank'}</span></p>
              {selectedOrder.catatan && (
                <p><strong>Catatan/Ucapan:</strong> <span className="text-primary italic">&quot;{selectedOrder.catatan}&quot;</span></p>
              )}
            </div>

            {/* Items list */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-gray-700">Rincian Item Buket:</h4>
              <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs">
                    <span>{item.product?.nama_produk || item.nama_produk || 'Buket'} × {item.jumlah}</span>
                    <span className="font-bold text-gray-900">
                      {formatRupiah(item.subtotal || item.harga_satuan * item.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-bold">
                <span>Total Pesanan</span>
                <span className="text-primary text-base">{formatRupiah(selectedOrder.total_harga)}</span>
              </div>
            </div>

            {/* Bukti Transfer jika ada */}
            {selectedOrder.bukti_pembayaran && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-2">
                <span className="font-bold text-amber-900 block">Bukti Pembayaran Diunggah Pelanggan:</span>
                <div
                  onClick={() => setZoomProofUrl(selectedOrder.bukti_pembayaran)}
                  className="cursor-pointer group relative overflow-hidden rounded-xl border border-amber-200 bg-white p-1 text-center"
                >
                  <img
                    src={selectedOrder.bukti_pembayaran}
                    alt="Bukti Transfer"
                    className="max-h-36 mx-auto rounded-lg object-contain group-hover:scale-105 transition-transform"
                  />
                  <span className="block text-[10px] text-amber-800 font-semibold mt-1">
                    🔍 Klik gambar untuk memperbesar
                  </span>
                </div>
              </div>
            )}

            {/* Action Verifikasi Pembayaran */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-semibold text-xs text-gray-700">
                {selectedIsCod ? 'Pembayaran Tunai (COD):' : 'Verifikasi Pembayaran:'}
              </h4>
              {selectedIsCod ? (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleVerifyPayment('lunas')}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedOrder.status_pembayaran === 'lunas'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedOrder.status_pembayaran === 'lunas' ? 'Sudah Lunas (Tunai)' : 'Tandai Lunas (Tunai Diterima)'}</span>
                </button>
              ) : (
                <div className={`grid ${selectedOrder.bukti_pembayaran ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleVerifyPayment('lunas')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedOrder.status_pembayaran === 'lunas'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedOrder.status_pembayaran === 'lunas' ? 'Sudah Lunas' : 'Verifikasi Lunas'}</span>
                  </button>

                  {selectedOrder.bukti_pembayaran && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleVerifyPayment('ditolak')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        selectedOrder.status_pembayaran === 'ditolak'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak Bukti</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Workflow status buttons */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="font-semibold text-xs text-gray-700">
                {selectedIsCod ? 'Perbarui Status Pesanan:' : 'Perbarui Status Pengerjaan & Pengiriman:'}
              </h4>
              <div className={`grid ${selectedIsCod ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                <button
                  disabled={isUpdating}
                  onClick={() => handleUpdateOrderStatus('diproses')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
                    selectedOrder.status_pesanan === 'diproses'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Diproses
                </button>
                {!selectedIsCod && (
                  <button
                    disabled={isUpdating}
                    onClick={() => handleUpdateOrderStatus('dikirim')}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors ${
                      selectedOrder.status_pesanan === 'dikirim'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dikirim
                  </button>
                )}
                <button
                  disabled={isUpdating}
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

              <button
                type="button"
                disabled={isUpdating || selectedOrder.status_pesanan === 'dibatalkan'}
                onClick={() => {
                  if (window.confirm('Yakin ingin membatalkan pesanan ini?')) {
                    handleUpdateOrderStatus('dibatalkan');
                  }
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  selectedOrder.status_pesanan === 'dibatalkan'
                    ? 'bg-rose-600 text-white shadow-sm cursor-default'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{selectedOrder.status_pesanan === 'dibatalkan' ? 'Pesanan Dibatalkan' : 'Batalkan Pesanan'}</span>
              </button>
            </div>

          </div>
          );
        })() : (
          <div className="lg:col-span-5 bg-white p-12 text-center rounded-3xl border border-borderMuted/30 text-textMuted text-xs">
            Pilih pesanan di tabel sebelah kiri untuk melihat detail.
          </div>
        )}

      </div>

      {/* Modal Zoom Bukti Transfer */}
      {zoomProofUrl && (
        <div
          onClick={() => setZoomProofUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn cursor-pointer"
        >
          <div className="relative max-w-lg w-full bg-white p-4 rounded-3xl space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-xs text-gray-900">Bukti Pembayaran Pelanggan</span>
              <button
                type="button"
                onClick={() => setZoomProofUrl(null)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={zoomProofUrl}
              alt="Bukti Transfer Penuh"
              className="max-h-[70vh] w-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
