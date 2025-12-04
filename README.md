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

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Clone the repo
git clone https://github.com/mulyana08/ProjectAssetManagement.git
cd ProjectAssetManagement

# Start all services (MySQL, Backend, Frontend)
docker-compose up -d

# Wait for services to start, then seed the database
docker-compose exec backend npm run seed
```

Access the app at http://localhost (frontend) and API at http://localhost:5001

### Individual Docker Builds

**Backend:**
```bash
cd backend
docker build -t itam-backend .
docker run -p 5001:5000 --env-file .env itam-backend
```

**Frontend:**
```bash
cd frontend
docker build -t itam-frontend .
docker run -p 80:80 itam-frontend
```

### Environment Variables

Create a `.env` file in root or set these in docker-compose:

| Variable | Description | Default |
|----------|-------------|---------|
| DB_HOST | MySQL host | db |
| DB_PORT | MySQL port | 3306 |
| DB_NAME | Database name | itam_db |
| DB_USER | Database user | itam_user |
| DB_PASSWORD | Database password | itam_password |
| JWT_SECRET | JWT signing secret | (required) |
| CLIENT_URL | Frontend URL | http://localhost |

## Running Tests

```bash
# Backend tests
cd backend
npm install
npm test

# Frontend lint
cd frontend
npm install
npm run lint
```

## Next steps
- Add unit & integration tests
- Harden security and monitoring
- Set up production deployment (AWS/GCP/DigitalOcean)

---
Generated: December 2025
