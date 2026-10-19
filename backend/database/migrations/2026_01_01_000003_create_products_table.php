<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->increments('id_produk');
            $table->unsignedInteger('id_kategori');
            $table->string('nama_produk', 150);
            $table->text('deskripsi')->nullable();
            $table->decimal('harga', 12, 2);
            $table->unsignedInteger('stok')->default(0);
            $table->string('foto', 255)->nullable();
            $table->boolean('status_tersedia')->default(true);
            $table->unsignedInteger('created_by')->nullable();
            $table->timestamps();

            $table->index('nama_produk');
            $table->foreign('id_kategori')->references('id_kategori')->on('categories')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('created_by')->references('id_user')->on('users')->onUpdate('cascade')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
