<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'products';
    protected $primaryKey = 'id_produk';

    protected $fillable = [
        'id_kategori',
        'nama_produk',
        'deskripsi',
        'harga',
        'stok',
        'foto',
        'status_tersedia'
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'integer',
            'stok' => 'integer',
            'status_tersedia' => 'boolean'
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'id_kategori', 'id_kategori');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'id_produk', 'id_produk');
    }
}
