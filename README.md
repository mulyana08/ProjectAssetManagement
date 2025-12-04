# ProjectAssetManagement

IT Asset Management System (ITAM) — Full-stack sample app built with Node.js/Express/Sequelize (backend) and React + Vite + Tailwind (frontend). Includes role-based access (Admin / Staff), seeders for dummy data and basic CRUD for assets, categories, locations, users, and transactions.

## Quickstart (local)

Prereqs: Node.js (18+), npm, MySQL

1. Start MySQL and create a database (or set credentials in `.env`).
2. Backend

```bash
cd backend
npm install
# copy .env.example to .env and edit DB credentials
npm run seed    # create initial data
npm run dev     # start backend on port 5001
```

3. Frontend

```bash
cd frontend
npm install
npm run dev     # start frontend on port 5174
```

4. Login
- Admin: `admin@company.com` / `admin123`
- Staff: `staff@company.com` / `staff123`

## Project structure
- `backend/` — Express API, Sequelize models, seeders
- `frontend/` — React app (Vite + Tailwind)
- `doc/` — design and testing docs

## CI
GitHub Actions workflow (frontend lint & build, backend test placeholder) is included at `.github/workflows/ci.yml`.

## Next steps
- Add unit & integration tests
- Add Dockerfiles and deployment docs
- Harden security and monitoring

---
Generated: December 2025
