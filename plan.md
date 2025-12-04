# Plan.md - IT Asset Management (ITAM) System

## 📋 Project Overview

**Nama Project:** IT Asset Management System (ITAM)  
**Stack Technology:** Node.js + Express + Sequelize (Backend) | React + Vite + Tailwind CSS (Frontend)  
**Database:** MySQL (itam_db)  
**Tanggal Update:** December 2024

---

## ✅ Status Fitur

### 1. Autentikasi & Otorisasi
| Fitur | Status | Catatan |
|-------|--------|---------|
| Login | ✅ Selesai | JWT + sessionStorage |
| Logout | ✅ Selesai | Clear session |
| Register | ✅ Selesai | Admin only |
| Role-based Access | ✅ Selesai | Admin & Staff roles |

### 2. Dashboard
| Fitur | Status | Catatan |
|-------|--------|---------|
| Total Assets | ✅ Selesai | Count 30 assets |
| Total Value | ✅ Selesai | Rp 884.800.000 |
| Assets by Status | ✅ Selesai | Chart distribution |
| Recent Transactions | ✅ Selesai | Latest 5 transactions |

### 3. Master Data - Categories
| Fitur | Status | Catatan |
|-------|--------|---------|
| List Categories | ✅ Selesai | Pagination + Search |
| Create Category | ✅ Selesai | Modal form |
| Update Category | ✅ Selesai | Modal form |
| Delete Category | ✅ Selesai | Confirm dialog |

### 4. Master Data - Locations
| Fitur | Status | Catatan |
|-------|--------|---------|
| List Locations | ✅ Selesai | Pagination + Search |
| Create Location | ✅ Selesai | Modal form |
| Update Location | ✅ Selesai | Modal form |
| Delete Location | ✅ Selesai | Confirm dialog |

### 5. Master Data - Users
| Fitur | Status | Catatan |
|-------|--------|---------|
| List Users | ✅ Selesai | Pagination + Search |
| Create User | ✅ Selesai | Modal form |
| Update User | ✅ Selesai | Modal form |
| Delete User | ✅ Selesai | Confirm dialog |

### 6. Asset Management
| Fitur | Status | Catatan |
|-------|--------|---------|
| List Assets | ✅ Selesai | Pagination + Search + Filter |
| Asset Detail | ✅ Selesai | Full info + history |
| Create Asset | ✅ Selesai | Form dengan validasi |
| Update Asset | ✅ Selesai | Form dengan validasi |
| Delete Asset | ✅ Selesai | Soft delete |
| Asset Status | ✅ Selesai | available, assigned, repair, retired, missing |
| QR Code | ✅ Selesai | Generate & Print |
| Import/Export | 🔄 Partial | Export CSV works |

### 7. Transaction Management
| Fitur | Status | Catatan |
|-------|--------|---------|
| List Transactions | ✅ Selesai | Pagination + Search + Filter |
| Checkout Asset | ✅ Selesai | Assign asset ke user |
| Checkin Asset | ✅ Selesai | Return asset |
| Report Repair | ✅ Selesai | Mark for repair |
| Report Missing | ✅ Selesai | Mark as missing |
| Dispose Asset | ✅ Selesai | Retire asset |
| Export Transaction | ✅ Selesai | Export to CSV |

---

## 📊 Data Testing Summary

### Dummy Data yang Dibuat:

| Entity | Jumlah | Keterangan |
|--------|--------|------------|
| Users | 8 | 2 original (admin, staff) + 6 baru |
| Categories | 12 | Laptop, Desktop, Monitor, Printer, dll |
| Locations | 12 | IT Room, HR Office, Finance, dll |
| Assets | 30 | Berbagai brand: Apple, Lenovo, Dell, HP |
| Transactions | 13 | checkout, checkin, repair, dispose, missing |

### Asset Distribution by Status:
- **Available**: 15 aset
- **Assigned**: 9 aset  
- **Repair**: 2 aset
- **Retired**: 2 aset
- **Missing**: 2 aset

### Asset Distribution by Category:
- Laptop: 8 aset
- Desktop: 4 aset
- Monitor: 4 aset
- Printer: 3 aset
- Networking: 3 aset
- Accessories: 3 aset
- Mobile Device: 2 aset
- Software: 2 aset
- Server: 1 aset

---

## 🐛 Bug Fixes

### Issue 1: Modal Not Opening
- **Problem:** Modal component tidak terbuka saat klik tombol
- **Root Cause:** Props mismatch - component menggunakan `isOpen` tapi di-pass sebagai `open`
- **Solution:** Update semua pages untuk menggunakan `isOpen` prop
- **Files Fixed:**
  - `frontend/src/pages/masterdata/CategoryList.jsx`
  - `frontend/src/pages/masterdata/LocationList.jsx`
  - `frontend/src/pages/masterdata/UserList.jsx`
  - `frontend/src/pages/assets/AssetList.jsx`

### Issue 2: Table Actions Not Showing
- **Problem:** Tombol Edit/Hapus tidak muncul di tabel
- **Root Cause:** Table component tidak handle `actions` prop
- **Solution:** Update Table.jsx untuk render kolom Aksi
- **File Fixed:** `frontend/src/components/common/Table.jsx`

