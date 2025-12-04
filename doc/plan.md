# 📋 Development Plan - IT Asset Management System

**Versi Dokumen**: 1.4  
**Tanggal**: 4 Desember 2025  
**Status**: In Progress - Phase 3 In Progress 🔄

---

## 📑 Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Tech Stack](#2-tech-stack)
3. [Fase Pengembangan (Detail)](#3-fase-pengembangan-detail)
4. [Database Schema (Detail)](#4-database-schema-detail)
5. [Detail Rencana Backend](#5-detail-rencana-backend)
6. [Detail Rencana Frontend](#6-detail-rencana-frontend)
7. [Checklist Progress Tracking](#7-checklist-progress-tracking)
8. [Timeline Estimasi](#8-timeline-estimasi)
9. [Risiko dan Mitigasi](#9-risiko-dan-mitigasi)

---

## 1. Ringkasan Proyek

### 1.1 Tujuan
Membangun Sistem Manajemen Aset TI (IT Asset Management System) yang mencakup:
- Sentralisasi inventaris aset TI
- Mekanisme Check-in/Check-out aset
- Jejak audit (audit trail) untuk setiap transaksi
- Role-Based Access Control (RBAC)

### 1.2 Arsitektur
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│    Database     │
│   (React.js)    │◀────│  (Node.js +     │◀────│    (MySQL)      │
│   + Tailwind    │     │   Express)      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 2. Tech Stack

### 2.1 Backend
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Runtime | Node.js | v18+ LTS |
| Framework | Express.js | v4.x |
| ORM | Sequelize | v6.x |
| Database | MySQL | v8.x |
| Authentication | JWT (jsonwebtoken) | v9.x |
| Password Hashing | Argon2 | v0.31.x |
| Validation | Joi | v17.x |
| Environment | dotenv | v16.x |
| CORS | cors | v2.x |
| Cookie Parser | cookie-parser | v1.x |

### 2.2 Frontend
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Library | React.js | v18.x |
| Build Tool | Vite | v5.x |
| Styling | Tailwind CSS | v3.x |
| HTTP Client | Axios | v1.x |
| Routing | React Router DOM | v6.x |
| State Management | React Context API | Built-in |
| Icons | React Icons | v5.x |
| Table | @tanstack/react-table | v8.x |
| Notifications | React Hot Toast | v2.x |

---

## 3. Fase Pengembangan (Detail)

### 📌 Fase 1: Setup & Infrastruktur (Sprint 1) - 2-3 Hari

#### 1.1 Persiapan Environment
| Task | Deskripsi | Output |
|------|-----------|--------|
| Install Node.js | Install Node.js v18+ LTS | Node & NPM tersedia |
| Install MySQL | Setup MySQL Server v8.x | Database server running |
| Setup IDE | VS Code + Extensions (ESLint, Prettier) | Development environment siap |
| Setup Git | Inisialisasi repository | `.gitignore` configured |

#### 1.2 Backend Setup
| Task | Deskripsi | Perintah/Output |
|------|-----------|-----------------|
| Init Project | Buat folder `backend/` dan init npm | `npm init -y` |
| Install Core Dependencies | Express, Sequelize, MySQL2 | `npm install express sequelize mysql2` |
| Install Auth Dependencies | JWT, Argon2, Cookie-parser | `npm install jsonwebtoken argon2 cookie-parser` |
| Install Dev Dependencies | Nodemon, Dotenv, CORS | `npm install -D nodemon dotenv cors` |
| Setup Folder Structure | Buat folders: config, controllers, models, routes, middleware, utils | Struktur folder lengkap |
| Konfigurasi Environment | Buat `.env` dan `.env.example` | Environment variables siap |
| Database Connection | Buat `config/Database.js` | Koneksi DB berhasil |
| Entry Point | Buat `index.js` dengan Express setup | Server bisa dijalankan |

#### 1.3 Frontend Setup
| Task | Deskripsi | Perintah/Output |
|------|-----------|-----------------|
| Create Vite Project | Init React dengan Vite | `npm create vite@latest frontend -- --template react` |
| Install Dependencies | Axios, React Router, React Icons | `npm install axios react-router-dom react-icons` |
| Install Tailwind | Setup Tailwind CSS | `npm install -D tailwindcss postcss autoprefixer` |
| Configure Tailwind | Buat `tailwind.config.js` | Tailwind siap digunakan |
| Install UI Libraries | Table, Toast | `npm install @tanstack/react-table react-hot-toast` |
| Setup Folder Structure | Buat folders: api, components, context, hooks, pages, routes, utils | Struktur folder lengkap |
| Konfigurasi Environment | Buat `.env` untuk API URL | `VITE_API_URL=http://localhost:5000` |

#### 1.4 Database Setup
| Task | Deskripsi | Output |
|------|-----------|--------|
| Create Database | Buat database `itam_db` | Database created |
| Create DB User | Buat user dengan privileges | User dengan akses penuh |
| Test Connection | Jalankan script test koneksi | Connection successful |

**Deliverables Fase 1:**
- ✅ Project structure backend & frontend
- ✅ Database connection working
- ✅ Express server running di port 5000
- ✅ React app running di port 5173
- ✅ Git repository initialized

---

### 📌 Fase 2: Backend Core Development (Sprint 2-3) - 7-10 Hari

#### 2.1 Database Models (Hari 1-2)
| Model | File | Relasi | Prioritas |
|-------|------|--------|-----------|
| User | `UserModel.js` | hasMany(Asset), hasMany(Transaction) | HIGH |
| Category | `CategoryModel.js` | hasMany(Asset) | HIGH |
| Location | `LocationModel.js` | hasMany(Asset) | HIGH |
| Asset | `AssetModel.js` | belongsTo(Category, Location, User), hasMany(Transaction) | HIGH |
| Transaction | `TransactionModel.js` | belongsTo(Asset, User as employee, User as admin) | HIGH |

**Langkah Detail:**
1. Buat setiap model dengan field sesuai schema
2. Definisikan associations di `models/index.js`
3. Jalankan `db.sync({ alter: true })` untuk create tables
4. Verifikasi struktur tabel di MySQL

#### 2.2 Authentication Module (Hari 2-3)
| Komponen | File | Fungsi |
|----------|------|--------|
| Auth Controller | `AuthController.js` | register, login, refreshToken, logout, getMe |
| Verify Token | `VerifyToken.js` | Middleware validasi JWT access token |
| Authorize Role | `AuthorizeRole.js` | Middleware check user role |
| Auth Routes | `AuthRoute.js` | Define auth endpoints |

**Flow Authentication:**
```
Login Request → Validate Credentials → Generate Access Token (15min)
                                    → Generate Refresh Token (1 day)
                                    → Set Refresh Token in HttpOnly Cookie
                                    → Return Access Token in Response

Token Refresh → Check Refresh Token Cookie → Validate Token
                                           → Generate New Access Token
                                           → Return New Access Token
```

#### 2.3 CRUD Modules (Hari 4-6)
| Module | Controller | Routes | Complexity |
|--------|------------|--------|------------|
| Users | `UserController.js` | `UserRoute.js` | Medium |
| Categories | `CategoryController.js` | `CategoryRoute.js` | Low |
| Locations | `LocationController.js` | `LocationRoute.js` | Low |
| Assets | `AssetController.js` | `AssetRoute.js` | High |

**Asset Controller Special Features:**
- Search by name, serial_number, asset_tag (LIKE query)
- Filter by category_id, location_id, status
- Pagination dengan limit & offset
- Include related data (category, location, holder)
- Get statistics (count by status)

#### 2.4 Transaction Module (Hari 7-8)
| Fungsi | Deskripsi | State Change |
|--------|-----------|--------------|
| checkout | Assign aset ke employee | available → assigned |
| checkin | Terima kembali aset | assigned → available/repair |
| sendToRepair | Kirim untuk perbaikan | available/assigned → repair |
| completeRepair | Selesai perbaikan | repair → available |
| dispose | Hapus/jual aset | any → retired |
| reportMissing | Laporkan hilang | assigned → missing |

**State Machine Rules:**
```
┌─────────────┐     checkout      ┌─────────────┐
│  AVAILABLE  │ ───────────────▶  │  ASSIGNED   │
└─────────────┘                   └─────────────┘
       │                                 │
       │ sendToRepair                    │ checkin (damaged)
       ▼                                 ▼
┌─────────────┐  completeRepair   ┌─────────────┐
│  IN REPAIR  │ ◀──────────────── │  IN REPAIR  │
└─────────────┘                   └─────────────┘
       │                                 │
       │ dispose (BER)                   │ reportMissing
       ▼                                 ▼
┌─────────────┐                   ┌─────────────┐
│   RETIRED   │                   │   MISSING   │
└─────────────┘                   └─────────────┘
```

#### 2.5 Utilities & Middleware (Hari 9)
| Utility | File | Fungsi |
|---------|------|--------|
| Response Helper | `responseHelper.js` | Standarisasi format response |
| Validators | `validators.js` | Joi validation schemas |
| Error Handler | `errorHandler.js` | Global error handling middleware |

**Deliverables Fase 2:**
- ✅ Semua models ter-sync ke database
- ✅ Auth endpoints working (login, logout, refresh)
- ✅ CRUD endpoints untuk semua entities
- ✅ Transaction endpoints dengan state machine
- ✅ Postman collection untuk testing

---

### 📌 Fase 3: Frontend Core Development (Sprint 4-5) - 10-14 Hari

#### 3.1 Base Setup & Layout (Hari 1-2)
| Komponen | File | Fungsi |
|----------|------|--------|
| Axios Instance | `api/axios.js` | HTTP client dengan interceptor |
| Auth Context | `context/AuthContext.jsx` | Global auth state |
| Main Layout | `components/layout/MainLayout.jsx` | Wrapper dengan sidebar & navbar |
| Sidebar | `components/layout/Sidebar.jsx` | Navigation menu |
| Navbar | `components/layout/Navbar.jsx` | User info & logout |
| Private Route | `routes/PrivateRoute.jsx` | Protected route wrapper |
| App Routes | `routes/AppRoutes.jsx` | Route definitions |

#### 3.2 Common Components (Hari 3-4)
| Komponen | Props | Variants |
|----------|-------|----------|
| Button | label, onClick, variant, disabled, loading | primary, secondary, danger, outline |
| Input | label, name, type, value, onChange, error, icon | text, email, password, number, date |
| Select | label, options, value, onChange, error, searchable | single, searchable |
| Modal | isOpen, onClose, title, children, size | sm, md, lg |
| Badge | label, variant | success, warning, danger, info, neutral |
| Card | title, children, footer | - |
| Table | columns, data, onSort, sortConfig | sortable |
| Pagination | currentPage, totalPages, onPageChange | - |
| SearchBar | value, onChange, placeholder, debounceMs | - |
| Loading | type, size | spinner, skeleton |

#### 3.3 Authentication Pages (Hari 5)
| Halaman | Route | Fitur |
|---------|-------|-------|
| Login | `/login` | Form email/password, validation, error handling |

**Login Flow:**
```
Enter Credentials → Validate Form → Call Login API
                                 → Store Access Token in Memory
                                 → Redirect to Dashboard
                                 → Load User Info
```

#### 3.4 Dashboard (Hari 6-7)
| Komponen | Data Source | Visualisasi |
|----------|-------------|-------------|
| Stats Cards | `/api/assets/stats` | 4 cards (Total, Available, Assigned, Repair) |
| Category Chart | `/api/assets/stats` | Pie/Donut chart |
| Recent Transactions | `/api/transactions?limit=5` | Table |
| Quick Actions | - | Buttons (Add Asset, Checkout, Checkin) |

#### 3.5 Assets Management (Hari 8-10)
| Halaman | Route | Fitur |
|---------|-------|-------|
| Asset List | `/assets` | Table, Search, Filter, Pagination |
| Add Asset | `/assets/add` | Form dengan validasi |
| Edit Asset | `/assets/edit/:id` | Pre-filled form |
| Asset Detail | `/assets/:id` | Info + Transaction History tabs |

**Asset List Features:**
- Search box dengan debounce 300ms
- Filter dropdown: Category, Location, Status
- Sortable columns: Name, Asset Tag, Status, Purchase Date
- Pagination: 10/25/50 items per page
- Action buttons: View, Edit, Delete (admin)

#### 3.6 Transactions (Hari 11-12)
| Halaman | Route | Fitur |
|---------|-------|-------|
| Transaction List | `/transactions` | Table dengan filter |
| Checkout | `/transactions/checkout` | Form checkout |
| Checkin | `/transactions/checkin` | Form checkin dengan kondisi |

**Checkout Form Fields:**
- Asset selection (only status = available)
- Employee selection (dropdown)
- Transaction date (default today)
- Condition notes (textarea)

**Checkin Form Fields:**
- Asset selection (only status = assigned, filtered by current holder)
- Return condition (Good / Damaged / Lost)
- Condition notes (required if damaged/lost)
- Transaction date (default today)

#### 3.7 Master Data (Hari 13)
| Halaman | Route | Akses |
|---------|-------|-------|
| Categories | `/master/categories` | Admin |
| Locations | `/master/locations` | Admin |
| Users | `/master/users` | Admin |

#### 3.8 Polish & UX (Hari 14)
| Item | Implementasi |
|------|--------------|
| Toast Notifications | Success/Error messages |
| Loading States | Skeleton loading |
| Empty States | "No data" illustrations |
| Error States | Error boundaries |
| Responsive | Mobile-friendly sidebar |
| 404 Page | Not Found page |

**Deliverables Fase 3:**
- ✅ Fully functional React application
- ✅ All pages implemented
- ✅ Responsive design
- ✅ Smooth UX dengan loading & notifications

---

### 📌 Fase 4: Integration & Testing (Sprint 6) - 5-7 Hari

#### 4.1 Integration Testing (Hari 1-2)
| Test Scenario | Steps | Expected Result |
|---------------|-------|-----------------|
| Full Asset Lifecycle | Login → Add Asset → Checkout → Checkin → Dispose | All states correct |
| Auth Flow | Login → Use App → Token Expires → Auto Refresh | No interruption |
| Role-based Access | Login as Staff → Try delete user | Access denied |
| Search & Filter | Search "MacBook" + Filter "Available" | Correct results |

#### 4.2 Backend Testing (Hari 3)
| Test Type | Scope | Tools |
|-----------|-------|-------|
| Endpoint Testing | All API endpoints | Postman/Thunder Client |
| Validation Testing | Invalid inputs | Postman |
| Auth Testing | Token expiry, invalid tokens | Postman |
| State Machine | Invalid transitions | Postman |

#### 4.3 Frontend Testing (Hari 4)
| Test Type | Scope | Method |
|-----------|-------|--------|
| UI Testing | All pages render correctly | Manual |
| Form Validation | All forms validate properly | Manual |
| Responsive | Mobile, Tablet, Desktop | Browser DevTools |
| Cross-browser | Chrome, Firefox, Safari | Manual |

#### 4.4 Security Testing (Hari 5)
| Test | Method | Expected |
|------|--------|----------|
| Unauthorized Access | Call API without token | 401 Unauthorized |
| Role Bypass | Staff try admin endpoints | 403 Forbidden |
| SQL Injection | `' OR '1'='1` in inputs | Query fails safely |
| XSS | `<script>` in inputs | Sanitized/escaped |
| Cookie Security | Check refresh token cookie | HttpOnly, Secure flags |

#### 4.5 UAT & Bug Fixing (Hari 6-7)
| Activity | Description |
|----------|-------------|
| Data Seeding | Insert realistic dummy data |
| User Testing | Test dengan real users (if possible) |
| Bug Documentation | Log semua issues found |
| Bug Fixing | Fix critical & major bugs |
| Regression Test | Re-test fixed issues |

**Deliverables Fase 4:**
- ✅ All tests passed
- ✅ No critical/major bugs
- ✅ Security vulnerabilities addressed
- ✅ UAT sign-off

---

### 📌 Fase 5: Deployment Preparation (Sprint 6) - 2-3 Hari

#### 5.1 Code Optimization
| Area | Optimization |
|------|--------------|
| Backend | Query optimization, add missing indexes |
| Frontend | Code splitting, lazy loading routes |
| Assets | Image optimization, minification |

#### 5.2 Documentation
| Document | Content |
|----------|---------|
| README.md | Project overview, setup instructions |
| API Documentation | Postman collection / Swagger |
| User Manual | How to use the application |
| Deployment Guide | Step-by-step deployment |

#### 5.3 Environment Setup
| Environment | Configuration |
|-------------|---------------|
| Production .env | Secure credentials, production URLs |
| Database | Production database setup |
| Server | Node.js production settings |

**Deliverables Fase 5:**
- ✅ Optimized codebase
- ✅ Complete documentation
- ✅ Production-ready application

---

## 4. Database Schema (Detail)

### 4.1 Entity Relationship Diagram (ERD)

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     USERS        │       │    CATEGORIES    │       │    LOCATIONS     │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ uuid             │       │ uuid             │       │ uuid             │
│ name             │       │ name             │       │ name             │
│ email            │       │ description      │       │ address          │
│ password         │       │ created_at       │       │ created_at       │
│ role             │       │ updated_at       │       │ updated_at       │
│ department       │       └────────┬─────────┘       └────────┬─────────┘
│ refresh_token    │                │                          │
│ created_at       │                │ 1:N                      │ 1:N
│ updated_at       │                │                          │
└────────┬─────────┘                │                          │
         │                          ▼                          ▼
         │              ┌───────────────────────────────────────────────┐
         │              │                    ASSETS                      │
         │ 1:N          ├───────────────────────────────────────────────┤
         │              │ id (PK)                                        │
         │              │ uuid                                           │
         ▼              │ name                                           │
┌────────────────┐      │ asset_tag (UNIQUE)                             │
│  Current       │      │ serial_number (UNIQUE)                         │
│  Holder        │◀─────│ category_id (FK) ─────────────────────────────┘
│  (1:N)         │      │ location_id (FK) ─────────────────────────────┘
└────────────────┘      │ current_holder_id (FK) ◀──────────────────────┘
                        │ status (ENUM)                                  │
                        │ purchase_date                                  │
                        │ price                                          │
                        │ warranty_expiry                                │
                        │ specifications (JSON)                          │
                        │ notes                                          │
                        │ created_at                                     │
                        │ updated_at                                     │
                        └───────────────────┬───────────────────────────┘
                                            │
                                            │ 1:N
                                            ▼
                        ┌───────────────────────────────────────────────┐
                        │                 TRANSACTIONS                   │
                        ├───────────────────────────────────────────────┤
                        │ id (PK)                                        │
                        │ uuid                                           │
                        │ asset_id (FK) ────────────────────────────────┘
                        │ user_id (FK) ─────▶ USERS (employee)          │
                        │ admin_id (FK) ────▶ USERS (processor)         │
                        │ action_type (ENUM)                             │
                        │ transaction_date                               │
                        │ condition_status                               │
                        │ notes                                          │
                        │ created_at                                     │
                        └───────────────────────────────────────────────┘
```

### 4.2 Detail Schema per Tabel

#### 📋 Tabel `users`
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    role ENUM('admin', 'staff', 'employee') DEFAULT 'employee',
    department VARCHAR(100) NULL,
    refresh_token TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_uuid (uuid),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
);
```

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `id` | INT | PK, Auto Increment | ID internal database |
| `uuid` | VARCHAR(36) | Unique, Not Null, Indexed | ID publik untuk API (UUIDv4) |
| `name` | VARCHAR(100) | Not Null | Nama lengkap user |
| `email` | VARCHAR(100) | Unique, Not Null, Indexed | Email untuk login |
| `password` | VARCHAR(255) | Nullable | Hash password (Argon2). Null jika employee tanpa akses |
| `role` | ENUM | Default 'employee' | Level akses: admin, staff, employee |
| `department` | VARCHAR(100) | Nullable | Departemen/divisi kerja |
| `refresh_token` | TEXT | Nullable | JWT refresh token untuk session |
| `created_at` | DATETIME | Default NOW | Timestamp pembuatan |
| `updated_at` | DATETIME | Auto Update | Timestamp update terakhir |

**Business Rules:**
- `admin`: Full CRUD access, manage users
- `staff`: CRUD assets & transactions, no user management
- `employee`: No login access (data only for asset assignment)

---

#### 📋 Tabel `categories`
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_categories_uuid (uuid),
    INDEX idx_categories_name (name)
);
```

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `id` | INT | PK, Auto Increment | ID internal |
| `uuid` | VARCHAR(36) | Unique, Not Null | ID publik |
| `name` | VARCHAR(100) | Not Null | Nama kategori (Laptop, Server, Monitor, dll) |
| `description` | TEXT | Nullable | Deskripsi kategori |
| `created_at` | DATETIME | Default NOW | Timestamp pembuatan |
| `updated_at` | DATETIME | Auto Update | Timestamp update |

**Sample Data:**
| name | description |
|------|-------------|
| Laptop | Komputer portabel untuk karyawan |
| Desktop | Komputer meja/workstation |
| Monitor | Layar display eksternal |
| Server | Server rack dan tower |
| Network Device | Router, Switch, Access Point |
| Printer | Printer dan scanner |
| Software License | Lisensi perangkat lunak |
| Peripheral | Mouse, keyboard, webcam, dll |

---

#### 📋 Tabel `locations`
```sql
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    address TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_locations_uuid (uuid),
    INDEX idx_locations_name (name)
);
```

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `id` | INT | PK, Auto Increment | ID internal |
| `uuid` | VARCHAR(36) | Unique, Not Null | ID publik |
| `name` | VARCHAR(100) | Not Null | Nama lokasi |
| `address` | TEXT | Nullable | Alamat lengkap lokasi |
| `created_at` | DATETIME | Default NOW | Timestamp pembuatan |
| `updated_at` | DATETIME | Auto Update | Timestamp update |

**Sample Data:**
| name | address |
|------|---------|
| HQ Server Room | Gedung A Lt. 2, Jakarta Pusat |
| IT Warehouse | Gedung B Lt. 1, Jakarta Pusat |
| Branch Office Bandung | Jl. Asia Afrika No. 123, Bandung |
| Branch Office Surabaya | Jl. Pemuda No. 456, Surabaya |

---

#### 📋 Tabel `assets`
```sql
CREATE TABLE assets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    asset_tag VARCHAR(50) NOT NULL UNIQUE,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    location_id INT NOT NULL,
    current_holder_id INT NULL,
    status ENUM('available', 'assigned', 'repair', 'retired', 'missing') DEFAULT 'available',
    purchase_date DATE NOT NULL,
    price DECIMAL(15,2) DEFAULT 0.00,
    warranty_expiry DATE NULL,
    specifications JSON NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_assets_uuid (uuid),
    INDEX idx_assets_asset_tag (asset_tag),
    INDEX idx_assets_serial_number (serial_number),
    INDEX idx_assets_status (status),
    INDEX idx_assets_category (category_id),
    INDEX idx_assets_location (location_id),
    INDEX idx_assets_holder (current_holder_id),
    FULLTEXT INDEX idx_assets_name_search (name),
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (current_holder_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);
```

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `id` | INT | PK, Auto Increment | ID internal |
| `uuid` | VARCHAR(36) | Unique, Not Null | ID publik |
| `name` | VARCHAR(150) | Not Null, Fulltext | Nama/model aset |
| `asset_tag` | VARCHAR(50) | Unique, Not Null | Kode barcode internal |
| `serial_number` | VARCHAR(100) | Unique, Not Null | Nomor seri pabrikan |
| `category_id` | INT | FK, Not Null | Referensi kategori |
| `location_id` | INT | FK, Not Null | Referensi lokasi penyimpanan |
| `current_holder_id` | INT | FK, Nullable | User pemegang saat ini |
| `status` | ENUM | Default 'available' | Status aset saat ini |
| `purchase_date` | DATE | Not Null | Tanggal pembelian |
| `price` | DECIMAL(15,2) | Default 0.00 | Harga perolehan |
| `warranty_expiry` | DATE | Nullable | Tanggal berakhir garansi |
| `specifications` | JSON | Nullable | Spesifikasi teknis fleksibel |
| `notes` | TEXT | Nullable | Catatan tambahan |
| `created_at` | DATETIME | Default NOW | Timestamp pembuatan |
| `updated_at` | DATETIME | Auto Update | Timestamp update |

**Status ENUM Values:**
| Status | Warna Badge | Deskripsi |
|--------|-------------|-----------|
| `available` | 🟢 Hijau | Tersedia di gudang, siap dipinjam |
| `assigned` | 🔵 Biru | Sedang digunakan/dipinjam karyawan |
| `repair` | 🟠 Orange | Dalam proses perbaikan |
| `retired` | 🔴 Merah | Dihapusbukukan/dijual/dibuang |
| `missing` | ⚫ Abu-abu | Dilaporkan hilang |

**Specifications JSON Example:**
```json
// Untuk Laptop
{
    "brand": "Apple",
    "model": "MacBook Pro 14 inch",
    "processor": "Apple M3 Pro",
    "ram": "18GB",
    "storage": "512GB SSD",
    "display": "14.2 inch Liquid Retina XDR"
}

// Untuk Monitor
{
    "brand": "Dell",
    "model": "U2722D",
    "size": "27 inch",
    "resolution": "2560x1440",
    "panel": "IPS"
}

// Untuk Software License
{
    "vendor": "Microsoft",
    "product": "Office 365 Business",
    "license_type": "Subscription",
    "seats": 1,
    "expiry_date": "2025-12-31"
}
```

---

#### 📋 Tabel `transactions`
```sql
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL UNIQUE,
    asset_id INT NOT NULL,
    user_id INT NULL,
    admin_id INT NOT NULL,
    action_type ENUM('checkout', 'checkin', 'repair_start', 'repair_complete', 'dispose', 'report_missing', 'found') NOT NULL,
    transaction_date DATETIME NOT NULL,
    condition_status ENUM('new', 'good', 'fair', 'damaged', 'lost') NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_transactions_uuid (uuid),
    INDEX idx_transactions_asset (asset_id),
    INDEX idx_transactions_user (user_id),
    INDEX idx_transactions_admin (admin_id),
    INDEX idx_transactions_action (action_type),
    INDEX idx_transactions_date (transaction_date),
    
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
```

| Kolom | Tipe Data | Constraint | Deskripsi |
|-------|-----------|------------|-----------|
| `id` | INT | PK, Auto Increment | ID internal |
| `uuid` | VARCHAR(36) | Unique, Not Null | ID publik |
| `asset_id` | INT | FK, Not Null | Aset yang terlibat |
| `user_id` | INT | FK, Nullable | Karyawan terkait (peminjam/pengembali) |
| `admin_id` | INT | FK, Not Null | Staff IT yang memproses |
| `action_type` | ENUM | Not Null | Jenis aksi transaksi |
| `transaction_date` | DATETIME | Not Null | Waktu transaksi |
| `condition_status` | ENUM | Nullable | Kondisi aset saat transaksi |
| `notes` | TEXT | Nullable | Catatan tambahan |
| `created_at` | DATETIME | Default NOW | Timestamp record |

**Action Type ENUM Values:**
| Action | Deskripsi | user_id Required |
|--------|-----------|------------------|
| `checkout` | Peminjaman aset ke karyawan | ✅ Yes |
| `checkin` | Pengembalian aset dari karyawan | ✅ Yes |
| `repair_start` | Kirim ke perbaikan | ❌ No |
| `repair_complete` | Selesai perbaikan | ❌ No |
| `dispose` | Penghapusan/disposal aset | ❌ No |
| `report_missing` | Lapor aset hilang | ✅ Yes (last holder) |
| `found` | Aset ditemukan kembali | ❌ No |

**Condition Status ENUM Values:**
| Status | Deskripsi |
|--------|-----------|
| `new` | Kondisi baru (masih segel) |
| `good` | Kondisi baik, berfungsi normal |
| `fair` | Kondisi cukup, ada bekas pakai minor |
| `damaged` | Rusak, perlu perbaikan |
| `lost` | Hilang/tidak ditemukan |

**Catatan Penting:**
- Tabel `transactions` bersifat **IMMUTABLE** (append-only)
- Tidak ada operasi UPDATE atau DELETE pada tabel ini
- Berfungsi sebagai audit trail yang tidak dapat diubah

---

### 4.3 Relasi Antar Tabel (Sequelize Associations)

```javascript
// models/index.js

import User from './UserModel.js';
import Category from './CategoryModel.js';
import Location from './LocationModel.js';
import Asset from './AssetModel.js';
import Transaction from './TransactionModel.js';

// ==========================================
// CATEGORY - ASSET (One-to-Many)
// ==========================================
Category.hasMany(Asset, {
    foreignKey: 'category_id',
    as: 'assets'
});
Asset.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

// ==========================================
// LOCATION - ASSET (One-to-Many)
// ==========================================
Location.hasMany(Asset, {
    foreignKey: 'location_id',
    as: 'assets'
});
Asset.belongsTo(Location, {
    foreignKey: 'location_id',
    as: 'location'
});

// ==========================================
// USER - ASSET (One-to-Many) - Current Holder
// ==========================================
User.hasMany(Asset, {
    foreignKey: 'current_holder_id',
    as: 'heldAssets'
});
Asset.belongsTo(User, {
    foreignKey: 'current_holder_id',
    as: 'holder'
});

// ==========================================
// ASSET - TRANSACTION (One-to-Many)
// ==========================================
Asset.hasMany(Transaction, {
    foreignKey: 'asset_id',
    as: 'transactions'
});
Transaction.belongsTo(Asset, {
    foreignKey: 'asset_id',
    as: 'asset'
});

// ==========================================
// USER - TRANSACTION (One-to-Many) - As Employee
// ==========================================
User.hasMany(Transaction, {
    foreignKey: 'user_id',
    as: 'employeeTransactions'
});
Transaction.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'employee'
});

// ==========================================
// USER - TRANSACTION (One-to-Many) - As Admin/Processor
// ==========================================
User.hasMany(Transaction, {
    foreignKey: 'admin_id',
    as: 'processedTransactions'
});
Transaction.belongsTo(User, {
    foreignKey: 'admin_id',
    as: 'processedBy'
});

export { User, Category, Location, Asset, Transaction };
```

---

### 4.4 State Machine - Valid State Transitions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ASSET STATUS STATE MACHINE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌─────────────┐                                                       │
│    │   [START]   │                                                       │
│    └──────┬──────┘                                                       │
│           │ create_asset                                                 │
│           ▼                                                              │
│    ┌─────────────┐         checkout          ┌─────────────┐            │
│    │  AVAILABLE  │ ─────────────────────────▶│  ASSIGNED   │            │
│    │   (idle)    │◀───────────────────────── │  (in use)   │            │
│    └──────┬──────┘    checkin (good/fair)    └──────┬──────┘            │
│           │                                         │                    │
│           │ repair_start                            │ checkin (damaged)  │
│           │                                         │ OR report_missing  │
│           ▼                                         ▼                    │
│    ┌─────────────┐                           ┌─────────────┐            │
│    │  IN REPAIR  │◀──────────────────────────│  IN REPAIR  │            │
│    │             │                           │             │            │
│    └──────┬──────┘                           └─────────────┘            │
│           │                                         │                    │
│           │ repair_complete                         │ report_missing     │
│           │         │                               ▼                    │
│           │         │                        ┌─────────────┐            │
│           │         │     found              │   MISSING   │            │
│           │         │  ┌─────────────────────│             │            │
│           ▼         ▼  ▼                     └──────┬──────┘            │
│    ┌─────────────┐                                  │                    │
│    │  AVAILABLE  │                                  │ dispose            │
│    └──────┬──────┘                                  │ (write-off)        │
│           │                                         │                    │
│           │ dispose                                 │                    │
│           │ (sale/recycle)                          │                    │
│           ▼                                         ▼                    │
│    ┌─────────────┐                           ┌─────────────┐            │
│    │   RETIRED   │◀──────────────────────────│   RETIRED   │            │
│    │  [TERMINAL] │                           │  [TERMINAL] │            │
│    └─────────────┘                           └─────────────┘            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Transition Rules Table:**

| Current Status | Action | New Status | Guard Condition |
|----------------|--------|------------|-----------------|
| - | create | `available` | Required fields valid |
| `available` | checkout | `assigned` | Valid employee selected |
| `available` | repair_start | `repair` | Damage notes provided |
| `available` | dispose | `retired` | Admin authorization |
| `assigned` | checkin (good/fair) | `available` | - |
| `assigned` | checkin (damaged) | `repair` | Damage notes required |
| `assigned` | report_missing | `missing` | Report notes required |
| `repair` | repair_complete | `available` | - |
| `repair` | dispose (BER) | `retired` | Admin authorization |
| `missing` | found | `available` | Location verified |
| `missing` | dispose | `retired` | Write-off authorized |

**Invalid Transitions (akan di-reject):**
- ❌ `assigned` → `checkout` (sudah dipinjam)
- ❌ `repair` → `checkout` (sedang diperbaiki)
- ❌ `retired` → any (status terminal)
- ❌ `missing` → `checkout` (belum ditemukan)

---

## 5. Detail Rencana Backend

### 5.1 Struktur Folder
```
backend/
├── config/
│   └── Database.js
├── controllers/
│   ├── AuthController.js
│   ├── UserController.js
│   ├── AssetController.js
│   ├── CategoryController.js
│   ├── LocationController.js
│   └── TransactionController.js
├── middleware/
│   ├── VerifyToken.js
│   ├── AuthorizeRole.js
│   └── Validation.js
├── models/
│   ├── index.js
│   ├── UserModel.js
│   ├── AssetModel.js
│   ├── CategoryModel.js
│   ├── LocationModel.js
│   └── TransactionModel.js
├── routes/
│   ├── AuthRoute.js
│   ├── UserRoute.js
│   ├── AssetRoute.js
│   ├── CategoryRoute.js
│   ├── LocationRoute.js
│   └── TransactionRoute.js
├── utils/
│   ├── responseHelper.js
│   └── validators.js
├── .env
├── .env.example
├── package.json
└── index.js
```

### 5.2 API Endpoints

#### Authentication
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| POST | `/api/auth/register` | Registrasi user baru | Admin |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/token` | Refresh access token | Public (Cookie) |
| DELETE | `/api/auth/logout` | Logout user | Authenticated |
| GET | `/api/auth/me` | Get current user info | Authenticated |

#### Users Management
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/users` | List semua users | Admin |
| GET | `/api/users/:id` | Detail user | Admin |
| POST | `/api/users` | Buat user baru | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Hapus user | Admin |
| GET | `/api/users/employees` | List employees (untuk dropdown) | Staff, Admin |

#### Categories Management
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/categories` | List semua kategori | Staff, Admin |
| GET | `/api/categories/:id` | Detail kategori | Staff, Admin |
| POST | `/api/categories` | Buat kategori baru | Admin |
| PUT | `/api/categories/:id` | Update kategori | Admin |
| DELETE | `/api/categories/:id` | Hapus kategori | Admin |

#### Locations Management
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/locations` | List semua lokasi | Staff, Admin |
| GET | `/api/locations/:id` | Detail lokasi | Staff, Admin |
| POST | `/api/locations` | Buat lokasi baru | Admin |
| PUT | `/api/locations/:id` | Update lokasi | Admin |
| DELETE | `/api/locations/:id` | Hapus lokasi | Admin |

#### Assets Management
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/assets` | List aset (+ search, filter, pagination) | Staff, Admin |
| GET | `/api/assets/:id` | Detail aset + history | Staff, Admin |
| POST | `/api/assets` | Buat aset baru | Staff, Admin |
| PUT | `/api/assets/:id` | Update aset | Staff, Admin |
| DELETE | `/api/assets/:id` | Hapus aset (soft delete) | Admin |
| GET | `/api/assets/stats` | Statistik aset untuk dashboard | Staff, Admin |

#### Transactions Management
| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| GET | `/api/transactions` | List semua transaksi | Staff, Admin |
| GET | `/api/transactions/:id` | Detail transaksi | Staff, Admin |
| POST | `/api/transactions/checkout` | Proses check-out aset | Staff, Admin |
| POST | `/api/transactions/checkin` | Proses check-in aset | Staff, Admin |
| POST | `/api/transactions/repair` | Kirim aset ke repair | Staff, Admin |
| POST | `/api/transactions/dispose` | Dispose aset | Admin |
| GET | `/api/transactions/asset/:assetId` | Riwayat transaksi per aset | Staff, Admin |

---

## 6. Detail Rencana Frontend

### 6.1 Struktur Folder
```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── Loading.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MainLayout.jsx
│   │   └── features/
│   │       ├── assets/
│   │       │   ├── AssetForm.jsx
│   │       │   ├── AssetCard.jsx
│   │       │   └── AssetStatusBadge.jsx
│   │       ├── transactions/
│   │       │   ├── CheckoutForm.jsx
│   │       │   ├── CheckinForm.jsx
│   │       │   └── TransactionHistory.jsx
│   │       └── dashboard/
│   │           ├── StatsCard.jsx
│   │           └── RecentTransactions.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useAssets.js
│   │   └── useFetch.js
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.jsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx
│   │   ├── assets/
│   │   │   ├── AssetList.jsx
│   │   │   ├── AssetDetail.jsx
│   │   │   ├── AddAsset.jsx
│   │   │   └── EditAsset.jsx
│   │   ├── transactions/
│   │   │   ├── TransactionList.jsx
│   │   │   ├── Checkout.jsx
│   │   │   └── Checkin.jsx
│   │   ├── master/
│   │   │   ├── categories/
│   │   │   │   ├── CategoryList.jsx
│   │   │   │   └── CategoryForm.jsx
│   │   │   ├── locations/
│   │   │   │   ├── LocationList.jsx
│   │   │   │   └── LocationForm.jsx
│   │   │   └── users/
│   │   │       ├── UserList.jsx
│   │   │       └── UserForm.jsx
│   │   └── NotFound.jsx
│   ├── routes/
│   │   ├── PrivateRoute.jsx
│   │   └── AppRoutes.jsx
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .env.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

### 6.2 Halaman & Fitur

#### 6.2.1 Halaman Login
- Form email & password
- Validasi input
- Remember me (opsional)
- Error handling & toast notification

#### 6.2.2 Dashboard
- Statistik ringkasan:
  - Total Aset
  - Aset Tersedia
  - Aset Dipinjam
  - Aset Dalam Perbaikan
- Chart distribusi aset per kategori
- Tabel transaksi terakhir
- Quick actions (Add Asset, Checkout, Checkin)

#### 6.2.3 Manajemen Aset
- Tabel daftar aset dengan:
  - Search (nama, serial number, asset tag)
  - Filter (kategori, lokasi, status)
  - Sorting
  - Pagination
- CRUD Operations:
  - Tambah aset baru
  - Edit aset
  - Lihat detail aset + riwayat
  - Hapus aset (Admin only)
- Status badge dengan warna:
  - 🟢 Available (Hijau)
  - 🔵 Assigned (Biru)
  - 🟠 In Repair (Orange)
  - 🔴 Retired (Merah)
  - ⚫ Missing (Abu-abu)

#### 6.2.4 Transaksi
- Form Check-out:
  - Pilih aset (hanya status Available)
  - Pilih karyawan penerima
  - Tanggal serah terima
  - Catatan kondisi awal
- Form Check-in:
  - Pilih aset yang dipinjam
  - Pilih kondisi pengembalian (Good/Damaged/Lost)
  - Catatan
- Riwayat transaksi dengan filter

#### 6.2.5 Master Data
- CRUD Categories
- CRUD Locations
- CRUD Users (Admin only)

### 6.3 Komponen Reusable

| Komponen | Deskripsi |
|----------|-----------|
| `Button` | Tombol dengan variants (primary, secondary, danger, outline) |
| `Input` | Input field dengan label, error message, icon |
| `Select` | Dropdown select dengan search |
| `Modal` | Dialog modal untuk konfirmasi & form |
| `Badge` | Status badge dengan warna |
| `Card` | Card container untuk stats |
| `Table` | Tabel dengan sorting & selection |
| `Pagination` | Navigasi halaman |
| `SearchBar` | Input pencarian dengan debounce |
| `Loading` | Spinner & skeleton loading |

---

## 7. Checklist Progress Tracking

### 📦 Fase 1: Setup & Infrastruktur ✅ COMPLETED (4 Desember 2025)

#### Backend Setup
- [x] Inisialisasi project Node.js (`npm init`)
- [x] Install dependencies backend
- [x] Setup struktur folder backend
- [x] Konfigurasi `.env` dan `.env.example`
- [x] Setup database connection (`config/Database.js`)
- [x] Test koneksi database
- [x] Setup entry point (`index.js`) dengan Express

#### Frontend Setup
- [x] Inisialisasi project React dengan Vite
- [x] Install dependencies frontend
- [x] Setup Tailwind CSS
- [x] Setup struktur folder frontend
- [x] Konfigurasi `.env` dan `.env.example`
- [x] Setup routing dasar dengan React Router

**📝 Catatan Phase 1:**
- Backend: Express server siap di port 5000
- Frontend: React + Vite siap di port 5173
- Struktur folder lengkap untuk backend & frontend
- Middleware dasar (VerifyToken, AuthorizeRole) sudah dibuat
- Axios interceptor untuk refresh token sudah dikonfigurasi
- Layout components (Sidebar, Navbar, MainLayout) sudah dibuat
- AuthContext untuk state management sudah tersedia

---

### 🔧 Fase 2: Backend Development ✅ COMPLETED

#### Models (Database Schema) ✅
- [x] Buat `UserModel.js`
- [x] Buat `CategoryModel.js`
- [x] Buat `LocationModel.js`
- [x] Buat `AssetModel.js`
- [x] Buat `TransactionModel.js`
- [x] Definisikan relasi antar model di `models/index.js`
- [x] Buat seeder untuk data awal (`seeders/seed.js`)

#### Authentication Module ✅
- [x] Implementasi `AuthController.js`
  - [x] Register function
  - [x] Login function (generate JWT + refresh token)
  - [x] Refresh token function
  - [x] Logout function
  - [x] Get current user function
- [x] Implementasi `VerifyToken.js` middleware
- [x] Implementasi `AuthorizeRole.js` middleware
- [x] Buat `AuthRoutes.js`

#### Users Module ✅
- [x] Implementasi `UserController.js`
  - [x] Get all users (with pagination & search)
  - [x] Get user by ID
  - [x] Create user
  - [x] Update user
  - [x] Delete user (soft delete)
  - [x] Change password
- [x] Buat `UserRoutes.js`

#### Categories Module ✅
- [x] Implementasi `CategoryController.js`
  - [x] Get all categories
  - [x] Get category by ID
  - [x] Create category
  - [x] Update category
  - [x] Delete category
- [x] Buat `CategoryRoutes.js`

#### Locations Module ✅
- [x] Implementasi `LocationController.js`
  - [x] Get all locations
  - [x] Get location by ID
  - [x] Create location
  - [x] Update location
  - [x] Delete location
  - [x] Get buildings list
- [x] Buat `LocationRoutes.js`

#### Assets Module ✅
- [x] Implementasi `AssetController.js`
  - [x] Get all assets (with search, filter, pagination)
  - [x] Get asset by ID (with transaction history)
  - [x] Create asset (with auto-generate code)
  - [x] Update asset
  - [x] Delete asset (only disposed)
  - [x] Get asset statistics
  - [x] Generate asset code preview
- [x] Buat `AssetRoutes.js`

#### Transactions Module ✅
- [x] Implementasi `TransactionController.js`
  - [x] Get all transactions
  - [x] Get transaction by ID
  - [x] Checkout asset
  - [x] Checkin asset
  - [x] Send to repair
  - [x] Complete repair
  - [x] Dispose asset
  - [x] Relocate asset
  - [x] Get transactions by asset ID
- [x] Implementasi State Machine logic (VALID_TRANSITIONS)
- [x] Buat `TransactionRoutes.js`

#### Routes & Utilities ✅
- [x] Buat `routes/index.js` untuk register semua routes
- [x] `responseHelper.js` sudah tersedia dari Phase 1
- [x] `constants.js` sudah tersedia dari Phase 1
- [x] Update `index.js` untuk integrasi routes & models

**📋 Fase 2 Completion Notes (4 Des 2025):**
- Semua Models dengan validasi lengkap
- Semua Controllers dengan full CRUD operations
- Semua Routes dengan middleware (auth & role)
- Database seeder untuk data awal
- State machine untuk asset status transitions

---

### 🎨 Fase 3: Frontend Development 🔄 IN PROGRESS

#### Base Setup & Layout ✅
- [x] Setup Axios instance dengan interceptor _(done in Phase 1)_
- [x] Implementasi `AuthContext.jsx` _(done in Phase 1)_
- [x] Buat komponen `Sidebar.jsx` _(done in Phase 1)_
- [x] Buat komponen `Navbar.jsx` _(done in Phase 1)_
- [x] Buat komponen `MainLayout.jsx` _(done in Phase 1)_
- [x] Setup `PrivateRoute.jsx` _(done in Phase 1)_
- [x] Setup `AppRoutes.jsx` _(done in Phase 1)_

#### Common Components ✅
- [x] Buat komponen `Button.jsx`
- [x] Buat komponen `Input.jsx`
- [x] Buat komponen `Select.jsx`
- [x] Buat komponen `Textarea.jsx`
- [x] Buat komponen `Modal.jsx`
- [x] Buat komponen `ConfirmDialog.jsx`
- [x] Buat komponen `Badge.jsx` (termasuk AssetStatusBadge, TransactionTypeBadge, UserRoleBadge)
- [x] Buat komponen `Card.jsx` (termasuk StatsCard)
- [x] Buat komponen `Table.jsx`
- [x] Buat komponen `Pagination.jsx`
- [x] Buat komponen `SearchBar.jsx`
- [x] Buat komponen `Loading.jsx` (Spinner, PageLoading, ContentLoading, Skeleton)
- [x] Buat komponen `EmptyState.jsx`
- [x] Buat `components/common/index.js` untuk export

#### API Services ✅
- [x] Buat `api/authAPI.js` - Authentication API calls
- [x] Buat `api/userAPI.js` - User management API calls
- [x] Buat `api/categoryAPI.js` - Category API calls
- [x] Buat `api/locationAPI.js` - Location API calls
- [x] Buat `api/assetAPI.js` - Asset management API calls
- [x] Buat `api/transactionAPI.js` - Transaction API calls
- [x] Buat `api/index.js` untuk central export

#### Utilities ✅
- [x] Buat `utils/formatters.js` - Format currency, date, number, dll
- [x] Buat `utils/index.js` untuk export

#### Authentication Pages ✅
- [x] Implementasi halaman `Login.jsx`
- [x] Implementasi login logic dengan AuthContext
- [x] Implementasi protected routes
- [x] Test flow login/logout

#### Dashboard ✅
- [x] Implementasi halaman `Dashboard.jsx`
- [x] Buat komponen `StatsCard.jsx` (integrated in Card.jsx)
- [x] Buat komponen `RecentTransactions.jsx` (in Dashboard)
- [x] Integrasi dengan API stats
- [x] Quick action buttons

#### Assets Management ✅
- [x] Implementasi halaman `AssetList.jsx`
  - [x] Tabel dengan data dari API
  - [x] Fitur search
  - [x] Fitur filter (kategori, lokasi, status, kondisi)
  - [x] Pagination
  - [x] Action buttons (View, Edit, Delete)
- [x] Implementasi halaman `AssetForm.jsx` (Add/Edit combined)
  - [x] Form input aset dengan semua fields
  - [x] Validasi form
  - [x] Auto-generate asset code
  - [x] Submit ke API (create/update)
- [x] Implementasi halaman `AssetDetail.jsx`
  - [x] Detail informasi aset
  - [x] Riwayat transaksi
  - [x] Quick action buttons
  - [x] Warranty alert
- [x] Buat `pages/assets/index.js` untuk export

#### Transactions ✅
- [x] Implementasi halaman `TransactionList.jsx`
  - [x] Tabel transaksi dengan data API
  - [x] Fitur search dan filter
  - [x] Pagination
- [x] Implementasi halaman `CheckoutForm.jsx`
  - [x] Asset selection (search & select)
  - [x] Employee dropdown
  - [x] Notes dan expected return date
- [x] Implementasi halaman `CheckinForm.jsx`
  - [x] Asset selection (In Use assets)
  - [x] Condition selection
  - [x] Notes
- [x] Implementasi halaman `RepairForm.jsx`
  - [x] Asset selection
  - [x] Repair vendor & estimated cost
  - [x] Notes (damage description)
- [x] Implementasi halaman `RelocateForm.jsx`
  - [x] Asset selection
  - [x] New location selection
  - [x] Notes
- [x] Buat `pages/transactions/index.js` untuk export

#### Master Data Management ✅
- [x] Implementasi `CategoryList.jsx`
  - [x] Table dengan CRUD operations
  - [x] Modal form Add/Edit
  - [x] Delete confirmation
- [x] Implementasi `LocationList.jsx`
  - [x] Table dengan CRUD operations
  - [x] Modal form Add/Edit
  - [x] Delete confirmation
- [x] Implementasi `UserList.jsx`
  - [x] Table dengan CRUD operations
  - [x] Modal form Add/Edit (with role selection)
  - [x] Delete confirmation
  - [x] Admin-only access check
- [x] Buat `pages/masterdata/index.js` untuk export

#### Routes Integration ✅
- [x] Update `AppRoutes.jsx` dengan semua page imports
- [x] Configure all routes dengan PrivateRoute

#### Polish & UX (In Progress)
- [x] Toast notifications (via react-hot-toast)
- [x] Loading states (ContentLoading component)
- [x] Empty states (EmptyState component)
- [ ] Error boundary implementation
- [x] Responsive design (Tailwind responsive classes)
- [x] Halaman `NotFound.jsx` (404)

**📋 Fase 3 Progress Notes (4 Des 2025):**
- Semua common components selesai ✅
- Semua API services selesai ✅
- Semua utility functions selesai ✅
- Dashboard dengan integrasi API selesai ✅
- Assets Management (List, Form, Detail) selesai ✅
- Transactions (List, Checkout, Checkin, Repair, Relocate) selesai ✅
- Master Data (Categories, Locations, Users) selesai ✅
- Routes integration selesai ✅

---

### 🧪 Fase 4: Testing & Integration

#### Backend Testing
- [ ] Test semua endpoint dengan berbagai skenario
- [ ] Test validasi input
- [ ] Test authentication & authorization
- [ ] Test state machine transitions
- [ ] Test database transactions (rollback scenarios)

#### Frontend Testing
- [ ] Test semua halaman tampil dengan benar
- [ ] Test form validations
- [ ] Test error handling dari API
- [ ] Test responsive design di berbagai ukuran layar

#### Integration Testing
- [ ] Test flow lengkap: Login → Add Asset → Checkout → Checkin
- [ ] Test flow: Login → View Dashboard → Filter Assets
- [ ] Test concurrent operations
- [ ] Test refresh token mechanism

#### Security Testing
- [ ] Test akses endpoint tanpa token
- [ ] Test akses endpoint dengan role tidak sesuai
- [ ] Test SQL injection pada input
- [ ] Verifikasi HttpOnly cookie pada refresh token

#### User Acceptance Testing (UAT)
- [ ] Siapkan data dummy yang realistis
- [ ] Test dengan user sebenarnya (jika memungkinkan)
- [ ] Dokumentasikan feedback
- [ ] Perbaiki issues yang ditemukan

---

### 📦 Fase 5: Deployment Preparation

- [ ] Optimasi kode backend (query optimization)
- [ ] Optimasi kode frontend (lazy loading, code splitting)
- [ ] Setup environment production
- [ ] Dokumentasi API (README/Postman Collection)
- [ ] Dokumentasi user manual
- [ ] Final review & approval

---

## 8. Timeline Estimasi

| Fase | Durasi | Target Selesai | Status |
|------|--------|----------------|--------|
| Fase 1: Setup & Infrastruktur | 2-3 hari | Week 1 | ✅ Completed (4 Des 2025) |
| Fase 2: Backend Development | 7-10 hari | Week 2-3 | ✅ Completed (4 Des 2025) |
| Fase 3: Frontend Development | 10-14 hari | Week 4-5 | 🔄 In Progress |
| Fase 4: Testing & Integration | 5-7 hari | Week 6 | ⏳ Pending |
| Fase 5: Deployment Preparation | 2-3 hari | Week 6 | ⏳ Pending |

**Total Estimasi**: 26-37 hari kerja (5-7 minggu)

---

## 9. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Perubahan requirement di tengah jalan | Delay timeline | Dokumentasi requirement yang jelas, approval sebelum coding |
| Kompleksitas state machine | Bug pada transisi status | Unit testing yang comprehensive |
| Performa query lambat | UX buruk | Indexing database, pagination, lazy loading |
| Security vulnerability | Data breach | Implementasi best practices (JWT, input validation, parameterized queries) |
| Integrasi frontend-backend tidak smooth | Delay | Definisi API contract yang jelas sejak awal |

---

## ✅ Approval Checkpoint

Sebelum memulai coding, pastikan hal-hal berikut sudah disetujui:

1. [ ] **Tech Stack** - Konfirmasi teknologi yang akan digunakan
2. [ ] **Database Schema** - Konfirmasi struktur tabel
3. [ ] **API Endpoints** - Konfirmasi daftar endpoint dan response format
4. [ ] **UI/UX Design** - Konfirmasi wireframe/mockup (jika ada)
5. [ ] **Timeline** - Konfirmasi target waktu pengerjaan
6. [ ] **Prioritas Fitur** - Konfirmasi fitur mana yang harus selesai duluan

---

**📝 Catatan:**
- Dokumen ini akan diupdate sesuai progress pengerjaan
- Checklist akan ditandai ✅ setelah item selesai
- Setiap fase memerlukan review sebelum lanjut ke fase berikutnya

---

*Dibuat berdasarkan: Perancangan Aplikasi Asset Management Lengkap.md*
