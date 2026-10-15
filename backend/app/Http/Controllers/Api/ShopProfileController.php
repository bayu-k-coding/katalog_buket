<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShopProfile;
use Illuminate\Http\Request;

class ShopProfileController extends Controller
{
    public function show()
    {
        $profile = ShopProfile::firstOrCreate(
            ['id_toko' => 1],
            [
                'nama_toko' => 'Intan Buket',
                'slogan' => 'Artisanal Botanical Elegance for Your Special Moments',
                'deskripsi' => 'Intan Buket adalah butik buket bunga, buket uang, dan kado kerajinan tangan berkualitas tinggi di Madiun.',
                'alamat' => 'Jl. Raya Pendidikan No. 45, Madiun, Jawa Timur',
                'jam_buka' => '08.00 – 21.00 WIB',
                'no_kontak' => '0812-3456-7890',
                'whatsapp' => '681234567890',
                'email_toko' => 'info@intanbuket.com',
            ]
        );

        return response()->json(['data' => $profile]);
    }

    public function update(Request $request)
    {
        $profile = ShopProfile::firstOrCreate(['id_toko' => 1]);

        $validated = $request->validate([
            'nama_toko' => 'required|string|max:100',
            'slogan' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string',
            'alamat' => 'nullable|string',
            'jam_buka' => 'nullable|string|max:100',
            'no_kontak' => 'nullable|string|max:20',
            'whatsapp' => 'nullable|string|max:20',
            'email_toko' => 'nullable|string|email|max:100',
            'logo' => 'nullable|string|max:255',
        ]);

        $validated['updated_by'] = $request->user()?->id_user ?? null;

        $profile->update($validated);

        return response()->json([
            'message' => 'Profil toko berhasil diperbarui',
            'data' => $profile
        ]);
    }
}
