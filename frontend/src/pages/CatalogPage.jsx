import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageX, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService, categoryService } from '../services/api';
import { mockProducts, mockCategories } from '../services/mockData';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryFromUrl = searchParams.get('kategori');

  const [products, setProducts] = useState(mockProducts);
  const [categories, setCategories] = useState(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState(
    selectedCategoryFromUrl ? Number(selectedCategoryFromUrl) : 'all'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync category when URL params change
    if (selectedCategoryFromUrl) {
      setSelectedCategory(Number(selectedCategoryFromUrl));
    } else {
      setSelectedCategory('all');
    }
  }, [selectedCategoryFromUrl]);

  useEffect(() => {
    productService.getAll().then((res) => {
      if (res?.data && res.data.length > 0) {
        setProducts(res.data);
      }
    });
    categoryService.getAll().then((res) => {
      if (res?.data && res.data.length > 0) {
        setCategories(res.data);
      }
    });
  }, []);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('kategori');
    } else {
      searchParams.set('kategori', catId);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.id_kategori === selectedCategory);
    }

    // Filter by Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.nama_produk.toLowerCase().includes(q) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.harga - b.harga);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.harga - a.harga);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.nama_produk.localeCompare(b.nama_produk));
    } else {
      // popular
      result.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest mb-1">
          {/* <Sparkles className="w-3.5 h-3.5" /> */}
          <span>Katalog Intan Buket</span>
        </div>
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-gray-900">
          Koleksi Buket Spesial
        </h1>
        <p className="text-textMuted text-sm mt-1 max-w-xl">
          Pilih dan sesuaikan buket impian Anda. Temukan berbagai desain buket bunga, buket uang, dan kado estetik.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-borderMuted/40 shadow-soft space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari buket wisuda, mawar, snack..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs text-textMuted font-medium shrink-0 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Urutkan:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FBF9F6] border border-borderMuted/60 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-primary"
            >
              <option value="popular">Paling Populer</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="name">Nama (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-[#F5F3F0] text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua Buket
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id_kategori}
              onClick={() => handleCategoryChange(cat.id_kategori)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCategory === cat.id_kategori
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-[#F5F3F0] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.nama_kategori}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between text-xs text-textMuted px-1">
        <span>Menampilkan <strong className="text-gray-900">{filteredProducts.length}</strong> produk</span>
        {searchTerm && (
          <span>Kata kunci: &quot;{searchTerm}&quot;</span>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id_produk} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-borderMuted/30 p-8 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-4">
            <PackageX className="w-8 h-8" />
          </div>
          <h3 className="font-playfair text-xl font-bold text-gray-900 mb-2">Buket Tidak Ditemukan</h3>
          <p className="text-textMuted text-xs max-w-md mx-auto mb-6">
            Tidak ada produk yang cocok dengan pencarian &quot;{searchTerm}&quot; atau kategori yang dipilih. Silakan coba kata kunci lain.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
            className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover shadow-sm"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
