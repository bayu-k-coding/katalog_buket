<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id_user');
            $table->string('nama_lengkap', 100);
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->string('no_telepon', 20)->nullable();
            $table->text('alamat')->nullable();
            $table->string('kota', 60)->nullable();
            $table->string('kode_pos', 10)->nullable();
            $table->enum('role', ['superadmin', 'admin', 'pelanggan'])->default('pelanggan');
            $table->boolean('status_aktif')->default(true);
            $table->rememberToken();
            $table->timestamps();

            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
