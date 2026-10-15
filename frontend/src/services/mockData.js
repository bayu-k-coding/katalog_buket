export const mockCategories = [
  { id_kategori: 1, nama_kategori: 'Buket Wisuda', deskripsi: 'Buket bunga dan boneka wisuda spesial perayaan kelulusan' },
  { id_kategori: 2, nama_kategori: 'Buket Uang', deskripsi: 'Buket elegan berbahan uang asli yang dirangkai estetik' },
  { id_kategori: 3, nama_kategori: 'Buket Snack', deskripsi: 'Buket kombinasi jajanan dan snack favorit penuh keceriaan' },
  { id_kategori: 4, nama_kategori: 'Buket Custom', deskripsi: 'Buket kustomisasi sesuai tema, warna, dan budget Anda' },
  { id_kategori: 5, nama_kategori: 'Buket Bunga Kering', deskripsi: 'Bunga abadi kering (dried flowers) tahan bertahun-tahun' }
];

export const mockProducts = [
  {
    id_produk: 1,
    id_kategori: 1,
    nama_kategori: 'Buket Wisuda',
    nama_produk: 'Buket Wisuda Mawar Merah & Boneka Teddy',
    deskripsi: 'Buket wisuda premium dengan kombinasi 5 tangkai bunga mawar artificial satin merah, boneka wisuda berkerudung/toga resmi, serta wrapping premium bernuansa maroon rose gold.',
    harga: 150000,
    stok: 12,
    foto: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    status_tersedia: true,
    is_featured: true,
    rating: 4.9,
    sold_count: 142
  },
  {
    id_produk: 2,
    id_kategori: 2,
    nama_kategori: 'Buket Uang',
    nama_produk: 'Buket Uang Tower 10 Lembar Floral Gold',
    deskripsi: 'Buket uang kertas bertingkat elegan dengan slot 10 lembar uang, dihiasi baby breath abadi dan pita satin premium. Harga tertera adalah jasa rangkai buket belum termasuk nominal uang.',
    harga: 200000,
    stok: 8,
    foto: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
    status_tersedia: true,
    is_featured: true,
    rating: 4.8,
    sold_count: 98
  },
  {
    id_produk: 3,
    id_kategori: 4,
    nama_kategori: 'Buket Custom',
    nama_produk: 'Buket Custom Pastel Blush Ribbon Special',
    deskripsi: 'Buket kustomisasi warna pastel lembut (soft pink & peach), bebas request kartu ucapan kaligrafi, dan pilihan wrapping kertas matte anti air.',
    harga: 175000,
    stok: 5,
    foto: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
    status_tersedia: true,
    is_featured: true,
    rating: 5.0,
    sold_count: 76
  },
  {
    id_produk: 4,
    id_kategori: 1,
    nama_kategori: 'Buket Wisuda',
    nama_produk: 'Buket Wisuda Sun Flower Radiance',
    deskripsi: 'Buket bunga matahari cerah perlambang masa depan gemilang, dipadukan boneka beruang mini toga dan pita satin emas.',
    harga: 160000,
    stok: 9,
    foto: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
    status_tersedia: true,
    is_featured: true,
    rating: 4.7,
    sold_count: 65
  },
  {
    id_produk: 5,
    id_kategori: 2,
    nama_kategori: 'Buket Uang',
    nama_produk: 'Buket Uang 20 Lembar Royal Emerald',
    deskripsi: 'Rangkaian megah 20 slot lembar uang melingkar seperti bunga mekar dengan hiasan dedaunan eucalyptus dan wrapping nuansa hijau sage.',
    harga: 250000,
    stok: 6,
    foto: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
    status_tersedia: true,
    is_featured: false,
    rating: 4.9,
    sold_count: 53
  },
  {
    id_produk: 6,
    id_kategori: 3,
    nama_kategori: 'Buket Snack',
    nama_produk: 'Buket Snack Ceria Pocky & Ferrero',
    deskripsi: 'Kombinasi manis cokelat Ferrero Rocher dan biskuit Pocky dalam balutan kertas wrapping aesthetic, cocok untuk hadiah ulang tahun dan sahabat.',
    harga: 135000,
    stok: 15,
    foto: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    status_tersedia: true,
    is_featured: false,
    rating: 4.8,
    sold_count: 110
  },
  {
    id_produk: 7,
    id_kategori: 5,
    nama_kategori: 'Buket Bunga Kering',
    nama_produk: 'Buket Rustic Dried Flowers & Cotton',
    deskripsi: 'Bunga kering alami pampas grass, lavender kering, bunny tail, dan bunga kapas asli. Tahan selamanya tanpa perlu disiram air.',
    harga: 185000,
    stok: 7,
    foto: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=800&q=80',
    status_tersedia: true,
    is_featured: false,
    rating: 4.9,
    sold_count: 44
  },
  {
    id_produk: 8,
    id_kategori: 4,
    nama_kategori: 'Buket Custom',
    nama_produk: 'Buket Monokrom Korean Style Black Rose',
    deskripsi: 'Buket mawar gelap misterius nan mewah bergaya estetik Korea dengan wrapping hitam doff dan pita perak eksklusif.',
    harga: 190000,
    stok: 0,
    foto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    status_tersedia: false,
    is_featured: false,
    rating: 4.6,
    sold_count: 31
  }
];

