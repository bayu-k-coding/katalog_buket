import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Share2,
  Check,
  Star,
  Truck,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { productService } from '../services/api';
import { mockProducts, mockShopProfile } from '../services/mockData';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [cardMessage, setCardMessage] = useState('');

  useEffect(() => {
    productService.getById(id).then((res) => {
      if (res?.data) {
        setProduct(res.data);
      } else {
        const found = mockProducts.find(p => p.id_produk === Number(id));
        setProduct(found || mockProducts[0]);
      }
    });
  }, [id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Memuat detail buket...</p>
      </div>
    );
  }

  const isOutOfStock = product.stok <= 0 || !product.status_tersedia;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-textMuted">
        <Link to="/" className="hover:text-primary">Beranda</Link>
        <span>/</span>
        <Link to="/katalog" className="hover:text-primary">Katalog</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate max-w-xs">{product.nama_produk}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-borderMuted/40 shadow-soft">

        {/* Left: Product Placeholder Box (Tanpa Gambar Foto) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#EDE9E4] border border-borderMuted/40 flex flex-col items-center justify-center text-textMuted">
            <div className="w-20 h-20 rounded-3xl bg-white/80 border border-borderMuted/40 flex items-center justify-center text-primary mb-3 shadow-sm">
              <Sparkles className="w-10 h-10" />
            </div>
            <span className="font-playfair font-bold text-base text-gray-800">
              IMG {product.nama_produk}
            </span>
            <span className="text-xs text-textMuted mt-1 tracking-wider uppercase font-medium">
              Kategori: {product.nama_kategori}
            </span>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg">
                  Stok Sedang Habis
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-textMuted px-2">
            <span>Rangkaian buket eksklusif Intan Buket</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Tautan produk berhasil disalin!');
                }}
                className="hover:text-primary flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Details & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2">
              <span className="px-3 py-1 bg-primary-subtle text-primary text-xs font-semibold rounded-full border border-primary/20">
                {product.nama_kategori}
              </span>
              <div className="flex items-center gap-1 text-xs text-textMuted">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-bold text-gray-900">{product.rating || '4.9'}</span>
                <span>({product.sold_count || 120} Terjual)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#1B1C1A] leading-tight">
              {product.nama_produk}
            </h1>

            {/* Price & Stock Badge */}
            <div className="p-4 bg-[#FBF9F6] rounded-2xl border border-borderMuted/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-textMuted uppercase tracking-wider block font-semibold">Harga Spesial</span>
                <span className="font-sans font-bold text-2xl sm:text-3xl text-primary">
                  {formatRupiah(product.harga)}
                </span>
              </div>
              <div>
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    Habis
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-secondary-subtle text-secondary text-xs font-semibold rounded-full">
                    Stok Tersedia ({product.stok} unit)
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-playfair font-semibold text-sm text-gray-900">Deskripsi Rangkaian</h3>
              <p className="text-textMuted text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {product.deskripsi}
              </p>
            </div>

            {/* Free Greeting Card Note */}
            <div className="p-4 bg-secondary-subtle/50 rounded-2xl border border-secondary/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                <Sparkles className="w-4 h-4" />
                <span>Gratis Kartu Ucapan Kaligrafi Eksklusif</span>
              </div>
              <input
                type="text"
                value={cardMessage}
                onChange={(e) => setCardMessage(e.target.value)}
                placeholder="Tulis pesan ucapan Anda di sini (opsional)..."
                className="w-full bg-white border border-secondary/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-700">Jumlah:</span>
              <div className="flex items-center border border-borderMuted/60 rounded-xl bg-[#F5F3F0]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stok, quantity + 1))}
                  className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                  disabled={quantity >= product.stok || isOutOfStock}
                >
                  +
                </button>
              </div>
              <span className="text-xs text-textMuted">
                Subtotal: <strong className="text-gray-900">{formatRupiah(product.harga * quantity)}</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-xs font-bold transition-all shadow-sm ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : added
                    ? 'bg-secondary text-white'
                    : 'bg-primary-subtle text-primary border border-primary/30 hover:bg-primary hover:text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Telah Masuk Keranjang!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Tambah ke Keranjang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-3 px-6 rounded-2xl text-xs font-bold transition-all shadow-elevated ${
                  isOutOfStock
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-hover active:scale-95'
                }`}
              >
                Beli Sekarang
              </button>
            </div>

            {/* WhatsApp Consultation */}
            <a
              href={`https://wa.me/${mockShopProfile.whatsapp || '681234567890'}?text=Halo%20Intan%20Buket,%20saya%20tertarik%20dengan%20produk%20${encodeURIComponent(product.nama_produk)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Tanya Florist seputar produk ini di WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
