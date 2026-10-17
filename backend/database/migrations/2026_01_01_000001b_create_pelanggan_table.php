<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pelanggan', function (Blueprint $table) {
            $table->increments('id_pelanggan');
            $table->string('nama_pelanggan', 100);
            $table->string('no telepon', 20)->nullable();
            $table->string('email', 100)->unique();
            $table->string('password_hash');
            $table->text('alamat')->nullable();
            $table->string('kota', 60)->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->boolean('status_aktif')->default(true);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pelanggan');
    }
};
