<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentGatewayController extends Controller
{
    /**
     * Dapatkan detail transaksi invoice untuk halaman Payment Gateway
     */
    public function show(int|string $orderId)
    {
        $order = Order::with(['items.product', 'paymentMethod', 'pelanggan'])->findOrFail($orderId);

        // Ambil data metode pembayaran lengkap
        $method = null;
        if ($order->id_metode) {
            $method = PaymentMethod::find($order->id_metode);
        }

        return response()->json([
            'data' => [
                'order' => $order,
                'payment_method' => $method,
            ]
        ]);
    }

    /**
     * Simulasi / Eksekusi penyelesaian pembayaran via Payment Gateway
     * (Otomatis memverifikasi pembayaran Lunas secara real-time)
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

        $channel = $request->input('channel', 'QRIS Instan');

        $order->update([
            'status_pembayaran' => 'lunas',
            'dibayar_pada' => now(),
            'status_pesanan' => $order->status_pesanan === 'baru' ? 'diproses' : $order->status_pesanan,
            'catatan_verifikasi' => "Pembayaran otomatis via Payment Gateway ({$channel})"
        ]);

        return response()->json([
            'message' => "Pembayaran berhasil diverifikasi secara otomatis via {$channel}!",
            'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
        ]);
    }
}

