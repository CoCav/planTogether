# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)

![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Backend Tests](https://img.shields.io/badge/backend-372%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/backend%20coverage-98.18%25%20statements%20%7C%2094.13%25%20branches-brightgreen)

![Frontend Tests](https://img.shields.io/badge/frontend-425%20passing-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-91.39%25%20statements%20%7C%2087.96%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a **fullstack event management platform** that enables users to create, join, and manage events with **role-based permissions**.

The project is composed of:

- a **Node.js / Express backend API** handling business logic, authentication, data management, and file uploads
- a **React frontend application** providing a responsive and interactive user interface with advanced filtering and user experience features

Together, they provide a complete end-to-end experience, from secure API operations to dynamic user interactions.

The application focuses on **clean architecture, scalability, and comprehensive automated testing**, ensuring reliability, consistency, and maintainability across both backend and frontend layers.

---

## 🎯 Key Highlights

- 🧪 **790+ automated tests across backend and frontend** (Jest + Supertest + Vitest + React Testing Library)
- 📊 **High test coverage** (~98% backend / ~91% frontend)
- 🔐 **Secure authentication and role-based access control (RBAC)**
- 🧱 **Clean fullstack architecture** (MVC backend + modular React frontend)
- 🔍 **Advanced event filtering** (search, creator, date range, sorting, pagination)
- 🔗 **URL-synchronized filters, pagination, and views**
- 🖼️ **Image upload system** (avatars and event images with preview and drag-and-drop)
- ⚛️ **Modern React frontend** with protected routes and dynamic UI
- 🛡️ **Robust validation and error handling** across API and UI

---

## 🚀 Application Overview

PlanTogether provides a complete fullstack event management experience, combining a secure backend API with a modern and interactive frontend.

Users can:

- Create, update, and manage events
- Join and leave events
- Browse, search, and filter events using advanced search options
- Upload and manage avatars and event images
- Interact with events through a role-based system (`organizer`, `co_organizer`, `participant`)
- Manage their profile and authentication securely

The platform ensures a smooth and intuitive user experience, with dynamic UI behavior driven by user roles and permissions, and reliable data handling powered by the backend API.

It also includes advanced frontend capabilities such as URL-synchronized filters, pagination, and contextual empty states for a consistent and seamless user experience.

---

## ⚙️ Getting Started

Follow these steps to run the fullstack application locally.

### 1. Clone the repository

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
JWT_SECRET=your_secret_key

DB_NAME=plantogether_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

UPLOAD_DIR=uploads

DB_LOGGING=false
DB_SSL=false

NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Start the backend server:

```bash
npm start
```

### 3. Setup the frontend

```bash
# from the project root
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the development server:

```bash
npm run dev
```

### 4. Access the application

- Frontend → http://localhost:5173
- Backend API → http://localhost:3000/api

---

## 📖 Project Documentation

The backend API is fully documented in the backend README:

👉 [`/backend/README.md`](./backend/README.md)

It includes:

- Available endpoints
- Request and response formats
- Authentication and authorization
- Error handling

The frontend is fully documented in the frontend README:

👉 [`/frontend/README.md`](./frontend/README.md)

It includes:

- Application architecture
- Core features and UI behavior
- State management and routing
- API integration details

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
- Multer (file uploads)

### ⚛️ Frontend

- React (Vite, component-based UI)
- React Router
- Axios (API communication)
- Context API
- Custom hooks
- FormData handling (file uploads)

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

This separation allows clear responsibility boundaries between data management, business logic, and user interface.

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
│   │   ├── controllers/
│   │   ├── integration/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   │
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── events/
│   │   ├── hooks/
│   │   │   ├── events/
│   │   │   └── pagination/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── tests/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── routes/
│   │   │   └── utils/
│   │   └── utils/
│   │
│   ├── public/
│   └── README.md
│
└── README.md
```

This structure ensures a clear separation of concerns between backend and frontend layers, improving maintainability, scalability, and testability.

Testing strategies are also separated: backend tests are organized at the project root level, while frontend tests are structured within the `src` directory alongside the application code.

---

## ✨ Features

### 🔐 Authentication

- User registration and login (JWT-based authentication)
- Secure password hashing with bcrypt
- Profile management (name, email)
- Avatar upload and update with preview support
- Password update with current password verification
- Session handling with optional "Remember me" functionality
- Redirect to the originally requested page after login

### 📅 Event Management

- Create, update, delete, and view events
- Upload and manage event images (with preview and fallback support)
- Automatic organizer assignment upon event creation
- Strong validation across frontend and backend
- Date consistency rules (end date must be after start date)

### 👥 Event Participation

- Join and leave events (except for the organizer)
- Prevent duplicate participation
- Retrieve event members and organizers
- Manage personal event dashboard (created and joined events)

### 🔍 Event Search & Filtering

- Keyword search (title and description)
- Creator-based search
- Filtering by type, theme, mode, and location
- Exact date and date range filtering
- Combined filters with sorting and pagination
- URL-synchronized filters, pagination, and active views

### 🖼️ Media & Upload Experience

- Avatar and event image upload system
- Drag and drop upload panels
- Image preview with filename and size
- Remove uploaded files before submission
- Default image fallback for missing or broken images

### 🎭 Roles & Permissions

The application enforces a strict role hierarchy:

```txt
organizer > co_organizer > participant > guest
```

Each role defines specific permissions:

- **Organizer**: full control over the event and its members
- **Co-organizer**: manage participants
- **Participant**: join and leave events
- **Guest**: read-only access to public event information

Access control is enforced through:

- Role-based access control (RBAC) across backend and frontend
- Strict role validation and permission checks

### 📄 User Experience

- Contextual empty states based on filters and views
- Loading states for asynchronous operations
- Config-driven event tabs (All, Upcoming, Archives, etc.)
- Responsive UI and reusable component design

---

## 🧱 Architecture

PlanTogether follows a clean fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend is built using a **layered architecture**:

- Routes → define API endpoints
- Controllers → handle requests and responses
- Services → business logic (events, memberships, roles)
- Models → database structure and relations (Sequelize)
- Validators → input validation
- Middlewares → authentication, authorization, file upload handling, and error handling
- Utils → shared logic (filtering, pagination, file management)

This design supports:

- Scalable business logic
- Secure access control (RBAC)
- Centralized event filtering and validation
- File upload management (avatars and event images)
- High testability

---

### ⚛️ Frontend

The frontend uses a **component-based and feature-driven architecture**:

- Pages → main application views
- Components → reusable UI elements
- Services → centralized Axios API layer
- Context → global authentication state
- Hooks → reusable logic (filtering, pagination, event actions)
- Features → domain-specific logic (filters, query params, empty states)
- Utils → shared helpers (image handling, data formatting)

This structure enables:

- Dynamic and responsive UI
- Role-based rendering
- URL-synchronized state (filters, pagination, views)
- Advanced user experience (uploads, previews, empty states)
- Scalable and maintainable code organization

Together, this architecture ensures a clear separation of concerns and allows both backend and frontend to evolve independently while maintaining a consistent and reliable data flow.

---

## 🧪 Testing

PlanTogether includes a **comprehensive automated test suite** covering both backend and frontend layers.

These tests ensure reliability, reduce regressions, and validate core application behavior across the entire stack.

### ▶️ Run Tests

#### Backend

```bash
npm test
```

#### Frontend

```bash
npm run test:run
```

---

### 📊 Results

- Backend: 372 tests (51 test suites)
- Frontend: 425 tests (53 test suites)
- ✅ 790+ tests in total — all passing
- 📊 High test coverage (~98% backend / ~91% frontend)

---

### 📦 Test Coverage

#### 🔧 Backend

- Authentication and profile management
- Event CRUD operations
- Filtering, sorting, and pagination
- Creator-based filtering
- Event memberships (join, leave, roles)
- Permissions and role hierarchy (RBAC)
- Validation and edge cases
- File upload handling (avatars and event images)
- API error handling and consistency
- Internal utilities (event filtering, date logic, pagination)

#### ⚛️ Frontend

- Pages and user flows (auth, events, profile)
- UI components and layout elements
- Routing and protected routes
- Role-based UI behavior
- Form validation and user input handling
- API interactions (mocked)
- Image upload flows (preview, remove, drag & drop)
- URL-synchronized filters, pagination, and views
- Loading, empty, and error states
- Custom hooks and utilities (event filtering, pagination, data fetching)

### 🔁 Test Strategy

- Backend tests simulate real API flows using **Jest** and **Supertest**
- Frontend tests simulate user interactions using **React Testing Library** and **Vitest**
- API calls are mocked on the frontend to isolate UI behavior
- Tests cover success cases, edge cases, and error handling
- Critical logic (filtering, uploads, pagination) is tested in isolation
- Each test is independent and ensures consistent application behavior

These tests provide strong confidence in both backend and frontend reliability.

---

## 🔐 Security

The application implements multiple security mechanisms to protect data and enforce access control across the system.

### 🔑 Authentication

- JWT-based authentication with secure token handling
- Protected API routes via authentication middleware

### 🛡️ Authorization

- Role-based access control (RBAC) across backend and frontend
- Fine-grained permission checks for events and memberships

### 🧾 Input Validation

- Request validation on both backend and frontend
- Protection against malformed or invalid data
- File validation for uploads (type and size constraints)

### 🔒 Data Protection

- Password hashing using bcrypt
- Sensitive data protection via Sequelize scopes
- Secure handling of uploaded files (avatars and event images)

### ⚙️ Additional Security Measures

- SQL injection protection via Sequelize ORM
- Centralized error handling with consistent API responses
- Controlled file upload flow with validation and cleanup

These mechanisms ensure secure data handling and prevent unauthorized access across both backend and frontend layers.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Introduced URL-synchronized filters, pagination, and active views
- Added creator-based search and advanced event filtering
- Implemented image upload UI (avatars and event images) with preview and drag-and-drop
- Improved contextual empty states and loading experience
- Introduced config-driven event tabs for better scalability

### 🔧 Backend

- Centralized event filtering logic using reusable utilities
- Added creator-based filtering across public and user event listings
- Implemented avatar and event image upload system
- Introduced reusable Multer upload middleware
- Added automatic cleanup of old uploaded files on replacement
- Strengthened upload validation and error handling
- Improved API consistency and filtering capabilities

### 🧪 Testing

- Expanded backend test coverage to 371 tests (51 test suites)
- Added comprehensive frontend test suite (425 tests across 53 test files)
- Improved coverage across filtering, uploads, and role-based logic
- Strengthened test reliability and structure across the full stack

---

## 📌 Project Status

| Area      | Status |
|-----------|--------|
| Backend   | ✅ Complete |
| Frontend  | ✅ Complete |
| Security  | ✅ Robust |
| Testing   | ✅ 790+ tests |
| UX        | 🚧 Ongoing improvements |

---

## 🔮 Future Improvements

### 🚀 Features

- Implement an event invitation system (invite users via email or shareable link)
- Add notifications (event updates, invitations, reminders)
- Support public and private events with fine-grained access control

### 📅 Event Management

- Improve handling of past events (archiving and UI state)

### ⚛️ Frontend / UX

- Improve mobile responsiveness and accessibility
- Enhance UI/UX consistency and animations

### ⚙️ Infrastructure

- Deploy the application (Vercel, Railway, or Render)
- Improve environment-based configuration for production

---

## 🧠 What I Learned

Through this project, I strengthened my fullstack development skills and gained hands-on experience building a production-oriented application.

### 🔧 Backend

- Designing a layered and scalable REST API architecture
- Implementing secure authentication using JWT
- Building role-based access control (RBAC)
- Managing relational data with Sequelize and PostgreSQL
- Handling complex business logic (roles, permissions, event workflows)
- Designing reusable utilities for filtering, pagination, and data processing
- Implementing file upload systems with validation and lifecycle management

---

### ⚛️ Frontend

- Structuring a modular and feature-driven React application
- Managing global state with the Context API
- Creating reusable logic with custom hooks
- Building dynamic, role-based UI behavior
- Synchronizing application state with URL parameters (filters, pagination, views)
- Designing interactive UX patterns (drag-and-drop uploads, previews, empty states)

---

### 🧪 Testing & Quality

- Writing backend tests using Jest and Supertest
- Building frontend tests with Vitest and React Testing Library
- Testing full user flows and complex UI interactions
- Ensuring reliability through automated testing and edge case handling
- Validating critical logic such as filtering, uploads, and permissions

---

### 🧱 Architecture & Practices

- Applying separation of concerns across backend and frontend
- Designing maintainable and scalable codebases
- Aligning frontend and backend validation logic
- Structuring applications around reusable and domain-driven features
- Writing clean, testable, and production-ready code

---
