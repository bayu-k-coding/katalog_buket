<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::withCount('products')->get();
        return response()->json(['data' => $categories]);
    }

    public function show($id)
    {
        $category = Category::with('products')->findOrFail($id);
        return response()->json(['data' => $category]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:80|unique:categories',
            'deskripsi' => 'nullable|string|max:255',
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.max' => 'Nama kategori maksimal 80 karakter.',
            'nama_kategori.unique' => 'Nama kategori ini sudah terdaftar. Silakan gunakan nama kategori lain.',
            'deskripsi.max' => 'Deskripsi kategori maksimal 255 karakter.',
        ]);

        $category = Category::create($validated);
        $category->loadCount('products');

        return response()->json([
            'message' => 'Kategori buket berhasil ditambahkan',
            'data' => $category
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'nama_kategori' => 'required|string|max:80|unique:categories,nama_kategori,' . $id . ',id_kategori',
            'deskripsi' => 'nullable|string|max:255',
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.max' => 'Nama kategori maksimal 80 karakter.',
            'nama_kategori.unique' => 'Nama kategori ini sudah terdaftar. Silakan gunakan nama kategori lain.',
            'deskripsi.max' => 'Deskripsi kategori maksimal 255 karakter.',
        ]);

        $category->update($validated);
        $category->loadCount('products');

        return response()->json([
            'message' => 'Kategori buket berhasil diperbarui',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        DB::transaction(function () use ($category) {
            // Dapatkan semua ID produk di dalam kategori ini
            $productIds = $category->products()->pluck('id_produk');

            if ($productIds->isNotEmpty()) {
                // Hapus detail pesanan terkait produk-produk ini jika ada
                OrderItem::whereIn('id_produk', $productIds)->delete();

                // Hapus semua produk di dalam kategori ini
                Product::whereIn('id_produk', $productIds)->delete();
            }

            // Hapus kategori itu sendiri
            $category->delete();
        });

        return response()->json([
            'message' => 'Kategori buket beserta produk di dalamnya berhasil dihapus'
        ]);
    }
}
