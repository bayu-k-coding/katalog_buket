<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->increments('id_metode');
            $table->string('nama_metode', 60)->unique();
            $table->string('nomor_rekening', 40)->nullable();
            $table->string('atas_nama', 100)->nullable();
            $table->string('keterangan', 255)->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
