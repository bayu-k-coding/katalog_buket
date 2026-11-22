<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_metode';

    protected $fillable = [
        'nama_metode',
        'nomor_rekening',
        'payment_url',
        'atas_nama',
        'qr_image',
        'keterangan',
        'instruksi',
        'status_aktif'
    ];

    protected $casts = [
        'status_aktif' => 'boolean'
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'id_metode', 'id_metode');
    }
}
