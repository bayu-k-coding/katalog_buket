import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Check } from 'lucide-react';
import { mockProducts, mockCategories } from '../../services/mockData';
import { formatRupiah } from '../../components/ProductCard';

const AdminProductsPage = () => {
  const [products, setProducts] = useState(mockProducts);
  const [categories] = useState(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    nama_produk: '',
    id_kategori: 1,
    harga: '',
    stok: '',
    foto: '',
    deskripsi: '',
    status_tersedia: true
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      nama_produk: '',
      id_kategori: 1,
      harga: '',
      stok: '',
      foto: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
      deskripsi: '',
      status_tersedia: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nama_produk: product.nama_produk,
      id_kategori: product.id_kategori,
      harga: product.harga,
      stok: product.stok,
      foto: product.foto,
      deskripsi: product.deskripsi,
      status_tersedia: product.status_tersedia
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus buket ini dari katalog?')) {
      setProducts(prev => prev.filter(p => p.id_produk !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cat = categories.find(c => c.id_kategori === Number(formData.id_kategori));

    if (editingProduct) {
      setProducts(prev =>
        prev.map(p =>
          p.id_produk === editingProduct.id_produk
            ? {
                ...p,
                ...formData,
                harga: Number(formData.harga),
                stok: Number(formData.stok),
                nama_kategori: cat?.nama_kategori || 'Buket'
              }
            : p
        )
      );
    } else {
      const newProduct = {
        id_produk: Date.now(),
        ...formData,
        harga: Number(formData.harga),
        stok: Number(formData.stok),
        nama_kategori: cat?.nama_kategori || 'Buket',
        rating: 5.0,
        sold_count: 0
      };
      setProducts(prev => [newProduct, ...prev]);
    }

    setModalOpen(false);
  };

  const filtered = products.filter(p =>
    p.nama_produk.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Katalog Produk Buket
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola data foto buket, harga, stok persediaan, dan deskripsi produk
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Buket</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted/30 shadow-soft flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama buket atau kategori..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
          />
        </div>
        <span className="text-xs text-textMuted hidden sm:inline">
          Total: <strong className="text-gray-900">{filtered.length}</strong> produk
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F6] border-b border-gray-100 text-textMuted uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-4">Foto</th>
                <th className="px-5 py-4">Nama Buket</th>
                <th className="px-5 py-4">Kategori</th>
                <th className="px-5 py-4">Harga</th>
                <th className="px-5 py-4">Stok</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id_produk} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="w-11 h-11 rounded-xl bg-[#EDE9E4] border border-borderMuted/40 flex items-center justify-center text-[10px] font-bold text-textMuted uppercase">
                      IMG
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    <span className="line-clamp-1">{product.nama_produk}</span>
                  </td>
                  <td className="px-5 py-3 text-textMuted">
                    {product.nama_kategori}
                  </td>
                  <td className="px-5 py-3 font-bold text-primary">
                    {formatRupiah(product.harga)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`font-semibold ${product.stok <= 5 ? 'text-red-600' : 'text-gray-700'}`}>
                      {product.stok} unit
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      product.status_tersedia ? 'bg-secondary-subtle text-secondary' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.status_tersedia ? 'Tampil' : 'Sembunyi'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Produk"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id_produk)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Produk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-elevated max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                {editingProduct ? 'Ubah Data Produk Buket' : 'Tambah Produk Buket Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Produk Buket *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_produk}
                  onChange={(e) => setFormData({ ...formData, nama_produk: e.target.value })}
                  placeholder="Contoh: Buket Wisuda Mawar Merah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori Buket *
                  </label>
                  <select
                    value={formData.id_kategori}
                    onChange={(e) => setFormData({ ...formData, id_kategori: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id_kategori} value={c.id_kategori}>
                        {c.nama_kategori}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.harga}
                    onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                    placeholder="150000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jumlah Stok Tersedia *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Status Tampil
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.status_tersedia}
                      onChange={(e) => setFormData({ ...formData, status_tersedia: e.target.checked })}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span>Tampilkan di Katalog Publik</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  value={formData.foto}
                  onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi Buket & Bahan
                </label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Bahan bunga, warna wrapping, pita..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan ke Katalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
