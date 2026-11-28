import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Banknote,
  ArrowRight,
  AlertCircle,
  Truck,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentMethodService } from '../services/api';
import { mockPaymentMethods } from '../services/mockData';
import { formatRupiah } from '../components/ProductCard';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [formData, setFormData] = useState({
    nama_penerima: user?.nama_lengkap || user?.nama_pelanggan || '',
    telp_penerima: user?.no_telepon || '',
    alamat_pengiriman: user?.alamat ? `${user.alamat}${user.kota ? ', ' + user.kota : ''}` : '',
    catatan: '',
    payment_type: 'online' // 'online' | 'cod'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Ambil metode pembayaran aktif dari backend
  useEffect(() => {
    paymentMethodService.getAll().then((res) => {
      if (res?.data && res.data.length > 0) {
        setPaymentMethods(res.data);
      }
    });
  }, []);

  // Update otomatis jika data profil user selesai dimuat
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nama_penerima: prev.nama_penerima || user.nama_lengkap || user.nama_pelanggan || '',
        telp_penerima: prev.telp_penerima || user.no_telepon || '',
        alamat_pengiriman: prev.alamat_pengiriman || (user.alamat ? `${user.alamat}${user.kota ? ', ' + user.kota : ''}` : '')
      }));
    }
  }, [user]);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-8 border border-borderMuted/40 shadow-soft">
          <p className="text-gray-500 mb-4 text-sm">Keranjang belanja Anda saat ini masih kosong.</p>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold text-xs rounded-xl hover:bg-primary-hover shadow-sm transition-all"
          >
            <span>Jelajahi Katalog Buket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nama_penerima.trim()) {
      setErrorMsg('Mohon isi nama lengkap penerima pesanan.');
      return;
    }
    if (!formData.telp_penerima.trim()) {
      setErrorMsg('Mohon isi nomor telepon/WhatsApp aktif penerima.');
      return;
    }
    if (!formData.alamat_pengiriman.trim()) {
      setErrorMsg('Mohon isi alamat lengkap tujuan pengiriman buket.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isOnline = formData.payment_type === 'online';

      // Temukan ID metode di database yang sesuai
      const codMethod = paymentMethods.find(m => {
        const n = (m.nama_metode || '').toLowerCase();
        return n.includes('cod') || n.includes('tempat') || n.includes('tunai');
      });
      const onlineMethod = paymentMethods.find(m => {
        const n = (m.nama_metode || '').toLowerCase();
        return n.includes('qris') || n.includes('online') || n.includes('transfer');
      }) || paymentMethods[0];

      const chosenIdMetode = isOnline ? (onlineMethod?.id_metode || 1) : (codMethod?.id_metode || 4);
      const chosenNamaMetode = isOnline ? 'Bayar Online' : 'COD (Bayar di Tempat)';

      const payload = {
        nama_penerima: formData.nama_penerima.trim(),
        telp_penerima: formData.telp_penerima.trim(),
        alamat_pengiriman: formData.alamat_pengiriman.trim(),
        catatan: formData.catatan?.trim() || null,
        id_metode: chosenIdMetode,
        metode_pembayaran: chosenNamaMetode,
        biaya_ongkir: 0,
        items: cart.map(item => ({
          id_produk: item.id_produk,
          jumlah: item.jumlah
        }))
      };

      const res = await orderService.create(payload);

      // Simpan riwayat pesanan lokal agar guest juga bisa melihat pesanan terbarunya
      if (res?.data?.id_pesanan) {
        const currentGuestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
        currentGuestOrders.unshift(res.data);
        localStorage.setItem('guest_orders', JSON.stringify(currentGuestOrders.slice(0, 10)));
      }

      clearCart();
      if (res?.data?.id_pesanan) {
        navigate(`/pembayaran/${res.data.id_pesanan}`);
      } else {
        navigate(`/pesanan-saya?success=1`);
      }
    } catch (err) {
      console.error('Gagal membuat pesanan:', err);
      const msg = err.response?.data?.message || err.message || 'Terjadi kendala saat memproses pesanan. Silakan coba kembali.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOnline = formData.payment_type === 'online';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900">Checkout Pesanan</h1>
        <p className="text-textMuted text-xs sm:text-sm mt-1">
          Lengkapi data pengiriman dan pilih opsi pembayaran untuk memproses rangkaian buket Anda
        </p>
      </div>

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Form: Data Pengiriman & Metode Pembayaran */}
        <div className="lg:col-span-7 space-y-6">

          {/* Form Card 1: Data Penerima */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                1. Data Penerima & Alamat Pengiriman
              </h3>
              {user && (
                <span className="text-[11px] bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full">
                  Akun: {user.nama_lengkap || user.email}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Penerima *
                </label>
                <input
                  type="text"
                  name="nama_penerima"
                  value={formData.nama_penerima}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Ayu Kartika"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nomor WhatsApp / HP Aktif *
                </label>
                <input
                  type="tel"
                  name="telp_penerima"
                  value={formData.telp_penerima}
                  onChange={handleChange}
                  required
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Alamat Lengkap Pengiriman *
              </label>
              <textarea
                name="alamat_pengiriman"
                value={formData.alamat_pengiriman}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, patokan lokasi..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Catatan Khusus (Kartu Ucapan / Permintaan Warna Pita / Jam Antar)
              </label>
              <input
                type="text"
                name="catatan"
                value={formData.catatan}
                onChange={handleChange}
                placeholder="Contoh: Ucapan 'Happy Graduation Ayu, S.Kom!', pita warna sage green"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Form Card 2: 2 Pilihan Pembayaran Bersih (Bayar Online / COD) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-5">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                2. Pilih Metode Pembayaran
              </h3>
            </div>

            {/* List 2 Opsi Bersih */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Opsi 1: Bayar Online */}
              <label
                className={`relative flex flex-col justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
                  isOnline
                    ? 'border-primary bg-primary/5 text-gray-900 ring-2 ring-primary/20 shadow-sm'
                    : 'border-borderMuted/60 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        Bayar Online
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="payment_type"
                      value="online"
                      checked={isOnline}
                      onChange={() => setFormData(prev => ({ ...prev, payment_type: 'online' }))}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                  </div>

                  <p className="text-xs text-textMuted leading-relaxed">
                    QRIS (GoPay, ShopeePay, DANA) atau Virtual Account BRI / BCA.
                  </p>
                </div>
              </label>

              {/* Opsi 2: COD (Bayar di Tempat) */}
              <label
                className={`relative flex flex-col justify-between p-5 rounded-2xl border cursor-pointer transition-all ${
                  !isOnline
                    ? 'border-primary bg-primary/5 text-gray-900 ring-2 ring-primary/20 shadow-sm'
                    : 'border-borderMuted/60 hover:border-gray-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-gray-900">
                        COD (Bayar di Tempat)
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="payment_type"
                      value="cod"
                      checked={!isOnline}
                      onChange={() => setFormData(prev => ({ ...prev, payment_type: 'cod' }))}
                      className="text-primary focus:ring-primary h-4 w-4"
                    />
                  </div>

                  <p className="text-xs text-textMuted leading-relaxed">
                    Bayar tunai langsung di butik atau saat kurir mengantar pesanan.
                  </p>
                </div>
              </label>

            </div>

          </div>

        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-6 sticky top-28">
          <h3 className="font-playfair font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">
            Ringkasan Pesanan
          </h3>

          {/* Items list */}
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 divide-y divide-gray-50">
            {cart.map((item) => (
              <div key={item.id_produk} className="pt-2 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nama_produk}
                      className="w-11 h-11 rounded-xl object-cover border border-borderMuted/40 shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-[#EDE9E4] border border-borderMuted/40 shrink-0 flex items-center justify-center text-[10px] font-bold text-textMuted">
                      BUKET
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.nama_produk}</p>
                    <p className="text-[11px] text-textMuted">{item.jumlah} × {formatRupiah(item.harga)}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  {formatRupiah(item.harga * item.jumlah)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-textMuted">
            <div className="flex justify-between">
              <span>Subtotal Produk</span>
              <span className="font-semibold text-gray-900">{formatRupiah(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Metode Terpilih</span>
              <span className="font-semibold text-primary">
                {isOnline ? 'Bayar Online (Otomatis)' : 'COD (Bayar di Tempat)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Pengiriman</span>
              <span className="text-secondary font-semibold">Gratis Ongkir (Kota Madiun)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Total Tagihan</span>
            <span className="font-sans font-bold text-2xl text-primary">{formatRupiah(cartTotal)}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:bg-gray-400 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Pesanan...</span>
              </>
            ) : (
              <>
                <span>Konfirmasi & Buat Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-textMuted text-center">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Pesanan aman & langsung masuk ke antrean perakitan florist Intan Buket.</span>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;
