import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { mockUsers } from '../../services/mockData';

const AdminUsersPage = () => {
  const [users, setUsers] = useState(mockUsers);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    role: 'admin',
    password: ''
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      nama_lengkap: '',
      email: '',
      no_telepon: '',
      role: 'admin',
      password: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      nama_lengkap: u.nama_lengkap,
      email: u.email,
      no_telepon: u.no_telepon || '',
      role: u.role,
      password: ''
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus pengguna ini?')) {
      setUsers(prev => prev.filter(u => u.id_user !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(prev =>
        prev.map(u =>
          u.id_user === editingUser.id_user
            ? { ...u, ...formData }
            : u
        )
      );
    } else {
      const newUser = {
        id_user: Date.now(),
        ...formData,
        status_aktif: 1
      };
      setUsers(prev => [...prev, newUser]);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-playfair text-3xl font-bold text-gray-900">
              Manajemen Pengguna
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
              Superadmin Only
            </span>
          </div>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola hak akses akun pemilik toko, staf kasir/admin, dan daftar akun pelanggan terdaftar
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FBF9F6] border-b border-gray-100 text-textMuted uppercase font-bold text-[10px] tracking-wider">
            <tr>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">No. Telepon</th>
              <th className="px-6 py-4">Peran (Role)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id_user} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">
                  {u.nama_lengkap}
                </td>
                <td className="px-6 py-4 text-textMuted">
                  {u.email}
                </td>
                <td className="px-6 py-4 text-textMuted">
                  {u.no_telepon || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    u.role === 'superadmin'
                      ? 'bg-purple-100 text-purple-800'
                      : u.role === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                  <span className="text-gray-700">Aktif</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Pengguna"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {u.role !== 'superadmin' && (
                      <button
                        onClick={() => handleDelete(u.id_user)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
                {editingUser ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
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
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Contoh: Rina Melati"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rina@intanbuket.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.no_telepon}
                  onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Hak Akses (Role) *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary bg-white"
                >
                  <option value="admin">Admin Toko / Kasir</option>
                  <option value="superadmin">Superadmin / Owner</option>
                  <option value="pelanggan">Pelanggan Biasa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {editingUser ? 'Password Baru (Kosongkan jika tidak diganti)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
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
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
