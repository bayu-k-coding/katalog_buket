import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, CreditCard, QrCode, Banknote, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { mockPaymentMethods } from '../services/mockData';
import { formatRupiah } from '../components/ProductCard';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama_penerima: 'Ayu Kartika',
    telp_penerima: '081234567892',
    alamat_pengiriman: 'Jl. Melati No. 12, Oro-oro Ombo, Madiun',
    catatan: 'Tolong tulis kartu ucapan: Happy Graduation!',
    id_metode: 1 // Default Transfer BRI
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Keranjang Anda kosong.</p>
        <Link to="/katalog" className="text-primary font-semibold text-sm">
          Kembali ke katalog buket
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama_penerima || !formData.telp_penerima || !formData.alamat_pengiriman) {
      alert('Mohon lengkapi nama penerima, nomor telepon, dan alamat pengiriman!');
      return;
    }

    setIsSubmitting(true);

    // Simulate instant order submission (Tanpa login)
    setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      navigate('/pesanan-saya?success=1');
    }, 800);
  };

  const selectedPayment = mockPaymentMethods.find(m => m.id_metode === Number(formData.id_metode));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-playfair text-3xl font-bold text-gray-900">Checkout Pesanan</h1>
        <p className="text-textMuted text-xs sm:text-sm mt-1">
          Lengkapi data pengiriman dan pilih metode pembayaran untuk memproses pesanan buket Anda (tanpa perlu login)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Form: Data Pengiriman & Metode Pembayaran */}
        <div className="lg:col-span-7 space-y-6">

          {/* Form Card 1: Data Penerima */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-4">
            <h3 className="font-playfair font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">
              1. Data Penerima & Alamat
            </h3>

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
                  Nomor WhatsApp / HP *
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
                Catatan / Request Khusus (Kartu Ucapan / Jam Kirim)
              </label>
              <input
                type="text"
                name="catatan"
                value={formData.catatan}
                onChange={handleChange}
                placeholder="Contoh: Tulisan di kartu ucapan 'Selamat Wisuda!', antar sebelum jam 13.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Form Card 2: Metode Pembayaran */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-4">
            <h3 className="font-playfair font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">
              2. Metode Pembayaran
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mockPaymentMethods.map((metode) => {
                const isSelected = Number(formData.id_metode) === metode.id_metode;
                return (
                  <label
                    key={metode.id_metode}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-subtle/50 text-gray-900'
                        : 'border-borderMuted/60 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="id_metode"
                      value={metode.id_metode}
                      checked={isSelected}
                      onChange={handleChange}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div className="text-xs">
                      <span className="font-bold block text-gray-900">{metode.nama_metode}</span>
                      {metode.nomor_rekening !== '-' && (
                        <span className="text-[11px] text-textMuted block mt-0.5">
                          {metode.nomor_rekening} ({metode.atas_nama})
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Payment Gateway Info Box */}
            {selectedPayment && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sistem Pembayaran Otomatis (Payment Gateway)</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Setelah konfirmasi pesanan, Anda akan diarahkan ke invoice pembayaran <strong>{selectedPayment.nama_metode}</strong>. Status pesanan akan terverifikasi otomatis dalam hitungan detik tanpa perlu mengunggah bukti transfer manual.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-6 sticky top-28">
          <h3 className="font-playfair font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">
            Ringkasan Pesanan
          </h3>

          {/* Items list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-gray-50">
            {cart.map((item) => (
              <div key={item.id_produk} className="pt-2 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[#EDE9E4] border border-borderMuted/40 shrink-0 flex items-center justify-center text-[9px] font-bold text-textMuted uppercase">
                    IMG
                  </div>
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
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatRupiah(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Pengiriman</span>
              <span className="text-secondary font-semibold">Gratis Area Madiun Kota</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Total Tagihan</span>
            <span className="font-sans font-bold text-2xl text-primary">{formatRupiah(cartTotal)}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <span>Memproses Pesanan...</span>
            ) : (
              <>
                <span>Konfirmasi & Buat Pesanan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-textMuted text-center">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>Pesanan Anda otomatis diteruskan ke admin toko tanpa harus login.</span>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;
