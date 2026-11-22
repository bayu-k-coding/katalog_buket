<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentMethodController extends Controller
{
    private function authorizeSuperAdmin(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();
        if (!$user || $user->role !== 'superadmin') {
            abort(response()->json([
                'message' => 'Akses ditolak. Hanya Superadmin (Owner) yang memiliki wewenang mengelola metode pembayaran & rekening.'
            ], 403));
        }
    }

    public function index()
    {
        $methods = PaymentMethod::where('status_aktif', true)
            ->orderBy('id_metode', 'asc')
            ->get();

        return response()->json([
            'data' => $methods
        ]);
    }

    public function adminIndex(Request $request)
    {
        $this->authorizeSuperAdmin($request);

        $methods = PaymentMethod::orderBy('id_metode', 'asc')->get();

        return response()->json([
            'data' => $methods
        ]);
    }

    public function show(int|string $id)
    {
        $method = PaymentMethod::findOrFail($id);
        return response()->json(['data' => $method]);
    }

    public function update(Request $request, int|string $id)
    {
        $this->authorizeSuperAdmin($request);

        $method = PaymentMethod::findOrFail($id);

        $validated = $request->validate([
            'nama_metode' => 'required|string|max:100',
            'nomor_rekening' => 'nullable|string|max:60',
            'payment_url' => 'nullable|string|max:500',
            'atas_nama' => 'nullable|string|max:100',
            'keterangan' => 'nullable|string|max:255',
            'instruksi' => 'nullable|string',
            'status_aktif' => 'nullable',
        ], [
            'nama_metode.required' => 'Nama metode pembayaran wajib diisi.',
        ]);

        // Upload file QRIS Image jika ada
        if ($request->hasFile('qr_image')) {
            $request->validate([
                'qr_image' => 'file|image|mimes:jpeg,png,jpg,webp,svg|max:3072'
            ], [
                'qr_image.image' => 'File QRIS harus berupa gambar.',
                'qr_image.mimes' => 'Format file QRIS harus JPG, PNG, WEBP, atau SVG.',
                'qr_image.max' => 'Ukuran maksimal file QRIS adalah 3 MB.',
            ]);

            // Hapus file lama jika ada
            if ($method->qr_image && Str::contains($method->qr_image, 'uploads/qris/')) {
                $oldFilename = basename(parse_url($method->qr_image, PHP_URL_PATH));
                $oldFilePath = public_path('uploads/qris/' . $oldFilename);
                if (file_exists($oldFilePath)) {
                    @unlink($oldFilePath);
                }
            }

            $file = $request->file('qr_image');
            $ext = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'qris_' . time() . '_' . Str::random(8) . '.' . strtolower($ext);
            $destination = public_path('uploads/qris');

            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }

            $file->move($destination, $filename);
            $validated['qr_image'] = url('uploads/qris/' . $filename);
        } elseif ($request->boolean('hapus_qr_image', false)) {
            if ($method->qr_image && Str::contains($method->qr_image, 'uploads/qris/')) {
                $oldFilename = basename(parse_url($method->qr_image, PHP_URL_PATH));
                $oldFilePath = public_path('uploads/qris/' . $oldFilename);
                if (file_exists($oldFilePath)) {
                    @unlink($oldFilePath);
                }
            }
            $validated['qr_image'] = null;
        }

        if (isset($validated['status_aktif'])) {
            $val = $validated['status_aktif'];
            $validated['status_aktif'] = ($val === true || $val === 'true' || $val === '1' || $val === 1);
        }

        $method->update($validated);

        return response()->json([
            'message' => "Metode pembayaran '{$method->nama_metode}' berhasil diperbarui.",
            'data' => $method->fresh()
        ]);
    }

    public function toggleStatus(Request $request, int|string $id)
    {
        $this->authorizeSuperAdmin($request);

        $method = PaymentMethod::findOrFail($id);
        $method->status_aktif = !$method->status_aktif;
        $method->save();

        $statusText = $method->status_aktif ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'message' => "Metode '{$method->nama_metode}' berhasil {$statusText}.",
            'data' => $method
        ]);
    }
}
