<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShopProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ShopProfileController extends Controller
{
    public function show()
    {
        $profile = ShopProfile::firstOrCreate(
            ['id_toko' => 1],
            [
                'nama_toko' => 'Intan Buket',
                'deskripsi' => 'Intan Buket adalah butik buket bunga, buket uang, dan kado kerajinan tangan berkualitas tinggi di Madiun.',
                'alamat' => 'Jl. Raya Pendidikan No. 45, Madiun',
                'jam_buka' => '08.00 - 21.00 WIB',
                'no_kontak' => '0812-3456-7890',
                'email_toko' => 'info@intanbuket.com',
            ]
        );

        return response()->json(['data' => $profile]);
    }

    public function update(Request $request)
    {
        $profile = ShopProfile::firstOrCreate(['id_toko' => 1]);

        $validated = $request->validate([
            'nama_toko' => 'required|string|max:35',
            'deskripsi' => 'nullable|string',
            'alamat' => 'nullable|string|max:100',
            'jam_buka' => 'nullable|string|max:20',
            'no_kontak' => 'required|string|max:16',
            'email_toko' => 'nullable|string|email|max:100',
        ], [
            'nama_toko.required' => 'Nama butik/toko wajib diisi.',
            'nama_toko.max' => 'Nama butik/toko maksimal 35 karakter.',
            'no_kontak.required' => 'Nomor kontak/WhatsApp resmi wajib diisi.',
            'no_kontak.max' => 'Nomor kontak maksimal 16 digit.',
            'alamat.max' => 'Alamat toko maksimal 100 karakter.',
            'jam_buka.max' => 'Jam buka maksimal 20 karakter.',
            'email_toko.email' => 'Format alamat email toko tidak valid.',
        ]);

        // Upload Logo Toko
        if ($request->hasFile('logo')) {
            $request->validate([
                'logo' => 'file|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
            ], [
                'logo.image' => 'File logo harus berupa gambar.',
                'logo.mimes' => 'Format file logo harus berupa JPG, PNG, WEBP, atau SVG.',
                'logo.max' => 'Ukuran file logo maksimal 2 MB.',
            ]);

            // Hapus file logo lama jika ada
            if ($profile->logo && Str::contains($profile->logo, 'uploads/logo/')) {
                $oldFilename = basename(parse_url($profile->logo, PHP_URL_PATH));
                $oldFilePath = public_path('uploads/logo/' . $oldFilename);
                if (file_exists($oldFilePath)) {
                    @unlink($oldFilePath);
                }
            }

            $file = $request->file('logo');
            $extension = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'logo_' . time() . '_' . Str::random(8) . '.' . strtolower($extension);
            $destinationPath = public_path('uploads/logo');

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);
            $validated['logo'] = url('uploads/logo/' . $filename);
        } elseif ($request->boolean('hapus_logo', false)) {
            // Hapus logo jika ada permintaan
            if ($profile->logo && Str::contains($profile->logo, 'uploads/logo/')) {
                $oldFilename = basename(parse_url($profile->logo, PHP_URL_PATH));
                $oldFilePath = public_path('uploads/logo/' . $oldFilename);
                if (file_exists($oldFilePath)) {
                    @unlink($oldFilePath);
                }
            }
            $validated['logo'] = null;
        }

        $validated['updated_by'] = $request->user()?->id_user ?? 1;

        $profile->update($validated);

        return response()->json([
            'message' => 'Profil toko berhasil diperbarui.',
            'data' => $profile->fresh()
        ]);
    }
}
