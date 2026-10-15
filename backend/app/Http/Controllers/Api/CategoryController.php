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
            'nama_kategori' => 'required|string|max:80|unique:categories',
            'deskripsi' => 'nullable|string|max:255',
        ]);

        $category = Category::create($validated);

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
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Kategori buket berhasil diperbarui',
            'data' => $category
        ]);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Kategori tidak dapat dihapus karena masih memiliki produk buket aktif.'
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Kategori buket berhasil dihapus'
        ]);
    }
}
