# Secure Dashboard (React + Node + MongoDB, microservices)

Local-only demo with two backend microservices and a React frontend:
- `auth-service` (signup/login, password hashing, JWT issuance)
- `user-service` (protected profile/dashboard data, JWT verification)
- `frontend` (React + Vite UI with protected dashboard)

Passwords are hashed with bcrypt, JWTs expire in 1 hour, and CORS is restricted to `http://localhost:5173` by default.

## Tech Stack
- React + Vite for the UI.
- Node.js + Express for each microservice.
- MongoDB Atlas for persistence.
- Mongoose ODM.
- bcryptjs for password hashing.
- jsonwebtoken for stateless auth between services.

## Architecture
- Each feature is isolated per service to reduce blast radius.
- Shared datastore: MongoDB `users` collection; both services use the same connection string and `JWT_SECRET`.
- `auth-service` (port 4000): `POST /api/auth/signup`, `POST /api/auth/login`, `GET /health`.
- `user-service` (port 4001): `GET /api/users/me` (JWT required in `Authorization: Bearer <token>`), `GET /health`.
- Frontend (port 5173) calls the two services directly via environment-configurable base URLs.

## Troubleshooting: npm not recognized

If you see `npm : The term 'npm' is not recognized`, Node.js isn't in your PATH.

**Quick fix (current session only):**
```powershell
$env:Path = "$env:Path;C:\Program Files\nodejs"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**Or use the setup script:**
```powershell
.\setup-env.ps1
```

**Permanent fix:**
1. Open "Environment Variables" (search in Windows Start menu)
2. Under "System variables", find `Path` and click "Edit"
3. Click "New" and add: `C:\Program Files\nodejs`
4. Click "OK" on all dialogs
5. Close and reopen your terminal

## Setup
1) Install dependencies
```
# auth-service
cd backend/auth-service
npm install

# user-service
cd ../user-service
npm install

# frontend
cd ../../frontend
npm install
```

2) Environment variables  
Copy the examples and fill in values (use the same `JWT_SECRET` for both services and a MongoDB Atlas URI):
```
# in backend/auth-service/.env (copy from env.example)
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/authdb?retryWrites=true&w=majority
JWT_SECRET=<strong-secret>
ALLOW_ORIGIN=http://localhost:5173

# in backend/user-service/.env (copy from env.example)
PORT=4001
MONGO_URI=<same as above>
JWT_SECRET=<same as above>
ALLOW_ORIGIN=http://localhost:5173

# in frontend/.env (copy from env.example)
VITE_AUTH_URL=http://localhost:4000
VITE_USER_URL=http://localhost:4001
```

3) Run services (separate terminals)
```
cd backend/auth-service && npm run dev
cd backend/user-service && npm run dev
cd frontend && npm run dev
```
Frontend dev server will print the local URL (defaults to http://localhost:5173).

## Seeding dummy users
With MongoDB Atlas credentials in place:
```
cd backend/auth-service
npm run seed
```
Seeded accounts (all passwords `Password123!`):
- demo@example.com
- alice@example.com
- bob@example.com

## Manual testing guide
1) Signup flow: use the UI to register a new account; expect a success state and token storage.
2) Login flow: login with either a newly created account or a seeded user (`demo@example.com / Password123!`).
3) Protected dashboard: after login, the dashboard shows the user’s name/email; direct navigation without a token should fail (handled by API 401).
4) Cross-service token use: token issued by `auth-service` must be accepted by `user-service` for `/api/users/me`.

## Security notes
- Passwords hashed with bcrypt (12 rounds).
- JWTs signed with server-side `JWT_SECRET`, 1h expiration.
- CORS restricted to the frontend origin (configurable).
- Validation on required fields for signup/login; duplicate emails blocked.

## Project structure
```
backend/
  auth-service/
    src/server.js         # signup/login + JWT issuance
    src/seed.js           # dummy user seeding
    env.example
  user-service/
    src/server.js         # protected profile route
    env.example
frontend/
  src/App.jsx             # UI + auth/dashboard logic
  src/api.js              # API calls to both services
  env.example
```

## Notes
- Keep `JWT_SECRET` and `MONGO_URI` private; never commit `.env`.
- Both services share the same database and secret so tokens validate across services.
- Ports can be adjusted via env vars if they collide with existing processes.

