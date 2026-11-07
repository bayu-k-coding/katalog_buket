import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Image as ImageIcon,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Package,
  Layers,
  AlertTriangle,
  X,
  Sparkles,
  ExternalLink,
  ArrowUpDown,
  Filter,
  UploadCloud,
  ImagePlus
} from 'lucide-react';
import { productService, categoryService } from '../../services/api';
import { formatRupiah } from '../../components/ProductCard';

const AdminProductsPage = () => {
  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'available' | 'hidden' | 'out_of_stock'
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'price_asc' | 'price_desc' | 'stock_asc' | 'name_asc'

  // Modal form states (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formGeneralError, setFormGeneralError] = useState('');

  // File upload states
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    nama_produk: '',
    id_kategori: '',
    harga: '',
    stok: '',
    deskripsi: '',
    status_tersedia: true
  });

  // Delete confirmation modal states
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Detail modal state (pop-up satu halaman tanpa pindah tab)
  const [detailProduct, setDetailProduct] = useState(null);

  // Fetch initial data (products & categories)
  const fetchData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ]);

      setProducts(prodRes?.data || []);
      setCategories(catRes?.data || []);
    } catch (err) {
      console.error('Gagal memuat data produk/kategori:', err);
      const msg = err.response?.data?.message || 'Gagal memuat katalog produk dari server. Pastikan server backend aktif.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-dismiss notification toast
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormErrors({});
    setFormGeneralError('');
    setSelectedFile(null);
    setFilePreview(null);
    setRemoveExistingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setFormData({
      nama_produk: '',
      id_kategori: categories.length > 0 ? categories[0].id_kategori : '',
      harga: '',
      stok: '',
      deskripsi: '',
      status_tersedia: true
    });
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormErrors({});
    setFormGeneralError('');
    setSelectedFile(null);
    setFilePreview(product.foto || null);
    setRemoveExistingPhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setFormData({
      nama_produk: product.nama_produk || '',
      id_kategori: product.id_kategori || (categories[0]?.id_kategori ?? ''),
      harga: product.harga ?? '',
      stok: product.stok ?? '',
      deskripsi: product.deskripsi || '',
      status_tersedia: Boolean(product.status_tersedia)
    });
    setModalOpen(true);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field-specific error
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // File selection & drag-drop handlers
  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormErrors((prev) => ({
        ...prev,
        foto: ['File yang dipilih harus berupa format gambar (JPG, PNG, WEBP, atau GIF).']
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        foto: ['Ukuran file gambar maksimal 5 MB.']
      }));
      return;
    }

    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.foto;
      return next;
    });

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
    setRemoveExistingPhoto(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setRemoveExistingPhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handler: Create or Update (menggunakan FormData untuk unggah file)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setFormGeneralError('');

    // Frontend validation
    const errors = {};
    if (!formData.nama_produk.trim()) {
      errors.nama_produk = ['Nama produk buket wajib diisi.'];
    }
    if (!formData.id_kategori) {
      errors.id_kategori = ['Kategori buket wajib dipilih.'];
    }
    if (formData.harga === '' || Number(formData.harga) < 0) {
      errors.harga = ['Harga buket harus berupa angka lebih besar atau sama dengan 0.'];
    }
    if (formData.stok === '' || Number(formData.stok) < 0) {
      errors.stok = ['Jumlah stok harus berupa bilangan bulat tidak negatif.'];
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormSubmitting(true);

    const submitData = new FormData();
    submitData.append('nama_produk', formData.nama_produk.trim());
    submitData.append('id_kategori', formData.id_kategori);
    submitData.append('harga', formData.harga);
    submitData.append('stok', formData.stok);
    submitData.append('status_tersedia', formData.status_tersedia ? '1' : '0');
    if (formData.deskripsi?.trim()) {
      submitData.append('deskripsi', formData.deskripsi.trim());
    }

    if (selectedFile) {
      submitData.append('foto', selectedFile);
    } else if (removeExistingPhoto) {
      submitData.append('hapus_foto', '1');
    }

    try {
      if (editingProduct) {
        // UPDATE (POST dengan _method PUT via api.js)
        const res = await productService.update(editingProduct.id_produk, submitData);
        const updated = res.data || { ...editingProduct, ...formData };

        // Ensure category name is updated in display
        const catObj = categories.find((c) => c.id_kategori === Number(formData.id_kategori));
        if (catObj) {
          updated.nama_kategori = catObj.nama_kategori;
        }

        setProducts((prev) =>
          prev.map((p) => (p.id_produk === editingProduct.id_produk ? updated : p))
        );
        setSuccessMsg(res.message || `Produk buket "${formData.nama_produk}" berhasil diperbarui.`);
      } else {
        // CREATE (POST)
        const res = await productService.create(submitData);
        const newProduct = res.data || {
          id_produk: Date.now(),
          ...formData,
          rating: 5.0,
          sold_count: 0
        };

        const catObj = categories.find((c) => c.id_kategori === Number(formData.id_kategori));
        if (catObj) {
          newProduct.nama_kategori = catObj.nama_kategori;
        }

        setProducts((prev) => [newProduct, ...prev]);
        setSuccessMsg(res.message || `Produk buket "${formData.nama_produk}" berhasil ditambahkan.`);
      }

      setModalOpen(false);
    } catch (err) {
      console.error('Gagal menyimpan produk:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        const msg = err.response?.data?.message || 'Gagal menyimpan data produk. Silakan periksa koneksi Anda.';
        setFormGeneralError(msg);
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Quick toggle status tampil/sembunyi
  const handleToggleStatus = async (product) => {
    const nextStatus = !product.status_tersedia;
    try {
      await productService.update(product.id_produk, {
        id_kategori: product.id_kategori,
        nama_produk: product.nama_produk,
        harga: product.harga,
        stok: product.stok,
        status_tersedia: nextStatus
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id_produk === product.id_produk ? { ...p, status_tersedia: nextStatus } : p
        )
      );
      setSuccessMsg(
        `Status produk "${product.nama_produk}" diubah menjadi ${nextStatus ? 'Tampil' : 'Sembunyi'}.`
      );
    } catch (err) {
      console.error('Gagal mengubah status produk:', err);
      setErrorMsg('Gagal memperbarui status ketersediaan produk.');
    }
  };

  // Submit Handler: Delete Product
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmProduct) return;

    setIsDeleting(true);
    try {
      const res = await productService.delete(deleteConfirmProduct.id_produk);
      setProducts((prev) =>
        prev.filter((p) => p.id_produk !== deleteConfirmProduct.id_produk)
      );
      setSuccessMsg(res.message || `Produk buket "${deleteConfirmProduct.nama_produk}" berhasil dihapus.`);
      setDeleteConfirmProduct(null);
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      const msg = err.response?.data?.message || 'Gagal menghapus produk dari server.';
      setErrorMsg(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered & Sorted products calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search term
        const term = searchTerm.toLowerCase();
        const matchSearch =
          !searchTerm ||
          p.nama_produk?.toLowerCase().includes(term) ||
          p.nama_kategori?.toLowerCase().includes(term) ||
          p.deskripsi?.toLowerCase().includes(term);

        // Category filter
        const matchCat =
          selectedCategory === 'all' || Number(p.id_kategori) === Number(selectedCategory);

        // Status filter
        let matchStatus = true;
        if (statusFilter === 'available') {
          matchStatus = p.status_tersedia && p.stok > 0;
        } else if (statusFilter === 'hidden') {
          matchStatus = !p.status_tersedia;
        } else if (statusFilter === 'out_of_stock') {
          matchStatus = p.stok <= 0;
        }

        return matchSearch && matchCat && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.harga - b.harga;
        if (sortBy === 'price_desc') return b.harga - a.harga;
        if (sortBy === 'stock_asc') return a.stok - b.stok;
        if (sortBy === 'name_asc') return a.nama_produk.localeCompare(b.nama_produk);
        return b.id_produk - a.id_produk; // Default latest
      });
  }, [products, searchTerm, selectedCategory, statusFilter, sortBy]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.status_tersedia && p.stok > 0).length;
    const criticalStock = products.filter((p) => p.stok <= 5 || !p.status_tersedia).length;
    const totalCategories = categories.length;
    return { total, available, criticalStock, totalCategories };
  }, [products, categories]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Katalog Produk Buket
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola data foto buket, kategori, harga satuan, jumlah stok persediaan, dan status tampil katalog
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-borderMuted/60 text-xs font-semibold text-gray-700 rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Muat ulang data dari server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Buket</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Total Produk</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-playfair text-2xl font-bold text-gray-900">{stats.total}</span>
            <span className="text-[11px] text-textMuted ml-1.5">item terdaftar</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Produk Aktif / Tampil</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-playfair text-2xl font-bold text-emerald-700">{stats.available}</span>
            <span className="text-[11px] text-textMuted ml-1.5">siap dipesan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Perlu Perhatian</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-playfair text-2xl font-bold text-amber-700">{stats.criticalStock}</span>
            <span className="text-[11px] text-textMuted ml-1.5">stok habis/kritis</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-textMuted">Kategori Buket</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-playfair text-2xl font-bold text-blue-700">{stats.totalCategories}</span>
            <span className="text-[11px] text-textMuted ml-1.5">kategori aktif</span>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-borderMuted/30 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama buket, kategori, atau bahan..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sorting Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id_kategori} value={cat.id_kategori}>
                {cat.nama_kategori}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="available">Tersedia & Tampil</option>
            <option value="hidden">Sembunyi / Nonaktif</option>
            <option value="out_of_stock">Stok Habis (0)</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
          >
            <option value="latest">Terbaru</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
            <option value="stock_asc">Stok Tersedikit</option>
            <option value="name_asc">Nama A-Z</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-primary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-xs font-semibold text-textMuted">Memuat data produk dari server...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="font-playfair font-bold text-base text-gray-900">
              Tidak Ada Produk Ditemukan
            </h3>
            <p className="text-xs text-textMuted max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Tidak ada produk yang cocok dengan kriteria pencarian dan filter Anda.'
                : 'Belum ada produk buket yang ditambahkan ke katalog.'}
            </p>
            {(searchTerm || selectedCategory !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F6] border-b border-gray-100 text-textMuted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-4 w-16">Foto</th>
                  <th className="px-5 py-4 min-w-[200px]">Nama Buket</th>
                  <th className="px-5 py-4">Kategori</th>
                  <th className="px-5 py-4">Harga Satuan</th>
                  <th className="px-5 py-4">Stok</th>
                  <th className="px-5 py-4">Status Tampil</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stok <= 0;
                  const isLowStock = product.stok > 0 && product.stok <= 5;

                  return (
                    <tr key={product.id_produk} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Foto Thumbnail (Dapat diklik untuk melihat detail) */}
                      <td className="px-5 py-3.5">
                        <div
                          onClick={() => setDetailProduct(product)}
                          className="w-12 h-12 rounded-xl bg-[#EDE9E4] border border-borderMuted/40 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                          title="Klik untuk melihat rincian produk"
                        >
                          {product.foto ? (
                            <img
                              src={product.foto}
                              alt={product.nama_produk}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            style={{ display: product.foto ? 'none' : 'flex' }}
                            className="w-full h-full flex-col items-center justify-center text-[10px] font-bold text-textMuted bg-[#EDE9E4]"
                          >
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </td>

                      {/* Nama Produk & Deskripsi (Dapat diklik untuk melihat detail) */}
                      <td className="px-5 py-3.5">
                        <div
                          onClick={() => setDetailProduct(product)}
                          className="space-y-0.5 cursor-pointer group"
                        >
                          <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 text-[13px]">
                            {product.nama_produk}
                          </p>
                          <p className="text-textMuted text-[11px] line-clamp-1 max-w-sm">
                            {product.deskripsi || 'Tidak ada keterangan deskripsi tambahan.'}
                          </p>
                        </div>
                      </td>

                      {/* Kategori Buket */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                          {product.nama_kategori || 'Umum'}
                        </span>
                      </td>

                      {/* Harga Produk */}
                      <td className="px-5 py-3.5 font-bold text-primary text-xs sm:text-sm">
                        {formatRupiah(product.harga)}
                      </td>

                      {/* Stok Persediaan */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : isLowStock
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOutOfStock ? 'Habis (0)' : `${product.stok} unit`}
                        </span>
                      </td>

                      {/* Status Tampil & Toggle */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            product.status_tersedia
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                          }`}
                          title="Klik untuk mengubah status tampil/sembunyi katalog"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.status_tersedia ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          <span>{product.status_tersedia ? 'Tampil' : 'Sembunyi'}</span>
                        </button>
                      </td>

                      {/* Kolom Aksi (Detail di Halaman ini, Edit, Delete) */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Lihat Detail: Membuka modal detail di halaman ini saja tanpa pindah tab */}
                          <button
                            type="button"
                            onClick={() => setDetailProduct(product)}
                            className="p-2 text-gray-500 hover:text-primary hover:bg-primary-subtle rounded-xl transition-colors cursor-pointer"
                            title="Lihat Detail Produk (Di Halaman Ini)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                            title="Ubah data produk buket"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmProduct(product)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Hapus produk buket dari katalog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info table */}
        <div className="p-4 bg-[#FBF9F6] border-t border-gray-100 flex items-center justify-between text-xs text-textMuted">
          <span>
            Menampilkan <strong>{filteredProducts.length}</strong> dari <strong>{products.length}</strong> produk buket
          </span>
          <span className="text-[11px] text-gray-400 hidden sm:inline">
            Intan Buket Backoffice Catalog Module
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL FORM: TAMBAH / UBAH PRODUK BUKET                                   */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 space-y-5 shadow-elevated my-8 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-playfair font-bold text-xl text-gray-900">
                  {editingProduct ? 'Ubah Data Produk Buket' : 'Tambah Produk Buket Baru'}
                </h3>
                <p className="text-xs text-textMuted mt-0.5">
                  {editingProduct
                    ? 'Perbarui rincian harga, stok, foto, dan kategori buket'
                    : 'Lengkapi formulir untuk menambahkan varian buket baru ke katalog'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* General Error Banner */}
            {formGeneralError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{formGeneralError}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Produk Buket */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nama Produk Buket *
                </label>
                <input
                  type="text"
                  name="nama_produk"
                  required
                  maxLength={150}
                  value={formData.nama_produk}
                  onChange={handleInputChange}
                  placeholder="Contoh: Buket Wisuda Mawar Merah & Boneka Teddy"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    formErrors.nama_produk
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                      : 'border-borderMuted/60 focus:border-primary'
                  }`}
                />
                {formErrors.nama_produk && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.nama_produk[0]}</p>
                )}
              </div>

              {/* Kategori & Harga */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kategori Buket *
                  </label>
                  <select
                    name="id_kategori"
                    required
                    value={formData.id_kategori}
                    onChange={handleInputChange}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none bg-white transition-colors cursor-pointer ${
                      formErrors.id_kategori
                        ? 'border-rose-300 focus:border-rose-500'
                        : 'border-borderMuted/60 focus:border-primary'
                    }`}
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id_kategori} value={c.id_kategori}>
                        {c.nama_kategori}
                      </option>
                    ))}
                  </select>
                  {formErrors.id_kategori && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.id_kategori[0]}</p>
                  )}
                </div>

                {/* Harga */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Harga Satuan (Rp) *
                  </label>
                  <input
                    type="number"
                    name="harga"
                    required
                    min={0}
                    step={1000}
                    value={formData.harga}
                    onChange={handleInputChange}
                    placeholder="150000"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                      formErrors.harga
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                        : 'border-borderMuted/60 focus:border-primary'
                    }`}
                  />
                  {formData.harga && !isNaN(Number(formData.harga)) && (
                    <p className="text-[11px] text-primary font-semibold mt-1">
                      {formatRupiah(formData.harga)}
                    </p>
                  )}
                  {formErrors.harga && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.harga[0]}</p>
                  )}
                </div>
              </div>

              {/* Stok & Status Tampil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stok Persediaan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Jumlah Stok Persediaan *
                  </label>
                  <input
                    type="number"
                    name="stok"
                    required
                    min={0}
                    value={formData.stok}
                    onChange={handleInputChange}
                    placeholder="Contoh: 10"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                      formErrors.stok
                        ? 'border-rose-300 focus:border-rose-500 bg-rose-50/30'
                        : 'border-borderMuted/60 focus:border-primary'
                    }`}
                  />
                  {formErrors.stok && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.stok[0]}</p>
                  )}
                </div>

                {/* Status Tampil Checkbox */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-borderMuted/60 bg-[#FBF9F6] cursor-pointer hover:border-primary/50 transition-colors">
                    <input
                      type="checkbox"
                      name="status_tersedia"
                      checked={formData.status_tersedia}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-800 block">
                        Tampilkan di Katalog Publik
                      </span>
                      <span className="text-[10px] text-textMuted block">
                        Aktifkan agar pelanggan dapat melihat & memesan
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Unggah File Foto Produk */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Foto Produk Buket
                </label>

                {/* Hidden native file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {filePreview ? (
                  /* Card tampilan pratinjau foto yang dipilih / sudah ada */
                  <div className="p-4 rounded-2xl bg-[#FBF9F6] border border-borderMuted/60 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-white border border-borderMuted/40 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative group">
                      <img
                        src={filePreview}
                        alt="Pratinjau Foto Buket"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div
                        style={{ display: 'none' }}
                        className="w-full h-full flex-col items-center justify-center text-[10px] text-gray-400 bg-gray-50"
                      >
                        <ImageIcon className="w-5 h-5 text-gray-300" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-gray-900 truncate block">
                          {selectedFile ? selectedFile.name : 'Foto buket saat ini'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            selectedFile
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {selectedFile ? 'File Baru' : 'Tersimpan'}
                        </span>
                      </div>

                      <p className="text-[11px] text-textMuted">
                        {selectedFile
                          ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Siap disimpan`
                          : 'File foto ini sudah aktif di katalog. Klik "Ganti Foto" untuk memilih file lain.'}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-borderMuted/60 hover:border-primary text-primary text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Ganti Foto</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Foto</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dropzone area bila belum ada foto */
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 sm:p-7 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                      isDragging
                        ? 'border-primary bg-primary-subtle/40 scale-[0.99]'
                        : 'border-borderMuted/80 hover:border-primary/80 bg-[#FAF8F5] hover:bg-[#F5F2ED]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-borderMuted/40 text-primary flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Klik untuk memilih foto buket, atau seret file ke sini
                      </p>
                      <p className="text-[11px] text-textMuted mt-0.5">
                        Mendukung file gambar format JPG, JPEG, PNG, WEBP, atau GIF (Maks. 5 MB)
                      </p>
                    </div>

                    <button
                      type="button"
                      className="mt-1 px-4 py-1.5 bg-white border border-borderMuted/60 text-xs font-bold text-gray-700 rounded-xl hover:text-primary hover:border-primary shadow-xs transition-colors pointer-events-none"
                    >
                      Pilih File dari Perangkat
                    </button>
                  </div>
                )}

                {formErrors.foto && (
                  <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{formErrors.foto[0]}</span>
                  </p>
                )}
              </div>

              {/* Deskripsi Buket & Bahan */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Deskripsi Buket & Rincian Bahan
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  value={formData.deskripsi}
                  onChange={handleInputChange}
                  placeholder="Sebutkan jenis bunga (artificial satin/segar), boneka toga, nominal uang, kartu ucapan gratis, warna kertas wrapping..."
                  className="w-full p-3.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary transition-colors leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Simpan Perubahan' : 'Tambahkan ke Katalog'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI HAPUS PRODUK                                             */}
      {/* ========================================================================= */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-5 shadow-elevated">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                Hapus Produk Buket?
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Apakah Anda yakin ingin menghapus produk{' '}
                <strong className="text-gray-900 font-semibold">
                  "{deleteConfirmProduct.nama_produk}"
                </strong>{' '}
                dari katalog toko? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {/* Info ringkas produk */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200/60 text-xs flex items-center justify-between">
              <span className="text-textMuted">Kategori: {deleteConfirmProduct.nama_kategori}</span>
              <span className="font-bold text-primary">{formatRupiah(deleteConfirmProduct.harga)}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Ya, Hapus Produk</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL PRODUK (POP-UP SATU HALAMAN TANPA PINDAH TAB)                */}
      {/* ========================================================================= */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-5 shadow-elevated max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Package className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-lg sm:text-xl text-gray-900">
                    Rincian Detail Produk
                  </h3>
                  <p className="text-[11px] text-textMuted">
                    ID Produk: #{detailProduct.id_produk} • Kategori {detailProduct.nama_kategori}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Foto & Rincian */}
            <div className="space-y-4">
              {/* Foto Produk */}
              <div className="aspect-[16/9] w-full rounded-2xl bg-[#EDE9E4] border border-borderMuted/40 overflow-hidden relative flex items-center justify-center">
                {detailProduct.foto ? (
                  <img
                    src={detailProduct.foto}
                    alt={detailProduct.nama_produk}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  style={{ display: detailProduct.foto ? 'none' : 'flex' }}
                  className="w-full h-full flex-col items-center justify-center text-textMuted bg-[#EDE9E4]"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs font-semibold">Foto Belum Diunggah</span>
                </div>

                {/* Status Badges Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm border border-gray-200">
                    {detailProduct.nama_kategori}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-sm ${
                      detailProduct.status_tersedia
                        ? 'bg-emerald-600/90 text-white'
                        : 'bg-gray-800/80 text-white'
                    }`}
                  >
                    {detailProduct.status_tersedia ? 'Tersedia di Katalog' : 'Disembunyikan'}
                  </span>
                </div>
              </div>

              {/* Judul & Harga */}
              <div>
                <h2 className="font-playfair font-bold text-xl text-gray-900 leading-tight">
                  {detailProduct.nama_produk}
                </h2>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-playfair text-2xl font-bold text-primary">
                    {formatRupiah(detailProduct.harga)}
                  </span>
                  <span className="text-xs text-textMuted">/ unit buket</span>
                </div>
              </div>

              {/* Rangkuman Stok & Kategori */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FBF9F6] border border-borderMuted/40 text-xs">
                <div>
                  <span className="text-textMuted block text-[11px]">Jumlah Stok Persediaan</span>
                  <span className={`font-bold text-sm ${detailProduct.stok <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {detailProduct.stok} unit {detailProduct.stok <= 0 && '(Stok Habis)'}
                  </span>
                </div>
                <div>
                  <span className="text-textMuted block text-[11px]">Kategori Rangkaian</span>
                  <span className="font-bold text-sm text-gray-900">
                    {detailProduct.nama_kategori}
                  </span>
                </div>
              </div>

              {/* Deskripsi & Rincian Bahan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-textMuted mb-1.5">
                  Deskripsi & Bahan Buket
                </h4>
                <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                  {detailProduct.deskripsi || 'Belum ada rincian deskripsi atau bahan untuk produk buket ini.'}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const prod = detailProduct;
                  setDetailProduct(null);
                  handleOpenEdit(prod);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Ubah Data Produk</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
