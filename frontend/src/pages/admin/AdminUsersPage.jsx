import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  Mail,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  Power,
  X,
  ShieldAlert,
  Lock,
  RefreshCw,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  // Data states
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'superadmin' | 'admin'

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formGeneralError, setFormGeneralError] = useState('');

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    no_telepon: '',
    role: 'admin',
    password: '',
    status_aktif: true
  });

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Gagal mengambil daftar pengguna:', err);
      const msg = err.response?.data?.message || 'Gagal memuat data pengguna dari server. Pastikan server backend aktif.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-dismiss notification
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Helper: check if a user is the currently logged-in Superadmin
  const isSelf = (u) => {
    if (!currentUser || !u) return false;
    return (
      (currentUser.id_user && u.id_user && Number(currentUser.id_user) === Number(u.id_user)) ||
      currentUser.email?.toLowerCase() === u.email?.toLowerCase()
    );
  };

  // Open modal for adding a new user
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      nama_lengkap: '',
      email: '',
      no_telepon: '',
      role: 'admin',
      password: '',
      status_aktif: true
    });
    setFormErrors({});
    setFormGeneralError('');
    setModalOpen(true);
  };

  // Open modal for editing existing user
  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      nama_lengkap: u.nama_lengkap || '',
      email: u.email || '',
      no_telepon: u.no_telepon || '',
      role: u.role || 'admin',
      password: '',
      status_aktif: Boolean(u.status_aktif)
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
      if (editingUser) {
        // Mode Update
        const payload = {
          nama_lengkap: formData.nama_lengkap,
          email: formData.email,
          no_telepon: formData.no_telepon || null,
          role: formData.role,
          status_aktif: formData.status_aktif ? 1 : 0
        };
        // Only include password if filled
        if (formData.password?.trim()) {
          payload.password = formData.password;
        }

        const res = await userService.update(editingUser.id_user, payload);
        const updated = res.data;

        setUsers((prev) =>
          prev.map((u) => (u.id_user === editingUser.id_user ? { ...u, ...updated } : u))
        );
        setSuccessMsg(res.message || 'Data pengguna berhasil diperbarui.');
        setModalOpen(false);
      } else {
        // Mode Create
        const payload = {
          nama_lengkap: formData.nama_lengkap,
          email: formData.email,
          no_telepon: formData.no_telepon || null,
          role: formData.role,
          password: formData.password
        };

        const res = await userService.create(payload);
        const created = res.data;

        setUsers((prev) => [...prev, created]);
        setSuccessMsg(res.message || 'Pengguna baru berhasil ditambahkan.');
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Gagal menyimpan data pengguna:', err);
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setFormGeneralError(err.response.data.message);
      } else {
        setFormGeneralError('Terjadi kesalahan saat menyimpan data pengguna. Silakan coba lagi.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (u) => {
    if (isSelf(u)) {
      alert('Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.');
      return;
    }

    setActionLoadingId(u.id_user);
    try {
      const res = await userService.toggleStatus(u.id_user);
      const newStatus = res.data?.status_aktif ?? !u.status_aktif;

      setUsers((prev) =>
        prev.map((item) =>
          item.id_user === u.id_user ? { ...item, status_aktif: newStatus } : item
        )
      );
      setSuccessMsg(res.message || `Status akun ${u.nama_lengkap} berhasil diperbarui.`);
    } catch (err) {
      console.error('Gagal mengubah status pengguna:', err);
      const msg = err.response?.data?.message || 'Gagal mengubah status aktif pengguna.';
      alert(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;

    if (isSelf(deleteConfirmUser)) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
      setDeleteConfirmUser(null);
      return;
    }

    if (deleteConfirmUser.role === 'superadmin') {
      alert('Akun Superadmin tidak dapat dihapus untuk menjaga keamanan sistem.');
      setDeleteConfirmUser(null);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await userService.delete(deleteConfirmUser.id_user);
      setUsers((prev) => prev.filter((u) => u.id_user !== deleteConfirmUser.id_user));
      setSuccessMsg(res.message || 'Akun pengguna berhasil dihapus dari sistem.');
      setDeleteConfirmUser(null);
    } catch (err) {
      console.error('Gagal menghapus pengguna:', err);
      const msg = err.response?.data?.message || 'Gagal menghapus pengguna dari database.';
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = u.nama_lengkap?.toLowerCase().includes(query);
        const matchEmail = u.email?.toLowerCase().includes(query);
        const matchPhone = u.no_telepon?.toLowerCase().includes(query);
        return matchName || matchEmail || matchPhone;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Counts for role badges
  const superadminCount = users.filter((u) => u.role === 'superadmin').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

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
            onClick={fetchUsers}
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
          <div className="flex items-center gap-2.5">
            <h1 className="font-playfair text-3xl font-bold text-gray-900">
              Manajemen Pengguna
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-purple-700" />
              <span>Superadmin Only</span>
            </span>
          </div>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Kelola hak akses akun pemilik toko (Superadmin) dan staf operasional/kasir (Admin Toko)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            title="Refresh Data"
            className="p-2.5 bg-white border border-borderMuted/40 text-gray-700 hover:text-primary hover:border-primary rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengguna</span>
          </button>
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
            placeholder="Cari berdasarkan nama, email, atau telepon..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-borderMuted/40 focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F3EF] rounded-xl text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              roleFilter === 'all'
                ? 'bg-white text-gray-900 font-bold shadow-xs'
                : 'text-textMuted hover:text-gray-900'
            }`}
          >
            Semua ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('superadmin')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              roleFilter === 'superadmin'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-textMuted hover:text-purple-700'
            }`}
          >
            Superadmin ({superadminCount})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              roleFilter === 'admin'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-textMuted hover:text-blue-700'
            }`}
          >
            Admin Toko ({adminCount})
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-3xl border border-borderMuted/30 shadow-soft overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-primary">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-textMuted">Memuat data pengguna dari database...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-textMuted mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">Tidak ada pengguna ditemukan</h3>
            <p className="text-textMuted text-xs max-w-sm mx-auto">
              {searchQuery
                ? `Tidak ada pengguna yang cocok dengan kata kunci "${searchQuery}".`
                : 'Belum ada pengguna terdaftar untuk filter ini.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-primary font-semibold hover:underline"
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
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Kontak (Email / Telp)</th>
                  <th className="px-6 py-4">Peran (Role)</th>
                  <th className="px-6 py-4">Status Akun</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isCurrent = isSelf(u);
                  const isSuper = u.role === 'superadmin';
                  const isRowActionLoading = actionLoadingId === u.id_user;

                  return (
                    <tr
                      key={u.id_user}
                      className={`transition-colors ${
                        isCurrent ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSuper
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.nama_lengkap ? u.nama_lengkap.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{u.nama_lengkap}</span>
                              {isCurrent && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                  <UserCheck className="w-3 h-3 text-amber-700" />
                                  <span>Akun Anda</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-textMuted block">
                              ID Pengguna: #{u.id_user}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-gray-800">
                            <Mail className="w-3.5 h-3.5 text-textMuted shrink-0" />
                            <span>{u.email}</span>
                          </div>
                          {u.no_telepon ? (
                            <div className="flex items-center gap-1.5 text-textMuted text-[11px]">
                              <Phone className="w-3 h-3 text-textMuted shrink-0" />
                              <span>{u.no_telepon}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-textMuted italic">Tanpa nomor telepon</span>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isSuper
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isSuper ? 'Superadmin' : 'Admin Toko'}</span>
                        </span>
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          {isCurrent ? (
                            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px] font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Aktif (Sedang Digunakan)</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              disabled={isRowActionLoading}
                              title={
                                u.status_aktif
                                  ? 'Klik untuk menonaktifkan akun staf ini'
                                  : 'Klik untuk mengaktifkan kembali akun staf ini'
                              }
                              className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
                                u.status_aktif
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                              } ${isRowActionLoading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  u.status_aktif ? 'bg-emerald-500' : 'bg-gray-400'
                                }`}
                              />
                              <span>
                                {isRowActionLoading
                                  ? 'Memproses...'
                                  : u.status_aktif
                                  ? 'Aktif'
                                  : 'Nonaktif'}
                              </span>
                              <Power className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ubah Data Pengguna"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete button (Protected) */}
                          {isCurrent ? (
                            <span
                              title="Anda tidak dapat menghapus akun Anda sendiri"
                              className="p-1.5 text-gray-300 cursor-not-allowed"
                            >
                              <Lock className="w-4 h-4" />
                            </span>
                          ) : isSuper ? (
                            <span
                              title="Akun Superadmin dilindungi dan tidak dapat dihapus"
                              className="p-1.5 text-gray-300 cursor-not-allowed"
                            >
                              <Lock className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmUser(u)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* MODAL: Tambah / Ubah Pengguna */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-6 shadow-elevated animate-scaleIn max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-playfair font-bold text-lg text-gray-900">
                  {editingUser ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
                </h3>
                <p className="text-[11px] text-textMuted mt-0.5">
                  {editingUser
                    ? `Perbarui informasi akun untuk ${editingUser.nama_lengkap}`
                    : 'Daftarkan akun staf kasir atau Superadmin baru'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
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
              {/* Nama Lengkap */}
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
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    formErrors.nama_lengkap
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-borderMuted/60 focus:border-primary'
                  }`}
                />
                {formErrors.nama_lengkap && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {formErrors.nama_lengkap[0]}
                  </span>
                )}
              </div>

              {/* Email */}
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
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    formErrors.email
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-borderMuted/60 focus:border-primary'
                  }`}
                />
                {formErrors.email && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {formErrors.email[0]}
                  </span>
                )}
              </div>

              {/* No. Telepon */}
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
                {formErrors.no_telepon && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {formErrors.no_telepon[0]}
                  </span>
                )}
              </div>

              {/* Peran / Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Peran Pengguna (Role) *
                </label>
                {editingUser && isSelf(editingUser) ? (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Superadmin (Owner)</span>
                    </div>
                    <p className="text-[10px] text-purple-700">
                      Anda tidak dapat menurunkan hak akses akun Anda sendiri untuk menjaga kepemilikan sistem.
                    </p>
                  </div>
                ) : (
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="admin">Admin Toko / Kasir Operasional</option>
                    <option value="superadmin">Superadmin / Pemilik Toko (Full Access)</option>
                  </select>
                )}
                {formErrors.role && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {formErrors.role[0]}
                  </span>
                )}
              </div>

              {/* Status Aktif (Hanya pada mode edit untuk staf lain) */}
              {editingUser && !isSelf(editingUser) && (
                <div className="p-3 bg-[#FBF9F6] rounded-xl border border-borderMuted/30 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-gray-800">Status Akun Aktif</span>
                    <span className="text-[10px] text-textMuted">
                      Akun nonaktif tidak akan dapat login ke backoffice
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.status_aktif}
                      onChange={(e) => setFormData({ ...formData, status_aktif: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {editingUser
                    ? 'Kata Sandi Baru (Kosongkan jika tidak ingin mengubah)'
                    : 'Kata Sandi *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '•••••••• (Tetap sama jika kosong)' : 'Minimal 6 karakter'}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    formErrors.password
                      ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                      : 'border-borderMuted/60 focus:border-primary'
                  }`}
                />
                {formErrors.password && (
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {formErrors.password[0]}
                  </span>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUser ? 'Perbarui Pengguna' : 'Simpan Pengguna'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Akun Kustom */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-elevated animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-playfair font-bold text-lg text-gray-900">
                Hapus Akun Pengguna?
              </h3>
              <p className="text-xs text-textMuted leading-relaxed">
                Apakah Anda yakin ingin menghapus akun{' '}
                <strong className="text-gray-900">{deleteConfirmUser.nama_lengkap}</strong> (
                {deleteConfirmUser.email})? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
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
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
