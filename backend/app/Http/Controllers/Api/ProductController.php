<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category')
            ->withSum(['orderItems as sold_count' => function ($q) {
                $q->whereHas('order', function ($oq) {
                    $oq->where('status_pesanan', '!=', 'dibatalkan');
                });
            }], 'jumlah');

        // Filter by category
        if ($request->filled('kategori') && $request->kategori !== 'all') {
            $query->where('id_kategori', $request->kategori);
        }

        // Search query
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nama_produk', 'like', "%{$s}%")
                  ->orWhere('deskripsi', 'like', "%{$s}%");
            });
        }

        // Storefront availability filter
        if ($request->boolean('available_only', false)) {
            $query->where('status_tersedia', true);
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        if ($sort === 'price_asc') {
            $query->orderBy('harga', 'asc');
        } elseif ($sort === 'price_desc') {
            $query->orderBy('harga', 'desc');
        } else {
            $query->orderBy('id_produk', 'desc');
        }

        $products = $query->get()->map(function ($p) {
            return [
                'id_produk' => $p->id_produk,
                'id_kategori' => $p->id_kategori,
                'nama_kategori' => $p->category?->nama_kategori ?? 'Umum',
                'nama_produk' => $p->nama_produk,
                'deskripsi' => $p->deskripsi,
                'harga' => (float) $p->harga,
                'foto' => $p->foto,
                'status_tersedia' => (bool) $p->status_tersedia,
                'sold_count' => (int) ($p->sold_count ?? 0),
            ];
        });

        return response()->json(['data' => $products]);
    }

    public function show(int|string $id)
    {
        $p = Product::with('category')
            ->withSum(['orderItems as sold_count' => function ($q) {
                $q->whereHas('order', function ($oq) {
                    $oq->where('status_pesanan', '!=', 'dibatalkan');
                });
            }], 'jumlah')
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id_produk' => $p->id_produk,
                'id_kategori' => $p->id_kategori,
                'nama_kategori' => $p->category?->nama_kategori ?? 'Umum',
                'nama_produk' => $p->nama_produk,
                'deskripsi' => $p->deskripsi,
                'harga' => (float) $p->harga,
                'foto' => $p->foto,
                'status_tersedia' => (bool) $p->status_tersedia,
                'sold_count' => (int) ($p->sold_count ?? 0),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_kategori' => 'required|exists:categories,id_kategori',
            'nama_produk' => 'required|string|max:60',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'status_tersedia' => 'nullable',
        ], [
            'id_kategori.required' => 'Kategori buket wajib dipilih.',
            'id_kategori.exists' => 'Kategori buket yang dipilih tidak ditemukan dalam sistem.',
            'nama_produk.required' => 'Nama produk buket wajib diisi.',
            'nama_produk.max' => 'Nama produk buket maksimal 60 karakter.',
            'harga.required' => 'Harga produk buket wajib diisi.',
            'harga.numeric' => 'Harga produk harus berupa angka nominal yang valid.',
            'harga.min' => 'Harga produk tidak boleh bernilai kurang dari 0.',
        ]);

        // Proses unggah file foto produk
        if ($request->hasFile('foto')) {
            $request->validate([
                'foto' => 'file|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            ], [
                'foto.file' => 'Input foto harus berupa file dokumen.',
                'foto.image' => 'File yang diunggah harus berupa gambar.',
                'foto.mimes' => 'Format file gambar harus berupa JPG, JPEG, PNG, WEBP, atau GIF.',
                'foto.max' => 'Ukuran file gambar maksimal 5 MB.',
            ]);

            $file = $request->file('foto');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = time() . '_' . Str::random(12) . '.' . strtolower($extension);
            $destinationPath = public_path('uploads/products');

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);
            $validated['foto'] = url('uploads/products/' . $filename);
        } elseif ($request->filled('foto') && is_string($request->foto)) {
            $validated['foto'] = $request->foto;
        } else {
            $validated['foto'] = null;
        }

        // Status ketersediaan
        if (isset($validated['status_tersedia'])) {
            $val = $validated['status_tersedia'];
            $validated['status_tersedia'] = ($val === true || $val === 'true' || $val === '1' || $val === 1);
        } else {
            $validated['status_tersedia'] = true;
        }

        if ($request->user()) {
            $validated['created_by'] = $request->user()->id_user;
        }

        $product = Product::create($validated);
        $product->load('category');

        return response()->json([
            'message' => 'Produk buket baru berhasil ditambahkan ke katalog.',
            'data' => [
                'id_produk' => $product->id_produk,
                'id_kategori' => $product->id_kategori,
                'nama_kategori' => $product->category?->nama_kategori ?? 'Umum',
                'nama_produk' => $product->nama_produk,
                'deskripsi' => $product->deskripsi,
                'harga' => (float) $product->harga,
                'foto' => $product->foto,
                'status_tersedia' => (bool) $product->status_tersedia,
                'sold_count' => 0,
            ]
        ], 201);
    }

    public function update(Request $request, int|string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'id_kategori' => 'required|exists:categories,id_kategori',
            'nama_produk' => 'required|string|max:60',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'status_tersedia' => 'nullable',
        ], [
            'id_kategori.required' => 'Kategori buket wajib dipilih.',
            'id_kategori.exists' => 'Kategori buket yang dipilih tidak ditemukan dalam sistem.',
            'nama_produk.required' => 'Nama produk buket wajib diisi.',
            'nama_produk.max' => 'Nama produk buket maksimal 60 karakter.',
            'harga.required' => 'Harga produk buket wajib diisi.',
            'harga.numeric' => 'Harga produk harus berupa angka nominal yang valid.',
            'harga.min' => 'Harga produk tidak boleh bernilai kurang dari 0.',
        ]);

        // Proses unggah file foto baru atau hapus foto lama
        if ($request->hasFile('foto')) {
            $request->validate([
                'foto' => 'file|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
            ], [
                'foto.file' => 'Input foto harus berupa file dokumen.',
                'foto.image' => 'File yang diunggah harus berupa gambar.',
                'foto.mimes' => 'Format file gambar harus berupa JPG, JPEG, PNG, WEBP, atau GIF.',
                'foto.max' => 'Ukuran file gambar maksimal 5 MB.',
            ]);

            // Hapus file foto lama jika tersimpan di uploads/products/
            if ($product->foto && Str::contains($product->foto, 'uploads/products/')) {
                $oldFilename = basename(parse_url($product->foto, PHP_URL_PATH));
                $oldFilePath = public_path('uploads/products/' . $oldFilename);
                if (file_exists($oldFilePath)) {
                    @unlink($oldFilePath);
                }
            }

            $file = $request->file('foto');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $filename = time() . '_' . Str::random(12) . '.' . strtolower($extension);
            $destinationPath = public_path('uploads/products');

            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);
            $validated['foto'] = url('uploads/products/' . $filename);
        } elseif ($request->boolean('hapus_foto', false)) {
            // Permintaan penghapusan foto
            if ($product->foto && Str::contains($product->foto, 'uploads/products/')) {
                $oldFilename = basename(parse_url($product->foto, PHP_URL_PATH));
                $oldFilePath = public_path('uploads/products/' . $oldFilename);
                if (file_exists($oldFilePath)) {
                    @unlink($oldFilePath);
                }
            }
            $validated['foto'] = null;
        } elseif ($request->filled('foto') && is_string($request->foto)) {
            $validated['foto'] = $request->foto;
        } else {
            // Pertahankan foto yang sudah ada jika tidak ada file baru yang diunggah
            $validated['foto'] = $product->foto;
        }

        if (isset($validated['status_tersedia'])) {
            $val = $validated['status_tersedia'];
            $validated['status_tersedia'] = ($val === true || $val === 'true' || $val === '1' || $val === 1);
        }

        $product->update($validated);
        $product->load('category');

        return response()->json([
            'message' => 'Data produk buket berhasil diperbarui.',
            'data' => [
                'id_produk' => $product->id_produk,
                'id_kategori' => $product->id_kategori,
                'nama_kategori' => $product->category?->nama_kategori ?? 'Umum',
                'nama_produk' => $product->nama_produk,
                'deskripsi' => $product->deskripsi,
                'harga' => (float) $product->harga,
                'foto' => $product->foto,
                'status_tersedia' => (bool) $product->status_tersedia,
                'rating' => 4.9,
                'sold_count' => 85,
            ]
        ]);
    }

    public function destroy(int|string $id)
    {
        $product = Product::findOrFail($id);
        $productName = $product->nama_produk;

        // Bersihkan file foto dari storage lokal jika ada
        if ($product->foto && Str::contains($product->foto, 'uploads/products/')) {
            $oldFilename = basename(parse_url($product->foto, PHP_URL_PATH));
            $oldFilePath = public_path('uploads/products/' . $oldFilename);
            if (file_exists($oldFilePath)) {
                @unlink($oldFilePath);
            }
        }

        $product->delete();

        return response()->json([
            'message' => "Produk buket '{$productName}' berhasil dihapus dari katalog."
        ]);
    }
}
