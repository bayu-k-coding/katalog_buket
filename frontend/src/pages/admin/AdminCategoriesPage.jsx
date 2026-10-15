import React, { useState } from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { mockCategories, mockProducts } from '../../services/mockData';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ nama_kategori: '', deskripsi: '' });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ nama_kategori: '', deskripsi: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ nama_kategori: cat.nama_kategori, deskripsi: cat.deskripsi || '' });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      setCategories(prev => prev.filter(c => c.id_kategori !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(prev =>
        prev.map(c =>
          c.id_kategori === editingCategory.id_kategori
            ? { ...c, ...formData }
            : c
        )
      );
    } else {
      const newCat = {
        id_kategori: Date.now(),
        ...formData
      };
      setCategories(prev => [...prev, newCat]);
    }
    setModalOpen(false);
  };

  const getProductCount = (catId) => {
    return mockProducts.filter(p => p.id_kategori === catId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Kategori Buket
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola pengelompokan jenis produk buket untuk memudahkan pencarian pelanggan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FBF9F6] border-b border-gray-100 text-textMuted uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-4">Nama Kategori</th>
              <th className="px-6 py-4">Deskripsi</th>
              <th className="px-6 py-4">Jumlah Produk</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id_kategori} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">
                  {cat.nama_kategori}
                </td>
                <td className="px-6 py-4 text-textMuted max-w-md">
                  {cat.deskripsi}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-subtle text-primary font-bold text-[11px]">
                    {getProductCount(cat.id_kategori)} produk
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Kategori"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id_kategori)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Kategori"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-elevated">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                {editingCategory ? 'Ubah Kategori Buket' : 'Tambah Kategori Baru'}
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
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_kategori}
                  onChange={(e) => setFormData({ ...formData, nama_kategori: e.target.value })}
                  placeholder="Contoh: Buket Wisuda"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Keterangan singkat kategori..."
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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
