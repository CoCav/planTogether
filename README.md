# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)

![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Backend Tests](https://img.shields.io/badge/backend-624%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/backend%20coverage-99.13%25%20statements%20%7C%2094.14%25%20branches-brightgreen)

![Frontend Tests](https://img.shields.io/badge/frontend-1119%20passing-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-97.65%25%20statements%20%7C%2094.51%25%20branches-brightgreen)

![Backend CI](https://github.com/CoCav/planTogether/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/CoCav/planTogether/actions/workflows/frontend-ci.yml/badge.svg)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a **fullstack event management platform** that enables users to create, join, and manage collaborative events through a secure role-based system.

The project is composed of:

- a **Node.js / Express backend API** responsible for authentication, business logic, permissions, filtering, uploads, transactions, logging, validation, and data persistence
- a **React frontend application** providing a responsive and interactive user experience with protected routes, advanced filtering, query synchronization, and dynamic role-aware UI behavior

Together, they provide a complete end-to-end experience, from secure API workflows and database operations to modern frontend interactions, scalable frontend architecture, and user-focused features.

The application focuses on **clean architecture, scalability, security, API consistency, continuous integration, reusable frontend and backend architecture, and comprehensive automated testing**, helping ensure reliability, maintainability, and predictable behavior across both backend and frontend layers.

---

## 🎯 Key Highlights

- 🧪 **1743 automated tests across backend and frontend** (Jest + Supertest + Vitest + React Testing Library)
- 📊 **High automated test coverage** (~99% backend / ~98% frontend)
- 🔁 **Separate backend and frontend CI workflows using GitHub Actions**
- 🔐 **Secure authentication and role-based access control (RBAC)**
- 🧱 **Clean fullstack architecture** (modular backend services + feature-oriented React frontend)
- 🔄 **Transaction-based backend workflows** for critical operations
- 🗄️ **Optimized backend query architecture** (filtering, pagination, indexes, participant counts, reusable query helpers)
- 🔍 **Advanced event filtering and listing architecture** (search, creator, date range, sorting, pagination, synchronized views)
- 🔗 **URL-synchronized filters, pagination, and active views**
- 🖼️ **Secure image upload system** with validation, preview, drag-and-drop, preservation, replacement, removal, cleanup, and upload protection
- ⚛️ **Modern React frontend with protected routes, accessibility-focused** UI patterns, reusable frontend workflows, and role-aware interactions
- 🛡️ **Centralized validation, security, error handling, and API consistency** across backend and frontend layers
- ♻️ **Soft-delete lifecycle handling** for memberships and secure account deletion flows
- ♿ **Accessibility-focused** frontend architecture with semantic HTML and ARIA support

---

## 🚀 Application Overview

PlanTogether provides a complete fullstack event management experience, combining a secure backend API with a modern and interactive frontend application.

Users can:

- Create, update, and manage events
- Join and leave events
- Browse, search, sort, and filter events using advanced filtering options
- Upload and manage avatars and event images
- Interact with events through a role-based system (`organizer`, `co_organizer`, `participant`)
- Manage their profile and authentication securely
- Interact with status-aware event workflows (`ongoing`, `upcoming`, `ended`)
- Benefit from permission-aware actions aligned across frontend and backend

The platform is designed to provide a smooth and intuitive user experience through contextual and permission-aware frontend interactions, protected frontend flows, centralized backend permission management, transaction-safe backend workflows, and consistent API-driven interactions.

Additional frontend capabilities include:

- URL-synchronized filters, pagination, and active views
- protected frontend routes and role-aware access guards
- reusable filtering, listing, and query synchronization workflows
- upload previews and drag-and-drop interactions
- contextual loading and empty-state behavior

Together, the frontend and backend layers provide reliable data handling, secure workflows, reusable architecture, centralized permission management, and consistent fullstack behavior across the application.

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

LOG_LEVEL=info

NODE_ENV=development

CORS_ORIGIN=http://localhost:5173
```

`.env.example` and `.env.test` files are provided as reference configurations.

Make sure PostgreSQL is running and the configured database is available.

Start the backend development server:

```bash
npm run dev
```

The backend server starts only if the database connection and model synchronization succeed.

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
- security, validation, upload handling, and logging
- filtering, pagination, query optimization, and permissions
- transactions, soft-delete lifecycle handling, and database consistency
- testing overview and CI integration

Dedicated backend testing documentation is also available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

It includes:

- testing architecture and strategy
- integration vs unit testing
- reusable helpers and factories
- transaction and upload testing
- database isolation and CI workflows
- validator and middleware testing
- mocking strategies

The frontend application is documented in the frontend README:

👉 [`/frontend/README.md`](./frontend/README.md)

It includes:

- frontend architecture and project structure
- feature-oriented frontend logic and reusable hooks
- routing, authentication, and frontend access guards
- query synchronization and listing architecture
- API integration and feature-oriented frontend workflows
- styling architecture and UI behavior
- frontend testing overview

Dedicated frontend testing documentation is also available:

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

It includes:

- frontend testing architecture and strategy
- frontend testing layers
- feature, hook, route, API, and utility testing
- reusable factories, mocks, helpers, and render utilities
- mocking strategies and testing workflows
- query synchronization and frontend access guard testing

---

## 🛠️ Tech Stack

The project uses a modern fullstack architecture combining a secure backend API, a dynamic frontend application, reusable frontend and backend architecture patterns, and comprehensive automated testing tools.

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
- Pino (structured logging)
- centralized CORS configuration
- Sequelize transactions

### ⚛️ Frontend

- React (Vite, component-based UI)
- React Router
- Axios (API communication)
- Context API
- Custom hooks
- Feature-oriented frontend architecture
- URL query synchronization
- FormData handling (file uploads)

### 🧪 Testing

#### Backend

- Jest
- Supertest
- PostgreSQL isolated test services

#### Frontend

- Vitest
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

### 🔁 Continuous Integration

- Separate backend and frontend GitHub Actions workflows

---

## 📁 Fullstack Structure

The project is organized into two main applications: a backend API and a frontend client, each following a modular and scalable architecture.

This separation provides clear responsibility boundaries between backend business logic, data management, security, frontend state management, testing, and user interface behavior.

```txt
planTogether/
├── backend/
│   ├── docs/
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── tests/
│   │   ├── factories/
│   │   ├── helpers/
│   │   ├── integration/
│   │   └── unit/
│   │
│   ├── uploads/
│   ├── .env.example
│   ├── .env.test
│   └── README.md
│
├── frontend/
│   ├── docs/
│   │
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── eventMemberships/
│   │   │   ├── users/
│   │   │   │   ├── authenticated/
│   │   │   │   └── public/
│   │   │   └── shared/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── tests/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── factories/
│   │   │   ├── features/
│   │   │   ├── helpers/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── routes/
│   │   │   ├── setup/
│   │   │   └── utils/
│   │   └── utils/
│   │
│   ├── public/
│   └── README.md
│
└── README.md
```

This structure supports clear separation of concerns across backend and frontend layers while improving scalability, maintainability, testing workflows, reusable architecture patterns, and long-term project organization.

Testing strategies are intentionally separated:

- backend tests are organized with dedicated integration and unit testing layers
- frontend tests are organized around features, hooks, pages, routes, APIs, and reusable frontend utilities

---

## ✨ Features

### 🔐 Authentication

- User registration and login (JWT-based authentication)
- Secure password hashing with bcrypt
- Authentication rate limiting protection
- Profile management (name, email)
- Avatar upload and update with preview support
- Password update with current password verification
- Session handling with optional "Remember me" functionality
- Redirect restoration after protected login flows
- Protected frontend routes and authentication persistence

### 📅 Event Management

- Create, update, delete, and view events
- Upload, preserve, replace, remove, and manage event images with preview and fallback support
- Event image lifecycle handling aligned across frontend and backend
- Automatic organizer assignment upon event creation
- Strong frontend and backend validation
- Date consistency rules, started-event editing protection, and protected event restrictions
- Transaction-based backend operations for critical workflows
- Centralized filtering, pagination, sorting, and listing behavior
- URL-synchronized event filtering and active views
- Optimized participant count and query behavior
- Ongoing, upcoming, all, and archived event views
- Centralized event status handling and status badges
- Started-event business rules aligned across frontend and backend

### 👥 Event Participation

- Join and leave events (except for the organizer)
- Prevent duplicate participation
- Retrieve event members and organizers
- Manage personalized event dashboards with active and historical views
- Membership restoration and soft-delete lifecycle handling
- Organizer ownership transfer workflows
- Role-aware membership actions and protected event interactions

### 🔍 Event Search & Filtering

- Keyword search (title and description)
- Creator-based search
- Filtering by type, theme, mode, and location
- Exact date and date range filtering
- Combined filters with sorting and pagination
- URL-synchronized filters, pagination, and active views
- Centralized active views and synchronized listing states

### 🖼️ Media & Upload Experience

- Avatar and event image upload system
- Drag-and-drop upload panels
- Image preview with filename and size
- Remove uploaded files before submission
- Default image fallback for missing or broken images
- Automatic cleanup of replaced or removed uploaded files
- Upload rollback protection during failed operations
- Secure upload validation and protected file handling
- Event image preservation when editing without image changes
- Event image removal with fallback image behavior

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
- Frontend access guards and protected event flows
- Strict role hierarchy enforcement

### 📄 User Experience

- Contextual empty states based on filters and views
- Loading states for asynchronous operations
- Config-driven event tabs and active views
- Responsive UI and standardized component architecture
- Consistent filtering, listing, and synchronization behavior
- Semantic HTML structure and accessibility-focused UI behavior
- Accessible forms, validation feedback, and keyboard-friendly interactions

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
- Config → centralized environment, logging, and security configuration
- Constants → shared business values and role definitions

This architecture supports:

- scalable business logic
- centralized security and validation
- secure role-based access control (RBAC)
- transaction-safe critical operations
- centralized event filtering and query handling
- optimized query and participant count behavior
- uploaded file management and cleanup
- reusable and consistent API responses
- strong testability and maintainability
- soft-delete lifecycle protection

### ⚛️ Frontend

The frontend uses a component-based and feature-oriented architecture designed for scalability, maintainability, reusable frontend patterns, and predictable UI behavior.

The frontend architecture is organized around:

- Pages → main application views
- Components → reusable UI elements
- API layer → centralized API communication and normalization
- Context → global authentication state
- Hooks → reusable frontend state and interaction logic
- Features → domain-specific frontend logic and query synchronization
- Utils → shared formatting, pagination, and uploaded file helpers
- Tests → reusable factories, helpers, mocks, and isolated frontend test layers

This architecture supports:

- dynamic and responsive UI behavior
- permission-aware frontend rendering and interactions
- URL-synchronized filters, pagination, and active views
- reusable frontend validation and normalization patterns
- scalable feature-oriented frontend organization
- semantic page structure
- responsive component behavior
- accessibility-focused navigation patterns
- reusable testing helpers and factories
- protected routes and role-aware access guards
- reusable listing and synchronization architecture
- selective create/edit datetime validation workflows
- started-event editing protections

Together, this structure helps maintain consistent frontend behavior, predictable state management, reusable business logic, and scalable long-term frontend development.

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

- Backend: 624 tests (78 test suites)
- Frontend: 1119 tests (123 test files)
- Total: 1743 automated tests
- ✅ Backend and frontend testing architectures fully integrated
- ✅ High automated coverage across backend and frontend layers

### 📦 Test Coverage

#### 🔧 Backend

- Authentication and profile management
- Authentication rate limiting
- Event CRUD operations
- Filtering, sorting, pagination, and query optimization
- Creator-based filtering
- Event memberships and permissions
- Role hierarchy and protected actions (RBAC)
- Validation, edge cases, and security rules
- File upload handling, cleanup, and rollback protection
- Event image preservation, replacement, removal, and cleanup
- Authenticated user event image metadata
- Transaction-safe workflows
- Soft-delete lifecycle handling and ownership transfer flows
- API response consistency and centralized error handling
- Database isolation and rollback behavior
- Internal utilities (filtering, pagination, formatting, uploads, query builders)

#### ⚛️ Frontend

- Authentication and protected access flows
- Routing and frontend access guards
- API layers and normalization helpers
- Feature-oriented frontend workflows and interactions
- Hooks and reusable state management
- Event filtering, pagination, and query synchronization
- Event listing architecture and active views
- Upload interactions and validation behavior
- Event image preservation, replacement, and removal behavior
- Authenticated user event image metadata handling
- Role-aware frontend interactions and permissions
- Reusable factories, mocks, render helpers, and testing utilities
- Semantic structure and accessibility-oriented testing
- ARIA validation and accessible interaction flows
- Ongoing event view behavior
- Event status synchronization and badge rendering
- Started-event editing restrictions and permission-aware actions
- Selective create/edit datetime validation behavior

### 🔁 Test Strategy

- Backend tests validate both integration workflows and isolated internal modules
- Frontend tests validate reusable frontend logic and user-facing behavior
- Backend integration tests use the real Express application with a dedicated PostgreSQL test database
- Frontend API calls are mocked to isolate frontend behavior
- Separate backend and frontend CI workflows run automatically through GitHub Actions
- Backend CI uses isolated PostgreSQL test services for integration testing
- Tests cover validation, permissions, uploads, filtering, transactions, synchronization, and error handling
- Reusable helpers, mocks, and factories reduce duplication across the testing architecture
- Tests are isolated to ensure deterministic and consistent behavior across the stack

Dedicated backend testing documentation is available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

Dedicated frontend testing documentation is also available:

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

These testing strategies help ensure reliable backend workflows, predictable frontend behavior, safer long-term refactoring, and maintainable fullstack development.

---

## 🔐 Security

The application implements multiple security mechanisms to protect data, enforce access control, and ensure safe and consistent behavior across both backend and frontend layers.

### 🔑 Authentication

- JWT-based authentication with secure token handling
- Protected API routes via authentication middleware
- Protected frontend routes and authentication persistence
- Password updates require current password verification
- Authentication rate limiting helps protect against brute-force attacks

### 🛡️ Authorization

- Role-based access control (RBAC) across backend and frontend
- Permission checks for events and memberships
- Event state-aware restrictions and started-event protections
- Centralized permission validation and protected actions
- Frontend access guards for protected event flows
- Strict role hierarchy enforcement

### 🧾 Input Validation

- Request validation on both backend and frontend
- Validation of request bodies, query parameters, and route parameters
- Protection against malformed or invalid data
- Password policy enforcement
- Centralized validation error formatting

### 📁 Upload Security

- MIME type validation
- File extension validation
- File size limits
- Controlled and normalized upload destinations
- Secure uploaded file preservation, replacement, removal, and cleanup
- Upload rollback protection during failed operations
- Protected file handling and path normalization

### 🔒 Data Protection

- Password hashing using bcrypt
- Sensitive data protection via Sequelize scopes
- Consistent API response formatting and centralized error handling
- Email normalization before persistence and authentication

### ⚙️ Additional Security Measures

- Helmet security headers protection
- Centralized CORS configuration
- SQL injection protection through Sequelize ORM parameterized queries
- Transaction-safe critical operations for safer database consistency
- Database indexes for optimized and safer query behavior
- Centralized logging and environment-based security configuration

These mechanisms help ensure secure data handling, predictable application behavior, transaction-safe workflows, protected frontend access behavior, and strong protection against unauthorized access and unsafe operations across the entire fullstack application.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Introduced URL-synchronized filters, pagination, and active views
- Implemented reusable event listing architecture across public and authenticated pages
- Added event image lifecycle handling for preservation, replacement, and removal
- Fixed My Events image rendering using authenticated user event image metadata
- Added ongoing event views and default event listing behavior
- Added centralized event status badge system
- Added status-aware event actions and restrictions
- Aligned started-event deletion behavior with backend authorization rules
- Added selective create/edit datetime validation behavior
- Added started-event start datetime locking during editing
- Added started-event editing support while preserving original start dates
- Expanded frontend testing coverage across routes, features, hooks, APIs, and query synchronization flows
- Added dedicated frontend testing documentation (`frontend/docs/testing.md`)

### 🔧 Backend

- Centralized filtering, pagination, query builders, and reusable query utilities
- Added transaction-safe workflows for critical operations
- Improved event image lifecycle handling for preservation, replacement, and removal
- Ensured authenticated user event listings include event image metadata
- Added organizer ownership transfer and soft-delete membership lifecycle handling
- Added ongoing event status support across filtering and access rules
- Added started-event deletion restrictions
- Added reusable started-event business-rule helpers
- Extended event access permission resolution
- Added dedicated backend testing documentation (`backend/docs/testing.md`)

### 🧪 Testing

- Expanded frontend testing architecture to 1119 tests across 123 test files
- Reached 1743 automated tests across the fullstack projects
- Added separate backend and frontend CI workflows using GitHub Actions
- Added isolated PostgreSQL test services for backend integration testing
- Added coverage for ongoing event workflows
- Added coverage for event status badge rendering
- Added coverage for event image preservation, replacement, removal, and authenticated user event image metadata
- Added coverage for started-event business rules and permission-aware actions
- Added coverage for selective create/edit datetime validation behavior
- Improved reusable frontend and backend factories, mocks, helpers, and render utilities
- Expanded testing coverage across permissions, uploads, filtering, validation, synchronization, routing, and business rules

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Backend Architecture | ✅ Modular, scalable & production-oriented |
| Frontend Architecture | ✅ Feature-oriented, scalable, and accessibility-focused |
| Authentication & RBAC | ✅ Complete |
| Security | ✅ Centralized & robust |
| Database & Transactions | ✅ Optimized and transaction-safe |
| Backend API | ✅ Stable and well-tested |
| Frontend Application | ✅ Standardized, role-aware, and accessibility-focused |
| Backend Testing & CI | ✅ 624 tests across 78 test suites |
| Frontend Testing & CI | ✅ 1119 tests across 123 test files |
| Documentation | ✅ Backend and frontend documentation available |
| UX Improvements | 🚧 Ongoing |

---

## 🔮 Future Improvements

### 🚀 Features

- Implement an event invitation system (email invitations or shareable links)
- Add event notifications and reminders
- Support public and private events with fine-grained access control
- Add event capacity management and registration deadlines
- Introduce event activity feeds and moderation audit logs

### 📅 Event Management

- Improve archived and past-event lifecycle management
- Expand advanced membership moderation workflows
- Add membership role history and audit tracking
- Improve event participation analytics and reporting

### ⚛️ Frontend & UX

- Continue reusable UI component extraction and styling consistency improvements
- Improve mobile responsiveness and accessibility
- Enhance UI consistency, animations, and loading transitions
- Expand reusable frontend hooks and feature abstractions
- Introduce richer user feedback systems (toasts, notifications, async states)

### ⚙️ Infrastructure & Deployment

- Containerize the application using Docker
- Deploy the application (Vercel, Railway, Render, or Fly.io)
- Improve environment-based configuration for production
- Expand CI/CD automation for testing and deployment workflows
- Improve production-ready file storage and upload strategies
- Add Swagger / OpenAPI API documentation support

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
- Working with transaction-safe workflows and protected database operations
- Improving query consistency and optimization for scalable backend behavior
- Managing soft-delete lifecycle handling and ownership transfer workflows
- Centralizing validation, security policies, logging, and API response handling
- Improving maintainability and backend organization through scalable architecture patterns
- Enforcing business rules consistently across frontend and backend layers
- Managing event image lifecycle behavior across database updates and filesystem cleanup

### ⚛️ Frontend

- Structuring a modular and feature-oriented React application
- Managing global state with the Context API
- Creating reusable frontend patterns with custom hooks
- Building dynamic and role-aware UI behavior
- Synchronizing application state with URL parameters (filters, pagination, active views)
- Designing scalable filtering and synchronized state architectures
- Designing interactive UX patterns (drag-and-drop uploads, previews, empty states)
- Improving frontend maintainability through reusable and scalable frontend architecture patterns
- Designing status-aware and permission-aware UI workflows
- Distinguishing unchanged, replaced, and removed image states in form workflows
- Designing selective create/edit validation workflows
- Managing started-event editing restrictions without impacting reusable form logic

### 🧪 Testing & Quality

- Writing backend tests using Jest and Supertest
- Building frontend tests with Vitest and React Testing Library
- Testing full API workflows and complex UI interactions
- Designing reusable testing helpers, factories, mocks, and isolated test environments
- Validating business rules, permissions, uploads, filtering, transactions, and security behavior
- Improving reliability through automated testing, CI workflows, edge cases, database isolation, and rollback validation

### 🧱 Architecture & Practices

- Applying separation of concerns across backend and frontend
- Designing maintainable and scalable codebases
- Aligning frontend and backend validation logic
- Structuring applications around reusable and domain-driven features
- Building consistent API-driven frontend/backend interactions
- Designing reusable and centralized architecture patterns
- Writing clean, testable, and production-oriented code

---
