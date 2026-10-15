<?php

namespace Database\Seeders;

use App\Models\ShopProfile;
use Illuminate\Database\Seeder;

class ShopProfileSeeder extends Seeder
{
    public function run(): void
    {
        ShopProfile::updateOrCreate(
            ['id_toko' => 1],
            [
                'id_toko' => 1,
                'nama_toko' => 'Intan Buket',
                'deskripsi' => 'Butik buket bunga, buket uang, dan kado kerajinan tangan berkualitas tinggi di Madiun.',
                'alamat' => 'Jl. Raya Pendidikan No. 45, Madiun',
                'jam_buka' => '08.00-21.00',
                'no_kontak' => '0812-3456-7890',
                'email_toko' => 'info@intanbuket.com',
                'logo' => null,
                'updated_by' => 1,
            ]
        );
    }
}
