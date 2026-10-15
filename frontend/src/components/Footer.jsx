import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Heart } from 'lucide-react';
import { mockShopProfile } from '../services/mockData';

const Footer = () => {
  return (
    <footer id="tentang" className="bg-[#1B1C1A] text-white pt-16 pb-8 border-t border-[#30312F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Col 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-light border border-primary/30">
                <span className="font-playfair font-bold text-xl">IB</span>
              </div>
              <div>
                <h3 className="font-playfair font-bold text-2xl tracking-tight text-white">
                  Intan Buket
                </h3>
                <span className="text-[10px] tracking-widest uppercase text-gray-400 font-medium">
                  Artisanal Florist
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              {mockShopProfile.slogan}. Setiap rangkaian buket dibuat dengan ketelitian seni tinggi untuk mengabadikan momen berharga Anda.
            </p>
            <div className="flex items-center gap-3">
              <a
                href={`https://instagram.com`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center text-white transition-colors"
                title="Instagram Intan Buket"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={`https://wa.me/${mockShopProfile.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary flex items-center justify-center text-white transition-colors"
                title="WhatsApp Intan Buket"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Kategori Cepat */}
          <div>
            <h4 className="font-playfair font-semibold text-lg text-white mb-5 pb-1 border-b border-white/10">
              Koleksi Buket
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link to="/katalog?kategori=1" className="hover:text-primary-light transition-colors">
                  Buket Wisuda & Boneka
                </Link>
              </li>
              <li>
                <Link to="/katalog?kategori=2" className="hover:text-primary-light transition-colors">
                  Buket Uang Elegan
                </Link>
              </li>
              <li>
                <Link to="/katalog?kategori=3" className="hover:text-primary-light transition-colors">
                  Buket Snack Ceria
                </Link>
              </li>
              <li>
                <Link to="/katalog?kategori=4" className="hover:text-primary-light transition-colors">
                  Custom Hand Bouquet
                </Link>
              </li>
              <li>
                <Link to="/katalog?kategori=5" className="hover:text-primary-light transition-colors">
                  Dried Flower (Bunga Kering)
                </Link>
              </li>
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
                <span>{mockShopProfile.alamat}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-light shrink-0" />
                <span>{mockShopProfile.no_kontak}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-light shrink-0" />
                <span>{mockShopProfile.email_toko}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary-light shrink-0" />
                <span>{mockShopProfile.jam_buka}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom divider */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Intan Buket. All rights reserved. Proyek TI Kelompok 2 - PNM.</p>
          <div className="flex items-center gap-2">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
            <span>menggunakan React & Laravel REST API</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
