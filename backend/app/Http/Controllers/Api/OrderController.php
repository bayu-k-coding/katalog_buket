<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentMethod;
use App\Models\Pelanggan;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['pelanggan', 'user', 'items.product', 'paymentMethod'])
            ->orderBy('id_pesanan', 'desc')
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function customerOrders(Request $request)
    {
        $user = auth('sanctum')->user() ?? $request->user();

        $query = Order::with(['pelanggan', 'user', 'items.product', 'paymentMethod'])
            ->orderBy('id_pesanan', 'desc');

        if ($user instanceof Pelanggan) {
            $query->where('id_pelanggan', $user->id_pelanggan);
        } elseif ($user instanceof User && !in_array($user->role, ['superadmin', 'admin'])) {
            $query->where('id_user', $user->id_user);
        }

        return response()->json(['data' => $query->get()]);
    }

    public function show(int|string $id)
    {
        $order = Order::with(['pelanggan', 'user', 'items.product', 'paymentMethod'])->findOrFail($id);
        return response()->json(['data' => $order]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_metode' => 'nullable|exists:payment_methods,id_metode',
            'metode_pembayaran' => 'nullable|string|max:60',
            'motode_pembayaran' => 'nullable|string|max:60',
            'nama_penerima' => 'required|string|max:60',
            'telp_penerima' => 'required|string|max:20',
            'alamat_pengiriman' => 'required|string',
            'catatan' => 'nullable|string|max:255',
            'biaya_ongkir' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.id_produk' => 'required|exists:products,id_produk',
            'items.*.jumlah' => 'required|integer|min:1',
        ], [
            'nama_penerima.required' => 'Nama penerima pesanan wajib diisi.',
            'telp_penerima.required' => 'Nomor telepon/WhatsApp penerima wajib diisi.',
            'alamat_pengiriman.required' => 'Alamat lengkap pengiriman wajib diisi.',
            'items.required' => 'Keranjang pesanan tidak boleh kosong.',
            'items.min' => 'Pilih minimal satu item produk buket.',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $user = auth('sanctum')->user() ?? $request->user();
            $pelangganId = null;
            $userId = null;

            if ($user instanceof Pelanggan) {
                $pelangganId = $user->id_pelanggan;
            } elseif ($user instanceof User) {
                $userId = $user->id_user;
            } else {
                $defaultPelanggan = Pelanggan::first();
                $pelangganId = $defaultPelanggan?->id_pelanggan ?? 1;
            }

            // Cari metode pembayaran dari database
            $paymentMethod = null;
            if (!empty($validated['id_metode'])) {
                $paymentMethod = PaymentMethod::find($validated['id_metode']);
            }

            $namaMetode = $validated['metode_pembayaran'] 
                ?? $validated['motode_pembayaran'] 
                ?? $paymentMethod?->nama_metode 
                ?? 'Bayar Online';

            $subtotalSemua = 0;
            $itemsToCreate = [];

            foreach ($validated['items'] as $itemData) {
                $product = Product::findOrFail($itemData['id_produk']);

                if (!$product->status_tersedia) {
                    throw new \Exception("Produk {$product->nama_produk} saat ini sedang tidak tersedia untuk dipesan.");
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
            $kodePesanan = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            $order = Order::create([
                'id_user' => $userId,
                'id_pelanggan' => $pelangganId,
                'id_metode' => $paymentMethod?->id_metode ?? $validated['id_metode'] ?? null,
                'kode_pesanan' => $kodePesanan,
                'gateway_order_id' => $kodePesanan,
                'motode_pembayaran' => $namaMetode,
                'tanggal_pesanan' => now(),
                'nama_penerima' => $validated['nama_penerima'],
                'telp_penerima' => $validated['telp_penerima'],
                'alamat_pengiriman' => $validated['alamat_pengiriman'],
                'catatan' => $validated['catatan'] ?? null,
                'biaya_ongkir' => $ongkir,
                'total_harga' => $totalHarga,
                'status_pembayaran' => 'belum_bayar',
                'status_pesanan' => 'baru',
            ]);

            foreach ($itemsToCreate as $item) {
                $item['id_pesanan'] = $order->id_pesanan;
                OrderItem::create($item);
            }

            return response()->json([
                'message' => 'Pesanan buket berhasil dibuat.',
                'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
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
            'message' => 'Status pengerjaan pesanan berhasil diperbarui.',
            'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
        ]);
    }

    public function cancelByCustomer(Request $request, int|string $id)
    {
        $order = Order::findOrFail($id);
        $user = auth('sanctum')->user() ?? $request->user();

        if ($user instanceof Pelanggan && (int) $order->id_pelanggan !== (int) $user->id_pelanggan) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk membatalkan pesanan ini.'
            ], 403);
        }

        if ($user instanceof User && !in_array($user->role, ['superadmin', 'admin']) && (int) $order->id_user !== (int) $user->id_user) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk membatalkan pesanan ini.'
            ], 403);
        }

        if ($order->status_pesanan === 'dibatalkan') {
            return response()->json([
                'message' => 'Pesanan ini sudah dibatalkan sebelumnya.'
            ], 422);
        }

        if ($order->status_pembayaran === 'lunas') {
            return response()->json([
                'message' => 'Pesanan yang sudah dibayar lunas tidak dapat dibatalkan langsung. Silakan hubungi admin.'
            ], 422);
        }

        if ($order->status_pesanan !== 'baru') {
            return response()->json([
                'message' => 'Pesanan yang sudah diproses tidak dapat dibatalkan. Silakan hubungi admin.'
            ], 422);
        }

        $order->update(['status_pesanan' => 'dibatalkan']);

        return response()->json([
            'message' => 'Pesanan berhasil dibatalkan.',
            'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
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
            if ($order->status_pesanan === 'baru') {
                $updateData['status_pesanan'] = 'diproses';
            }
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Status pembayaran berhasil diverifikasi.',
            'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
        ]);
    }

    public function uploadProof(Request $request, int|string $id)
    {
        $order = Order::findOrFail($id);

        $updateData = [
            'dibayar_pada' => now(),
            'status_pembayaran' => 'menunggu_verifikasi'
        ];

        if ($request->hasFile('bukti_pembayaran')) {
            $request->validate([
                'bukti_pembayaran' => 'file|image|mimes:jpeg,png,jpg,webp|max:5120'
            ], [
                'bukti_pembayaran.image' => 'File bukti transfer harus berupa gambar.',
                'bukti_pembayaran.mimes' => 'Format file gambar harus JPG, PNG, atau WEBP.',
                'bukti_pembayaran.max' => 'Ukuran maksimal file bukti transfer adalah 5 MB.',
            ]);

            $file = $request->file('bukti_pembayaran');
            $ext = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = 'proof_' . time() . '_' . Str::random(8) . '.' . strtolower($ext);
            $destination = public_path('uploads/proofs');

            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }

            $file->move($destination, $filename);
            $updateData['bukti_pembayaran'] = url('uploads/proofs/' . $filename);
        }

        $order->update($updateData);

        return response()->json([
            'message' => 'Konfirmasi & bukti pembayaran berhasil dikirim. Menunggu verifikasi admin.',
            'data' => $order->load(['items.product', 'paymentMethod', 'pelanggan'])
        ]);
    }
}