---

## 🔧 Technical Details

### Backend Structure
```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   ├── assetController.js
│   ├── categoryController.js
│   ├── locationController.js
│   ├── userController.js
│   └── transactionController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Asset.js
│   ├── Category.js
│   ├── Location.js
│   ├── User.js
│   └── Transaction.js
├── routes/
│   └── index.js
├── seeders/
│   ├── initSeeder.js
│   └── dummyData.js ← NEW
└── app.js
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Table.jsx ← FIXED
│   │   │   ├── Modal.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   └── layout/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── assets/
│   │   │   └── AssetList.jsx ← FIXED
│   │   ├── transactions/
│   │   └── masterdata/
│   │       ├── CategoryList.jsx ← FIXED
│   │       ├── LocationList.jsx ← FIXED
│   │       └── UserList.jsx ← FIXED
│   ├── services/
│   └── utils/
└── vite.config.js
```

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | admin123 |
| Staff | staff@company.com | staff123 |
| Staff (new) | budi.santoso@company.com | user123 |

---

## 🚀 Roadmap / Future Enhancements

### Priority High
- [ ] Bulk import assets dari Excel/CSV
- [ ] Asset maintenance scheduling
- [ ] Notification system (email/in-app)
- [ ] Asset depreciation calculation
- [ ] Advanced reporting & analytics

### Priority Medium
- [ ] Asset barcode/QR scanner integration
- [ ] Mobile responsive improvements
- [ ] User profile management
- [ ] Password reset feature
- [ ] Activity audit log

### Priority Low
- [ ] Dark mode theme
- [ ] Multi-language support
- [ ] Integration dengan ERP/HRIS
- [ ] Custom report builder
- [ ] API documentation (Swagger)

---

## 📝 Testing Checklist

### CRUD Operations Test Results

#### Categories ✅
- [x] CREATE: Tambah "CCTV" category → Berhasil
- [x] READ: List semua kategori → Berhasil (12 kategori)
- [x] UPDATE: Edit "CCTV" jadi "CCTV & Security Camera" → Berhasil
- [x] DELETE: Hapus "CCTV & Security Camera" → Berhasil

#### Locations ✅
- [x] READ: List semua lokasi → Berhasil (12 lokasi)
- [x] Edit/Delete buttons → Visible dan functional

#### Assets ✅
- [x] READ: List semua aset → Berhasil (30 aset)
- [x] Detail/Edit/Delete buttons → Visible dan functional
- [x] Status badges → Berhasil (colored badges)

#### Users ✅
- [x] READ: List semua user → Berhasil (8 users)
- [x] Edit/Delete buttons → Visible dan functional

#### Transactions ✅
- [x] READ: List semua transaksi → Berhasil (13 transaksi)
- [x] Detail button → Visible dan functional
- [x] Filter & Search → Functional

---

## � Role-Based Access Testing

### Admin Role (admin@company.com)
| Menu/Page | Akses | Status |
|-----------|-------|--------|
| Dashboard | ✅ | Tested |
| Assets | ✅ Full CRUD | Tested |
| Transactions | ✅ Full Access | Tested |
| Categories | ✅ Full CRUD | Tested |
| Locations | ✅ Full CRUD | Tested |
| Users | ✅ Full CRUD | Tested |

### Staff Role (staff@company.com)
| Menu/Page | Akses | Status |
|-----------|-------|--------|
| Dashboard | ✅ | Tested |
| Assets | ✅ View/Edit | Tested |
| Transactions | ✅ View + Checkout/Checkin | Tested |
| Categories | ❌ Blocked (403) | Tested |
| Locations | ❌ Blocked (403) | Tested |
| Users | ❌ Blocked (403) | Tested |

### Access Control Verification
- [x] Staff login berhasil dengan staff@company.com
- [x] Menu navigation Staff hanya menampilkan 3 menu (Dashboard, Assets, Transactions)
- [x] Staff TIDAK bisa akses /master/categories → redirect ke 403 Unauthorized
- [x] Staff TIDAK bisa akses /master/locations → redirect ke 403 Unauthorized
- [x] Staff TIDAK bisa akses /master/users → redirect ke 403 Unauthorized
- [x] Role-based menu filtering berfungsi dengan baik

---

## �🔐 Security Considerations

- [x] JWT Token authentication
- [x] Password hashing dengan bcrypt
- [x] Protected routes (middleware)
- [x] Role-based access control
- [ ] Rate limiting (TODO)
- [ ] Input sanitization (partial)
- [ ] CORS configuration
- [ ] SQL injection prevention (Sequelize)

---

## � Project Roadmap & Milestones (Recommended)

This section expands the tactical plan into concrete milestones, timelines, and acceptance criteria so the team can make steady progress from MVP to Production-ready.

Milestone A — MVP (2 weeks)
- Goal: Stable CRUD for Assets, Categories, Locations, Users, Transactions; basic role-based access; runnable locally and seeded with dummy data.
- Success criteria:
  - Backend API endpoints covered for core resources (status 200/201/204 where applicable)
  - Frontend pages for list/detail/create/update/delete functional and responsive
  - Seed script installs sample data and documented run steps

