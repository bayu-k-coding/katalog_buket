<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'id_pesanan';

    protected $fillable = [
        'id_pelanggan',
        'motode_pembayaran',
        'tanggal_pesanan',
        'nama_penerima',
        'telp_penerima',
        'alamat_pengiriman',
        'catatan',
        'biaya_ongkir',
        'total_harga',
        'status_pembayaran',
        'status_pesanan',
        'gateway_order_id',
        'kadaluarsa_pada',
        'dibayar_pada'
    ];

    protected $appends = [
        'metode_pembayaran'
    ];

    protected function casts(): array
    {
        return [
            'total_harga' => 'integer',
            'biaya_ongkir' => 'integer',
            'tanggal_pesanan' => 'datetime',
            'kadaluarsa_pada' => 'datetime',
            'dibayar_pada' => 'datetime',
        ];
    }

    /**
     * Alias accessor untuk kolom motode_pembayaran
     */
    public function getMetodePembayaranAttribute(): ?string
    {
        return $this->motode_pembayaran;
    }

    public function setMetodePembayaranAttribute(?string $value): void
    {
        $this->attributes['motode_pembayaran'] = $value;
    }

    public function pelanggan()
    {
        return $this->belongsTo(Pelanggan::class, 'id_pelanggan', 'id_pelanggan');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'id_pesanan', 'id_pesanan');
    }
}
