<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:60',
            'email' => 'required|string|email|max:60|unique:pelanggan,email',
            'password' => 'required|string|min:6|confirmed',
            'no_telepon' => 'nullable|string|max:16',
            'alamat' => 'nullable|string|max:60',
            'kota' => 'nullable|string|max:7',
            'kode_pos' => 'nullable|string|max:5',
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $pelanggan = Pelanggan::create([
            'nama_pelanggan' => $validated['nama_lengkap'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'no telepon' => $validated['no_telepon'] ?? null,
            'alamat' => $validated['alamat'] ?? null,
            'kota' => $validated['kota'] ?? null,
            'kode_pos' => $validated['kode_pos'] ?? null,
            'status_aktif' => true,
        ]);

        $token = $pelanggan->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi akun berhasil',
            'user' => $pelanggan,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // 1. Cek Admin / Superadmin di tabel `users`
        $admin = User::where('email', $request->email)->first();
        if ($admin && Hash::check($request->password, $admin->password_hash)) {
            if (! $admin->status_aktif) {
                return response()->json(['message' => 'Akun admin Anda telah dinonaktifkan.'], 403);
            }

            $token = $admin->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login admin berhasil',
                'user' => $admin,
                'token' => $token,
            ]);
        }

        // 2. Cek Pelanggan Storefront di tabel `pelanggan`
        $pelanggan = Pelanggan::where('email', $request->email)->first();
        if ($pelanggan && Hash::check($request->password, $pelanggan->password_hash)) {
            if (! $pelanggan->status_aktif) {
                return response()->json(['message' => 'Akun pelanggan Anda telah dinonaktifkan.'], 403);
            }

            $token = $pelanggan->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil',
                'user' => $pelanggan,
                'token' => $token,
            ]);
        }

        throw ValidationException::withMessages([
            'email' => ['Email atau password yang Anda masukkan salah.'],
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $authUser = $request->user();

        if ($authUser instanceof Pelanggan) {
            $validated = $request->validate([
                'nama_lengkap' => 'required|string|max:60',
                'no_telepon' => 'nullable|string|max:16',
                'alamat' => 'nullable|string|max:60',
                'kota' => 'nullable|string|max:7',
                'kode_pos' => 'nullable|string|max:5',
                'password_baru' => 'nullable|string|min:6',
            ]);

            $updateData = [
                'nama_pelanggan' => $validated['nama_lengkap'],
                'no telepon' => $validated['no_telepon'] ?? $authUser->no_telepon,
                'alamat' => $validated['alamat'] ?? $authUser->alamat,
                'kota' => $validated['kota'] ?? $authUser->kota,
                'kode_pos' => $validated['kode_pos'] ?? $authUser->kode_pos,
            ];

            if (!empty($validated['password_baru'])) {
                $updateData['password_hash'] = Hash::make($validated['password_baru']);
            }

            $authUser->update($updateData);

            return response()->json([
                'message' => 'Profil berhasil diperbarui',
                'user' => $authUser,
            ]);
        }

        // Jika model User (Admin / Superadmin)
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:60',
            'no_telepon' => 'nullable|string|max:16',
            'password_baru' => 'nullable|string|min:6',
        ]);

        $updateData = [
            'nama_lengkap' => $validated['nama_lengkap'],
            'no_telepon' => $validated['no_telepon'] ?? $authUser->no_telepon,
        ];

        if (!empty($validated['password_baru'])) {
            $updateData['password_hash'] = Hash::make($validated['password_baru']);
        }

        $authUser->update($updateData);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $authUser,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }
}
