# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)

![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Backend Tests](https://img.shields.io/badge/backend-570%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/backend%20coverage-98.54%25%20statements%20%7C%2092.85%25%20branches-brightgreen)

![Frontend Tests](https://img.shields.io/badge/frontend-357%20safe--scope%20passing-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-in%20progress-lightgrey)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a **fullstack event management platform** that enables users to create, join, and manage collaborative events through a secure role-based system.

The project is composed of:

- a **Node.js / Express backend API** responsible for authentication, business logic, permissions, filtering, uploads, transactions, logging, and data persistence
- a **React frontend application** providing a responsive and interactive user experience with protected routes, advanced filtering, and dynamic UI behavior

Together, they provide a complete end-to-end experience, from secure API workflows and database operations to modern frontend interactions and user-focused features.

The application focuses on **clean architecture, scalability, security, API consistency, continuous integration, and comprehensive automated testing**, helping ensure reliability, maintainability, and predictable behavior across both backend and frontend layers.

---

## 🎯 Key Highlights

- 🧪 Comprehensive backend testing + progressive frontend safe-scope testing (Jest + Supertest + Vitest + React Testing Library)
- 📊 **High automated test coverage** (~98% backend / ~91% frontend)
- 🔁 **Automated backend CI testing with GitHub Actions and PostgreSQL services**
- 🔐 **Secure authentication and role-based access control (RBAC)**
- 🧱 **Clean fullstack architecture** (modular MVC backend + scalable React frontend)
- 🔄 **Transaction-based backend workflows** for critical operations
- 🗄️ **Optimized backend query architecture** (filtering, pagination, indexes, participant counts)
- 🔍 **Advanced event filtering** (search, creator, date range, sorting, pagination)
- 🔗 **URL-synchronized filters, pagination, and views**
- 🖼️ **Secure image upload system** with validation, preview, drag-and-drop, replacement cleanup, and upload protection
- ⚛️ **Modern React frontend** with protected routes and dynamic UI behavior
- 🛡️ **Centralized validation, security, error handling, and API consistency** across backend and frontend layers
- ♻️ **Soft-delete lifecycle handling** for memberships and secure account deletion flows

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

The platform is designed to provide a smooth and intuitive user experience through dynamic UI behavior, protected frontend flows, centralized backend permission management, transaction-safe backend workflows, and consistent API-driven interactions.

Additional frontend capabilities include:

- URL-synchronized filters and pagination
- protected frontend routes and role-aware UI behavior
- upload previews and drag-and-drop interactions

Together, the frontend and backend layers provide reliable data handling, secure workflows, scalable architecture, centralized permission management, and consistent fullstack behavior across the application.

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

📌 `.env.example` and `.env.test` files are provided as reference configurations.

Start the backend server:

```bash
npm start
```

📌 The backend server starts only if the database connection and model synchronization succeed.

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
- core features and UI behavior
- state management and routing
- API integration details
- frontend testing structure

Dedicated frontend testing documentation is also available:

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

It includes:

- frontend testing architecture and strategy
- frontend testing layers
- reusable factories, mocks, and render helpers
- mocking strategies
- safe-scope testing strategy
- frontend refactor testing workflow

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
- Pino (structured logging)
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
- PostgreSQL isolated test services

#### Frontend

- Vitest
- React Testing Library
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

### 🔁 Continuous Integration

- GitHub Actions CI

## 📁 Fullstack Structure

The project is organized into two main applications: a backend API and a frontend client, each following a modular and scalable architecture.

This separation provides clear responsibility boundaries between business logic, data management, security, testing, and user interface behavior.

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
│   │   │   ├── context/
│   │   │   ├── factories/
│   │   │   ├── features/
│   │   │   ├── helpers/
│   │   │   ├── hooks/
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

This structure supports clear separation of concerns across backend and frontend layers while improving scalability, maintainability, testing, and long-term project organization.

Testing strategies are intentionally separated:

- backend tests are organized with dedicated integration and unit testing layers
- frontend tests are organized around features, hooks, routes, APIs, and reusable frontend utilities

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
- Redirect to the originally requested page after login

### 📅 Event Management

- Create, update, delete, and view events
- Upload and manage event images (with preview and fallback support)
- Automatic organizer assignment upon event creation
- Strong frontend and backend validation
- Date consistency rules and protected event restrictions
- Transaction-based backend operations for critical workflows
- Centralized filtering, pagination, and sorting behavior
- Optimized participant count and query behavior

### 👥 Event Participation

- Join and leave events (except for the organizer)
- Prevent duplicate participation
- Retrieve event members and organizers
- Manage personal event dashboards (created and joined events)
- Membership restoration and soft-delete lifecycle handling
- Organizer ownership transfer workflows

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
- Upload rollback protection during failed operations
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

The frontend uses a component-based and feature-oriented architecture designed for scalability, maintainability, and reusable frontend business logic.

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
- role-aware frontend rendering and interactions
- URL-synchronized filters, pagination, and active views
- reusable frontend validation and normalization logic
- scalable feature-oriented frontend organization
- reusable frontend testing utilities and factories
- safer frontend refactoring and progressive testing workflows

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

- Backend: 570 tests (76 test suites)
- Frontend: 357 safe-scope tests (55 safe-scope test suites)
- ✅ Backend fully tested and stable
- 🚧 Frontend UI/page refactor in progress with stabilized safe-scope testing

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
- Transaction-safe workflows
- Soft-delete lifecycle handling and ownership transfer flows
- API response consistency and centralized error handling
- Database isolation and rollback behavior
- Internal utilities (filtering, pagination, formatting, uploads, query builders)

#### ⚛️ Frontend

Current frontend safe-scope coverage includes:

- feature logic
- hooks
- context
- routes and protected access
- API layers and normalization helpers
- reusable utilities
- reusable factories, mocks, and render helpers
- filtering, pagination, uploads, and role-aware interactions

Legacy page and component tests are progressively being updated during the frontend UI refactor.

### 🔁 Test Strategy

- Backend tests validate both integration flows and isolated internal modules
- Frontend tests validate reusable frontend logic and user-facing behavior
- Backend integration tests use the real Express application with a dedicated PostgreSQL test database
- Frontend API calls are mocked to isolate frontend behavior
- Backend CI workflows run automatically through GitHub Actions and isolated PostgreSQL test services
- Tests cover validation, permissions, uploads, filtering, transactions, synchronization, and error handling
- Reusable helpers, mocks, and factories reduce duplication across the testing architecture
- Tests are isolated to ensure deterministic and consistent behavior across the stack

Dedicated backend testing documentation is available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

Dedicated frontend testing documentation is also available:

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

These testing strategies help ensure reliable backend workflows, predictable frontend behavior, safer refactoring, and maintainable long-term fullstack development.

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

### 📁 Upload Security

- MIME type validation
- File extension validation
- File size limits
- Controlled and normalized upload destinations
- Secure uploaded file replacement and cleanup
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

These mechanisms help ensure secure data handling, predictable application behavior, transaction-safe workflows, and strong protection against unauthorized access and unsafe operations across the entire fullstack application.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Introduced URL-synchronized filters, pagination, and active views
- Added creator-based search and advanced event filtering
- Implemented image upload UI (avatars and event images) with preview and drag-and-drop
- Improved contextual empty states and loading experience
- Refactored the frontend API layer and normalization helpers
- Improved feature-oriented frontend architecture and reusable logic organization
- Added reusable frontend factories, mocks, and testing helpers
- Introduced a safe-scope frontend testing strategy during the UI refactor
- Added dedicated frontend testing documentation (`frontend/docs/testing.md`)

### 🔧 Backend

- Refactored the backend into a more modular and scalable architecture
- Centralized event filtering, pagination, query builders, and reusable query utilities
- Added creator-based filtering across public and authenticated event listings
- Introduced centralized formatting utilities and reusable API response structures
- Added transaction-safe workflows for critical operations
- Implemented centralized security policies (uploads, password rules, CORS)
- Improved authorization architecture and protected action handling
- Added organizer ownership transfer and soft-delete membership lifecycle handling
- Added automatic uploaded file cleanup with path normalization protection
- Strengthened upload validation, centralized logging, error handling, and API consistency
- Added database indexes and improved Sequelize query consistency
- Added dedicated backend testing documentation (`backend/docs/testing.md`)

### 🧪 Testing

- Expanded backend testing architecture to 570 tests across 76 test suites
- Added automated backend CI workflows using GitHub Actions and PostgreSQL test services
- Added dedicated backend and frontend testing documentation
- Improved reusable frontend and backend factories, mocks, and helpers
- Expanded testing coverage across permissions, uploads, filtering, validation, synchronization, and business rules
- Improved testing maintainability and long-term refactor safety across the fullstack architecture

---

## 📌 Project Status

| Area | Status |
|---|---|
| Backend Architecture | ✅ Modular, scalable & production-oriented |
| Frontend Application | 🚧 Functional, with UI/pages refactor in progress |
| Authentication & RBAC | ✅ Complete |
| Security | ✅ Centralized & robust |
| Database & Transactions | ✅ Optimized and transaction-safe |
| Backend Testing & CI | ✅ Stable with GitHub Actions CI |
| Frontend Testing | 🚧 357 safe-scope tests passing |
| Documentation | ✅ Backend and frontend testing documentation available |
| Backend API | ✅ Stable and well-tested |
| UX & Frontend Refactor | 🚧 Ongoing improvements |

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

- Continue the frontend UI and page refactor
- Improve mobile responsiveness and accessibility
- Enhance UI consistency, animations, and loading transitions
- Improve frontend state management and API synchronization
- Expand reusable frontend hooks and feature abstractions

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
- Improving maintainability and backend organization through large-scale refactoring

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
- Improving reliability through automated testing, CI workflows, edge cases, database isolation, and rollback validation

### 🧱 Architecture & Practices

- Applying separation of concerns across backend and frontend
- Designing maintainable and scalable codebases
- Aligning frontend and backend validation logic
- Structuring applications around reusable and domain-driven features
- Building consistent API-driven frontend/backend interactions
- Designing reusable and centralized backend architecture patterns
- Writing clean, testable, and production-oriented code

---
