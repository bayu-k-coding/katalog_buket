import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Heart,
  Truck,
  ShieldCheck,
  Clock,
  Gift,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService, categoryService, shopProfileService } from '../services/api';
import { mockProducts, mockCategories, mockShopProfile } from '../services/mockData';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState(mockProducts.slice(0, 4));
  const [categories, setCategories] = useState(mockCategories);
  const [shopProfile, setShopProfile] = useState(mockShopProfile);

  useEffect(() => {
    // Load products
    productService.getAll({ featured: true }).then((res) => {
      if (res?.data && res.data.length > 0) {
        setFeaturedProducts(res.data.slice(0, 4));
      }
    });
    // Load categories
    categoryService.getAll().then((res) => {
      if (res?.data && res.data.length > 0) {
        setCategories(res.data);
      }
    });
    // Load shop profile
    shopProfileService.get().then((res) => {
      if (res?.data) {
        setShopProfile(res.data);
      }
    });
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F3F0] to-surface pt-12 pb-20 border-b border-borderMuted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-subtle text-primary border border-primary/20 text-xs font-semibold tracking-wide">
                {/* <Sparkles className="w-3.5 h-3.5" /> */}
                <span>Koleksi Eksklusif Wisuda & Pesta 2026</span>
              </div>

              <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1B1C1A] leading-[1.15]">
                Rangkaian Buket Mewah untuk <span className="text-primary italic font-normal">Momen Terindah</span>
              </h1>

              <p className="text-textMuted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {shopProfile.deskripsi || 'Intan Buket menyediakan buket wisuda elegan, buket uang premium, dan custom bouquet spesial. Dirangkai dengan penuh cinta dan presisi seni tinggi.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/katalog"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-primary text-white font-semibold rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 text-sm"
                >
                  <span>Jelajahi Katalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {/* <Link
                  to="/pesanan-saya"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-gray-800 font-semibold rounded-2xl hover:bg-gray-50 border border-borderMuted/60 shadow-soft transition-all text-sm"
                >
                  <span>Lacak Pesanan</span>
                </Link> */}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-borderMuted/30">
                <div>
                  <div className="font-playfair text-2xl font-bold text-primary">500+</div>
                  <div className="text-xs text-textMuted">Buket Terkirim</div>
                </div>
                <div>
                  <div className="font-playfair text-2xl font-bold text-secondary">4.9 / 5</div>
                  <div className="text-xs text-textMuted">Kepuasan Pelanggan</div>
                </div>
                <div>
                  <div className="font-playfair text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-textMuted">Bahan Kualitas Premium</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative blob */}
                <div className="absolute -top-6 -right-6 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-6 -left-6 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

                <div className="relative bg-white p-3 rounded-3xl shadow-elevated border border-borderMuted/40 overflow-hidden group">
                  <img
                    src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=900&q=80"
                    alt="Buket Wisuda Intan Buket"
                    className="w-full h-[400px] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Floating badge */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-borderMuted/30 shadow-lg flex items-center justify-between">
                    <div>
                      <p className="text-xs text-textMuted font-medium">Best Seller Wisuda</p>
                      <h4 className="font-playfair font-bold text-gray-900 text-sm">Buket Wisuda Mawar & Teddy</h4>
                      <p className="text-primary font-bold text-sm">Rp 150.000</p>
                    </div>
                    <Link
                      to="/katalog/1"
                      className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors"
                    >
                      Pesan
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Keunggulan / Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-borderMuted/30 shadow-soft hover:shadow-elevated transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-playfair font-bold text-base text-gray-900 mb-1">Rangkaian Eksklusif</h3>
              <p className="text-xs text-textMuted leading-relaxed">Dibuat langsung oleh florist berpengalaman dengan detail rapi.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderMuted/30 shadow-soft hover:shadow-elevated transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-subtle text-secondary flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-playfair font-bold text-base text-gray-900 mb-1">Gratis Kartu Ucapan</h3>
              <p className="text-xs text-textMuted leading-relaxed">Tulis pesan hangat untuk sahabat dan orang tercinta tanpa biaya tambahan.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderMuted/30 shadow-soft hover:shadow-elevated transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-playfair font-bold text-base text-gray-900 mb-1">Pengiriman Aman</h3>
              <p className="text-xs text-textMuted leading-relaxed">Packing kardus tebal dan pelindung anti lecek sampai di tangan Anda.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderMuted/30 shadow-soft hover:shadow-elevated transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary-subtle text-secondary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-playfair font-bold text-base text-gray-900 mb-1">Kemudahan Bayar</h3>
              <p className="text-xs text-textMuted leading-relaxed">Mendukung Transfer Bank, QRIS instan, maupun COD saat barang sampai.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Kategori Pilihan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Pilihan Koleksi</span>
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mt-1">Kategori Buket Terpopuler</h2>
          </div>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            <span>Semua Kategori</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id_kategori}
              to={`/katalog?kategori=${cat.id_kategori}`}
              className="group bg-white p-5 rounded-2xl border border-borderMuted/30 hover:border-primary/50 text-center shadow-soft hover:shadow-elevated transition-all flex flex-col items-center justify-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#F5F3F0] group-hover:bg-primary-subtle group-hover:text-primary flex items-center justify-center text-textMuted mb-3 transition-colors">
                {/* <Sparkles className="w-6 h-6" /> */}
              </div>
              <h4 className="font-playfair font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">
                {cat.nama_kategori}
              </h4>
              <p className="text-[11px] text-textMuted mt-1 line-clamp-1">
                {cat.deskripsi}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Produk Unggulan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Paling Diminati</span>
            <h2 className="font-playfair text-3xl font-bold text-gray-900 mt-1">Produk Unggulan Kami</h2>
            <p className="text-sm text-textMuted mt-1">Pilihan favorit wisudawan dan perayaan momen spesial</p>
          </div>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-borderMuted/60 text-xs font-semibold rounded-xl text-gray-800 hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <span>Lihat Semua Katalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id_produk} product={product} />
          ))}
        </div>
      </section>

      {/* 5. Custom Bouquet Banner CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-primary text-white rounded-3xl p-8 sm:p-12 shadow-elevated">
          {/* Subtle background circle decoration */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Layanan Spesial Custom
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold leading-tight">
              Punya Konsep Buket Impian Sendiri?
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              Konsultasikan buket custom sesuai tema warna, kombinasi bunga, uang, snack, atau kado unik Anda langsung dengan florist kami melalui WhatsApp.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${shopProfile.whatsapp || '681234567890'}?text=Halo%20Intan%20Buket,%20saya%20ingin%20konsultasi%20pesan%20buket%20custom`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold text-sm rounded-xl hover:bg-gray-100 shadow-md transition-all active:scale-95"
              >
                <span>Chat Florist via WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/katalog?kategori=4"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-hover text-white font-semibold text-sm rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
              >
                <span>Lihat Contoh Custom</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
