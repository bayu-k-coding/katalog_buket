import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { mockOrders, mockProducts, mockUsers } from '../../services/mockData';
import { formatRupiah } from '../../components/ProductCard';

const AdminDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const accessDenied = searchParams.get('denied') === 'superadmin_only';

  const pendingOrders = mockOrders.filter(o => o.status_pesanan === 'baru' || o.status_pembayaran === 'menunggu_verifikasi');
  const lowStockProducts = mockProducts.filter(p => p.stok <= 5);
  const totalRevenue = mockOrders.reduce((sum, o) => sum + (o.status_pembayaran === 'lunas' ? o.total_harga : 0), 0);

  return (
    <div className="space-y-8">
      {/* Access Denied Notice */}
      {accessDenied && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn shadow-sm">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold">Akses Ditolak!</strong>
            Halaman Manajemen Pengguna hanya dapat diakses oleh akun dengan wewenang <strong>Superadmin (Owner)</strong>.
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Dashboard Backoffice
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Ringkasan performa toko, transaksi pesanan buket, dan inventaris stok
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/produk"
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
          >
            + Tambah Produk
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Total Omset Lunas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-bold text-2xl text-gray-900">{formatRupiah(totalRevenue)}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Bulan berjalan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Pesanan Baru Masuk</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-bold text-2xl text-gray-900">{pendingOrders.length} Pesanan</div>
          <span className="text-[11px] text-amber-600 font-medium">Perlu verifikasi pembayaran</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Total Koleksi Buket</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-bold text-2xl text-gray-900">{mockProducts.length} Produk</div>
          <span className="text-[11px] text-textMuted">Tersedia di etalase</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Peringatan Stok</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-sans font-bold text-2xl text-red-600">{lowStockProducts.length} Produk</div>
          <span className="text-[11px] text-red-600 font-medium">Stok menipis / habis</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-borderMuted/30 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-playfair font-bold text-lg text-gray-900">
              Pesanan Terbaru
            </h3>
            <Link
              to="/admin/pesanan"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Kelola Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {mockOrders.slice(0, 4).map((order) => (
              <div key={order.id_pesanan} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gray-900">{order.kode_pesanan}</span>
                    <span className="text-xs text-textMuted">• {order.pelanggan}</span>
                  </div>
                  <span className="text-[11px] text-textMuted block mt-0.5">
                    {order.items?.length || 1} item • {order.metode_pembayaran}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-bold text-xs text-primary">{formatRupiah(order.total_harga)}</div>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase mt-0.5 ${
                    order.status_pesanan === 'selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.status_pesanan}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Low stock alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-borderMuted/30 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-playfair font-bold text-lg text-gray-900">
              Perlu Restok
            </h3>
            <span className="text-xs text-red-600 font-semibold">{lowStockProducts.length} item</span>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((p) => (
              <div key={p.id_produk} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-[#EDE9E4] border border-borderMuted/40 shrink-0 flex items-center justify-center text-[9px] font-bold text-textMuted uppercase">
                  IMG
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{p.nama_produk}</p>
                  <p className="text-[11px] text-red-600 font-bold">
                    {p.stok <= 0 ? 'Stok Habis (0)' : `Sisa ${p.stok} unit`}
                  </p>
                </div>
                <Link
                  to="/admin/produk"
                  className="text-xs text-primary font-semibold hover:underline px-2"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
