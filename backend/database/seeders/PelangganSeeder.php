<?php

namespace Database\Seeders;

use App\Models\Pelanggan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PelangganSeeder extends Seeder
{
    public function run(): void
    {
        Pelanggan::updateOrCreate(
            ['email' => 'pelanggan@mail.com'],
            [
                'id_pelanggan' => 1,
                'nama_pelanggan' => 'Ayu Kartika',
                'no telepon' => '081234567892',
                'email' => 'pelanggan@mail.com',
                'password_hash' => Hash::make('password123'),
                'alamat' => 'Jl. Melati No. 12, Oro-oro Ombo',
                'kota' => 'Madiun',
                'kode_pos' => '63126',
                'status_aktif' => true,
            ]
        );
    }
}
