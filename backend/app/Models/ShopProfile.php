<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopProfile extends Model
{
    use HasFactory;

    protected $table = 'shop_profile';
    protected $primaryKey = 'id_toko';
    public $incrementing = false;

    const CREATED_AT = null;

    protected $fillable = [
        'id_toko',
        'nama_toko',
        'deskripsi',
        'alamat',
        'jam_buka',
        'no_kontak',
        'email_toko',
        'logo',
        'updated_by'
    ];

    protected $appends = [
        'slogan',
        'whatsapp'
    ];

    public function getSloganAttribute(): string
    {
        return 'Artisanal Botanical Elegance for Your Special Moments';
    }

    public function getWhatsappAttribute(): string
    {
        return $this->no_kontak ?? '081234567890';
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by', 'id_user');
    }
}
