<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class PaymentMethodController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => [
                [
                    'id_metode' => 1,
                    'kode' => 'transfer',
                    'nama_metode' => 'Transfer Bank (BCA / BRI / Mandiri)',
                    'nomor_rekening' => '0123-01-098765-50-8',
                    'atas_nama' => 'Intan Permata',
                    'keterangan' => 'Transfer manual ke rekening butik dan verifikasi',
                    'status_aktif' => true,
                ],
                [
                    'id_metode' => 2,
                    'kode' => 'bayar ditempat',
                    'nama_metode' => 'Bayar di Tempat (COD / Ambil di Toko)',
                    'nomor_rekening' => 'Tunai di Butik',
                    'atas_nama' => 'Intan Buket',
                    'keterangan' => 'Bayar tunai saat pesanan diambil atau kurir mengantarkan',
                    'status_aktif' => true,
                ]
            ]
        ]);
    }
}
