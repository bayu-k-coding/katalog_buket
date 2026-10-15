<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Superadmin (Owner Toko)
        User::updateOrCreate(
            ['email' => 'owner@intanbuket.com'],
            [
                'id_user' => 1,
                'nama_lengkap' => 'Intan Permata (Owner)',
                'email' => 'owner@intanbuket.com',
                'password_hash' => Hash::make('password123'),
                'no_telepon' => '081234567890',
                'role' => 'superadmin',
                'status_aktif' => true,
            ]
        );

        // 2. Admin 1 (Staf Kasir & Admin Toko)
        User::updateOrCreate(
            ['email' => 'admin1@intanbuket.com'],
            [
                'id_user' => 2,
                'nama_lengkap' => 'Siti Rahma (Admin Toko)',
                'email' => 'admin1@intanbuket.com',
                'password_hash' => Hash::make('password123'),
                'no_telepon' => '081234567891',
                'role' => 'admin',
                'status_aktif' => true,
            ]
        );
    }
}
