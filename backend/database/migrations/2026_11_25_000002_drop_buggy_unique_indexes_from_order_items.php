<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $indexes = collect(DB::select('SHOW INDEX FROM order_items'))
            ->pluck('Key_name')
            ->unique()
            ->all();

        Schema::table('order_items', function (Blueprint $table) use ($indexes) {
            if (in_array('id_pesanan_UNIQUE', $indexes)) {
                $table->dropUnique('id_pesanan_UNIQUE');
            }
            if (in_array('id_produk_UNIQUE', $indexes)) {
                $table->dropUnique('id_produk_UNIQUE');
            }
        });
    }

    public function down(): void
    {
        // Tidak perlu mengembalikan constraint unik tunggal yang keliru
    }
};
