import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { orderService, productService } from '../../services/api';
import { formatRupiah } from '../../components/ProductCard';

const AdminDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const accessDenied = searchParams.get('denied') === 'superadmin_only';

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, productsRes] = await Promise.allSettled([
          orderService.getAll(),
          productService.getAll()
        ]);

        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value?.data)) {
          setOrders(ordersRes.value.data);
        }

        if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value?.data)) {
          setProducts(productsRes.value.data);
        }
      } catch (err) {
        console.warn('Gagal memuat ringkasan dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingOrders = orders.filter(
    (o) => o.status_pesanan === 'baru' || o.status_pembayaran === 'menunggu_verifikasi'
  );
  const unavailableProducts = products.filter((p) => !p.status_tersedia);
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status_pembayaran === 'lunas' ? Number(o.total_harga) : 0),
    0
  );

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
            Ringkasan performa toko, transaksi pesanan buket, dan ketersediaan katalog produk
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

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-primary gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-xs text-textMuted font-medium">Memuat statistik transaksi...</span>
        </div>
      ) : (
        <>
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
              <span className="text-[11px] text-emerald-600 font-medium">Transaksi lunas terverifikasi</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Pesanan Perlu Diproses</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="font-sans font-bold text-2xl text-gray-900">{pendingOrders.length} Pesanan</div>
              <span className="text-[11px] text-amber-600 font-medium">Perlu dirangkai / verifikasi</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Total Katalog Buket</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="font-sans font-bold text-2xl text-gray-900">{products.length} Buket</div>
              <span className="text-[11px] text-blue-600 font-medium">Terdaftar di katalog</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-textMuted uppercase tracking-wider">Buket Kosong</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="font-sans font-bold text-2xl text-amber-700">{unavailableProducts.length} Produk</div>
              <span className="text-[11px] text-amber-700 font-medium">Sedang tidak tersedia di etalase</span>
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
                {orders.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-6">Belum ada pesanan masuk.</p>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <div key={order.id_pesanan} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-gray-900">
                            {order.kode_pesanan || `#${order.id_pesanan}`}
                          </span>
                          <span className="text-xs text-textMuted">• {order.nama_penerima || order.pelanggan?.nama_pelanggan || 'Pelanggan'}</span>
                        </div>
                        <span className="text-[11px] text-textMuted block mt-0.5">
                          {order.items?.length ?? 0} item • {order.motode_pembayaran || order.metode_pembayaran || 'Transfer'}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-xs text-primary">{formatRupiah(order.total_harga)}</div>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase mt-0.5 ${
                          order.status_pesanan === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status_pesanan === 'diproses'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status_pesanan === 'dikirim'
                            ? 'bg-purple-100 text-purple-800'
                            : order.status_pesanan === 'dibatalkan'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.status_pesanan}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Unavailable products */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-borderMuted/30 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-playfair font-bold text-lg text-gray-900">
                  Produk Tidak Tersedia
                </h3>
                <span className="text-xs text-amber-700 font-semibold">{unavailableProducts.length} item</span>
              </div>

              <div className="space-y-3">
                {unavailableProducts.length === 0 ? (
                  <p className="text-xs text-textMuted text-center py-6">
                    Semua produk saat ini berstatus tersedia di etalase.
                  </p>
                ) : (
                  unavailableProducts.map((p) => (
                    <div key={p.id_produk} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-[#EDE9E4] border border-borderMuted/40 shrink-0 overflow-hidden flex items-center justify-center text-textMuted">
                        {p.foto ? (
                          <img
                            src={p.foto}
                            alt={p.nama_produk}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{p.nama_produk}</p>
                        <p className="text-[11px] text-rose-600 font-bold">
                          Tidak Tersedia
                        </p>
                      </div>
                      <Link
                        to="/admin/produk"
                        className="text-xs text-primary font-semibold hover:underline px-2"
                      >
                        Edit
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
