<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Filter by category
        if ($request->filled('kategori')) {
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
            $query->where('status_tersedia', true)->where('stok', '>', 0);
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
                'stok' => (int) $p->stok,
                'foto' => $p->foto,
                'status_tersedia' => (bool) $p->status_tersedia,
                'rating' => 4.9,
                'sold_count' => 85,
            ];
        });

        return response()->json(['data' => $products]);
    }

    public function show(int|string $id)
    {
        $p = Product::with('category')->findOrFail($id);

        return response()->json([
            'data' => [
                'id_produk' => $p->id_produk,
                'id_kategori' => $p->id_kategori,
                'nama_kategori' => $p->category?->nama_kategori ?? 'Umum',
                'nama_produk' => $p->nama_produk,
                'deskripsi' => $p->deskripsi,
                'harga' => (float) $p->harga,
                'stok' => (int) $p->stok,
                'foto' => $p->foto,
                'status_tersedia' => (bool) $p->status_tersedia,
                'rating' => 4.9,
                'sold_count' => 85,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_kategori' => 'required|exists:categories,id_kategori',
            'nama_produk' => 'required|string|max:40',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'stok' => 'required|integer|min:0',
            'foto' => 'nullable',
            'status_tersedia' => 'boolean',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Produk buket berhasil dibuat',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, int|string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'id_kategori' => 'required|exists:categories,id_kategori',
            'nama_produk' => 'required|string|max:40',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'stok' => 'required|integer|min:0',
            'foto' => 'nullable',
            'status_tersedia' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Produk buket berhasil diperbarui',
            'data' => $product
        ]);
    }

    public function destroy(int|string $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Produk buket berhasil dihapus'
        ]);
    }
}
