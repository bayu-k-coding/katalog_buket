import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../components/ProductCard';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl p-12 border border-borderMuted/40 shadow-soft max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-gray-900 mb-2">Keranjang Belanja Kosong</h2>
          <p className="text-textMuted text-xs sm:text-sm mb-6 leading-relaxed">
            Anda belum menambahkan buket ke dalam keranjang. Yuk jelajahi aneka koleksi buket terbaik kami!
          </p>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary-hover shadow-elevated transition-all"
          >
            <span>Mulai Pilih Buket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Ada <strong className="text-gray-900">{totalItems}</strong> item dalam keranjang Anda
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Kosongkan</span>
        </button>
      </div>

      {/* Cart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-borderMuted/40 shadow-soft overflow-hidden divide-y divide-gray-100">
            {cart.map((item) => (
              <div key={item.id_produk} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                {/* Placeholder Thumbnail (Tanpa Gambar Foto) */}
                <Link to={`/katalog/${item.id_produk}`} className="w-16 h-16 rounded-2xl bg-[#EDE9E4] shrink-0 border border-borderMuted/40 flex flex-col items-center justify-center text-textMuted group hover:bg-[#E5E0D9] transition-colors">
                  <span className="text-[10px] font-bold tracking-wider text-textMuted uppercase">IMG</span>
                </Link>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <Link
                    to={`/katalog/${item.id_produk}`}
                    className="font-playfair font-semibold text-base text-gray-900 hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.nama_produk}
                  </Link>
                  <p className="text-xs text-textMuted mt-0.5">
                    Harga: {formatRupiah(item.harga)}
                  </p>
                  <p className="text-xs font-bold text-primary mt-1">
                    Subtotal: {formatRupiah(item.harga * item.jumlah)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-borderMuted/60 rounded-xl bg-[#F5F3F0]">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id_produk, -1)}
                      className="px-3 py-1 text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-900">
                      {item.jumlah}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id_produk, 1)}
                      className="px-3 py-1 text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id_produk)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                    title="Hapus dari keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tambah buket lain dari katalog</span>
          </Link>
        </div>

        {/* Right: Order Summary Panel */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-borderMuted/40 shadow-soft space-y-6">
          <h3 className="font-playfair font-bold text-lg text-gray-900 border-b border-gray-100 pb-3">
            Ringkasan Belanja
          </h3>

          <div className="space-y-3 text-xs text-textMuted">
            <div className="flex justify-between">
              <span>Total Harga ({totalItems} barang)</span>
              <span className="font-semibold text-gray-900">{formatRupiah(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimasi Pengiriman</span>
              <span className="text-secondary font-medium">Dihitung di checkout</span>
            </div>
            <div className="flex justify-between">
              <span>Kartu Ucapan Kaligrafi</span>
              <span className="text-secondary font-medium">Gratis (Free)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-textMuted font-medium block">Total Pembayaran</span>
              <span className="font-sans font-bold text-2xl text-primary">{formatRupiah(cartTotal)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95"
          >
            <span>Lanjut ke Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;
