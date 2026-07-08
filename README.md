# 🏨 Hostel Management System

Full-stack MERN application for managing hostel operations — students, rooms, payments, complaints, staff, and more.

## Tech Stack

**Frontend:** React 19 + Vite + Tailwind CSS v4 + daisyUI 5  
**Backend:** Node.js + Express 5 + Mongoose + Socket.io  
**Database:** MongoDB  
**Auth:** JWT (httpOnly cookies) + bcrypt  
**Real-time:** Socket.io (live notifications, dashboard updates)  
**Charts:** Recharts  

## Features

- **Dashboard** — Stats, occupancy/revenue charts, real-time activity feed
- **Students** — CRUD, search, detail view, bulk CSV import, check-in/out
- **Rooms** — CRUD, grid view with occupancy bar, allocate/vacate, room transfers
- **Payments** — Record payments, receipt printing, dues tracking, Excel export
- **Complaints** — Submit with categories, status workflow, feedback & rating
- **Leaves/Outpass** — Apply, approve/reject, auto-expiry
- **Visitor Log** — Digital gate entry/exit, pass generation
- **Notices** — Post with priority levels, urgent toast alerts
- **Notifications** — Real-time bell + full page, read/unread
- **Staff** — CRUD by designation, duty assignment
- **Audit Log** — Immutable activity trail with filters
- **Reports** — Excel export (students, payments, complaints)
- **Settings** — Dark mode toggle, notification prefs
- **Global Search** — Ctrl+K search across students
- **Real-time** — Socket.io for live notifications, dashboard, room status

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & Install
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/hostel-management
JWT_SECRET=your-secret-key
```

### 3. Seed Database
```bash
cd backend && npm run seed
```

### 4. Start Development
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### 5. Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hostel.com | admin123 |
| Staff | staff@hostel.com | staff123 |
| Student | student@hostel.com | student123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| GET/POST/PUT/DELETE | /api/students | Student CRUD |
| GET/POST/PUT/DELETE | /api/rooms | Room CRUD |
| PUT | /api/rooms/:id/allocate | Allocate room |
| GET/POST | /api/payments | Payment CRUD |
| GET/POST | /api/complaints | Complaints |
| GET/POST | /api/leaves | Leave management |
| GET/POST | /api/visitors | Visitor log |
| GET/POST | /api/notices | Notice board |
| GET | /api/notifications | Notifications |
| GET/POST | /api/staff | Staff management |
| GET | /api/dashboard/* | Dashboard stats |
| GET | /api/exports/* | Excel exports |
| GET | /api/audit | Activity log |
