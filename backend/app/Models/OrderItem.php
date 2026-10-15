<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';
    protected $primaryKey = 'id_detail';
    public $timestamps = false;

    protected $fillable = [
        'id_pesanan',
        'id_produk',
        'jumlah',
        'harga_satuan',
        'subtotal'
    ];

    protected function casts(): array
    {
        return [
            'jumlah' => 'integer',
            'harga_satuan' => 'integer',
            'subtotal' => 'integer'
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'id_pesanan', 'id_pesanan');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'id_produk', 'id_produk');
    }
}
