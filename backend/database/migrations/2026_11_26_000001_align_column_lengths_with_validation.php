<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Penyesuaian wajar kolom database agar tetap dekat dengan struktur ERD asli
     * namun tidak menimbulkan error truncation pada data nyata.
     */
    public function up(): void
    {
        // 1. shop_profile (nama_toko 11->35, alamat 60->100 varchar, jam_buka 11->20)
        Schema::table('shop_profile', function (Blueprint $table) {
            $table->string('nama_toko', 35)->change();
            $table->string('alamat', 100)->nullable()->change();
            $table->string('jam_buka', 20)->nullable()->change();
            $table->string('no_kontak', 16)->nullable()->change();
        });

        // 2. pelanggan (kota 7->30, alamat 60 NOT NULL -> 100 varchar NULL; kolom lain tetap proporsional)
        Schema::table('pelanggan', function (Blueprint $table) {
            $table->string('nama_pelanggan', 60)->nullable()->change();
            if (Schema::hasColumn('pelanggan', 'no telepon')) {
                $table->string('no telepon', 16)->nullable()->change();
            }
            $table->string('email', 60)->change();
            $table->string('alamat', 100)->nullable()->change();
            $table->string('kota', 30)->nullable()->change();
            $table->string('kode_pos', 5)->nullable()->change();
        });

        // 3. users (tetap sesuai ukuran asli yang sudah proporsional)
        Schema::table('users', function (Blueprint $table) {
            $table->string('nama_lengkap', 60)->change();
            $table->string('email', 60)->change();
            $table->string('no_telepon', 16)->nullable()->change();
        });

        // 4. products (nama_produk 40->60 agar nama produk tidak terlalu mepet)
        Schema::table('products', function (Blueprint $table) {
            $table->string('nama_produk', 60)->change();
        });

        // 5. categories (tetap sesuai ukuran asli)
        Schema::table('categories', function (Blueprint $table) {
            $table->string('nama_kategori', 30)->change();
            $table->string('deskripsi', 100)->nullable()->change();
        });

        // 6. orders (pertahankan panjang asli 60/16/100; id_pelanggan dibuat nullable untuk checkout admin)
        Schema::table('orders', function (Blueprint $table) {
            $table->string('nama_penerima', 60)->change();
            $table->string('telp_penerima', 16)->change();
            $table->string('catatan', 100)->nullable()->change();
        });

        $col = DB::selectOne("SHOW COLUMNS FROM orders LIKE 'id_pelanggan'");
        if ($col && strtoupper($col->Null) === 'NO') {
            DB::statement("ALTER TABLE orders MODIFY COLUMN id_pelanggan {$col->Type} NULL");
        }
    }

    public function down(): void
    {
        // Tidak mengecilkan kembali kolom yang sudah disesuaikan
    }
};
