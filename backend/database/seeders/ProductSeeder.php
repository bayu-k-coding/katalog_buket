<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'id_produk' => 1,
                'id_kategori' => 1,
                'nama_produk' => 'Buket Wisuda Mawar Merah & Boneka Teddy',
                'deskripsi' => 'Buket wisuda premium dengan kombinasi 5 tangkai bunga mawar artificial satin merah, boneka wisuda berkerudung/toga resmi, serta wrapping premium bernuansa maroon rose gold.',
                'harga' => 150000,
                'foto' => 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 2,
                'id_kategori' => 2,
                'nama_produk' => 'Buket Uang Tower 10 Lembar Floral Gold',
                'deskripsi' => 'Buket uang kertas bertingkat elegan dengan slot 10 lembar uang, dihiasi baby breath abadi dan pita satin premium. Harga tertera adalah jasa rangkai buket belum termasuk nominal uang.',
                'harga' => 200000,
                'foto' => 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 3,
                'id_kategori' => 4,
                'nama_produk' => 'Buket Custom Pastel Blush Ribbon Special',
                'deskripsi' => 'Buket kustomisasi warna pastel lembut (soft pink & peach), bebas request kartu ucapan kaligrafi, dan pilihan wrapping kertas matte anti air.',
                'harga' => 175000,
                'foto' => 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 4,
                'id_kategori' => 1,
                'nama_produk' => 'Buket Wisuda Sun Flower Radiance',
                'deskripsi' => 'Buket bunga matahari cerah perlambang masa depan gemilang, dipadukan boneka beruang mini toga dan pita satin emas.',
                'harga' => 160000,
                'foto' => 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 5,
                'id_kategori' => 2,
                'nama_produk' => 'Buket Uang 20 Lembar Royal Emerald',
                'deskripsi' => 'Rangkaian megah 20 slot lembar uang melingkar seperti bunga mekar dengan hiasan dedaunan eucalyptus dan wrapping nuansa hijau sage.',
                'harga' => 250000,
                'foto' => 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 6,
                'id_kategori' => 3,
                'nama_produk' => 'Buket Snack Ceria Pocky & Ferrero',
                'deskripsi' => 'Kombinasi manis cokelat Ferrero Rocher dan biskuit Pocky dalam balutan kertas wrapping aesthetic, cocok untuk hadiah ulang tahun dan sahabat.',
                'harga' => 135000,
                'foto' => 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 7,
                'id_kategori' => 5,
                'nama_produk' => 'Buket Rustic Dried Flowers & Cotton',
                'deskripsi' => 'Bunga kering alami pampas grass, lavender kering, bunny tail, dan bunga kapas asli. Tahan selamanya tanpa perlu disiram air.',
                'harga' => 185000,
                'foto' => 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 8,
                'id_kategori' => 4,
                'nama_produk' => 'Buket Monokrom Korean Style Black Rose',
                'deskripsi' => 'Buket mawar gelap misterius nan mewah bergaya estetik Korea dengan wrapping hitam doff dan pita perak eksklusif.',
                'harga' => 190000,
                'foto' => 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80',
                'status_tersedia' => false,
            ]
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(['id_produk' => $prod['id_produk']], $prod);
        }
    }
}
