# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)
![Accessibility](https://img.shields.io/badge/accessibility-semantic%20%26%20ARIA-blue)

![Backend Tests](https://img.shields.io/badge/backend-650%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/backend%20coverage-99.14%25%20statements%20%7C%2094.65%25%20branches-brightgreen)

![Frontend Tests](https://img.shields.io/badge/frontend-1218%20passing-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-97.89%25%20statements%20%7C%2095.07%25%20branches-brightgreen)

![Backend CI](https://github.com/CoCav/planTogether/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/CoCav/planTogether/actions/workflows/frontend-ci.yml/badge.svg)

![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a fullstack event management platform that enables users to create, discover, join, and manage collaborative events through a secure role-aware system.

The project is composed of:

- a **Node.js / Express backend API** responsible for authentication, business logic, permissions, filtering, uploads, transactions, logging, validation, and data persistence
- a **React frontend application** providing a responsive, accessibility-focused, and role-aware user experience with protected routes, advanced filtering, query synchronization, and dynamic permission-aware UI behavior

Together, the frontend and backend provide a complete end-to-end experience, from secure API workflows and database operations to responsive UI interactions, synchronized permissions, and comprehensive automated testing.

The application focuses on scalability, security, API consistency, maintainability, continuous integration, and predictable behavior across both backend and frontend layers.

---

## 🎯 Key Highlights

- 🧪 **1868 automated tests across backend and frontend** (Jest + Supertest + Vitest + React Testing Library)
- 📊 **High automated test coverage** (~99% backend / ~98% frontend)
- 🔁 **Separate backend and frontend CI workflows** using GitHub Actions
- 🔐 **Secure authentication and role-based access control (RBAC)** with centralized validation, security policies, error handling, and consistent API behavior
- 🧱 **Clean fullstack architecture** combining modular backend services, a feature-oriented React frontend, protected routes, reusable business logic, and permission-aware UI behavior
- ♿ **Accessibility-focused frontend architecture** with semantic HTML, ARIA support, keyboard-friendly interactions, and reusable accessible UI patterns
- 🔄 **Transaction-safe backend workflows** with optimized filtering, pagination, participant counting, query utilities, and scalable database operations
- 🔍 **Advanced event filtering and synchronized listing behavior** with search, creator filters, date ranges, sorting, pagination, synchronized views, and clean URL synchronization
- 👤 **Public user profiles and event activity pages** with created and joined event listings
- 🖼️ **Shared upload and image lifecycle handling** with validation, previews, drag-and-drop interactions, preservation, replacement, cleanup, and upload protection

---

## 📚 Table of Contents

- [🎯 Key Highlights](#-key-highlights)
- [🚀 Application Overview](#-application-overview)
- [⚙️ Getting Started](#️-getting-started)
- [📖 Project Documentation](#-project-documentation)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Fullstack Structure](#-fullstack-structure)
- [✨ Features](#-features)
- [🧱 Architecture](#-architecture)
- [🧪 Testing](#-testing)
- [🔐 Security](#-security)
- [🚀 Recent Improvements](#-recent-improvements)
- [📌 Project Status](#-project-status)
- [🔮 Future Improvements](#-future-improvements)
- [🧠 What I Learned](#-what-i-learned)

---

## 🚀 Application Overview

PlanTogether provides a complete fullstack event management experience, combining a secure backend API with a modern, responsive, and role-aware frontend application.

Users can:

- Create, update, and manage events
- Join and leave events
- Browse, search, sort, and filter events
- Upload and manage avatars and event images
- Interact with events through a role-based system (`organizer`, `co_organizer`, `participant`)
- Manage profile information and authentication securely
- Interact with status-aware event workflows (`ongoing`, `upcoming`, `past`)
- Access permission-aware actions synchronized across frontend and backend layers
- Browse public user profiles and public user event activity

The platform is designed to provide a smooth and intuitive user experience through contextual and role-aware UI interactions, protected routing, centralized permission management, transaction-safe backend workflows, and consistent API-driven behavior.

Additional frontend capabilities include:

- URL-synchronized filters, pagination, sorting, and active views
- protected routes and frontend access guards
- centralized filtering and query synchronization behavior
- clean URL generation for synchronized event listings
- shared upload previews and drag-and-drop interactions
- contextual loading, validation, and empty-state behavior
- accessibility-focused UI patterns with semantic HTML and ARIA support

Together, the frontend and backend provide secure data handling, synchronized permissions, predictable API behavior, and consistent fullstack interactions across the application.

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

Create a `.env` file inside the `backend` folder:

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

Make sure PostgreSQL is running and that the configured databases exist before starting the backend server.

Start the backend development server:

```bash
npm run dev
```

The backend server starts only after the database connection and model synchronization succeed.

### 3️⃣ Setup the Frontend

```bash
# from the project root
cd frontend
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend development server:

```bash
npm run dev
```

### 4️⃣ Access the Application

- Frontend:

`http://localhost:5173`

- Backend API:

`http://localhost:3000/api`

---

## 📖 Project Documentation

The backend API is fully documented in the backend README:

👉 [`/backend/README.md`](./backend/README.md)

It covers:

- backend architecture and project structure
- API endpoints and response formats
- authentication and authorization
- security, validation, uploads, and logging
- filtering, pagination, query optimization, and permissions
- transactions, soft-delete lifecycle handling, and database consistency
- testing overview and CI integration

Dedicated backend testing documentation is also available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

It covers:

- testing architecture and strategy
- integration and unit testing
- reusable helpers and factories
- transaction, upload, and validator testing
- database isolation and CI workflows
- middleware testing and mocking strategies

The frontend application is documented in the frontend README:

👉 [`/frontend/README.md`](./frontend/README.md)

It covers:

- frontend architecture and project structure
- feature-oriented frontend logic and reusable hooks
- routing, authentication, and frontend access guards
- query synchronization and listing behavior
- API integration and frontend workflows
- styling architecture and UI behavior
- frontend testing overview

Dedicated frontend testing documentation is also available:

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

It covers:

- frontend testing architecture and strategy
- testing layers and testing workflows
- feature, hook, route, API, and utility testing
- reusable factories, mocks, helpers, and render utilities
- mocking strategies and isolation patterns
- query synchronization and frontend access guard testing

---

## 🛠️ Tech Stack

The project uses a modern fullstack stack combining a secure backend API, a responsive React frontend, centralized business logic, and comprehensive automated testing.

### 🔧 Backend

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT authentication
- bcrypt password hashing
- express-validator
- Multer
- Helmet
- express-rate-limit
- Pino
- centralized CORS configuration
- Sequelize transactions

### ⚛️ Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- Context API
- custom hooks
- feature-oriented React architecture
- URL query synchronization
- FormData upload handling

### 🧪 Testing Stack

#### Backend

- Jest
- Supertest
- isolated PostgreSQL test database

#### Frontend

- Vitest
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

### 🔁 Continuous Integration

- separate backend and frontend GitHub Actions workflows

---

## 📁 Fullstack Structure

The project is organized into two main applications: a backend API and a frontend client, each following a modular and maintainable structure.

This separation creates clear boundaries between backend business logic, data management, security, frontend state management, testing, and user interface behavior.

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

This structure promotes maintainability, testing consistency, separation of concerns, and long-term project organization across both backend and frontend layers.

Testing strategies are intentionally separated:

- backend tests are organized around integration and unit testing layers
- frontend tests are organized around features, hooks, pages, routes, APIs, and reusable utilities

---

## ✨ Features

### 🔐 Authentication

- User registration and login with JWT authentication
- Secure password hashing with bcrypt
- Authentication rate limiting protection
- Profile management (name, email, avatar)
- Avatar upload, update, preview, and persistence support
- Password updates with current password verification
- Session persistence with optional "Remember me" functionality
- Redirect restoration after protected authentication flows
- Protected frontend routes and authentication persistence

### 📅 Event Management

- Create, update, delete, and view events
- Upload, preview, preserve, replace, and remove event images
- Event image lifecycle handling synchronized across frontend and backend
- Automatic organizer assignment upon event creation
- Strong frontend and backend validation
- Started-event editing restrictions and protected event workflows
- Centralized filtering, sorting, pagination, and listing behavior
- URL-synchronized filters, pagination, sorting, and active views
- Ongoing, upcoming, archived, and all event views
- Centralized event status handling and status badge rendering
- Optimized participant count and query behavior
- Transaction-safe backend workflows for critical operations

### 👥 Event Participation

- Join and leave events
- Prevent duplicate participation
- Retrieve event members and organizers
- Personalized dashboards with active and historical event views
- Public user profiles with organized and joined event history
- Membership restoration and soft-delete lifecycle handling
- Organizer ownership transfer workflows
- Role-aware membership actions and protected interactions

### 🔍 Event Search & Filtering

- Keyword search (title and description)
- Creator-based search
- Filtering by type, theme, mode, and location
- Exact date and date range filtering
- Combined filters with sorting and pagination
- URL-synchronized filters and active views
- Centralized listing state and query synchronization behavior

### 🖼️ Media & Upload Experience

- Shared avatar and event image upload system
- Drag-and-drop upload interactions
- Image previews with filename and size feedback
- Uploaded file removal before submission
- Default image fallback handling
- Automatic cleanup of replaced and removed uploads
- Upload rollback protection during failed operations
- Secure upload validation and protected file handling
- Event image preservation and removal behavior during edit workflows

### 🎭 Roles & Permissions

The application enforces a strict role hierarchy:

```txt
organizer > co_organizer > participant
```

Each role defines specific permissions:

- **Organizer** → full control over events and members
- **Co-organizer** → manage participants and edit events
- **Participant** → join and leave events

Unauthenticated users can access public event and public user information in read-only mode.

Access control is enforced through:

- role-based access control (RBAC) across backend and frontend
- centralized permission validation and protected actions
- frontend access guards and protected event flows
- strict role hierarchy enforcement

### 📄 User Experience

- Contextual empty states based on filters and active views
- Loading states for asynchronous operations
- Config-driven event tabs and active views
- Responsive UI and reusable component architecture
- Consistent filtering and synchronized listing behavior
- Semantic HTML structure and accessibility-focused UI behavior
- Accessible forms, validation feedback, and keyboard-friendly interactions

---

## 🧱 Architecture

PlanTogether follows a clean fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend uses a modular layered architecture:

- Routes → define API endpoints
- Controllers → handle requests and responses
- Services → business logic, permissions, and workflows
- Models → database structure and Sequelize relations
- Validators → request validation and input rules
- Middlewares → authentication, authorization, uploads, rate limiting, and error handling
- Utils → shared filtering, pagination, formatting, and file management helpers
- Config → centralized environment, logging, and security configuration
- Constants → shared business values and role definitions

This architecture supports:

- centralized security and validation
- secure role-based access control (RBAC)
- transaction-safe critical operations
- filtering, pagination, and optimized query behavior
- uploaded file management and cleanup
- consistent API responses
- maintainability and testability
- soft-delete lifecycle protection

### ⚛️ Frontend

The frontend uses a component-based and feature-oriented architecture focused on maintainability, predictable UI behavior, and reusable frontend patterns.

The frontend is organized around:

- Pages → application views and route composition
- Components → reusable UI elements
- API layer → centralized API communication and normalization
- Context → global authentication state
- Hooks → reusable state and interaction logic
- Features → domain-specific logic and query synchronization
- Utils → shared formatting, pagination, and upload helpers
- Tests → reusable factories, helpers, mocks, and isolated testing layers

This architecture supports:

- responsive and dynamic UI behavior
- permission-aware rendering and interactions
- URL-synchronized filters, pagination, and active views
- reusable validation and normalization patterns
- scalable feature organization
- semantic structure and accessibility-focused behavior
- protected routes and frontend access guards
- synchronized listing and filtering behavior
- selective create/edit datetime validation workflows
- started-event editing protections

Together, this architecture helps maintain consistent frontend and backend behavior, predictable state management, centralized business logic, and long-term maintainability across the application.

---

## 🧪 Testing

PlanTogether includes a comprehensive automated testing architecture covering both backend and frontend layers.

These tests help ensure reliability, reduce regressions, validate business rules, and maintain consistent behavior across the application.

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

- Backend: 650 tests (79 test suites)
- Frontend: 1218 tests (128 test files)
- Total: 1868 automated tests
- ✅ Fully integrated backend and frontend testing architecture
- ✅ High automated coverage across the fullstack application

### 📦 Test Coverage

#### 🔧 Backend

- Authentication and profile management
- Authentication rate limiting and security rules
- Event CRUD operations
- Filtering, sorting, pagination, and query optimization
- Event memberships, permissions, and RBAC workflows
- Validation, edge cases, and centralized error handling
- File uploads, cleanup, rollback protection, and image lifecycle handling
- Transaction-safe workflows and database isolation behavior
- Soft-delete lifecycle handling and ownership transfer flows
- Internal utilities (filtering, pagination, formatting, uploads, query builders)

#### ⚛️ Frontend

- Authentication, routing, and protected access flows
- Frontend access guards and permission-aware interactions
- API layers and normalization helpers
- Feature-oriented workflows and reusable state management
- Event filtering, pagination, listing behavior, and query synchronization
- Public user profile and public user event listing workflows
- Clean URL synchronization across event listing pages
- Upload interactions, validation behavior, and image lifecycle handling
- Role-aware frontend interactions and protected event behavior
- Reusable factories, mocks, render helpers, and testing utilities
- Semantic structure, ARIA validation, and accessibility-focused interactions
- Event status synchronization and badge rendering
- Started-event editing restrictions and selective datetime validation workflows

### 🔁 Test Strategy

- Backend tests validate both integration workflows and isolated internal modules
- Frontend tests validate frontend business logic and user-facing behavior
- Backend integration tests use the real Express application with an isolated PostgreSQL test database
- Frontend API calls are mocked to isolate frontend behavior
- Separate backend and frontend CI workflows run automatically through GitHub Actions
- Tests cover validation, permissions, uploads, filtering, transactions, synchronization, and error handling
- Reusable helpers, mocks, and factories reduce duplicated test setup
- Tests remain isolated to ensure deterministic and predictable behavior across the stack

Dedicated backend testing documentation is available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

Dedicated frontend testing documentation is also available:

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

These testing strategies help support reliable backend workflows, predictable frontend behavior, safer refactoring, and maintainable long-term fullstack development.

---

## 🔐 Security

The application implements multiple security mechanisms to protect data, enforce access control, and ensure safe and consistent behavior across both backend and frontend layers.

### 🔑 Authentication

- JWT-based authentication with secure token handling
- Protected API routes through authentication middleware
- Protected frontend routes and authentication persistence
- Password updates require current password verification
- Authentication rate limiting protection against brute-force attacks

### 🛡️ Authorization

- Role-based access control (RBAC) across backend and frontend
- Permission checks for events and memberships
- Event state-aware restrictions and started-event protections
- Centralized permission validation and protected actions
- Frontend access guards for protected event workflows
- Strict role hierarchy enforcement

### 🧾 Input Validation

- Backend and frontend request validation
- Validation of request bodies, query parameters, and route parameters
- Protection against malformed and invalid data
- Password policy enforcement
- Centralized validation error formatting

### 📁 Upload Security

- MIME type and file extension validation
- File size limits and protected upload handling
- Controlled and normalized upload destinations
- Uploaded file preservation, replacement, removal, and cleanup
- Upload rollback protection during failed operations
- Secure file handling and path normalization

### 🔒 Data Protection

- Password hashing with bcrypt
- Sensitive data protection through Sequelize scopes
- Consistent API responses and centralized error handling
- Email normalization before persistence and authentication

### ⚙️ Additional Security Measures

- Helmet security headers
- Centralized CORS configuration
- SQL injection protection through Sequelize parameterized queries
- Transaction-safe critical operations for database consistency
- Database indexes for optimized query behavior
- Centralized logging and environment-based security configuration

These mechanisms help ensure secure data handling, predictable application behavior, protected access flows, transaction-safe operations, and strong protection against unauthorized actions across the application.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Implemented reusable event listing architecture with URL-synchronized filters, pagination, and active views
- Added public user profiles with created and joined event listings
- Added paginated public user event views with synchronized URL state
- Improved clean URL behavior by omitting fallback views, first pages, and default sorting values
- Added ongoing event views, centralized event status handling, and status-aware UI behavior
- Improved event image lifecycle handling and authenticated user event image support
- Added selective create/edit datetime validation and started-event editing protections
- Expanded accessibility-focused UI behavior, semantic structure, and reusable component patterns
- Improved upload preview architecture and responsive upload interactions
- Expanded frontend testing coverage and dedicated frontend testing documentation

### 🔧 Backend

- Centralized filtering, pagination, query builders, and query utilities
- Added transaction-safe workflows, ownership transfer, and soft-delete lifecycle handling
- Improved event status handling, access permissions, and started-event restrictions
- Added public user profiles and public user event listings with filtering, sorting, pagination, and created/joined views
- Improved public user event enrichment, statistics handling, and pagination/query-builder helpers
- Expanded security, validation, upload handling, and API consistency behavior
- Added dedicated backend testing documentation

### 🧪 Testing

- Reached 1868 automated tests across backend and frontend
- Expanded coverage across filtering, pagination, permissions, uploads, validation, synchronization, routing, and business rules
- Added coverage for public user profiles, public user event listings, and clean URL synchronization
- Added coverage for event status workflows, image lifecycle handling, and started-event restrictions
- Expanded accessibility, semantic structure, and protected route testing coverage
- Improved reusable factories, mocks, helpers, and render utilities
- Maintained high automated coverage across backend and frontend layers

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Backend Architecture | ✅ Modular, scalable, and production-oriented |
| Frontend Architecture | ✅ Feature-oriented, accessibility-focused, and fully tested |
| Authentication & RBAC | ✅ Centralized and synchronized across backend and frontend |
| Security | ✅ Centralized, validated, and production-oriented |
| Database & Transactions | ✅ Optimized, indexed, and transaction-safe |
| Backend API | ✅ Stable, standardized, and fully tested |
| Frontend Application | ✅ Responsive, role-aware, accessibility-focused, and URL-synchronized |
| Backend Testing & CI | ✅ 650 tests across 79 test suites |
| Frontend Testing & CI | ✅ 1218 tests across 128 test files |
| Documentation | ✅ Backend, frontend, and testing documentation available |
| UX & Accessibility | ✅ Responsive UI, semantic structure, upload UX, and accessibility-focused interactions implemented |

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
- Improve participation analytics and event reporting

### ⚛️ Frontend & UX

- Continue reusable UI component extraction and frontend architecture refinement
- Continue responsive and accessibility-focused UI improvements
- Enhance UI consistency, transitions, animations, and async feedback behavior
- Expand reusable hooks, listing abstractions, and query synchronization behavior
- Introduce richer feedback systems (toasts, notifications, contextual async states)

### ⚙️ Infrastructure & Deployment

- Containerize the application using Docker
- Deploy the application (Vercel, Railway, Render, or Fly.io)
- Improve production environment configuration
- Expand CI/CD automation for testing and deployment workflows
- Improve production-ready file storage and upload strategies
- Add Swagger / OpenAPI documentation support

---

## 🧠 What I Learned

Through this project, I strengthened my fullstack development skills and gained hands-on experience building a production-oriented application focused on architecture, security, testing, maintainability, scalability, and long-term reliability.

### 🔧 Backend

- Designing modular and scalable REST API architectures
- Implementing secure JWT authentication and role-based access control (RBAC)
- Managing relational data with Sequelize and PostgreSQL
- Handling complex business logic around roles, permissions, memberships, and event workflows
- Building reusable filtering, pagination, formatting, and query utilities
- Implementing secure file upload systems with validation, cleanup, and lifecycle management
- Working with transaction-safe workflows and protected database operations
- Improving query consistency, indexing, and scalable backend behavior
- Managing soft-delete lifecycle handling and ownership transfer workflows
- Centralizing validation, security policies, logging, and API response handling
- Aligning frontend and backend permission enforcement
- Managing synchronized event image behavior across database updates and filesystem cleanup
- Improving maintainability through modular backend architecture patterns

### ⚛️ Frontend

- Structuring a modular and feature-oriented React application
- Managing global state with the Context API
- Creating reusable frontend patterns with custom hooks and shared feature logic
- Building dynamic, role-aware, and status-aware UI behavior
- Synchronizing filters, pagination, and active views with URL parameters
- Designing reusable listing, filtering, and query synchronization behavior
- Building interactive UX patterns including drag-and-drop uploads, previews, loading states, and contextual empty states
- Improving maintainability through reusable frontend architecture patterns
- Designing permission-aware frontend workflows aligned with backend authorization rules
- Managing event image preservation, replacement, and removal workflows
- Designing selective create/edit validation workflows
- Managing started-event editing protections without impacting reusable form behavior
- Improving accessibility-focused UI behavior with semantic structure and ARIA-aware components

### 🧪 Testing & Quality

- Writing backend tests with Jest and Supertest
- Building frontend tests with Vitest and React Testing Library
- Testing full API workflows and complex frontend interactions
- Designing reusable testing helpers, factories, mocks, and isolated test environments
- Validating business rules, permissions, uploads, filtering, transactions, synchronization, and security behavior
- Improving reliability through automated testing, CI workflows, edge-case validation, database isolation, and rollback protection

### 🧱 Architecture & Practices

- Applying separation of concerns across backend and frontend layers
- Designing maintainable and scalable architectures
- Aligning frontend and backend validation and permission behavior
- Structuring applications around reusable and domain-driven features
- Building consistent API-driven frontend/backend interactions
- Writing clean, testable, and production-oriented code
- Improving long-term maintainability through reusable architecture and testing practices

---
