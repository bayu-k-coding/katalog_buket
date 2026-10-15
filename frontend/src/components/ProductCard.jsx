import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Check, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stok <= 0 || !product.status_tersedia) return;

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.stok <= 0 || !product.status_tersedia;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-borderMuted/40 hover:border-primary/50 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col h-full">
      {/* Product Placeholder Frame (Tanpa Gambar Foto) */}
      <Link to={`/katalog/${product.id_produk}`} className="relative block aspect-[4/3] overflow-hidden bg-[#EFEEEB]">
        <div className="w-full h-full flex flex-col items-center justify-center text-textMuted bg-[#EDE9E4] group-hover:bg-[#E5E0D9] transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-borderMuted/40 flex items-center justify-center text-primary mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <Gift className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-textMuted">
            IMG {product.nama_kategori}
          </span>
        </div>

        {/* Category Pill Tag */}
        <span className="absolute top-3 left-3 bg-[#FBF9F6]/90 backdrop-blur-sm text-textMuted text-[11px] font-semibold px-2.5 py-1 rounded-full border border-borderMuted/30 shadow-sm">
          {product.nama_kategori}
        </span>

        {/* Stock Status Badge */}
        {isOutOfStock ? (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            Habis
          </span>
        ) : product.stok <= 5 ? (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
            Sisa {product.stok}
          </span>
        ) : (
          <span className="absolute top-3 right-3 bg-secondary/90 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full shadow-sm">
            Tersedia
          </span>
        )}
      </Link>

      {/* Product Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Rating & Sold count */}
        <div className="flex items-center gap-1.5 text-xs text-textMuted mb-2">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="font-semibold text-gray-800">{product.rating || '4.9'}</span>
          <span>• Terjual {product.sold_count || 50}+</span>
        </div>

        {/* Product Title */}
        <Link
          to={`/katalog/${product.id_produk}`}
          className="font-playfair font-semibold text-base sm:text-lg text-[#1B1C1A] group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-3 flex-1"
        >
          {product.nama_produk}
        </Link>

        {/* Price & CTA Action */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] text-textMuted uppercase tracking-wider block font-medium">Harga</span>
            <span className="font-sans font-bold text-base sm:text-lg text-primary">
              {formatRupiah(product.harga)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-secondary text-white'
                : 'bg-primary text-white hover:bg-primary-hover active:scale-95'
            }`}
            title={isOutOfStock ? 'Stok habis' : 'Tambah ke Keranjang'}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Ditambah</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">+ Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
