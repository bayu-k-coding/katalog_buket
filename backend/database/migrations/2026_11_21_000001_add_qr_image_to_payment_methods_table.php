<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_methods', function (Blueprint $table) {
            if (!Schema::hasColumn('payment_methods', 'qr_image')) {
                $table->string('qr_image', 255)->nullable()->after('atas_nama');
            }
            if (!Schema::hasColumn('payment_methods', 'instruksi')) {
                $table->text('instruksi')->nullable()->after('keterangan');
            }
        });
    }

    public function down(): void
    {
        Schema::table('payment_methods', function (Blueprint $table) {
            if (Schema::hasColumn('payment_methods', 'qr_image')) {
                $table->dropColumn('qr_image');
            }
            if (Schema::hasColumn('payment_methods', 'instruksi')) {
                $table->dropColumn('instruksi');
            }
        });
    }
};

