<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Memastikan pengguna yang terotentikasi adalah Admin atau Superadmin aktif.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!($user instanceof User) || !in_array($user->role, ['admin', 'superadmin'], true)) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya Admin atau Superadmin yang memiliki wewenang.'
            ], 403);
        }

        if (!$user->status_aktif) {
            return response()->json([
                'message' => 'Akun admin Anda telah dinonaktifkan.'
            ], 403);
        }

        return $next($request);
    }
}
