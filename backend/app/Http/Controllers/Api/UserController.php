<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id_user', 'nama_lengkap', 'email', 'no_telepon', 'role', 'status_aktif', 'created_at')
            ->orderBy('id_user', 'desc')
            ->get();

        return response()->json(['data' => $users]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:60',
            'email' => 'required|email|max:60|unique:users',
            'password' => 'required|string|min:6',
            'no_telepon' => 'nullable|string|max:16',
            'role' => 'required|in:superadmin,admin',
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
            'message' => 'Pengguna baru berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    public function update(Request $request, int|string $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:60',
            'email' => 'required|email|max:60|unique:users,email,' . $id . ',id_user',
            'no_telepon' => 'nullable|string|max:16',
            'role' => 'required|in:superadmin,admin',
            'password' => 'nullable|string|min:6',
        ]);

        $updateData = [
            'nama_lengkap' => $validated['nama_lengkap'],
            'email' => $validated['email'],
            'no_telepon' => $validated['no_telepon'] ?? $user->no_telepon,
            'role' => $validated['role'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password_hash'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return response()->json([
            'message' => 'Pengguna berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function destroy(int|string $id)
    {
        $user = User::findOrFail($id);

        if ($user->role === 'superadmin') {
            return response()->json(['message' => 'Akun Superadmin tidak dapat dihapus.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Pengguna berhasil dihapus']);
    }
}
