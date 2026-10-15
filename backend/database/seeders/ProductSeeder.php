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
                'stok' => 12,
                'foto' => null,
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 2,
                'id_kategori' => 2,
                'nama_produk' => 'Buket Uang Tower 10 Lembar Floral Gold',
                'deskripsi' => 'Buket uang kertas bertingkat elegan dengan slot 10 lembar uang, dihiasi baby breath abadi dan pita satin premium. Harga tertera adalah jasa rangkai buket belum termasuk nominal uang.',
                'harga' => 200000,
                'stok' => 8,
                'foto' => null,
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 3,
                'id_kategori' => 4,
                'nama_produk' => 'Buket Custom Pastel Blush Ribbon Special',
                'deskripsi' => 'Buket kustomisasi warna pastel lembut (soft pink & peach), bebas request kartu ucapan kaligrafi, dan pilihan wrapping kertas matte anti air.',
                'harga' => 175000,
                'stok' => 5,
                'foto' => null,
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 4,
                'id_kategori' => 1,
                'nama_produk' => 'Buket Wisuda Sun Flower Radiance',
                'deskripsi' => 'Buket bunga matahari cerah perlambang masa depan gemilang, dipadukan boneka beruang mini toga dan pita satin emas.',
                'harga' => 160000,
                'stok' => 9,
                'foto' => null,
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 5,
                'id_kategori' => 2,
                'nama_produk' => 'Buket Uang 20 Lembar Royal Emerald',
                'deskripsi' => 'Rangkaian megah 20 slot lembar uang melingkar seperti bunga mekar dengan hiasan dedaunan eucalyptus dan wrapping nuansa hijau sage.',
                'harga' => 250000,
                'stok' => 6,
                'foto' => null,
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 6,
                'id_kategori' => 3,
                'nama_produk' => 'Buket Snack Ceria Pocky & Ferrero',
                'deskripsi' => 'Kombinasi manis cokelat Ferrero Rocher dan biskuit Pocky dalam balutan kertas wrapping aesthetic, cocok untuk hadiah ulang tahun dan sahabat.',
                'harga' => 135000,
                'stok' => 15,
                'foto' => null,
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 7,
                'id_kategori' => 5,
                'nama_produk' => 'Buket Rustic Dried Flowers & Cotton',
                'deskripsi' => 'Bunga kering alami pampas grass, lavender kering, bunny tail, dan bunga kapas asli. Tahan selamanya tanpa perlu disiram air.',
                'harga' => 185000,
                'stok' => 7,
                'foto' => null,
                'status_tersedia' => true,
            ],
            [
                'id_produk' => 8,
                'id_kategori' => 4,
                'nama_produk' => 'Buket Monokrom Korean Style Black Rose',
                'deskripsi' => 'Buket mawar gelap misterius nan mewah bergaya estetik Korea dengan wrapping hitam doff dan pita perak eksklusif.',
                'harga' => 190000,
                'stok' => 0,
                'foto' => null,
                'status_tersedia' => false,
            ]
        ];

        foreach ($products as $prod) {
            Product::updateOrCreate(['id_produk' => $prod['id_produk']], $prod);
        }
    }
}
