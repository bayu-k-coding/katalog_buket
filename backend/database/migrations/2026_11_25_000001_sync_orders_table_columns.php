<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'kode_pesanan')) {
                $table->string('kode_pesanan', 50)->nullable()->unique()->after('id_pesanan');
            }
            if (!Schema::hasColumn('orders', 'id_user')) {
                $table->unsignedInteger('id_user')->nullable()->after('id_pesanan');
            }
            if (!Schema::hasColumn('orders', 'id_metode')) {
                $table->unsignedInteger('id_metode')->nullable()->after('id_pelanggan');
            }
            if (!Schema::hasColumn('orders', 'bukti_pembayaran')) {
                $table->string('bukti_pembayaran', 255)->nullable()->after('status_pembayaran');
            }
            if (!Schema::hasColumn('orders', 'diverifikasi_pada')) {
                $table->dateTime('diverifikasi_pada')->nullable()->after('dibayar_pada');
            }
            if (!Schema::hasColumn('orders', 'catatan_verifikasi')) {
                $table->string('catatan_verifikasi', 255)->nullable()->after('diverifikasi_pada');
            }

            // Ubah dari enum lama ('transfer','bayar ditempat') agar bisa menyimpan nama metode pembayaran dinamis
            $table->string('motode_pembayaran', 60)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $cols = array_filter([
                'kode_pesanan',
                'id_user',
                'id_metode',
                'bukti_pembayaran',
                'diverifikasi_pada',
                'catatan_verifikasi',
            ], fn ($col) => Schema::hasColumn('orders', $col));

            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
