# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)

![JWT](https://img.shields.io/badge/Auth-JWT-yellow)

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![Testing Library](https://img.shields.io/badge/Testing-Library-E33332)
![Tests](https://img.shields.io/badge/tests-150%2B%20passing-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a **fullstack event management platform** that allows users to create, join, and manage events with **role-based permissions**.

It combines a **robust Node.js / Express backend API** with a **modern React frontend**, delivering a complete user experience from data management to interactive UI.

The project focuses on **clean architecture, secure API design, and comprehensive automated testing**, ensuring reliability across both backend and frontend layers.

---

## 🎯 Key Highlights

- 🧪 **150+ automated tests across backend and frontend** (Jest + Supertest + Vitest + React Testing Library)
- 🔐 **Secure authentication & role-based access control (RBAC)**
- 🧱 **Clean fullstack architecture** (MVC backend + modular React frontend)
- 🔍 **Advanced event filtering** (search, date range, sorting, pagination)
- ⚛️ **Modern React frontend** with protected routes and dynamic UI
- 🛡️ **Robust validation & error handling** across API and UI

---

## 🚀 Application Overview

PlanTogether provides a complete event management experience.

Users can:

- create and manage events
- join and leave events
- explore events using advanced filtering
- collaborate through a role-based system

The platform combines a secure backend API with an intuitive frontend interface, ensuring a smooth, reliable, and secure user experience.

---

## 🛠️ Tech Stack

The project uses a modern fullstack architecture combining a robust backend, a dynamic frontend, and comprehensive testing tools.

### 🔧 Backend

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT (authentication)
- bcrypt (password hashing)
- express-validator (input validation)

---

### ⚛️ Frontend

- React (Vite, componed-based UI)
- React Router
- Axios (API communication)
- Context API
- Custom hooks

---

### 🧪 Testing

#### Backend
- Jest
- Supertest

#### Frontend
- Vitest
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

---

## 📁 Fullstack Structure

The project is organized into two main applications: a backend API and a frontend client, each following a modular and scalable architecture.

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
│   ├── tests/
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
│   │   ├── tests/
│   │   │   ├── pages/
│   │   │   └── routes/
│   │   └── utils/
│   │
│   ├── public/
│   └── README.md
│
└── README.md
```

This structure clearly separates backend and frontend concerns, making both parts modular, testable, and easy to maintain as the project evolves.

Backend and frontend testing strategies are separated, with backend tests located at the root level and frontend tests organized within the `src` directory.

---

## ✨ Features

### 🔐 Authentication

- User registration and login (JWT-based authentication)
- Secure password hashing (bcrypt)
- Profile management (name, email)
- Password update with current password verification
- Session handling with optional "Remember me" functionality
- Redirect after login

---

### 📅 Event Management

- Create, update, delete, and view events
- Automatic organizer assignment
- Strong validation (frontend + backend)
- Date consistency rules (end > start)

---

### 👥 Event Participation

- Join and leave events *(except organizer)*
- Prevent duplicate participation
- Retrieve event members and organizers

---

### 🔍 Event Search & Filtering

- Keyword search (title & description)
- Filtering by type, theme, mode, and location
- Exact date and date range filtering
- Combined filters with sorting and pagination

---

### 🎭 Roles & Permissions

**Roles hierarchy:**

```
organizer > co_organizer > participant > guest
```

**Roles:**

- Organizer: full control over the event and its members
- Co-organizer: manage participants
- Participant: join and leave events
- Guest: read-only access to public event information

**Access Control:**

- Role-based access control (RBAC) across backend and frontend
- Strict role validation and permission checks

---

## 🧱 Architecture

PlanTogether follows a clean fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend is built using a **layered architecture**:

- Routes → define API endpoints  
- Controllers → handle requests and responses  
- Services → business logic (events, memberships, roles)  
- Models → database structure & relations (Sequelize)  
- Validators → input validation  
- Middlewares → authentication, authorization, error handling  

👉 Designed for:
- scalable business logic
- secure access control (RBAC)
- advanced filtering and validation
- full testability

---

### ⚛️ Frontend

The frontend uses a **component-based architecture**:

- Pages → main application views  
- Components → reusable UI elements  
- API layer → centralized Axios calls  
- Context → global authentication state  
- Hooks → reusable logic  
- Features → domain-specific logic and validation  

👉 Enables:
- dynamic and responsive UI
- role-based rendering
- scalable and maintainable code structure

This architecture ensures a clear separation of concerns and allows both backend and frontend to evolve independently while maintaining a consistent data flow.

---

## 🧪 Testing

PlanTogether includes a **comprehensive automated test suite** covering both backend and frontend to ensure reliability and prevent regressions.

---

### 🔧 Backend Testing

**Coverage:**

- authentication and profile management
- event CRUD operations
- filtering, sorting, and pagination
- memberships (join, leave, roles)
- permissions & role hierarchy
- validation and edge cases
- API error consistency

**Run tests:**

```bash
npm test
```

**Results:**
- ✅ 9 test suites
- ✅ 97 tests passing

---

### ⚛️ Frontend Testing

**Coverage:**

The following pages and features are tested:

- HomePage
- LoginPage
- RegisterPage
- EventsPage
- EventDetailsPage
- MyEventsPage
- CreateEventPage
- EditEventPage
- ProfilePage
- AppRouter / ProtectedRoute

**Run tests:**

```bash
npm run test:run
```

**Results:**
- ✅ 10 test suites
- ✅ 61 tests passing

These tests validate business logic, user flows, and UI behavior, ensuring a stable, reliable, and consistent application across both backend and frontend layers.

---

## 🔐 Security

The application implements multiple security mechanisms to protect data and enforce access control across the system.

- JWT-based authentication (secure token handling)
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation (backend and frontend)
- Protected API routes via authentication middleware
- Sensitive data protection using Sequelize scopes
- Centralized error handling with consistent responses

These mechanisms ensure secure data handling and prevent unauthorized access across both backend and frontend layers.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Added My Events dashboard (created vs joined events)
- Refactored Profile page for better separation of concerns
- Improved protected routing and redirect behavior
- Enhanced UI consistency (footer, layout, and components)

---

### 🔧 Backend

- Standardized API error responses for better frontend integration
- Added event creator information in API responses
- Improved event filtering system (search, exact date, date range)

---

### 🧪 Testing

- Refactored backend test structure (auth, events, memberships)
- Expanded backend test coverage (97 tests)
- Added comprehensive frontend test suite (all main pages and routing)
- Improved test database initialization and reliability

---

## 📌 Project Status

| Area      | Status |
|-----------|--------|
| Backend   | ✅ Complete |
| Frontend  | ✅ Functional |
| Security  | ✅ Robust |
| Testing   | ✅ 158 tests (19 test suites) |
| UX        | 🚧 Ongoing improvements |

---

## 🔮 Future Improvements

### 🚀 Features

- Add event registration deadlines
- Implement event invitation system
- Add notifications (event updates, invitations)
- Support user avatars and profile enhancements

---

### 📅 Event Management

- Improve handling of past events (archive and UI state)

---

### ⚛️ Frontend / UX

- Improve mobile responsiveness and optimization

---

### ⚙️ Infrastructure

- Deploy the application (Vercel / Railway / Render)

---

## 🧠 What I Learned

Through this project, I strengthened my fullstack development skills and gained experience working on a production-oriented application.

---

### 🔧 Backend

- Designing a layered and scalable REST API architecture
- Implementing secure authentication with JWT
- Building role-based access control (RBAC)
- Managing relational data with Sequelize and PostgreSQL
- Handling complex business logic (roles, permissions, event workflows)

---

### ⚛️ Frontend

- Structuring a modular React application
- Managing global state with Context API
- Creating reusable logic with custom hooks
- Building dynamic, role-based UI behavior

---

### 🧪 Testing & Quality

- Writing backend tests with Jest and Supertest
- Building frontend tests with Vitest and React Testing Library
- Ensuring reliability through automated testing and edge case handling

---

### 🧱 Architecture & Practices

- Applying separation of concerns across backend and frontend
- Designing maintainable and scalable codebases
- Aligning frontend and backend validation logic