<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->increments('id_pesanan');
            $table->string('kode_pesanan', 30)->unique();
            $table->unsignedInteger('id_user');
            $table->unsignedInteger('id_metode');
            $table->dateTime('tanggal_pesanan')->useCurrent();
            $table->string('nama_penerima', 100);
            $table->string('telp_penerima', 20);
            $table->text('alamat_pengiriman');
            $table->string('catatan', 255)->nullable();
            $table->decimal('total_harga', 14, 2)->default(0);
            $table->enum('status_pembayaran', [
                'belum_bayar',
                'menunggu_verifikasi',
                'lunas',
                'ditolak',
                'kedaluwarsa'
            ])->default('belum_bayar');
            $table->string('bukti_pembayaran', 255)->nullable();
            $table->dateTime('dibayar_pada')->nullable();
            $table->dateTime('diverifikasi_pada')->nullable();
            $table->string('catatan_verifikasi', 255)->nullable();
            $table->enum('status_pesanan', [
                'baru',
                'diproses',
                'dikirim',
                'selesai',
                'dibatalkan'
            ])->default('baru');
            $table->timestamps();

            $table->foreign('id_user')->references('id_user')->on('users')->onUpdate('cascade')->onDelete('restrict');
            $table->foreign('id_metode')->references('id_metode')->on('payment_methods')->onUpdate('cascade')->onDelete('restrict');
            $table->index('status_pembayaran');
            $table->index('status_pesanan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
