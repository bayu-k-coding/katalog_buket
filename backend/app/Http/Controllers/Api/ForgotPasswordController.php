<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pelanggan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ForgotPasswordController extends Controller
{
    /**
     * Pastikan tabel password_reset_tokens siap digunakan
     */
    protected function ensureTableExists(): void
    {
        if (!Schema::hasTable('password_reset_tokens')) {
            DB::statement("
                CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
                    `email` VARCHAR(255) NOT NULL,
                    `token` VARCHAR(255) NOT NULL,
                    `created_at` TIMESTAMP NULL DEFAULT NULL,
                    PRIMARY KEY (`email`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }
    }

    /**
     * Kirim link reset kata sandi ke email pengguna
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
        ]);

        $this->ensureTableExists();

        $email = $request->email;
        $userExists = User::where('email', $email)->exists() || Pelanggan::where('email', $email)->exists();

        // Pesan sukses netral (OWASP Best Practice mencegah Enumeration Attack)
        if (! $userExists) {
            return response()->json([
                'message' => 'Jika email Anda terdaftar, tautan pemulihan kata sandi telah dikirimkan ke kotak masuk Anda.',
            ]);
        }

        // Generate token kriptografis acak
        $plainToken = Str::random(64);
        $hashedToken = hash('sha256', $plainToken);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $hashedToken,
                'created_at' => now(),
            ]
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $resetUrl = rtrim($frontendUrl, '/') . '/reset-password?token=' . $plainToken . '&email=' . urlencode($email);

        // Catat di log agar di lingkungan lokal/development dapat selalu ditelusuri
        Log::info("=== RESET PASSWORD LINK ===");
        Log::info("Email: {$email}");
        Log::info("URL: {$resetUrl}");

        $sent = false;
        $brevoApiKey = env('BREVO_API_KEY');

        // 1. Pengiriman Utama: Menggunakan Brevo REST API (Sangat cepat, aman, & stabil tanpa isu port SMTP)
        if ($brevoApiKey) {
            try {
                $senderEmail = env('MAIL_FROM_ADDRESS', 'krisdiantorobayu52@gmail.com');
                $senderName = env('MAIL_FROM_NAME', 'Intan Buket eKatalog');

                $response = Http::withHeaders([
                    'api-key' => $brevoApiKey,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])->post('https://api.brevo.com/v3/smtp/email', [
                    'sender' => [
                        'name' => $senderName,
                        'email' => $senderEmail,
                    ],
                    'to' => [
                        ['email' => $email]
                    ],
                    'subject' => 'Atur Ulang Kata Sandi - Intan Buket eKatalog',
                    'htmlContent' => "
                        <div style='font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #eee; border-radius: 16px; background-color: #faf8f5;'>
                            <div style='text-align: center; margin-bottom: 24px;'>
                                <div style='width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: #f7e6e6; color: #832729; font-weight: bold; font-size: 20px; margin: 0 auto 8px auto; text-align: center;'>IB</div>
                                <h2 style='color: #832729; margin: 0; font-size: 22px;'>Intan Buket eKatalog</h2>
                                <p style='color: #888; font-size: 12px; margin-top: 4px;'>Artisanal Florist & Buket Madiun</p>
                            </div>
                            <div style='background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);'>
                                <p style='color: #333; font-size: 15px; font-weight: bold; margin-top: 0;'>Halo,</p>
                                <p style='color: #555; font-size: 14px; line-height: 1.6;'>
                                    Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda di <strong>Intan Buket eKatalog</strong>.
                                </p>
                                <div style='text-align: center; margin: 28px 0;'>
                                    <a href='{$resetUrl}' style='background-color: #832729; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 14px; display: inline-block;'>
                                        Atur Kata Sandi Baru &rarr;
                                    </a>
                                </div>
                                <p style='color: #777; font-size: 12px; line-height: 1.5;'>
                                    Tautan di atas berlaku selama <strong>60 menit</strong>. Jika tombol di atas tidak dapat diklik, salin dan buka tautan berikut di peramban (browser) Anda:<br>
                                    <a href='{$resetUrl}' style='color: #832729; word-break: break-all;'>{$resetUrl}</a>
                                </p>
                                <hr style='border: none; border-top: 1px solid #eee; margin: 24px 0;' />
                                <p style='color: #999; font-size: 11px; margin-bottom: 0;'>
                                    Jika Anda tidak pernah meminta pengaturan ulang kata sandi ini, mohon abaikan email ini. Akun Anda tetap aman.
                                </p>
                            </div>
                        </div>
                    ",
                ]);

                if ($response->successful()) {
                    Log::info("Email reset password berhasil dikirim via Brevo API ke: {$email}");
                } else {
                    Log::warning("Brevo API error: " . $response->body());
                }
            } catch (\Throwable $e) {
                Log::warning("Pengiriman via Brevo API gagal: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Tautan pemulihan kata sandi berhasil dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam Anda.',
        ]);
    }

    /**
     * Proses ubah kata sandi dengan token valid
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'token.required' => 'Token reset kata sandi tidak ditemukan.',
            'email.required' => 'Alamat email wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $this->ensureTableExists();

        $email = $request->email;
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $record || ! hash_equals($record->token, hash('sha256', $request->token))) {
            throw ValidationException::withMessages([
                'token' => ['Tautan pengaturan ulang kata sandi tidak valid atau telah digunakan.'],
            ]);
        }

        // Cek kedaluwarsa (maksimal 60 menit)
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            throw ValidationException::withMessages([
                'token' => ['Tautan telah kedaluwarsa (lebih dari 60 menit). Silakan ajukan permintaan baru.'],
            ]);
        }

        $newPasswordHash = Hash::make($request->password);
        $updated = false;

        // 1. Cek Admin di tabel users
        $admin = User::where('email', $email)->first();
        if ($admin) {
            $admin->password_hash = $newPasswordHash;
            $admin->save();
            $updated = true;
        }

        // 2. Cek Pelanggan di tabel pelanggan
        $pelanggan = Pelanggan::where('email', $email)->first();
        if ($pelanggan) {
            $pelanggan->password_hash = $newPasswordHash;
            $pelanggan->save();
            $updated = true;
        }

        if (! $updated) {
            throw ValidationException::withMessages([
                'email' => ['Akun pengguna dengan email tersebut tidak ditemukan.'],
            ]);
        }

        // Hapus token agar hanya bisa digunakan sekali
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'message' => 'Kata sandi Anda berhasil diperbarui. Silakan masuk menggunakan kata sandi baru Anda.',
        ]);
    }
}
