import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
  Package,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  FolderPlus,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/api';

const AdminCategoriesPage = () => {
  const { user, isSuperAdmin } = useAuth();

  // Data states
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'has_products' | 'empty'

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formGeneralError, setFormGeneralError] = useState('');

  const [formData, setFormData] = useState({
    nama_kategori: '',
    deskripsi: ''
  });

  // Delete confirmation modal states
  const [deleteConfirmCat, setDeleteConfirmCat] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories from API
  const fetchCategories = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await categoryService.getAll();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Gagal mengambil daftar kategori:', err);
      const msg =
        err.response?.data?.message ||
        'Gagal memuat data kategori dari server. Pastikan server backend Laravel aktif.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-dismiss notification toast
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Open modal for adding a new category
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      nama_kategori: '',
      deskripsi: ''
    });
    setFormErrors({});
    setFormGeneralError('');
    setModalOpen(true);
  };

  // Open modal for editing existing category
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      nama_kategori: cat.nama_kategori || '',
      deskripsi: cat.deskripsi || ''
    });
    setFormErrors({});
    setFormGeneralError('');
    setModalOpen(true);
  };

  // Form submit handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormErrors({});
    setFormGeneralError('');

    try {
      if (editingCategory) {
        // Mode Update
        const payload = {
          nama_kategori: formData.nama_kategori.trim(),
          deskripsi: formData.deskripsi.trim() || null
        };

        const res = await categoryService.update(editingCategory.id_kategori, payload);
        const updated = res.data;

        setCategories((prev) =>
          prev.map((c) =>
            c.id_kategori === editingCategory.id_kategori
              ? {
                  ...c,
                  ...updated,
                  products_count: c.products_count ?? updated.products_count ?? 0
                }
              : c
          )
        );

        setSuccessMsg(res.message || 'Kategori buket berhasil diperbarui.');
        setModalOpen(false);
      } else {
        // Mode Create
        const payload = {
          nama_kategori: formData.nama_kategori.trim(),
          deskripsi: formData.deskripsi.trim() || null
        };

        const res = await categoryService.create(payload);
        const created = res.data;

        setCategories((prev) => [
          ...prev,
          { ...created, products_count: created.products_count ?? 0 }
        ]);

        setSuccessMsg(res.message || 'Kategori buket baru berhasil ditambahkan.');
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Gagal menyimpan kategori:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormGeneralError(err.response.data.message);
      } else {
        setFormGeneralError('Terjadi kesalahan saat menyimpan kategori. Silakan periksa koneksi backend.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete category handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmCat) return;

    setIsDeleting(true);
    try {
      const res = await categoryService.delete(deleteConfirmCat.id_kategori);
      setCategories((prev) =>
        prev.filter((c) => c.id_kategori !== deleteConfirmCat.id_kategori)
      );
      setSuccessMsg(res.message || 'Kategori buket beserta isinya berhasil dihapus.');
      setDeleteConfirmCat(null);
    } catch (err) {
      console.error('Gagal menghapus kategori:', err);
      const msg =
        err.response?.data?.message || 'Gagal menghapus kategori dari database.';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const count = Number(c.products_count || 0);

      // Filter type
      if (filterType === 'has_products' && count === 0) return false;
      if (filterType === 'empty' && count > 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.nama_kategori?.toLowerCase().includes(query);
        const matchDesc = c.deskripsi?.toLowerCase().includes(query);
        return matchName || matchDesc;
      }
      return true;
    });
  }, [categories, filterType, searchQuery]);

  // Statistics
  const totalCategories = categories.length;
  const totalProductsLinked = useMemo(() => {
    return categories.reduce((sum, c) => sum + Number(c.products_count || 0), 0);
  }, [categories]);

  const topCategory = useMemo(() => {
    if (categories.length === 0) return null;
    return [...categories].sort(
      (a, b) => Number(b.products_count || 0) - Number(a.products_count || 0)
    )[0];
  }, [categories]);

  const emptyCategoriesCount = useMemo(() => {
    return categories.filter((c) => Number(c.products_count || 0) === 0).length;
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            className="text-emerald-500 hover:text-emerald-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{errorMsg}</span>
          </div>
          <button
            onClick={fetchCategories}
            className="px-3 py-1 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-playfair text-3xl font-bold text-gray-900">
              Kategori Buket
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
              {isSuperAdmin ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Superadmin Panel</span>
                </>
              ) : (
                <>
                  <BadgeCheck className="w-3 h-3 text-amber-600" />
                  <span>Admin Toko Panel</span>
                </>
              )}
            </span>
          </div>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola pengelompokan jenis buket (Wisuda, Uang, Snack, Bunga Kering, dll.) untuk etalase katalog pelanggan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCategories}
            disabled={isLoading}
            title="Muat Ulang Data Kategori"
            className="p-2.5 bg-white border border-borderMuted/40 text-gray-700 hover:text-primary hover:border-primary rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Kategori */}
        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Total Kategori
            </p>
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mt-1">
              {totalCategories}
            </h3>
            <span className="text-[11px] text-textMuted mt-0.5 block">
              Grup etalase buket
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Total Produk Terhubung */}
        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Produk Terkategori
            </p>
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mt-1">
              {totalProductsLinked}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Varian buket aktif
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Kategori Terbanyak */}
        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Varian Terbanyak
            </p>
            <h3 className="font-playfair text-lg font-bold text-gray-900 mt-1 truncate">
              {topCategory ? topCategory.nama_kategori : '-'}
            </h3>
            <span className="text-[11px] text-primary font-medium mt-0.5 block">
              {topCategory ? `${topCategory.products_count || 0} varian buket` : 'Belum ada data'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Kategori Kosong */}
        <div className="bg-white p-5 rounded-2xl border border-borderMuted/30 shadow-soft flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-textMuted">
              Kategori Kosong
            </p>
            <h3 className="font-playfair text-2xl font-bold text-gray-900 mt-1">
              {emptyCategoriesCount}
            </h3>
            <span className="text-[11px] text-textMuted mt-0.5 block">
              Dapat dihapus / diisi produk
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
            <FolderPlus className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted/30 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kategori atau deskripsi buket..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-borderMuted/40 focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F3EF] rounded-xl text-xs font-medium self-start md:self-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white text-gray-900 font-bold shadow-xs'
                : 'text-textMuted hover:text-gray-900'
            }`}
          >
            Semua ({categories.length})
          </button>
          <button
            onClick={() => setFilterType('has_products')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'has_products'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-textMuted hover:text-emerald-700'
            }`}
          >
            Ada Produk ({categories.filter((c) => Number(c.products_count || 0) > 0).length})
          </button>
          <button
            onClick={() => setFilterType('empty')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'empty'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-textMuted hover:text-amber-700'
            }`}
          >
            Belum Ada Produk ({emptyCategoriesCount})
          </button>
        </div>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-primary">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-textMuted">
              Memuat data kategori buket dari database...
            </span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-textMuted mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Tidak ada kategori ditemukan</h3>
            <p className="text-textMuted text-xs max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada kategori buket yang cocok dengan kata kunci "${searchQuery}".`
                : 'Belum ada kategori buket yang terdaftar pada filter ini.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F6] border-b border-gray-100 text-textMuted uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Kategori Buket</th>
                  <th className="px-6 py-4">Deskripsi Peruntukan</th>
                  <th className="px-6 py-4">Jumlah Produk Terhubung</th>
                  <th className="px-6 py-4">Status Etalase</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((cat) => {
                  const productCount = Number(cat.products_count || 0);
                  const hasProducts = productCount > 0;

                  return (
                    <tr
                      key={cat.id_kategori}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Name & ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {cat.nama_kategori ? cat.nama_kategori.charAt(0).toUpperCase() : 'K'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block text-sm">
                              {cat.nama_kategori}
                            </span>
                            <span className="text-[11px] text-textMuted block">
                              ID Kategori: #{cat.id_kategori}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <p className="text-gray-600 text-xs max-w-md leading-relaxed line-clamp-2">
                          {cat.deskripsi || (
                            <span className="text-textMuted italic">Tidak ada deskripsi</span>
                          )}
                        </p>
                      </td>

                      {/* Product Count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs ${
                              hasProducts
                                ? 'bg-primary-subtle text-primary'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>{productCount} Varian Buket</span>
                          </span>
                        </div>
                      </td>

                      {/* Storefront Status */}
                      <td className="px-6 py-4">
                        {hasProducts ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Aktif di Katalog</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span>Belum Ada Produk</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Storefront Link */}
                          <Link
                            to={`/katalog?kategori=${cat.id_kategori}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-subtle rounded-lg transition-colors"
                            title="Pratinjau Kategori di Katalog Publik"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Ubah Nama & Deskripsi Kategori"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setDeleteConfirmCat(cat)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Kategori Buket"
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
      </div>

      {/* MODAL: Tambah / Ubah Kategori */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-elevated animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-playfair font-bold text-lg text-gray-900">
                  {editingCategory ? 'Ubah Kategori Buket' : 'Tambah Kategori Baru'}
                </h3>
                <p className="text-[11px] text-textMuted mt-0.5">
                  {editingCategory
                    ? `Perbarui informasi kategori untuk ${editingCategory.nama_kategori}`
                    : 'Tambahkan grup variasi buket baru ke etalase toko'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Form Error Banner */}
            {formGeneralError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formGeneralError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Kategori */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Kategori Buket <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={formData.nama_kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_kategori: e.target.value })
                  }
                  placeholder="Contoh: Buket Wisuda Spesial"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    formErrors.nama_kategori
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-borderMuted/60 focus:border-primary'
                  }`}
                />
                {formErrors.nama_kategori && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {formErrors.nama_kategori[0]}
                  </span>
                )}
                <span className="text-[10px] text-textMuted mt-1 block">
                  Maksimal 80 karakter, harus unik.
                </span>
              </div>

              {/* Deskripsi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Deskripsi Kategori
                  </label>
                  <span className="text-[10px] text-textMuted">
                    {formData.deskripsi.length}/255 karakter
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={255}
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Keterangan singkat mengenai variasi buket dalam kategori ini..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors leading-relaxed ${
                    formErrors.deskripsi
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-borderMuted/60 focus:border-primary'
                  }`}
                />
                {formErrors.deskripsi && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {formErrors.deskripsi[0]}
                  </span>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Perbarui Kategori' : 'Simpan Kategori'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Kategori Kustom */}
      {deleteConfirmCat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-elevated animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                Hapus Kategori Buket?
              </h3>

              {Number(deleteConfirmCat.products_count || 0) > 0 ? (
                <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200/80 text-left text-xs text-rose-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Kategori Berisi {deleteConfirmCat.products_count} Produk</span>
                  </div>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    Kategori <strong className="text-gray-900">{deleteConfirmCat.nama_kategori}</strong> saat ini memiliki{' '}
                    <strong>{deleteConfirmCat.products_count} produk buket</strong>. Menghapus kategori ini akan langsung menghapus kategori beserta seluruh produk buket di dalamnya.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-textMuted leading-relaxed">
                  Apakah Anda yakin ingin menghapus kategori{' '}
                  <strong className="text-gray-900">{deleteConfirmCat.nama_kategori}</strong>? Kategori ini kosong dan aman dihapus dari sistem.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {isDeleting
                    ? 'Menghapus...'
                    : Number(deleteConfirmCat.products_count || 0) > 0
                    ? 'Ya, Hapus Semua'
                    : 'Ya, Hapus'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
