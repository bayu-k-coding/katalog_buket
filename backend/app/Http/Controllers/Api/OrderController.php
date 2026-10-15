<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['pelanggan', 'items.product'])
            ->orderBy('id_pesanan', 'desc')
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function customerOrders(Request $request)
    {
        $pelangganId = $request->user()->id_pelanggan;

        $orders = Order::with(['items.product'])
            ->where('id_pelanggan', $pelangganId)
            ->orderBy('id_pesanan', 'desc')
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function show(int|string $id)
    {
        $order = Order::with(['pelanggan', 'items.product'])->findOrFail($id);
        return response()->json(['data' => $order]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'motode_pembayaran' => 'nullable|in:transfer,bayar ditempat',
            'metode_pembayaran' => 'nullable|string',
            'id_metode' => 'nullable',
            'nama_penerima' => 'required|string|max:60',
            'telp_penerima' => 'required|string|max:16',
            'alamat_pengiriman' => 'required|string',
            'catatan' => 'nullable|string|max:100',
            'biaya_ongkir' => 'nullable|integer',
            'items' => 'required|array|min:1',
            'items.*.id_produk' => 'required|exists:products,id_produk',
            'items.*.jumlah' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $pelangganId = $request->user()?->id_pelanggan ?? 1;

            $metode = 'transfer';
            if (!empty($validated['motode_pembayaran'])) {
                $metode = $validated['motode_pembayaran'];
            } elseif (!empty($validated['metode_pembayaran'])) {
                $lower = strtolower($validated['metode_pembayaran']);
                if (str_contains($lower, 'cod') || str_contains($lower, 'tempat')) {
                    $metode = 'bayar ditempat';
                }
            } elseif (!empty($validated['id_metode']) && (int) $validated['id_metode'] === 2) {
                $metode = 'bayar ditempat';
            }

            $subtotalSemua = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['id_produk']);

                if ($product->stok < $itemData['jumlah']) {
                    throw new \Exception("Stok {$product->nama_produk} tidak mencukupi (tersisa {$product->stok}).");
                }

                $subtotal = $product->harga * $itemData['jumlah'];
                $subtotalSemua += $subtotal;

                $itemsToCreate[] = [
                    'id_produk' => $product->id_produk,
                    'jumlah' => $itemData['jumlah'],
                    'harga_satuan' => $product->harga,
                    'subtotal' => $subtotal,
                ];
            }

            $ongkir = $validated['biaya_ongkir'] ?? 0;
            $totalHarga = $subtotalSemua + $ongkir;
            $gatewayId = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

            $order = Order::create([
                'id_pelanggan' => $pelangganId,
                'motode_pembayaran' => $metode,
                'tanggal_pesanan' => now(),
                'nama_penerima' => $validated['nama_penerima'],
                'telp_penerima' => $validated['telp_penerima'],
                'alamat_pengiriman' => $validated['alamat_pengiriman'],
                'catatan' => $validated['catatan'] ?? null,
                'biaya_ongkir' => $ongkir,
                'total_harga' => $totalHarga,
                'status_pembayaran' => 'belum_bayar',
                'status_pesanan' => 'baru',
                'gateway_order_id' => $gatewayId,
            ]);

            foreach ($itemsToCreate as $item) {
                $item['id_pesanan'] = $order->id_pesanan;
                OrderItem::create($item);
            }

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'data' => $order->load('items.product')
            ], 201);
        });
    }

    public function updateStatus(Request $request, int|string $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status_pesanan' => 'required|in:baru,diproses,dikirim,selesai,dibatalkan'
        ]);

        $order->update(['status_pesanan' => $validated['status_pesanan']]);

        return response()->json([
            'message' => 'Status pesanan berhasil diperbarui',
            'data' => $order
        ]);
    }

    public function verifyPayment(Request $request, int|string $id)
    {
        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status_pembayaran' => 'required|in:belum_bayar,menunggu_verifikasi,lunas,ditolak,kedaluwarsa'
        ]);

        $updateData = [
            'status_pembayaran' => $validated['status_pembayaran'],
        ];

        if ($validated['status_pembayaran'] === 'lunas') {
            $updateData['dibayar_pada'] = now();
            if ($order->status_pembayaran !== 'lunas') {
                foreach ($order->items as $item) {
                    Product::where('id_produk', $item->id_produk)
                        ->decrement('stok', $item->jumlah);
                }
                $updateData['status_pesanan'] = 'diproses';
            }
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Status pembayaran berhasil diperbarui',
            'data' => $order
        ]);
    }

    public function uploadProof(int|string $id)
    {
        $order = Order::findOrFail($id);

        $order->update([
            'dibayar_pada' => now(),
            'status_pembayaran' => 'menunggu_verifikasi'
        ]);

        return response()->json([
            'message' => 'Konfirmasi pembayaran berhasil dikirim',
            'data' => $order
        ]);
    }
}
