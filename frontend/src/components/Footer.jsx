import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useShopProfile } from '../context/ShopProfileContext';
import { categoryService } from '../services/api';

const Footer = () => {
  const { shopProfile: profile } = useShopProfile();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService.getAll().then((res) => {
      if (Array.isArray(res?.data)) {
        setCategories(res.data.slice(0, 5));
      }
    });
  }, []);

  const rawPhone = profile.no_kontak || profile.whatsapp || '081234567890';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  return (
    <footer id="tentang" className="bg-[#1B1C1A] text-white pt-16 pb-8 border-t border-[#30312F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {profile.logo ? (
                <div className="w-10 h-10 rounded-xl bg-white overflow-hidden flex items-center justify-center p-0.5 border border-white/20">
                  <img
                    src={profile.logo}
                    alt={profile.nama_toko || 'Logo'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-light border border-primary/30">
                  <span className="font-playfair font-bold text-xl">IB</span>
                </div>
              )}
              <div>
                <h3 className="font-playfair font-bold text-2xl tracking-tight text-white">
                  {profile.nama_toko || 'Intan Buket'}
                </h3>
                <span className="text-[10px] tracking-widest uppercase text-gray-400 font-medium">
                  Artisanal Florist
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {profile.deskripsi || 'Butik buket bunga, buket uang, dan kado kerajinan tangan berkualitas tinggi di Madiun. Setiap rangkaian buket dibuat dengan ketelitian seni tinggi.'}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center text-white transition-colors"
                title="WhatsApp Toko"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${profile.email_toko || 'info@intanbuket.com'}`}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-white transition-colors"
                title="Email Toko"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Kategori Cepat */}
          <div>
            <h4 className="font-playfair font-semibold text-lg text-white mb-5 pb-1 border-b border-white/10">
              Koleksi Buket
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id_kategori}>
                    <Link
                      to={`/katalog?kategori=${cat.id_kategori}`}
                      className="hover:text-primary-light transition-colors"
                    >
                      {cat.nama_kategori}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <Link to="/katalog" className="hover:text-primary-light transition-colors">
                    Semua Koleksi Buket
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Layanan & Info */}
          <div>
            <h4 className="font-playfair font-semibold text-lg text-white mb-5 pb-1 border-b border-white/10">
              Informasi & Bantuan
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link to="/pesanan-saya" className="hover:text-primary-light transition-colors">
                  Cek Status Pesanan
                </Link>
              </li>
              <li>
                <Link to="/katalog" className="hover:text-primary-light transition-colors">
                  Cara Memesan Buket
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-primary-light transition-colors">
                  Masuk ke Akun
                </Link>
              </li>
              <li>
                <span className="text-gray-400">Pengiriman Cepat Area Madiun</span>
              </li>
              <li>
                <span className="text-gray-400">Gratis Kartu Ucapan Custom</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Jam Buka */}
          <div>
            <h4 className="font-playfair font-semibold text-lg text-white mb-5 pb-1 border-b border-white/10">
              Hubungi Kami
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-light shrink-0 mt-1" />
                <span>{profile.alamat || 'Jl. Raya Pendidikan No. 45, Madiun'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-light shrink-0" />
                <span>{profile.no_kontak || '0812-3456-7890'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-light shrink-0" />
                <span>{profile.email_toko || 'info@intanbuket.com'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-light shrink-0" />
                <span>{profile.jam_buka || '08.00 - 21.00 WIB'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
