import React, { useState } from 'react';
import { Store, Phone, Mail, Clock, Instagram, MapPin, CheckCircle2 } from 'lucide-react';
import { mockShopProfile } from '../../services/mockData';

const AdminShopProfilePage = () => {
  const [formData, setFormData] = useState({ ...mockShopProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900">
            Pengaturan Profil Toko
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Informasi identitas butik, alamat, kontak WhatsApp, dan jam operasional Intan Buket
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">Profil toko berhasil diperbarui!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-borderMuted/30 shadow-soft space-y-6 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nama Toko *
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="nama_toko"
                required
                value={formData.nama_toko}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Slogan Toko
            </label>
            <input
              type="text"
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nomor WhatsApp Toko *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="no_kontak"
                required
                value={formData.no_kontak}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Email Toko
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email_toko"
                value={formData.email_toko}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Jam Operasional
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="jam_buka"
                value={formData.jam_buka}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Akun Instagram
            </label>
            <div className="relative">
              <Instagram className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Alamat Lengkap Toko Fisik
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Deskripsi Singkat Butik
            </label>
            <textarea
              rows={4}
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary"
            />
          </div>

        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-elevated transition-all"
          >
            Simpan Informasi Toko
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminShopProfilePage;
