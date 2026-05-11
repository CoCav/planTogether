# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)

![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Backend Tests](https://img.shields.io/badge/backend-478%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/backend%20coverage-98%25%20statements%20%7C%2091%25%20branches-brightgreen)

![Frontend Tests](https://img.shields.io/badge/frontend-425%20passing-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-91.39%25%20statements%20%7C%2087.96%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a **fullstack event management platform** that enables users to create, join, and manage collaborative events through a secure role-based system.

The project is composed of:

- a **Node.js / Express backend API** responsible for authentication, business logic, permissions, filtering, uploads, transactions, and data persistence
- a **React frontend application** providing a responsive and interactive user experience with protected routes, advanced filtering, and dynamic UI behavior

Together, they provide a complete end-to-end experience, from secure API workflows and database operations to modern frontend interactions and user-focused features.

The application focuses on **clean architecture, scalability, security, API consistency, and comprehensive automated testing**, helping ensure reliability, maintainability, and predictable behavior across both backend and frontend layers.

---

## 🎯 Key Highlights

- 🧪 **900+ automated tests across backend and frontend** (Jest + Supertest + Vitest + React Testing Library)
- 📊 **High automated test coverage** (~98% backend / ~91% frontend)
- 🔐 **Secure authentication and role-based access control (RBAC)**
- 🧱 **Clean fullstack architecture** (modular MVC backend + scalable React frontend)
- 🔄 **Transaction-based backend workflows** for critical operations
- 🔍 **Advanced event filtering** (search, creator, date range, sorting, pagination)
- 🔗 **URL-synchronized filters, pagination, and views**
- 🖼️ **Secure image upload system** with validation, preview, drag-and-drop, replacement cleanup, and upload protection
- ⚛️ **Modern React frontend** with protected routes and dynamic UI behavior
- 🛡️ **Centralized validation, security, error handling, and API consistency** across backend and frontend layers

---

## 🚀 Application Overview

PlanTogether provides a complete fullstack event management experience, combining a secure backend API with a modern and interactive frontend application.

Users can:

- Create, update, and manage events
- Join and leave events
- Browse, search, and filter events using advanced filtering options
- Upload and manage avatars and event images
- Interact with events through a role-based system (`organizer`, `co_organizer`, `participant`)
- Manage their profile and authentication securely

The platform is designed to provide a smooth and intuitive user experience through dynamic UI behavior, protected frontend flows, centralized backend permission management, and consistent API-driven interactions.

Additional frontend capabilities include:

- URL-synchronized filters and pagination
- contextual empty states
- protected routes
- responsive interactive UI behavior
- reusable frontend form and filtering components

Together, the frontend and backend layers provide reliable data handling, secure workflows, scalable architecture, and consistent fullstack behavior across the application.

---

## ⚙️ Getting Started

Follow these steps to run the fullstack application locally.

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether
```

### 2️⃣ Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=3000

JWT_SECRET=your_secret_key

DB_NAME=plantogether_db
DB_NAME_TEST=plantogether_test_db

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

📌 A `.env.example` file is provided as a reference configuration.

Start the backend server:

```bash
npm start
```

📌 The backend server starts only if the database connection succeeds.

### 3️⃣ Setup the Frontend

```bash
# from the project root
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend development server:

```bash
npm run dev
```

### 4️⃣ Access the Application

- Frontend → `http://localhost:5173`
- Backend API → `http://localhost:3000/api`

---

## 📖 Project Documentation

The backend API is fully documented in the backend README:

👉 [`/backend/README.md`](./backend/README.md)

It includes:

- backend architecture and project structure
- API endpoints and response formats
- authentication and authorization
- security, validation, and upload handling
- filtering, pagination, and permissions
- transactions and database consistency
- testing overview

Dedicated backend testing documentation is also available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

It includes:

- testing architecture and strategy
- integration vs unit testing
- reusable helpers and factories
- transaction and upload testing
- database isolation
- validator and middleware testing
- mocking strategies

The frontend application is documented in the frontend README:

👉 [`/frontend/README.md`](./frontend/README.md)

It includes:

- frontend architecture and project structure
- core features and UI behavior
- state management and routing
- API integration details
- frontend testing structure

---

## 🛠️ Tech Stack

The project uses a modern fullstack architecture combining a secure backend API, a dynamic frontend application, and comprehensive automated testing tools.

### 🔧 Backend

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT (authentication)
- bcrypt (password hashing)
- express-validator (input validation)
- Multer (file uploads)
- Helmet (HTTP security)
- express-rate-limit (authentication protection)
- centralized CORS configuration
- Sequelize transactions

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

This separation provides clear responsibility boundaries between business logic, data management, security, testing, and user interface behavior.

```txt
planTogether/
├── backend/
│   ├── docs/
│   │   └── testing.md
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── security/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   │   ├── auth/
│   │   │   ├── errors/
│   │   │   ├── events/
│   │   │   ├── files/
│   │   │   └── formatting/
│   │   └── validators/
│   │
│   ├── tests/
│   │   ├── factories/
│   │   ├── helpers/
│   │   ├── integration/
│   │   └── unit/
│   │
│   ├── uploads/
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

This structure supports clear separation of concerns across backend and frontend layers while improving scalability, maintainability, testing, and long-term project organization.

Testing strategies are intentionally separated:

- backend tests are organized with dedicated integration and unit testing layers
- frontend tests are colocated with application features and UI components

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
- Strong frontend and backend validation
- Date consistency rules and protected event restrictions
- Transaction-based backend operations for critical workflows
- Centralized filtering, pagination, and sorting behavior

### 👥 Event Participation

- Join and leave events (except for the organizer)
- Prevent duplicate participation
- Retrieve event members and organizers
- Manage personal event dashboards (created and joined events)

### 🔍 Event Search & Filtering

- Keyword search (title and description)
- Creator-based search
- Filtering by type, theme, mode, and location
- Exact date and date range filtering
- Combined filters with sorting and pagination
- URL-synchronized filters, pagination, and active views

### 🖼️ Media & Upload Experience

- Avatar and event image upload system
- Drag-and-drop upload panels
- Image preview with filename and size
- Remove uploaded files before submission
- Default image fallback for missing or broken images
- Automatic cleanup of replaced uploaded files
- Secure upload validation and protected file handling

### 🎭 Roles & Permissions

The application enforces a strict role hierarchy:

```txt
organizer > co_organizer > participant
```

Each role defines specific permissions:

- **Organizer** → full control over events and members
- **Co-organizer** → manage participants and edit events
- **Participant** → join and leave events

Unauthenticated users can still access public event and public user information in read-only mode.

Access control is enforced through:

- Role-based access control (RBAC) across backend and frontend
- Centralized permission validation and protected actions
- Strict role hierarchy enforcement

### 📄 User Experience

- Contextual empty states based on filters and views
- Loading states for asynchronous operations
- Config-driven event tabs (All, Upcoming, Archives, etc.)
- Responsive UI and reusable component design

---

## 🧱 Architecture

PlanTogether follows a clean fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend is built using a modular layered architecture:

- Routes → define API endpoints
- Controllers → handle requests and responses
- Services → business logic (events, memberships, permissions)
- Models → database structure and Sequelize relations
- Validators → request validation and input rules
- Middlewares → authentication, authorization, uploads, rate limiting, and error handling
- Utils → shared logic (filtering, pagination, formatting, file management)
- Config → centralized environment and security configuration
- Constants → shared business values and role definitions

This architecture supports:

- scalable business logic
- centralized security and validation
- secure role-based access control (RBAC)
- transaction-based critical operations
- centralized event filtering and query handling
- uploaded file management and cleanup
- reusable and consistent API responses
- strong testability and maintainability

### ⚛️ Frontend

The frontend uses a component-based and feature-driven architecture:

- Pages → main application views
- Components → reusable UI elements
- Services → centralized Axios API layer
- Context → global authentication state
- Hooks → reusable logic (filtering, pagination, event actions)
- Features → domain-specific logic (filters, query params, empty states)
- Utils → shared helpers (image handling, data formatting)

This structure enables:

- dynamic and responsive UI behavior
- role-based rendering
- URL-synchronized state (filters, pagination, views)
- advanced user experience (uploads, previews, empty states)
- scalable and maintainable frontend organization
- reusable UI and feature logic

Together, this architecture ensures a clean separation of concerns and allows both backend and frontend layers to evolve independently while maintaining reliable API-driven interactions, predictable data flow, and scalable fullstack development.

---

## 🧪 Testing

PlanTogether includes a comprehensive automated testing architecture covering both backend and frontend layers.

These tests help ensure reliability, reduce regressions, validate business rules, and maintain consistent behavior across the fullstack application.

### ▶️ Run Tests

#### Backend

```bash
npm test
```

#### Frontend

```bash
npm run test:run
```

### 📊 Results

- Backend: 478 tests (64 test suites)
- Frontend: 425 tests (53 test suites)
- ✅ 900+ automated tests in total — all passing
- 📊 High automated test coverage (~98% backend / ~91% frontend)

### 📦 Test Coverage

#### 🔧 Backend

- Authentication and profile management
- Event CRUD operations
- Filtering, sorting, and pagination
- Creator-based filtering
- Event memberships and permissions
- Role hierarchy and protected actions (RBAC)
- Validation, edge cases, and security rules
- File upload handling and cleanup
- Transaction-based workflows
- API response consistency and centralized error handling
- Database isolation and rollback behavior
- Internal utilities (filtering, pagination, formatting, uploads)

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

- Backend tests validate both integration flows and isolated internal modules
- Frontend tests simulate user interactions using React Testing Library and Vitest
- Backend integration tests use the real Express application with a dedicated PostgreSQL test database
- Frontend API calls are mocked to isolate UI behavior
- Tests cover success cases, edge cases, validation, permissions, uploads, transactions, and error handling
- Critical backend logic is tested in isolation for maintainability and predictable behavior
- Reusable helpers and factories reduce duplication across the testing architecture
- Tests are isolated to ensure deterministic and consistent behavior across the stack

Dedicated backend testing documentation is also available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

These tests provide strong confidence in backend and frontend reliability, maintainability, scalability, and safer long-term refactoring.

---

## 🔐 Security

The application implements multiple security mechanisms to protect data, enforce access control, and ensure safe and consistent behavior across both backend and frontend layers.

### 🔑 Authentication

- JWT-based authentication with secure token handling
- Protected API routes via authentication middleware
- Password updates require current password verification
- Authentication rate limiting helps protect against brute-force attacks

### 🛡️ Authorization

- Role-based access control (RBAC) across backend and frontend
- Fine-grained permission checks for events and memberships
- Centralized permission validation and protected actions
- Strict role hierarchy enforcement

### 🧾 Input Validation

- Request validation on both backend and frontend
- Validation of request bodies, query parameters, and route parameters
- Protection against malformed or invalid data
- Password policy enforcement
- Centralized validation error formatting

Upload validation includes:

- MIME type validation
- File extension validation
- File size limits
- Controlled upload destinations
- Secure uploaded file replacement and cleanup

### 🔒 Data Protection

- Password hashing using bcrypt
- Sensitive data protection via Sequelize scopes
- Secure uploaded file handling with cleanup and path normalization
- Consistent API response formatting and centralized error handling
- Email normalization before persistence and authentication

### ⚙️ Additional Security Measures

- Helmet security headers protection
- Centralized CORS configuration
- SQL injection protection through Sequelize ORM parameterized queries
- Secure file upload flow with validation and cleanup
- Transaction-based critical operations for safer database consistency
- Database indexes for optimized and safer query behavior

These mechanisms help ensure secure data handling, predictable application behavior, and strong protection against unauthorized access and unsafe operations across the entire fullstack application.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Introduced URL-synchronized filters, pagination, and active views
- Added creator-based search and advanced event filtering
- Implemented image upload UI (avatars and event images) with preview and drag-and-drop
- Improved contextual empty states and loading experience
- Introduced config-driven event tabs for better scalability

### 🔧 Backend

- Refactored the backend into a more modular and scalable architecture
- Centralized event filtering, pagination, and query handling using reusable utilities
- Added creator-based filtering across public and authenticated event listings
- Introduced centralized formatting utilities and reusable API response structures
- Added transaction-based workflows for critical operations
- Implemented centralized security policies (uploads, password rules, CORS)
- Improved authorization architecture and protected action handling
- Added automatic uploaded file cleanup with path normalization protection
- Strengthened upload validation, centralized error handling, and API consistency
- Added database indexes and improved Sequelize query consistency
- Added dedicated backend testing documentation (`backend/docs/testing.md`)

### 🧪 Testing

- Expanded backend testing architecture to 478 tests across 64 test suites
- Added dedicated backend testing documentation and testing strategy structure
- Improved database isolation, transaction testing, and rollback validation
- Expanded coverage across permissions, uploads, filtering, validation, and business rules
- Improved reusable helpers, factories, and testing maintainability across the fullstack architecture

---

## 📌 Project Status

| Area | Status |
|---|---|
| Backend Architecture | ✅ Modular, scalable & well-tested |
| Frontend Application | ✅ Functional & feature-rich |
| Authentication & RBAC | ✅ Complete |
| Security | ✅ Centralized & robust |
| Testing | ✅ 900+ automated tests |
| Documentation | ✅ Backend and testing documentation available |
| Backend API | ✅ Stable and production-oriented |
| UX & Frontend Refactor | 🚧 Ongoing improvements |

---

## 🔮 Future Improvements

### 🚀 Features

- Implement an event invitation system (email invitations or shareable links)
- Add event notifications and reminders
- Support public and private events with fine-grained access control
- Add event capacity management and registration deadlines

### 📅 Event Management

- Improve handling of past events (archiving, visibility, and UI states)
- Add organizer ownership transfer and advanced membership management
- Introduce soft-delete support for memberships and archived events

### ⚛️ Frontend & UX

- Refactor parts of the frontend architecture following backend improvements
- Improve mobile responsiveness and accessibility
- Enhance UI consistency, animations, and loading transitions
- Improve frontend state management and API synchronization
- Expand reusable frontend hooks and feature abstractions

### ⚙️ Infrastructure & Deployment

- Containerize the application using Docker
- Deploy the application (Vercel, Railway, Render, or Fly.io)
- Improve environment-based configuration for production
- Add CI automation for testing and deployment workflows
- Improve production-ready file storage and upload strategies

---

## 🧠 What I Learned

Through this project, I strengthened my fullstack development skills and gained hands-on experience building a production-oriented application with a strong focus on architecture, security, testing, maintainability, and long-term scalability.

### 🔧 Backend

- Designing a modular and scalable REST API architecture
- Implementing secure authentication using JWT
- Building role-based access control (RBAC)
- Managing relational data with Sequelize and PostgreSQL
- Handling complex business logic (roles, permissions, event workflows)
- Designing reusable utilities for filtering, pagination, formatting, and data processing
- Implementing secure file upload systems with validation and lifecycle management
- Working with transaction-based workflows and protected database operations
- Centralizing validation, security policies, and API response handling
- Improving query consistency, maintainability, and backend organization through refactoring

### ⚛️ Frontend

- Structuring a modular and feature-driven React application
- Managing global state with the Context API
- Creating reusable logic with custom hooks
- Building dynamic and role-based UI behavior
- Synchronizing application state with URL parameters (filters, pagination, views)
- Designing interactive UX patterns (drag-and-drop uploads, previews, empty states)
- Improving frontend maintainability through reusable and scalable component architecture

### 🧪 Testing & Quality

- Writing backend tests using Jest and Supertest
- Building frontend tests with Vitest and React Testing Library
- Testing full API workflows and complex UI interactions
- Designing reusable testing helpers, factories, and isolated test environments
- Validating business rules, permissions, uploads, filtering, transactions, and security behavior
- Improving reliability through automated testing, edge cases, database isolation, and rollback validation

### 🧱 Architecture & Practices

- Applying separation of concerns across backend and frontend
- Designing maintainable and scalable codebases
- Aligning frontend and backend validation logic
- Structuring applications around reusable and domain-driven features
- Building consistent API-driven frontend/backend interactions
- Writing clean, testable, and production-oriented code

---