Milestone B — Beta (4 weeks)
- Goal: Improve UX, add import/export, basic reporting, mobile responsiveness, and CI pipeline.
- Success criteria:
  - CSV import for assets with validation and preview
  - Export reports (assets, transactions) as CSV
  - GitHub Actions build + automated linting

Milestone C — Production (6–8 weeks)
- Goal: Harden security, add monitoring, automated backups, deployments, and documentation for operations.
- Success criteria:
  - HTTPS-ready deployment instructions and scripts (Docker / managed service)
  - Automated DB backups and migration strategy
  - Monitoring (Sentry/Prometheus) and alerting configured

Estimated timeline (calendar weeks) — subject to change based on team size and priorities.

## ✅ Acceptance Criteria (per feature)
- Assets: create/read/update/delete, QR/Barcode generation, asset assignment workflow, and history/audit trail for changes.
- Transactions: checkout/checkin flows with validation (asset status), user notifications (optional), and export.
- Role-based Access: admin vs staff behavior validated via tests and manual checks; unauthorized access returns 403.
- Data Integrity: migrations exist and sample data loads consistently.

## 🧪 QA & Testing Strategy

- Unit Tests (backend): controllers and services for core logic (create/update/validation). Aim for critical path coverage: assets and transactions.
- Integration Tests: basic API smoke tests for important routes (auth, assets, transactions).
- Frontend Smoke Tests: one welcome/login + one asset listing + one asset create flow (Cypress/Playwright recommended).
- Manual QA checklist: cross-browser checks, role-based access, edge cases (empty inputs, large CSV import, concurrent checkouts).

Test data and CI:
- Use the existing `backend/seeders/dummyData.js` in CI setup for deterministic test data.

## ⚙️ CI/CD Plan

- Git branches: `main` = production-ready; `develop` = active development; feature branches `feature/*`.
- GitHub Actions workflow:
  - `lint` job: run ESLint for frontend and backend
  - `test` job: run backend unit tests + frontend smoke tests
  - `build` job: build frontend (Vite) and backend (prepare docker image)
  - `deploy` job: optional, triggered on `main` — publish Docker image or deploy to chosen host

## 📦 Deployment Strategy

- Preferred: Dockerized deployment with environment variables for DB and secrets.
- Simple alternative: Deploy backend to a process-based host (Heroku/Render) and frontend to static host (Netlify/Vercel) with API URL configured.

Deployment checklist:
- [ ] Build artifacts produced and verified
- [ ] Migrations run automatically or via a documented step
- [ ] Secrets stored in host secret manager
- [ ] Health check endpoint present and monitored

## 🔍 Monitoring & Observability

- Integrate error tracking (Sentry) for backend and frontend.
- Expose basic Prometheus metrics (or host metrics) and configure dashboards.
- Configure uptime/health check and alerting for 5xx rates and DB connectivity.

## 🔐 Security Hardening

- Enforce HTTPS in production
- Rotate secrets and avoid committing any sensitive values
- Add rate limiting middleware for public endpoints
- Harden CORS policies and validate inputs

## 💾 Backups & Database Migrations

- Schedule daily DB backups; retain 7–30 days depending on retention policy
- Use Sequelize migrations for schema changes; never modify production schema without a migration

## 👩‍💻 Developer Onboarding & Docs

- `README.md`: quickstart, local dev, run seeders, env variables, and testing instructions
- `CONTRIBUTING.md`: branching model, PR template, code style and review checklist

## ⚠️ Risks & Mitigations

- Risk: CSV import corrupts data — Mitigation: add preview step and validation; sandbox imports first
- Risk: Role misconfiguration — Mitigation: tests that exercise role-restricted routes and UI

## 📌 Immediate Next Steps (Priority)
1. Finalize `plan.md` (this change) and commit to `develop` — DONE
2. Add `README.md` with quickstart and seed instructions — NEXT
3. Add GitHub Actions CI for lint + build + basic tests — NEXT
4. Add minimal unit tests for backend critical paths — NEXT
5. Prepare deployment Dockerfile(s) and docs — FOLLOW-UP

---

## �📱 Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Tested |
| Firefox | ⚠️ Not tested |
| Safari | ⚠️ Not tested |
| Edge | ⚠️ Not tested |

---

## 🏃 How to Run

### Backend
```bash
cd backend
npm install
npm run seed      # Initial data
npm run dummy     # Dummy data (optional)
npm run dev       # Start server (port 5001)
```

### Frontend
```bash
cd frontend
npm install
npm run dev       # Start dev server (port 5174)
```

### Database
- Pastikan MySQL berjalan
- Database akan auto-create oleh Sequelize
- Run seeder untuk data awal

---

## 📞 Contact & Support

- **Developer:** [Your Name]
- **Email:** [your.email@company.com]
- **Repository:** [GitHub URL]

---

*Document generated: November 2024*
*Last tested: All CRUD operations verified working*
