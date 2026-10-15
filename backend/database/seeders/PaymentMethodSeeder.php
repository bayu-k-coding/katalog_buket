<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        $methods = [
            [
                'id_metode' => 1,
                'nama_metode' => 'Transfer Bank BRI',
                'nomor_rekening' => '0123-01-098765-50-8',
                'atas_nama' => 'Intan Permata',
                'keterangan' => 'Kirim bukti transfer ke WhatsApp/sistem',
                'status_aktif' => true,
            ],
            [
                'id_metode' => 2,
                'nama_metode' => 'Transfer Bank BCA',
                'nomor_rekening' => '821-098-7654',
                'atas_nama' => 'Intan Permata',
                'keterangan' => 'Kirim bukti transfer ke WhatsApp/sistem',
                'status_aktif' => true,
            ],
            [
                'id_metode' => 3,
                'nama_metode' => 'QRIS (Gopay / OVO / Dana / ShopeePay)',
                'nomor_rekening' => 'Scan QR Code Toko',
                'atas_nama' => 'Intan Buket Madiun',
                'keterangan' => 'Pindai barcode QRIS saat melakukan pembayaran',
                'status_aktif' => true,
            ],
            [
                'id_metode' => 4,
                'nama_metode' => 'COD (Bayar Tunai saat Ambil / Terima)',
                'nomor_rekening' => 'Tunai di Tempat',
                'atas_nama' => 'Intan Buket',
                'keterangan' => 'Bayar saat buket diambil di butik atau via kurir instan lokal',
                'status_aktif' => true,
            ],
        ];

        foreach ($methods as $m) {
            PaymentMethod::updateOrCreate(['id_metode' => $m['id_metode']], $m);
        }
    }
}
