<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Pelanggan extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'pelanggan';
    protected $primaryKey = 'id_pelanggan';

    protected $fillable = [
        'nama_pelanggan',
        'no telepon',
        'email',
        'password_hash',
        'alamat',
        'kota',
        'kode_pos',
        'status_aktif'
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $appends = [
        'nama_lengkap',
        'no_telepon',
        'role'
    ];

    protected function casts(): array
    {
        return [
            'status_aktif' => 'boolean',
        ];
    }

    /**
     * Override method Laravel Auth untuk membaca kolom password_hash
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * Accessor agar frontend yang membaca nama_lengkap tetap bekerja
     */
    public function getNamaLengkapAttribute(): ?string
    {
        return $this->nama_pelanggan;
    }

    /**
     * Accessor dan Mutator untuk kolom 'no telepon' (dengan spasi di database)
     */
    public function getNoTeleponAttribute(): ?string
    {
        return $this->attributes['no telepon'] ?? null;
    }

    public function setNoTeleponAttribute($value): void
    {
        $this->attributes['no telepon'] = $value;
    }

    /**
     * Role accessor untuk kompatibilitas frontend
     */
    public function getRoleAttribute(): string
    {
        return 'pelanggan';
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'id_pelanggan', 'id_pelanggan');
    }
}