export const mockShopProfile = {
  id_toko: 1,
  nama_toko: 'Intan Buket',
  slogan: 'Artisanal Botanical Elegance for Your Special Moments',
  deskripsi: 'Intan Buket adalah butik buket bunga, buket uang, dan kado kerajinan tangan berkualitas tinggi. Setiap buket dirangkai dengan ketelitian seni tinggi untuk mengabadikan momen berharga wisuda, ulang tahun, dan pernikahan Anda.',
  alamat: 'Jl. Raya Pendidikan No. 45, Madiun, Jawa Timur 63126',
  jam_buka: 'Senin - Minggu: 08.00 – 21.00 WIB',
  no_kontak: '0812-3456-7890',
  whatsapp: '681234567890',
  email_toko: 'info@intanbuket.com',
  instagram: '@intanbuket_official',
  logo: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=200&q=80'
};

export const mockPaymentMethods = [
  { id_metode: 1, nama_metode: 'QRIS Instan (GoPay, OVO, Dana, ShopeePay)', nomor_rekening: 'Otomatis Verifikasi 24/7', atas_nama: 'Payment Gateway', icon: 'qr' },
  { id_metode: 2, nama_metode: 'Virtual Account BRI (BRIVA)', nomor_rekening: 'Kode Bayar Otomatis', atas_nama: 'Payment Gateway', icon: 'bank' },
  { id_metode: 3, nama_metode: 'Virtual Account BCA', nomor_rekening: 'Kode Bayar Otomatis', atas_nama: 'Payment Gateway', icon: 'bank' },
  { id_metode: 4, nama_metode: 'COD (Bayar Tunai saat Terima / Pick-up)', nomor_rekening: 'Bayar di Tempat', atas_nama: 'Intan Buket', icon: 'cash' }
];

