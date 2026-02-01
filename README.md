# Sistem Transparansi Keuangan BEM FT

## 📋 Deskripsi
Aplikasi web untuk mengelola keuangan BEM Fakultas Teknik dengan fitur transparansi penuh, manajemen kas anggota, dan pelacakan transaksi.

## 🚀 Cara Menggunakan

### 1. Membuka Aplikasi
- Buka file `index.html` di browser Anda untuk halaman beranda
- Atau buka `login.html` langsung untuk login sebagai admin/bendahara

### 2. Login ke Dashboard
**Kredensial Login:**

**Admin:**
- Username: `admin`
- Password: `adminkeren`

**Bendahara:**
- Username: `bendahara`
- Password: `semangat`

### 3. Fitur-fitur yang Tersedia

#### Halaman Beranda (index.html)
- Melihat total saldo kas
- Melihat daftar anggota dan status pembayaran
- Pencarian data anggota
- Filter berdasarkan status pembayaran

#### Dashboard Admin (dashboard.html)
Setelah login, Anda dapat:

**Manajemen Kas Anggota:**
- ✅ Tambah anggota baru
- ✏️ Edit data anggota
- 🗑️ Hapus data anggota
- 📊 Lihat statistik kas (total anggota, sudah bayar, belum bayar, total terkumpul)
- 🔍 Cari anggota berdasarkan nama/NIM/prodi
- 🔽 Filter berdasarkan status pembayaran
- 📥 Export data ke Excel

## 📂 Struktur File

```
📁 Project
├── index.html        # Halaman beranda (publik)
├── login.html        # Halaman login admin/bendahara
├── dashboard.html    # Dashboard manajemen (setelah login)
└── app.js           # JavaScript untuk fungsi dashboard
```

## 💾 Penyimpanan Data

Aplikasi menggunakan **localStorage** browser untuk menyimpan data. Data akan tersimpan di browser dan tidak akan hilang saat halaman di-refresh.

### Sinkronisasi Data Dashboard ↔️ Index

Aplikasi ini menggunakan **real-time synchronization** antara dashboard dan halaman index:

**Cara Kerja:**
1. Admin/Bendahara mengelola data di **dashboard.html** (tambah/edit/hapus anggota)
2. Data otomatis tersimpan ke **localStorage**
3. Halaman **index.html** akan **otomatis update** menampilkan data terbaru
4. Sinkronisasi terjadi dengan 2 cara:
   - **Storage Event** - untuk tab berbeda di browser yang sama
   - **Polling (setiap 2 detik)** - untuk tab yang sama

**Cara Melihat Sinkronisasi:**
1. Buka `dashboard.html` di satu tab (setelah login)
2. Buka `index.html` di tab lain
3. Tambah/edit data anggota di dashboard
4. Lihat perubahan otomatis muncul di index.html!

**Catatan:** 
- Data hanya tersimpan di browser yang sama
- Jangan hapus data browser atau localStorage akan hilang
- Untuk penggunaan production, disarankan menggunakan database server

## 🎨 Fitur Desain

- ✨ Desain modern dengan gradient background
- 📱 Responsive untuk mobile dan desktop
- 🎭 Animasi smooth untuk interaksi
- 🌈 Color-coded status (hijau = lunas, merah = belum lunas)
- 📊 Statistik real-time dengan animasi

## 🔧 Troubleshooting

**Problem: Data tidak tersimpan**
- Pastikan browser mendukung localStorage
- Jangan gunakan mode incognito/private
- Cek console browser untuk error

**Problem: Tidak bisa login**
- Pastikan username dan password benar (case-sensitive)
- Clear cache browser jika perlu

**Problem: Tampilan tidak sesuai**
- Pastikan koneksi internet aktif (untuk load Font Awesome)
- Gunakan browser modern (Chrome, Firefox, Edge terbaru)

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🛠️ Pengembangan Lebih Lanjut

Untuk pengembangan production, pertimbangkan:
1. Mengganti localStorage dengan database (MySQL, PostgreSQL, MongoDB)
2. Implementasi backend API (Node.js, PHP, Python)
3. Menambahkan autentikasi yang lebih kuat (JWT, OAuth)
4. Implementasi backup data otomatis
5. Menambahkan fitur laporan PDF
6. Multi-user access control

## 📞 Support

Untuk pertanyaan atau masalah, silakan hubungi admin sistem.

---

**Dibuat untuk BEM Fakultas Teknik**
© 2024 - Sistem Transparansi Keuangan