# 🌸 Panduan Instalasi & Setup Project — eKatalog Intan Buket

Dokumen ini ditujukan untuk rekan pengembang (tim) yang ingin menginstal, mengonfigurasi, dan menjalankan project **eKatalog Intan Buket** di lingkungan komputer lokal (*localhost*).

---

## 🛠️ Prasyarat Sistem (Prerequisites)

Sebelum melakukan instalasi, pastikan komputer Anda telah terpasang perangkat lunak berikut:
1. **PHP** minimal versi **8.2** (pastikan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `curl` aktif di `php.ini`).
2. **Composer** (Dependency manager untuk PHP).
3. **Node.js** minimal versi **18.x** & **NPM**.
4. **MySQL / MariaDB** (melalui XAMPP, Laragon, atau MySQL service native).
5. **Git**.

---

## 📥 Langkah 1: Clone Repository

Buka terminal dan lakukan clone repository ke komputer lokal:
```bash
git clone <URL_REPOSITORY_GITHUB>
cd katalog_buket
```

Struktur direktori utama terdiri dari dua folder:
- `/backend` : Server REST API berbasis **Laravel 12**.
- `/frontend` : Aplikasi antarmuka pengguna berbasis **React 18 + Vite + Tailwind CSS**.

---

## ⚙️ Langkah 2: Setup Backend (Laravel 12)

1. **Masuk ke folder backend:**
   ```bash
   cd backend
   ```

2. **Pasang dependensi PHP:**
   ```bash
   composer install
   ```

3. **Salin file konfigurasi environment:**
   - Di Windows (PowerShell / CMD):
     ```bash
     copy .env.example .env
     ```
   - Di Git Bash / macOS / Linux:
     ```bash
     cp .env.example .env
     ```

4. **Buat Database MySQL Baru:**
   - Buka **phpMyAdmin** (`http://localhost/phpmyadmin`) atau GUI database Anda (HeidiSQL, DBeaver, dll).
   - Buat database baru bernama: `ekatalog_intan_buket`

5. **Sesuaikan Kredensial Database di `.env`:**
   Buka file `.env` di folder `backend`, lalu pastikan bagian database dan URL frontend sudah sesuai:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=ekatalog_intan_buket
   DB_USERNAME=root
   DB_PASSWORD=

   # Konfigurasi Port Frontend & Service Email
   FRONTEND_URL=http://localhost:3000
   MAIL_FROM_ADDRESS="krisdiantorobayu52@gmail.com"
   MAIL_FROM_NAME="Intan Buket eKatalog"
   BREVO_API_KEY=
   ```
   > **Catatan Pengiriman Email:**  
   > - Jika ingin menguji pengiriman email nyata ke Gmail, masukkan API Key Brevo pada `BREVO_API_KEY`.
   > - Jika `BREVO_API_KEY` dikosongkan, fitur reset password tetap berfungsi secara lokal; tautan reset password akan otomatis dicatat di file log: `backend/storage/logs/laravel.log`.

6. **Generate Application Key:**
   ```bash
   php artisan key:generate
   ```

7. **Jalankan Migrasi Database & Data Dummy (Seeder):**
   ```bash
   php artisan migrate --seed
   ```
   *Perintah ini akan membuat semua tabel skema dan mengisikan data awal kategori, produk buket, metode pembayaran, akun admin toko, dan akun pelanggan.*

8. **Jalankan Server Lokal Backend:**
   ```bash
   php artisan serve
   ```
   Backend REST API akan berjalan di: 👉 **`http://localhost:8000`**

---

## 💻 Langkah 3: Setup Frontend (React 18 + Vite)

Buka jendela terminal baru (biarkan terminal backend tetap berjalan):

1. **Masuk ke folder frontend:**
   ```bash
   cd frontend
   ```

2. **Pasang dependensi JavaScript:**
   ```bash
   npm install
   ```

3. **Jalankan Server Lokal Frontend:**
   ```bash
   npm run dev
   ```
   Frontend web akan otomatis aktif di: 👉 **`http://localhost:3000`**

---

## 🔑 Akun Percobaan Default (Demo Credentials)

Sistem menggunakan **Universal Login** di halaman `/login` (satu form login dapat mengenali apakah pengguna adalah Admin atau Pelanggan secara otomatis):

| Peran (Role) | Email | Kata Sandi | Halaman Tujuan Setelah Login |
| :--- | :--- | :--- | :--- |
| **Superadmin (Owner)** | `owner@intanbuket.com` | `password123` | Dashboard Admin (`/admin/dashboard`) |
| **Admin Toko (Staf Kasir)** | `admin1@intanbuket.com` | `password123` | Dashboard Admin (`/admin/dashboard`) |
| **Pelanggan** | `pelanggan@mail.com` | `password123` | Beranda / Katalog Buket (`/katalog`) |

---

## 💡 Fitur-Fitur Utama

1. **Universal Authentication (Sanctum Dual-Model)**:
   - Mendukung akun Admin (`users`) dan Pelanggan (`pelanggan`).
   - Rute panel admin dilindungi oleh `AdminRoute` (hanya role `admin` / `superadmin` yang dapat mengakses).

2. **Fitur Lupa & Reset Kata Sandi**:
   - Permintaan melalui `/forgot-password` mengirim tautan sekali pakai (*single-use token*) berdurasi **60 menit**.
   - Pengiriman menggunakan Brevo REST API v3 (port 443 HTTPS), aman dari pemblokiran port SMTP lokal.

3. **Storefront & Katalog**:
   - Filter kategori buket (*Wisuda, Uang, Snack, Custom, Dried Flower*).
   - Pencarian real-time, pengurutan harga, dan kustomisasi ucapan kaligrafi.
   - Keranjang belanja interaktif dan form Checkout pesanan.

4. **Backoffice Dashboard Admin (`/admin/*`)**:
   - Statistik omset penjualan dan pelacakan pesanan masuk.
   - Manajemen katalog produk & kategori (CRUD).
   - Verifikasi bukti pembayaran pesanan.
   - Manajemen staf pengguna.

---

## ❓ FAQ & Kendala Umum (Troubleshooting)

1. **Muncul *"This site can't be reached / localhost refused to connect"* saat klik link email reset kata sandi:**  
   Pastikan terminal frontend Vite Anda berjalan di port **3000** (`http://localhost:3000`). Jika Vite Anda berjalan di port lain (seperti `5173`), pastikan variabel `FRONTEND_URL` di file `backend/.env` disamakan dengan port tersebut.

2. **Tautan reset kata sandi muncul error *"Tautan tidak valid atau telah digunakan"*:**  
   Setiap kali pengguna meminta tautan baru, tautan dari email sebelumnya akan otomatis dibatalkan (*invalidated*). Selalu klik tombol dari **email paling baru** yang masuk di kotak masuk Gmail Anda.

3. **Port MySQL bentrok:**  
   Jika MySQL Anda tidak berjalan di port `3306`, sesuaikan variabel `DB_PORT` pada file `backend/.env`.