export const mockOrders = [
  {
    id_pesanan: 1,
    kode_pesanan: 'ORD-20261001-01',
    id_user: 3,
    pelanggan: 'Ayu Kartika',
    tanggal_pesanan: '2026-10-01 10:30',
    nama_penerima: 'Ayu Kartika',
    telp_penerima: '081234567892',
    alamat_pengiriman: 'Jl. Melati No. 12, Oro-oro Ombo, Madiun',
    catatan: 'Tolong tulis kartu ucapan: Happy Graduation Ayu, S.Kom!',
    metode_pembayaran: 'Transfer Bank BRI',
    total_harga: 350000,
    status_pembayaran: 'menunggu_verifikasi',
    status_pesanan: 'baru',
    bukti_pembayaran: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    items: [
      { id_produk: 1, nama_produk: 'Buket Wisuda Mawar Merah & Boneka Teddy', jumlah: 1, harga_satuan: 150000, subtotal: 150000 },
      { id_produk: 2, nama_produk: 'Buket Uang Tower 10 Lembar Floral Gold', jumlah: 1, harga_satuan: 200000, subtotal: 200000 }
    ]
  },
  {
    id_pesanan: 2,
    kode_pesanan: 'ORD-20260928-02',
    id_user: 3,
    pelanggan: 'Rizki Pratama',
    tanggal_pesanan: '2026-09-28 14:15',
    nama_penerima: 'Rizki Pratama',
    telp_penerima: '085712345678',
    alamat_pengiriman: 'Jl. Merdeka No. 88, Kartoharjo, Madiun',
    catatan: 'Pita ganti warna biru jika ada.',
    metode_pembayaran: 'QRIS',
    total_harga: 160000,
    status_pembayaran: 'lunas',
    status_pesanan: 'diproses',
    bukti_pembayaran: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    items: [
      { id_produk: 4, nama_produk: 'Buket Wisuda Sun Flower Radiance', jumlah: 1, harga_satuan: 160000, subtotal: 160000 }
    ]
  },
  {
    id_pesanan: 3,
    kode_pesanan: 'ORD-20260920-03',
    id_user: 3,
    pelanggan: 'Sinta Dewi',
    tanggal_pesanan: '2026-09-20 09:00',
    nama_penerima: 'Sinta Dewi',
    telp_penerima: '081398765432',
    alamat_pengiriman: 'Perumahan Asri Blok C-4, Taman, Madiun',
    catatan: 'Antar sebelum jam 12 siang ya min.',
    metode_pembayaran: 'Transfer Bank BCA',
    total_harga: 200000,
    status_pembayaran: 'lunas',
    status_pesanan: 'dikirim',
    bukti_pembayaran: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    items: [
      { id_produk: 2, nama_produk: 'Buket Uang Tower 10 Lembar Floral Gold', jumlah: 1, harga_satuan: 200000, subtotal: 200000 }
    ]
  },
  {
    id_pesanan: 4,
    kode_pesanan: 'ORD-20260910-04',
    id_user: 3,
    pelanggan: 'Ayu Kartika',
    tanggal_pesanan: '2026-09-10 16:45',
    nama_penerima: 'Ayu Kartika',
    telp_penerima: '081234567892',
    alamat_pengiriman: 'Jl. Melati No. 12, Oro-oro Ombo, Madiun',
    catatan: 'Terima kasih banyak!',
    metode_pembayaran: 'COD',
    total_harga: 175000,
    status_pembayaran: 'lunas',
    status_pesanan: 'selesai',
    bukti_pembayaran: null,
    items: [
      { id_produk: 3, nama_produk: 'Buket Custom Pastel Blush Ribbon Special', jumlah: 1, harga_satuan: 175000, subtotal: 175000 }
    ]
  }
];

export const mockUsers = [
  { id_user: 1, nama_lengkap: 'Intan Permata (Owner)', email: 'owner@intanbuket.com', role: 'superadmin', no_telepon: '081234567890', kota: 'Madiun', status_aktif: 1 },
  { id_user: 2, nama_lengkap: 'Siti Rahma (Staf Kasir)', email: 'admin1@intanbuket.com', role: 'admin', no_telepon: '081234567891', kota: 'Madiun', status_aktif: 1 },
  { id_user: 3, nama_lengkap: 'Budi Santoso (Admin Toko)', email: 'admin2@intanbuket.com', role: 'admin', no_telepon: '081234567893', kota: 'Madiun', status_aktif: 1 },
  { id_user: 4, nama_lengkap: 'Ayu Kartika (Pelanggan)', email: 'pelanggan@mail.com', role: 'pelanggan', no_telepon: '081234567892', alamat: 'Jl. Melati No. 12, Oro-oro Ombo', kota: 'Madiun', kode_pos: '63126', status_aktif: 1 }
];
