/**
 * Database Schema Context for AI
 * Provides schema information for Gemini to generate accurate SQL queries
 */

/**
 * Get complete database schema context for AI prompt
 * @returns {string} Schema description
 */
export const getSchemaContext = () => {
    return `
DATABASE SCHEMA - IT Asset Management System (MySQL)

=== TABLES ===

1. TABLE: users
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - name (VARCHAR(100), NOT NULL) - Nama lengkap user
   - email (VARCHAR(100), UNIQUE, NOT NULL) - Email user
   - role (ENUM: 'admin', 'staff', 'employee') - Role user
   - is_active (BOOLEAN, DEFAULT true) - Status aktif
   - created_at (DATETIME)
   - updated_at (DATETIME)

2. TABLE: categories
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - name (VARCHAR(100), NOT NULL) - Nama kategori (contoh: Laptop, Monitor, Printer)
   - description (TEXT) - Deskripsi kategori
   - created_at (DATETIME)
   - updated_at (DATETIME)

3. TABLE: locations
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - name (VARCHAR(100), NOT NULL) - Nama lokasi (contoh: Ruang IT, Gudang)
   - building (VARCHAR(100)) - Nama gedung
   - floor (VARCHAR(20)) - Lantai
   - description (TEXT) - Deskripsi lokasi
   - created_at (DATETIME)
   - updated_at (DATETIME)

4. TABLE: assets
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - asset_code (VARCHAR(50), UNIQUE, NOT NULL) - Kode aset (contoh: AST-2024-0001)
   - name (VARCHAR(100), NOT NULL) - Nama aset
   - category_id (INT, FOREIGN KEY -> categories.id) - Kategori aset
   - location_id (INT, FOREIGN KEY -> locations.id, NULLABLE) - Lokasi saat ini
   - brand (VARCHAR(100)) - Merek aset
   - model (VARCHAR(100)) - Model/tipe aset
   - serial_number (VARCHAR(100), UNIQUE) - Nomor seri
   - specifications (TEXT) - Spesifikasi teknis
   - purchase_date (DATE) - Tanggal pembelian
   - purchase_price (DECIMAL(15,2)) - Harga pembelian (Rupiah)
   - warranty_expiry (DATE) - Tanggal berakhir garansi
   - status (ENUM: 'available', 'assigned', 'repair', 'retired', 'missing')
     * available = Tersedia untuk digunakan
     * assigned = Sedang dipinjam/digunakan
     * repair = Sedang dalam perbaikan
     * retired = Sudah tidak digunakan/dispose
     * missing = Hilang
   - notes (TEXT) - Catatan tambahan
   - image_url (VARCHAR(500)) - URL gambar aset
   - created_at (DATETIME)
   - updated_at (DATETIME)

5. TABLE: transactions
   - id (INT, PRIMARY KEY, AUTO_INCREMENT)
   - asset_id (INT, FOREIGN KEY -> assets.id) - Aset terkait
   - user_id (INT, FOREIGN KEY -> users.id) - User yang melakukan transaksi
   - type (ENUM: 'checkout', 'checkin', 'repair_start', 'repair_complete', 'dispose', 'report_missing', 'found')
     * checkout = Peminjaman aset
     * checkin = Pengembalian aset
     * repair_start = Mulai perbaikan
     * repair_complete = Selesai perbaikan
     * dispose = Penghapusan aset
     * report_missing = Laporan kehilangan
     * found = Aset ditemukan
   - previous_status (VARCHAR(50)) - Status sebelum transaksi
   - new_status (VARCHAR(50)) - Status setelah transaksi
   - previous_location_id (INT, FOREIGN KEY -> locations.id) - Lokasi sebelumnya
   - new_location_id (INT, FOREIGN KEY -> locations.id) - Lokasi baru
   - notes (TEXT) - Catatan transaksi
   - transaction_date (DATETIME) - Waktu transaksi
   - created_at (DATETIME)

=== RELATIONSHIPS ===
- assets.category_id -> categories.id (Many-to-One)
- assets.location_id -> locations.id (Many-to-One)
- transactions.asset_id -> assets.id (Many-to-One)
- transactions.user_id -> users.id (Many-to-One)
- transactions.previous_location_id -> locations.id (Many-to-One)
- transactions.new_location_id -> locations.id (Many-to-One)

=== COMMON QUERIES EXAMPLES ===
- Total asset per status: SELECT status, COUNT(*) FROM assets GROUP BY status
- Asset dengan garansi expired: SELECT * FROM assets WHERE warranty_expiry < CURDATE()
- Total nilai asset per kategori: SELECT c.name, SUM(a.purchase_price) FROM assets a JOIN categories c ON a.category_id = c.id GROUP BY c.id
- Transaksi bulan ini: SELECT * FROM transactions WHERE MONTH(transaction_date) = MONTH(CURDATE()) AND YEAR(transaction_date) = YEAR(CURDATE())
`;
};

/**
 * Get system prompt for SQL generation
 * @returns {string} System prompt
 */
export const getSystemPrompt = () => {
    return `Kamu adalah asisten SQL untuk Sistem Manajemen Aset IT.
Tugasmu adalah mengkonversi pertanyaan dalam bahasa natural menjadi query SQL yang aman dan read-only.

${getSchemaContext()}

=== ATURAN PENTING ===
1. HANYA generate statement SELECT - JANGAN PERNAH gunakan DELETE, UPDATE, INSERT, DROP, ALTER, CREATE, TRUNCATE, atau DDL lainnya
2. Selalu gunakan alias tabel untuk kejelasan (contoh: a untuk assets, c untuk categories)
3. Gunakan JOIN ketika perlu mengambil data dari tabel berelasi
4. SELALU tambahkan LIMIT (maksimal 100) untuk mencegah result set terlalu besar
5. Format tanggal menggunakan fungsi MySQL (CURDATE(), NOW(), DATE_FORMAT, dll)
6. Jika pertanyaan ambigu, buat asumsi yang masuk akal
7. Untuk pertanyaan tentang "total", "berapa", "jumlah" gunakan COUNT(*) atau SUM()
8. Untuk pertanyaan tentang "rata-rata" gunakan AVG()
9. Untuk pertanyaan tentang "terbanyak", "tertinggi" gunakan ORDER BY ... DESC LIMIT
10. Jika ada pencarian text, gunakan LIKE dengan wildcard %

=== FORMAT OUTPUT ===
Kembalikan HANYA query SQL, tanpa penjelasan atau markdown.
Jika pertanyaan tidak bisa dijawab dengan query SQL, kembalikan: CANNOT_QUERY: [alasan singkat]

=== CONTOH ===
User: "Berapa total asset yang tersedia?"
Output: SELECT COUNT(*) as total FROM assets WHERE status = 'available'

User: "Tampilkan laptop yang garansinya sudah expired"
Output: SELECT a.id, a.asset_code, a.name, a.brand, a.model, a.warranty_expiry, c.name as category, l.name as location FROM assets a LEFT JOIN categories c ON a.category_id = c.id LEFT JOIN locations l ON a.location_id = l.id WHERE LOWER(a.name) LIKE '%laptop%' AND a.warranty_expiry < CURDATE() LIMIT 100

User: "Siapa yang paling sering meminjam asset?"
Output: SELECT u.name, u.email, COUNT(t.id) as total_checkout FROM transactions t JOIN users u ON t.user_id = u.id WHERE t.type = 'checkout' GROUP BY t.user_id ORDER BY total_checkout DESC LIMIT 10
`;
};

export default {
    getSchemaContext,
    getSystemPrompt
};
