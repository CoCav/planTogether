# PlanTogether - Fullstack Event Management Platform

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/HTTP-Axios-green)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![Jest](https://img.shields.io/badge/Testing-Jest-red)
![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

A production-oriented fullstack application with strong backend architecture and comprehensive testing.

PlanTogether is a collaborative event management platform where users can create, join and manage events with role-based permissions.

It is a **fullstack web application** built with a **Node.js / Express backend** and a **React frontend**, providing a complete workflow from API design to user interaction.

---

## 🎯 Key Highlights

- ✅ 97 backend tests (Jest + Supertest)
- 🔐 JWT authentication with role-based permissions
- 🔍 Advanced filtering (search + date range + overlap logic)
- 🧱 Clean layered backend architecture
- ⚛️ Modular React frontend

---

## 🚀 Overview

PlanTogether allows users to:

- create and manage events
- join and leave events
- explore events using advanced filtering
- collaborate through a role-based system

---

## ✨ Features

### 👤 Authentication

- User registration and login (JWT)
- Secure password hashing (bcrypt)
- Profile management (name, email)
- Password update (requires current password)
- Logout functionality
- Session-based authentication
- Optional "Remember me"
- Redirect after login

---

### 📅 Event Management

- Manage events (create, update, delete, view)
- Automatic organizer assignment
- Strong validation (frontend + backend)
- Date consistency rules (end > start)

---

### 👥 Event Participation

- Join events
- Leave events *(except organizer)*
- Prevent duplicate participation
- Retrieve members and organizers

---

### 🔍 Event Discovery

- Keyword search (title & description)
- Filter by type, theme, mode, location
- Exact date filtering
- Date range filtering (overlap logic)
- Combined filters
- Reset filters
- Sorting and pagination

---

### 👥 Roles & Permissions

Roles:
```
organizer > co_organizer > participant
```


- Organizer:
  - full control
  - promote / demote users
  - remove members

- Co-organizer:
  - manage participants
  - remove participants

- Participant:
  - join / leave events

✔ Strict role validation  
✔ Permission checks on backend and frontend  

---

## 🧱 Architecture

### Backend Architecture

The backend follows a **layered and modular architecture**:

- Routes → define API endpoints
- Controllers → handle requests/responses
- Services → business logic (events, memberships, roles)
- Models → database structure & relations (Sequelize)
- Validators → input validation (express-validator)
- Middlewares → authentication, authorization, errors
- Utils → shared helpers (pagination, formatting)
- Config → environment & DB configuration
- Tests → structured test suites (auth, events, memberships)

The backend is designed to handle real-world business logic including roles, permissions, event participation and advanced filtering.

👉 Supports:
- complex business logic
- advanced filtering & pagination
- strong validation & security
- full testability

---

### Frontend Architecture

The frontend follows a **component-based modular architecture**:

- Pages:
  - HomePage
  - LoginPage
  - RegisterPage
  - EventsPage
  - EventDetailsPage
  - CreateEventPage
  - EditEventPage
  - ProfilePage
  - MyEventsPage

- Components → reusable UI elements
- API → centralized Axios calls
- Features → domain logic & validation
- Routes → routing + protected routes
- Context → global auth state
- Hooks → reusable logic
- Utils → helpers (token, normalization)
- Styles → UI organization

The frontend is designed to provide a dynamic and responsive user experience with role-aware UI behavior.

👉 Enables:
- reusable components
- scalable structure
- clean separation of concerns

---

## 🧪 Testing

The backend includes a **comprehensive automated test suite**.

Coverage:

- authentication & profile
- event CRUD
- filtering, sorting, pagination
- memberships (join, leave, roles)
- permissions & role hierarchy
- validation & edge cases
- API error consistency

Run tests:

```bash
npm test
```

Results:
- ✅ 9 test suites
- ✅ 97 tests passing

The test suite ensures API stability, reliability and prevents regressions.

---

## 🛠️ Tech Stack

**Backend**
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT
- bcrypt
- express-validator

**Frontend**
- React (Vite)
- React Router
- Axios
- Context API
- Custom hooks

**Testing**
- Jest
- Supertest

---

## 📁 Project Structure

```
planTogether/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── config/
│   │
│   ├─ tests/
│   │   ├── auth/
│   │   ├── events/
│   │   └── memberships/
│   │
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── events/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   └── utils/
│   │
│   ├── public/
│   └── README.md
│
└── README.md
```

---

## 🔐 Security

- JWT authentication
- Password hashing (bcrypt)
- Role-based authorization
- Input validation
- Protected API routes
- Sequelize scopes for sensitive data
- Centralized error handling

---

## 🚀 Recent Improvements

- My Events dashboard (created vs joined)
- Profile page refactor
- Improved protected routing
- Footer & UI improvements
- Standardized backend error responses
- Added event creator info in API
- Advanced filtering system
- Exact date & range filtering
- Backend test refactor (auth/events/memberships)
- Expanded test coverage to 97 tests
- Improved test DB initialization

---

## 📌 Project Status

| Part     | Status |
|----------|--------|
| Backend  | ✅ Completed |
| Frontend | ✅ Functional |
| Security | ✅ Solid |
| Testing |  ✅ Backend only (97 tests, 9 suites) |
| UX | 🚧 Improving|

---

## 🔮Future Improvements

- Event registration deadlines
- Handling past events (archive / UI state)
- Notifications system
- User avatars
- Event invitations
- Mobile optimization
- Deployment (Vercel / Railway / Render)
- Frontend testing

---

## 🧠 What I Learned
- Fullstack architecture design
- REST API development
- Role-based authorization
- JWT authentication
- Relational data modeling
- React state management
- Custom hooks
- Backend testing (Jest + Supertest)
- Handling real-world business logic