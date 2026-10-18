<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Memastikan hanya Superadmin yang dapat mengakses resource ini
     */
    private function authorizeSuperadmin(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'superadmin') {
            abort(response()->json([
                'message' => 'Akses ditolak. Hanya Superadmin (Owner) yang memiliki wewenang mengelola data pengguna.'
            ], 403));
        }
    }

    public function index(Request $request)
    {
        $this->authorizeSuperadmin($request);

        $users = User::select(
            'id_user',
            'nama_lengkap',
            'email',
            'no_telepon',
            'role',
            'status_aktif',
            'created_at'
        )
            ->orderBy('id_user', 'asc')
            ->get();

        return response()->json(['data' => $users]);
    }

    public function store(Request $request)
    {
        $this->authorizeSuperadmin($request);

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email',
            'password' => 'required|string|min:6',
            'no_telepon' => 'nullable|string|max:20',
            'role' => 'required|in:superadmin,admin',
        ], [
            'nama_lengkap.required' => 'Nama lengkap pengguna wajib diisi.',
            'nama_lengkap.max' => 'Nama lengkap maksimal 100 karakter.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email ini sudah terdaftar sebagai pengguna lain.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'role.required' => 'Peran pengguna (role) wajib dipilih.',
            'role.in' => 'Peran pengguna harus Superadmin atau Admin Toko.',
        ]);

        $user = User::create([
            'nama_lengkap' => $validated['nama_lengkap'],
            'email' => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'no_telepon' => $validated['no_telepon'] ?? null,
            'role' => $validated['role'],
            'status_aktif' => true,
        ]);

        return response()->json([
            'message' => 'Pengguna baru berhasil ditambahkan.',
            'data' => $user
        ], 201);
    }

    public function show(Request $request, int|string $id)
    {
        $this->authorizeSuperadmin($request);

        $user = User::findOrFail($id);

        return response()->json(['data' => $user]);
    }

    public function update(Request $request, int|string $id)
    {
        $this->authorizeSuperadmin($request);

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email,' . $id . ',id_user',
            'no_telepon' => 'nullable|string|max:20',
            'role' => 'required|in:superadmin,admin',
            'password' => 'nullable|string|min:6',
            'status_aktif' => 'nullable|boolean',
        ], [
            'nama_lengkap.required' => 'Nama lengkap pengguna wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email ini sudah digunakan pengguna lain.',
            'password.min' => 'Kata sandi baru minimal 6 karakter.',
            'role.required' => 'Peran pengguna wajib dipilih.',
            'role.in' => 'Peran pengguna harus Superadmin atau Admin Toko.',
        ]);

        // Proteksi: Superadmin tidak boleh menurunkan peran akunnya sendiri
        if ((int) $request->user()->id_user === (int) $id && $validated['role'] !== 'superadmin') {
            return response()->json([
                'message' => 'Anda tidak dapat menurunkan hak akses (role) akun Anda sendiri.'
            ], 422);
        }

        // Proteksi: Superadmin tidak boleh menonaktifkan akunnya sendiri
        if ((int) $request->user()->id_user === (int) $id && isset($validated['status_aktif']) && !$validated['status_aktif']) {
            return response()->json([
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.'
            ], 422);
        }

        $updateData = [
            'nama_lengkap' => $validated['nama_lengkap'],
            'email' => $validated['email'],
            'no_telepon' => $validated['no_telepon'] ?? $user->no_telepon,
            'role' => $validated['role'],
        ];

        if (isset($validated['status_aktif'])) {
            $updateData['status_aktif'] = (bool) $validated['status_aktif'];
        }

        if (!empty($validated['password'])) {
            $updateData['password_hash'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'data' => $user->fresh()
        ]);
    }

    public function destroy(Request $request, int|string $id)
    {
        $this->authorizeSuperadmin($request);

        $user = User::findOrFail($id);

        // Proteksi: Tidak boleh menghapus diri sendiri
        if ((int) $request->user()->id_user === (int) $id) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.'
            ], 422);
        }

        // Proteksi: Tidak boleh menghapus akun Superadmin lain (keamanan sistem)
        if ($user->role === 'superadmin') {
            return response()->json([
                'message' => 'Akun Superadmin tidak dapat dihapus untuk menjaga keamanan dan kepemilikan sistem.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Akun pengguna berhasil dihapus dari sistem.'
        ]);
    }

    /**
     * Mengaktifkan atau menonaktifkan status akun pengguna
     */
    public function toggleStatus(Request $request, int|string $id)
    {
        $this->authorizeSuperadmin($request);

        $user = User::findOrFail($id);

        // Proteksi: Tidak boleh menonaktifkan diri sendiri
        if ((int) $request->user()->id_user === (int) $id) {
            return response()->json([
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.'
            ], 422);
        }

        $user->status_aktif = !$user->status_aktif;
        $user->save();

        $statusText = $user->status_aktif ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Akun {$user->nama_lengkap} berhasil {$statusText}.",
            'data' => $user
        ]);
    }
}
