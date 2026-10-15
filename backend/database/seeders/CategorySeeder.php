<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'id_kategori' => 1,
                'nama_kategori' => 'Buket Wisuda',
                'deskripsi' => 'Buket bunga dan boneka wisuda spesial perayaan kelulusan'
            ],
            [
                'id_kategori' => 2,
                'nama_kategori' => 'Buket Uang',
                'deskripsi' => 'Buket elegan berbahan uang asli yang dirangkai estetik'
            ],
            [
                'id_kategori' => 3,
                'nama_kategori' => 'Buket Snack',
                'deskripsi' => 'Buket kombinasi jajanan dan snack favorit penuh keceriaan'
            ],
            [
                'id_kategori' => 4,
                'nama_kategori' => 'Buket Custom',
                'deskripsi' => 'Buket kustomisasi sesuai tema, warna, dan budget Anda'
            ],
            [
                'id_kategori' => 5,
                'nama_kategori' => 'Buket Bunga Kering',
                'deskripsi' => 'Bunga abadi kering (dried flowers) tahan bertahun-tahun'
            ]
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['id_kategori' => $cat['id_kategori']], $cat);
        }
    }
}
