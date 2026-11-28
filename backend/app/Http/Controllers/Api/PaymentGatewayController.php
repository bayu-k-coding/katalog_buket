<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentGatewayController extends Controller
{
    /**
     * Dapatkan detail transaksi invoice untuk halaman Payment Gateway
     * Dilengkapi auto-sync status dengan server Midtrans secara real-time
     */
    public function show(int|string $orderId)
    {
        $order = Order::with(['items.product', 'paymentMethod', 'pelanggan'])->findOrFail($orderId);

        // Jika pesanan belum lunas dan memiliki gateway_order_id, periksa langsung status ke Midtrans
        if ($order->status_pembayaran !== 'lunas' && $order->gateway_order_id) {
            $this->checkMidtransStatusDirectly($order);
        }

        // Ambil data metode pembayaran lengkap, QRIS toko resmi, dan Rekening Bank
        $method = null;
        if ($order->id_metode) {
            $method = PaymentMethod::find($order->id_metode);
        }

        $allMethods = PaymentMethod::where('status_aktif', true)->get();
        $qrisMethod = $allMethods->first(function ($m) {
            return !empty($m->qr_image);
        }) ?? PaymentMethod::find(3);

        $bankMethods = $allMethods->filter(function ($m) {
            $name = strtolower($m->nama_metode);
            return (str_contains($name, 'bri') || str_contains($name, 'bca') || str_contains($name, 'bank')) && !empty($m->nomor_rekening) && $m->nomor_rekening !== '-';
        })->values();

        return response()->json([
            'data' => [
                'order' => $order->fresh(['items.product', 'paymentMethod', 'pelanggan']),
                'payment_method' => $method,
                'qris_method' => $qrisMethod,
                'bank_methods' => $bankMethods,
                'midtrans' => [
                    'client_key' => config('midtrans.client_key', 'Mid-client-pDgZI-OMnkti_hva'),
                    'snap_js' => config('midtrans.snap_js', 'https://app.sandbox.midtrans.com/snap/snap.js'),
                    'is_production' => config('midtrans.is_production', false),
                ]
            ]
        ]);
    }

    /**
     * Pengecekan status langsung ke server Midtrans secara real-time
     */
    private function checkMidtransStatusDirectly(Order $order): void
    {
        try {
            $serverKey = config('midtrans.server_key');
            $authHeader = base64_encode($serverKey . ':');
            $baseUrl = config('midtrans.is_production')
                ? 'https://api.midtrans.com/v2'
                : 'https://api.sandbox.midtrans.com/v2';

            $targetOrderId = $order->gateway_order_id ?: $order->kode_pesanan;

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $authHeader,
                'Accept' => 'application/json',
            ])->timeout(3)->get("{$baseUrl}/{$targetOrderId}/status");

            if ($response->successful()) {
                $status = $response->json('transaction_status');
                $fraud = $response->json('fraud_status');
                $paymentType = $response->json('payment_type', 'Midtrans');

                if ($status === 'settlement' || ($status === 'capture' && $fraud === 'accept')) {
                    $order->update([
                        'status_pembayaran' => 'lunas',
                        'dibayar_pada' => now(),
                        'status_pesanan' => $order->status_pesanan === 'baru' ? 'diproses' : $order->status_pesanan,
                        'catatan_verifikasi' => "Pembayaran otomatis via Midtrans ({$paymentType})"
                    ]);
                }
            }
        } catch (\Throwable $e) {
            // silent fail
        }
    }

    /**
     * Generate Snap Token dari Midtrans API
     */
    public function createMidtransToken(Request $request, int|string $orderId)
    {
        $order = Order::with(['items.product', 'pelanggan', 'user'])->findOrFail($orderId);

        if ($order->status_pembayaran === 'lunas') {
            return response()->json([
                'message' => 'Pesanan ini sudah lunas sebelumnya.',
                'is_lunas' => true,
            ]);
        }

        $serverKey = config('midtrans.server_key', 'SB-Mid-server-18lCGy2EhiHSpt8jJ9Bl4B9C');
        $snapUrl = config('midtrans.snap_url', 'https://app.sandbox.midtrans.com/snap/v1/transactions');

        // Midtrans mewajibkan order_id unik. Buat referensi unik yang merujuk ke pesanan ini
        $midtransOrderId = $order->kode_pesanan . '-' . time();
        $order->update(['gateway_order_id' => $midtransOrderId]);

        $itemDetails = [];
        $calculatedGross = 0;

        foreach ($order->items as $item) {
            $price = (int) $item->harga_satuan;
            $qty = (int) $item->jumlah;
            $itemDetails[] = [
                'id' => 'PRD-' . $item->id_produk,
                'price' => $price,
                'quantity' => $qty,
                'name' => Str::limit($item->product?->nama_produk ?? 'Buket Bunga', 45, '...'),
            ];
            $calculatedGross += ($price * $qty);
        }

        if ($order->biaya_ongkir > 0) {
            $itemDetails[] = [
                'id' => 'ONGKIR',
                'price' => (int) $order->biaya_ongkir,
                'quantity' => 1,
                'name' => 'Biaya Pengiriman',
            ];
            $calculatedGross += (int) $order->biaya_ongkir;
        }

        // Pastikan total gross_amount persis sama dengan jumlah item_details
        $grossAmount = $calculatedGross > 0 ? $calculatedGross : (int) $order->total_harga;

        $customerEmail = $order->pelanggan?->email ?? $order->user?->email ?? 'pelanggan@intanbuket.com';
        $customerName = $order->nama_penerima ?: ($order->pelanggan?->nama_pelanggan ?? 'Pelanggan Intan Buket');
        $customerPhone = $order->telp_penerima ?: ($order->pelanggan?->no_telepon ?? '08123456789');

        $payload = [
            'transaction_details' => [
                'order_id' => $midtransOrderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $customerName,
                'email' => $customerEmail,
                'phone' => $customerPhone,
                'shipping_address' => [
                    'first_name' => $customerName,
                    'phone' => $customerPhone,
                    'address' => $order->alamat_pengiriman ?: 'Madiun',
                ],
            ],
            'item_details' => $itemDetails,
            'enabled_payments' => [
                'qris',
                'gopay',
                'shopeepay',
                'bri_va',
                'bca_va',
            ],
            'callbacks' => [
                'finish' => env('FRONTEND_URL', 'http://localhost:3000') . "/pesanan-saya?success=1&order_id={$order->id_pesanan}",
            ],
        ];

        try {
            $authHeader = base64_encode($serverKey . ':');
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . $authHeader,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post($snapUrl, $payload);

            if ($response->successful()) {
                $token = $response->json('token');
                $redirectUrl = $response->json('redirect_url');

                return response()->json([
                    'token' => $token,
                    'redirect_url' => $redirectUrl,
                    'order_id' => $midtransOrderId,
                    'client_key' => config('midtrans.client_key'),
                ]);
            }

            Log::error('Midtrans Snap Error: ' . $response->body());
            return response()->json([
                'message' => 'Gagal membuat sesi pembayaran Midtrans: ' . $response->json('error_messages.0', $response->body()),
            ], 422);

        } catch (\Throwable $e) {
            Log::error('Midtrans Exception: ' . $e->getMessage());
            return response()->json([
                'message' => 'Kendala koneksi ke server Midtrans: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Webhook HTTP Notification Callback dari Midtrans
     */
    public function midtransWebhook(Request $request)
    {
        $payload = $request->all();
        Log::info('Midtrans Webhook Received: ', $payload);

        $orderId = $payload['order_id'] ?? null;
        $statusCode = $payload['status_code'] ?? null;
        $grossAmount = $payload['gross_amount'] ?? null;
        $signatureKey = $payload['signature_key'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus = $payload['fraud_status'] ?? null;
        $paymentType = $payload['payment_type'] ?? 'Midtrans';

        if (!$orderId || !$statusCode || !$grossAmount || !$signatureKey) {
            return response()->json(['message' => 'Data notifikasi tidak lengkap.'], 400);
        }

        // Verifikasi keaslian Signature Key Midtrans
        $serverKey = config('midtrans.server_key');
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $expectedSignature) {
            Log::warning('Midtrans Webhook Signature Mismatch: ' . $orderId);
            return response()->json(['message' => 'Signature key tidak valid.'], 403);
        }

        // Temukan pesanan berdasarkan gateway_order_id atau kode_pesanan
        $order = Order::where('gateway_order_id', $orderId)
            ->orWhere('kode_pesanan', $orderId)
            ->first();

        if (!$order) {
            // Coba cari dengan menghapus suffix timestamp jika ada (ORD-xxx-timestamp)
            $parts = explode('-', $orderId);
            if (count($parts) >= 3) {
                $baseCode = $parts[0] . '-' . $parts[1] . '-' . $parts[2];
                $order = Order::where('kode_pesanan', $baseCode)->first();
            }
        }

        if (!$order) {
            Log::warning('Midtrans Webhook Order Not Found: ' . $orderId);
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        // Tangani status transaksi Midtrans
        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'accept') {
                $order->update([
                    'status_pembayaran' => 'lunas',
                    'dibayar_pada' => now(),
                    'status_pesanan' => $order->status_pesanan === 'baru' ? 'diproses' : $order->status_pesanan,
                    'catatan_verifikasi' => "Pembayaran otomatis via Midtrans Snap ({$paymentType})"
                ]);
            }
        } elseif ($transactionStatus === 'settlement') {
            $order->update([
                'status_pembayaran' => 'lunas',
                'dibayar_pada' => now(),
                'status_pesanan' => $order->status_pesanan === 'baru' ? 'diproses' : $order->status_pesanan,
                'catatan_verifikasi' => "Pembayaran lunas terverifikasi via Midtrans Snap ({$paymentType})"
            ]);
        } elseif ($transactionStatus === 'pending') {
            $order->update([
                'status_pembayaran' => 'menunggu_verifikasi',
                'catatan_verifikasi' => "Menunggu penyelesaian transfer via Midtrans ({$paymentType})"
            ]);
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
            $order->update([
                'status_pembayaran' => 'belum_bayar',
                'catatan_verifikasi' => "Transaksi Midtrans ({$transactionStatus})"
            ]);
        }

        return response()->json(['status' => 'success', 'message' => 'Notifikasi Midtrans berhasil diproses.']);
    }

    /**
     * Eksekusi konfirmasi lunas (dipanggil saat callback sukses dari Snap)
     */
    public function pay(Request $request, int|string $orderId)
    {
        $order = Order::findOrFail($orderId);

        if ($order->status_pembayaran === 'lunas') {
            return response()->json([
                'message' => 'Pesanan ini sudah lunas sebelumnya.',
                'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
            ]);
        }

        // Pada mode Production, jangan percaya konfirmasi langsung dari client — wajib verifikasi ke server Midtrans
        if (config('midtrans.is_production')) {
            if ($order->gateway_order_id || $order->kode_pesanan) {
                $this->checkMidtransStatusDirectly($order);
                $order->refresh();
            }

            if ($order->status_pembayaran === 'lunas') {
                return response()->json([
                    'message' => 'Pembayaran telah terverifikasi resmi oleh Midtrans.',
                    'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
                ]);
            }

            return response()->json([
                'message' => 'Pembayaran belum terverifikasi lunas oleh server Midtrans.'
            ], 422);
        }

        $channel = $request->input('channel', 'Pembayaran Otomatis');

        $order->update([
            'status_pembayaran' => 'lunas',
            'dibayar_pada' => now(),
            'status_pesanan' => $order->status_pesanan === 'baru' ? 'diproses' : $order->status_pesanan,
            'catatan_verifikasi' => "Pembayaran otomatis ({$channel})"
        ]);

        return response()->json([
            'message' => "Pembayaran berhasil diverifikasi secara otomatis!",
            'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
        ]);
    }
}
