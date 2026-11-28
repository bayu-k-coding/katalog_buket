<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

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
            'nama_kategori' => 'required|string|max:30|unique:categories',
            'deskripsi' => 'nullable|string|max:100',
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.max' => 'Nama kategori maksimal 30 karakter.',
            'nama_kategori.unique' => 'Nama kategori ini sudah terdaftar. Silakan gunakan nama kategori lain.',
            'deskripsi.max' => 'Deskripsi kategori maksimal 100 karakter.',
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
            'nama_kategori' => 'required|string|max:30|unique:categories,nama_kategori,' . $id . ',id_kategori',
            'deskripsi' => 'nullable|string|max:100',
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.max' => 'Nama kategori maksimal 30 karakter.',
            'nama_kategori.unique' => 'Nama kategori ini sudah terdaftar. Silakan gunakan nama kategori lain.',
            'deskripsi.max' => 'Deskripsi kategori maksimal 100 karakter.',
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
        $productCount = $category->products()->count();

        if ($productCount > 0) {
            return response()->json([
                'message' => "Kategori \"{$category->nama_kategori}\" tidak dapat dihapus karena masih berisi {$productCount} produk. Pindahkan atau hapus produk terlebih dahulu."
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori buket berhasil dihapus'
        ]);
    }
}
