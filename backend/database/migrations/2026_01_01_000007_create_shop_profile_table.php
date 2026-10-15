<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_profile', function (Blueprint $table) {
            $table->unsignedTinyInteger('id_toko')->default(1)->primary();
            $table->string('nama_toko', 100);
            $table->string('slogan', 255)->nullable();
            $table->text('deskripsi')->nullable();
            $table->text('alamat')->nullable();
            $table->string('jam_buka', 100)->nullable();
            $table->string('no_kontak', 20)->nullable();
            $table->string('whatsapp', 20)->nullable();
            $table->string('email_toko', 100)->nullable();
            $table->string('logo', 255)->nullable();
            $table->unsignedInteger('updated_by')->nullable();
            $table->timestamps();

            $table->foreign('updated_by')->references('id_user')->on('users')->onUpdate('cascade')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shop_profile');
    }
};
