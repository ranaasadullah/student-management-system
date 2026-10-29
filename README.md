# Rollcall – Student Management System (MERN)

Full stack student management app built with **React (Vite), Node.js, Express and MongoDB**.
Light green theme, responsive layout, JWT authentication and role-based access.

## Features
- **Auth:** register, login, logout (JWT, passwords hashed with bcrypt)
- **Roles:** the first registered account becomes **Admin**; later accounts are **User**
  - Admin: add, edit, view, search and **delete** students
  - User: add, edit, view and search students
- **Students:** add, edit, delete, search, view details, course filter
- **Dashboard:** total students, new this week, courses, average per course, recent registrations, students-by-course chart, search bar
- **Pagination** (server-side, 8 per page)
- **UI:** responsive, form validation (client + server), loading spinners and skeleton rows, toasts, delete confirmation

## Requirements
Node.js 18+ and MongoDB (local install or a MongoDB Atlas connection string).

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
# edit .env: set MONGO_URI and a long random JWT_SECRET
npm run dev
```
API runs at http://localhost:5000

### 2. Frontend (new terminal)
```bash
cd client
npm install
npm run dev
```
App runs at http://localhost:5173 (requests to `/api` are proxied to the backend).

### 3. Use it
Open http://localhost:5173, click **Create an account** — this first account is the Admin.

## Production (single server)
```bash
cd client && npm run build
cd ../server && NODE_ENV=production npm start
```
Express then serves the built React app and the API on one port.

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | public |
| POST | /api/auth/login | public |
| GET | /api/auth/me | logged in |
| GET | /api/students?search=&course=&page=&limit= | logged in |
| GET | /api/students/stats | logged in |
| GET | /api/students/courses | logged in |
| GET | /api/students/:id | logged in |
| POST | /api/students | logged in |
| PUT | /api/students/:id | logged in |
| DELETE | /api/students/:id | admin only |

## Structure
```
server/  models, routes, middleware, server.js
client/  src/pages, src/components, AuthContext.jsx, api.js, styles.css
```
