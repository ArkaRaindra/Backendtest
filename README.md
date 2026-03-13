# 🥐 Bakery Delight — Full Stack (MySQL)

Website toko roti modern menggunakan **Node.js + Express** sebagai backend, **MySQL** sebagai database, **Tailwind CSS** untuk tampilan, dan **Admin Panel** lengkap.

---

## 📁 Struktur Proyek

```
bakery-delight/
├── backend/
│   ├── server.js            # Entry point Express server
│   ├── database.js          # MySQL pool + auto-create tabel + seed data
│   └── routes/
│       ├── products.js      # API produk (CRUD)
│       ├── reviews.js       # API ulasan
│       ├── gallery.js       # API gallery
│       ├── auth.js          # Login admin & settings
│       └── orders.js        # API pesanan & statistik
├── public/
│   ├── index.html           # Halaman beranda
│   ├── produk.html          # Halaman produk + filter
│   ├── ulasan.html          # Halaman ulasan pelanggan
│   ├── galeri.html          # Halaman gallery + lightbox
│   ├── tentang.html         # Halaman tentang kami
│   └── admin/
│       └── index.html       # Panel Admin (SPA)
├── uploads/                 # Folder upload gambar (auto-created)
├── init.sql                 # Script SQL buat database & tabel
├── .env.example             # Contoh konfigurasi environment
└── package.json
```

---

## 🚀 Cara Menjalankan

### 1. Siapkan MySQL Database

```bash
# Buat database & tabel via file SQL
mysql -u root -p < init.sql

# Atau buat database manual; tabel auto-dibuat saat server start
mysql -u root -p -e "CREATE DATABASE bakery_delight CHARACTER SET utf8mb4;"
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL Anda
```

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=bakery_delight
SESSION_SECRET=bakery-delight-secret-key-2025
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Jalankan Server

```bash
npm start        # produksi
npm run dev      # development (auto-restart)
```

Saat pertama kali dijalankan, server akan otomatis:
- Membuat semua tabel yang belum ada
- Mengisi data awal (produk, ulasan, admin, pengaturan)

---

## 🔑 Login Admin Default

| Username | Password  |
|----------|-----------|
| `admin`  | `admin123`|

---

## 📊 Fitur Admin Panel

| Menu           | Keterangan                                     |
|----------------|------------------------------------------------|
| 📈 Dashboard   | Statistik produk, ulasan, pesanan, pendapatan  |
| 🥖 Produk      | Tambah / edit / hapus + upload foto            |
| ⭐ Ulasan      | Moderasi, setujui/sembunyikan, hapus           |
| 🖼️ Gallery     | Upload & kelola foto                           |
| 🛒 Pesanan     | Lihat & update status pesanan                  |
| ⚙️ Pengaturan  | Edit info toko, notice bar, kontak             |

---

## 🔌 API Endpoints

### Produk
- `GET /api/products` — Semua produk (query: `category`, `status`, `search`, `special`)
- `GET /api/products/:id` — Detail produk
- `POST /api/products` — Tambah *(admin)*
- `PUT /api/products/:id` — Update *(admin)*
- `DELETE /api/products/:id` — Hapus *(admin)*

### Ulasan
- `GET /api/reviews` — Semua ulasan (query: `approved`)
- `POST /api/reviews` — Kirim ulasan baru
- `PUT /api/reviews/:id/approve` — Setujui/sembunyikan *(admin)*
- `DELETE /api/reviews/:id` — Hapus *(admin)*

### Gallery
- `GET /api/gallery` — Semua foto
- `POST /api/gallery` — Upload foto *(admin)*
- `DELETE /api/gallery/:id` — Hapus foto *(admin)*

### Pesanan
- `GET /api/orders` — Semua pesanan *(admin)*
- `GET /api/orders/stats` — Statistik dashboard *(admin)*
- `POST /api/orders` — Buat pesanan baru
- `PUT /api/orders/:id/status` — Update status *(admin)*

### Auth & Settings
- `POST /api/auth/login` — Login admin
- `POST /api/auth/logout` — Logout
- `GET /api/auth/check` — Cek status login
- `GET /api/auth/settings` — Ambil pengaturan toko
- `PUT /api/auth/settings` — Simpan pengaturan *(admin)*

---

## 🛠️ Teknologi

| Layer    | Teknologi                           |
|----------|-------------------------------------|
| Runtime  | Node.js                             |
| Framework| Express.js                          |
| Database | **MySQL** via `mysql2/promise`      |
| Frontend | HTML5 + Tailwind CSS (CDN)          |
| Auth     | express-session + bcryptjs          |
| Upload   | Multer                              |
| Config   | dotenv                              |

---

## ⚠️ Perbedaan dari Versi SQLite

| Aspek           | SQLite                       | MySQL                                    |
|-----------------|------------------------------|------------------------------------------|
| Driver          | better-sqlite3               | mysql2/promise                           |
| Query style     | Sinkron                      | Async/await                              |
| Upsert          | `INSERT OR REPLACE`          | `INSERT ... ON DUPLICATE KEY UPDATE`     |
| JSON column     | TEXT + manual JSON.parse     | Native JSON (auto-parse oleh driver)     |
| Koneksi         | File lokal `.db`             | TCP ke server MySQL                      |
| Config          | Tidak perlu `.env`           | Wajib mengisi `.env`                     |
