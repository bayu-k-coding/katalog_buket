<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->increments('id_detail');
            $table->unsignedInteger('id_pesanan');
            $table->unsignedInteger('id_produk');
            $table->unsignedInteger('jumlah');
            $table->decimal('harga_satuan', 12, 2);
            $table->decimal('subtotal', 14, 2);
            $table->timestamps();

            $table->unique(['id_pesanan', 'id_produk']);
            $table->foreign('id_pesanan')->references('id_pesanan')->on('orders')->onUpdate('cascade')->onDelete('cascade');
            $table->foreign('id_produk')->references('id_produk')->on('products')->onUpdate('cascade')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
