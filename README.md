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

![Backend Tests](https://img.shields.io/badge/backend-715%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/backend%20coverage-99.27%25%20statements%20%7C%2095.33%25%20branches-brightgreen)

![Frontend Tests](https://img.shields.io/badge/frontend-1363%20passing-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-96.49%25%20statements%20%7C%2093.01%25%20branches-brightgreen)

![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a fullstack event management platform that enables users to create, discover, join, and manage collaborative events through a secure role-aware system.

The project combines:

- a **Node.js / Express backend API** responsible for authentication, permissions, business logic, validation, uploads, and data persistence
- a **React frontend application** providing a responsive, accessibility-focused, and permission-aware user experience with advanced filtering, location-aware workflows, interactive maps, and protected routes

Together, these layers deliver secure data handling, synchronized permissions, automated testing, and a consistent end-to-end user experience.

---

## 🎯 Key Highlights

- 🧪 **2078 automated tests** across backend and frontend (Jest, Supertest, Vitest, React Testing Library)
- 📊 **High automated test coverage** (~99% backend / ~96% frontend)
- 🔁 **Dedicated backend and frontend CI pipelines** with GitHub Actions
- 🔐 **Secure authentication and RBAC** with centralized validation and permission management
- 🧱 **Modular fullstack architecture** with layered backend services and a feature-oriented React frontend
- ♿ **Accessibility-focused frontend** with semantic HTML, ARIA support, and keyboard-friendly interactions
- 🌍 **Location-aware event workflows** powered by OpenStreetMap and geolocation services
- 🔄 **Transaction-safe backend workflows** with filtering, pagination, and optimized database operations
- 🔍 **Advanced search, filtering, pagination, and URL-synchronized event listings** across public and authenticated views
- 👤 **Public user profiles and event activity pages** showcasing created and joined events
- 🖼️ **Shared upload workflows** with previews, validation, and image lifecycle management

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

PlanTogether is a fullstack event management platform that combines a secure backend API with a modern, responsive, and role-aware frontend application.

Users can:

- create, manage, and participate in events
- browse, search, sort, and filter events
- discover events through location search and interactive maps
- upload and manage avatars and event images
- manage profiles and authenticated sessions
- interact with role-based and permission-aware event workflows
- browse public user profiles and event activity

The platform provides:

- secure authentication and protected routes
- centralized filtering, pagination, and query synchronization
- geolocation-aware event discovery powered by OpenStreetMap
- responsive and accessibility-focused user interfaces
- transaction-safe backend workflows and consistent API behavior
- synchronized permissions across frontend and backend layers

Together, the frontend and backend deliver secure data handling, predictable behavior, and a consistent end-to-end user experience.

---

## ⚙️ Getting Started

### Requirements:

- Node.js
- PostgreSQL
- npm

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

Create a `.env` file inside the `backend` folder using `.env.example` as a reference.

A `.env.example` file is provided as a reference configuration. Test environments should use a separate local test configuration.

```env
NODE_ENV=development

PORT=3000
JWT_SECRET=your_jwt_secret_here

DB_HOST=localhost
DB_PORT=5432

DB_USER=postgres
DB_PASSWORD=your_database_password

DB_NAME=plantogether_db
DB_NAME_TEST=plantogether_test

UPLOAD_DIR=uploads

DB_LOGGING=false
DB_SSL=false

LOG_LEVEL=info

AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10

LOCATION_RATE_LIMIT_WINDOW_MS=60000
LOCATION_RATE_LIMIT_MAX=30

LOCATION_PROVIDER=nominatim
GEOCODING_USER_AGENT=PlanTogether/1.0

NOMINATIM_SEARCH_URL=https://nominatim.openstreetmap.org/search
GEOCODING_RESULT_LIMIT=5

CORS_ORIGIN=http://localhost:5173
```

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

Create a `.env` file inside the `frontend` folder using `.env.example` as a reference:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend development server:

```bash
npm run dev
```

### 4️⃣ Access the Application

Frontend:

```txt
http://localhost:5173
```

Backend API:

```txt
http://localhost:3000/api
```

---

## 📖 Project Documentation

Detailed documentation is available for both application layers and their testing architectures.

### Backend

👉 `/backend/README.md`

Covers backend architecture, API workflows, security, validation, geolocation features, database operations, and CI integration.

👉 `/backend/docs/testing.md`

Covers backend testing architecture, integration and unit testing, database isolation, reusable test utilities, and CI workflows.

### Frontend

👉 `/frontend/README.md`

Covers frontend architecture, reusable features and hooks, authentication, maps, query synchronization, API integration, and UI patterns.

👉 `/frontend/docs/testing.md`

Covers frontend testing architecture, testing layers, reusable utilities, accessibility testing, and mocking strategies.

---

## 🛠️ Tech Stack

The project uses a modern fullstack stack combining a secure backend API, a responsive React frontend, centralized business logic, and comprehensive automated testing.

### 🔧 Backend

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT authentication
- bcrypt
- express-validator
- Multer
- Helmet
- express-rate-limit
- Pino
- Sequelize transactions

### ⚛️ Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- Context API
- custom hooks
- feature-oriented architecture
- React Leaflet
- OpenStreetMap / Nominatim

### 🧪 Testing Stack

#### Backend

- Jest
- Supertest
- isolated PostgreSQL test database

#### Frontend

- Vitest
- React Testing Library
- jsdom

### 🔁 Continuous Integration

- GitHub Actions
- separate backend and frontend CI workflows

---

## 📁 Fullstack Structure

The project is organized into two main applications: a backend API and a frontend client, each following a modular and maintainable architecture.

This separation creates clear boundaries between backend business logic, data management, security, frontend application logic, testing, and user interface behavior.

```txt
planTogether/
├── backend/
│   ├── docs/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── tests/
│   ├── uploads/
│   └── README.md
│
├── frontend/
│   ├── docs/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── tests/
│   │   └── utils/
│   └── README.md
│
└── README.md
```

### Structure Highlights

- **Backend** centralizes API endpoints, business logic, validation, security, database access, uploads, and automated testing.
- **Frontend** follows a feature-oriented architecture with reusable components, hooks, routing, API integration, location-aware workflows, and automated testing.
- **Testing** is maintained independently for each application, with dedicated documentation and testing strategies.

This structure promotes maintainability, separation of concerns, testing consistency, and long-term scalability across both backend and frontend layers.

---

## ✨ Features

### 🔐 Authentication

- User registration and login with JWT authentication
- Secure password hashing and authentication rate limiting
- Profile management with avatar upload support
- Password updates with current password verification
- Session persistence with optional "Remember me" functionality
- Protected routes, authentication persistence, and redirect restoration

### 📅 Event Management

- Create, update, delete, and browse events
- Upload and manage event images
- Event status-aware workflows (upcoming, ongoing, ended)
- Frontend and backend validation
- Started-event restrictions and protected event actions
- Centralized filtering, sorting, pagination, and listing behavior
- URL-synchronized views and query parameters
- Transaction-safe backend workflows

### 🌍 Location & Discovery

- Location search powered by OpenStreetMap and Nominatim
- Interactive event maps
- Geolocation-aware event workflows
- Location-based event discovery and filtering

### 👥 Participation & Community

- Join and leave events
- Role-aware event participation
- Organizer ownership transfer workflows
- Personalized dashboards with active and historical events
- Public user profiles with organized and joined event history
- Membership restoration and soft-delete lifecycle handling

### 🔍 Search & Filtering

- Keyword, creator, type, theme, and location filters
- Exact-date and date-range filtering
- Combined filtering, sorting, and pagination
- URL-synchronized filters and active views
- Centralized query synchronization behavior

### 🎭 Roles & Permissions

The application enforces a strict role hierarchy:

```txt
organizer > co_organizer > participant
```

Access control is enforced through:

- role-based access control (RBAC)
- centralized permission validation
- protected routes and frontend access guards
- permission-aware UI behavior
- strict role hierarchy enforcement

### 🖼️ Uploads & Media

- Shared avatar and event image upload workflows
- Drag-and-drop uploads with previews
- Secure upload validation and protected file handling
- Image preservation, replacement, removal, and cleanup workflows

### 📄 User Experience

- Responsive and accessibility-focused UI
- Semantic HTML and ARIA-aware interactions
- Keyboard-friendly navigation
- Contextual loading, validation, and empty states
- Reusable component architecture and consistent user workflows

---

## 🧱 Architecture

PlanTogether follows a modular fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend uses a layered architecture organized around:

- Routes and Controllers → API endpoints and request handling
- Services → business logic, permissions, and workflows
- Models → database structure and Sequelize relations
- Validators and Middlewares → validation, authentication, authorization, uploads, rate limiting, and error handling
- Utils, Config, and Constants → shared helpers, environment configuration, logging, and business rules

This architecture provides centralized security, role-based access control (RBAC), transaction-safe operations, filtering and pagination utilities, upload management, and consistent API behavior.

### ⚛️ Frontend

The frontend follows a feature-oriented architecture organized around:

- Pages and Components → application views and reusable UI elements
- API Layer → centralized API communication and normalization
- Context and Hooks → authentication state and reusable interaction logic
- Features → domain-specific business logic and query synchronization
- Utils and Tests → shared helpers, factories, mocks, and testing utilities

This architecture supports permission-aware interfaces, synchronized filtering and navigation, location-aware workflows, reusable UI patterns, protected routes, accessibility-focused interactions, and scalable feature development.

Together, these architectural layers help maintain consistent behavior, predictable workflows, strong separation of concerns, and long-term maintainability across the application.

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

- Backend: **715 tests** across **88 test suites**
- Frontend: **1363 tests** across **136 test files**
- Total: **2078 automated tests**
- ✅ High automated coverage across the fullstack application
- ✅ Separate backend and frontend CI workflows

### 📦 Coverage Areas

#### 🔧 Backend

- authentication, authorization, and security
- event management and memberships
- filtering, pagination, and geolocation workflows
- uploads, validation, and error handling
- transactions, soft deletes, and ownership transfers
- services, middleware, utilities, and database workflows

#### ⚛️ Frontend

- authentication, routing, and protected access
- feature-oriented business logic and reusable hooks
- filtering, pagination, query synchronization, and maps
- uploads, validation, and permission-aware interactions
- API integration, state management, and reusable utilities
- accessibility, semantic structure, and user interactions

### 🔁 Test Strategy

- Backend tests combine integration and unit testing with an isolated PostgreSQL test database.
- Frontend tests validate business logic and user-facing behavior using Vitest and React Testing Library.
- API calls are mocked on the frontend to isolate UI behavior.
- Reusable factories, mocks, helpers, and render utilities reduce duplicated test setup.
- Separate GitHub Actions workflows automatically validate backend and frontend changes.

Detailed testing documentation is available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

These testing strategies support reliable workflows, safer refactoring, and long-term maintainability across the fullstack application.

---

## 🔐 Security

PlanTogether implements multiple security mechanisms to protect data, enforce access control, and maintain consistent behavior across both backend and frontend layers.

### 🔑 Authentication & Access Control

- JWT-based authentication
- Password hashing with bcrypt
- Authentication rate limiting
- Protected API endpoints and frontend routes
- Role-based access control (RBAC)
- Centralized permission validation and role hierarchy enforcement

### 🛡️ Validation & Data Protection

- Backend and frontend validation of request bodies, query parameters, and route parameters
- Password policy enforcement
- Sensitive data protection through Sequelize scopes
- Email normalization and consistent error handling

### 📁 Upload Security

- MIME type and file extension validation
- File size restrictions and protected upload handling
- Secure upload destinations and path normalization
- Upload cleanup, replacement, and rollback protection

### ⚙️ Infrastructure & Application Security

- Helmet security headers
- Centralized CORS configuration
- SQL injection protection through Sequelize parameterized queries
- Transaction-safe database operations
- Centralized logging and environment-based configuration

These security mechanisms help protect user data, enforce permissions, prevent unauthorized actions, and maintain predictable application behavior across the fullstack architecture.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Added location-aware event workflows with interactive maps and location search
- Expanded public user profiles and event activity pages
- Improved filtering, pagination, query synchronization, and clean URL behavior
- Strengthened accessibility, responsive UI patterns, and reusable component architecture
- Enhanced upload workflows, image lifecycle handling, and protected frontend interactions

### 🔧 Backend

- Centralized filtering, pagination, geolocation, and query utilities
- Added transaction-safe workflows, ownership transfers, and soft-delete lifecycle handling
- Expanded permissions, validation, upload handling, and API consistency
- Improved public user profile and event activity workflows

### 🧪 Testing

- Reached **2078 automated tests** across backend and frontend
- Expanded coverage for permissions, geolocation, uploads, validation, routing, accessibility, and business workflows
- Added dedicated backend and frontend testing documentation
- Maintained high automated coverage across the fullstack application

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Backend | ✅ Modular architecture, secure API, transaction-safe workflows, and comprehensive test coverage |
| Frontend | ✅ Feature-oriented architecture, responsive UI, accessibility-focused interactions, and permission-aware workflows |
| Authentication & Permissions | ✅ JWT authentication and RBAC synchronized across backend and frontend |
| Geolocation & Maps | ✅ Location search, geolocation workflows, and OpenStreetMap integration implemented |
| Uploads & Media | ✅ Shared avatar and event image workflows with validation and lifecycle handling |
| Testing & CI | ✅ 2078 automated tests with dedicated backend and frontend CI pipelines |
| Documentation | ✅ Backend, frontend, and testing documentation available |

---

## 🔮 Future Improvements

### 🚀 Features

- Event invitations and sharing workflows
- Notifications and reminder systems
- Public and private events with expanded access controls
- Event capacity management and registration deadlines
- Participation analytics and event reporting

### 👥 Community & Moderation

- Advanced membership management and moderation workflows
- Event activity feeds and audit logs
- Membership history and role tracking
- Enhanced archived and historical event management

### ⚛️ Frontend & User Experience

- Continued UI component extraction and architecture refinement
- Additional accessibility and responsive design improvements
- Richer feedback systems (toasts, notifications, async states)
- Enhanced animations, transitions, and interaction feedback
- Further expansion of reusable hooks and listing abstractions

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Cloud deployment and production environment setup
- Expanded CI/CD automation
- Production-ready file storage strategies
- OpenAPI / Swagger documentation

---

## 🧠 What I Learned

Through this project, I strengthened my fullstack development skills by building a production-oriented application focused on architecture, security, testing, maintainability, and long-term scalability.

### 🔧 Backend Development

- Designing modular and maintainable REST APIs
- Implementing secure authentication, authorization, and role-based access control (RBAC)
- Managing relational data and complex business workflows with PostgreSQL and Sequelize
- Building reusable validation, filtering, pagination, upload, and query utilities
- Working with transactions, soft-delete workflows, and data consistency patterns
- Designing secure file upload and lifecycle management systems

### ⚛️ Frontend Development

- Structuring a feature-oriented React application
- Managing authentication, routing, and global state with Context API
- Building reusable hooks, components, and shared business logic
- Implementing permission-aware, status-aware, and accessibility-focused user interfaces
- Synchronizing application state with URL parameters, filters, and navigation workflows
- Creating responsive user experiences with uploads, maps, forms, validation, and asynchronous interactions

### 🧪 Testing & Quality Assurance

- Writing backend and frontend automated tests with Jest, Supertest, Vitest, and React Testing Library
- Testing business rules, permissions, validation, uploads, and user-facing workflows
- Building reusable testing utilities, factories, mocks, and isolated test environments
- Improving reliability through CI workflows, database isolation, and regression testing

### 🧱 Architecture & Engineering Practices

- Applying separation of concerns across frontend and backend layers
- Designing scalable and maintainable application architectures
- Aligning frontend and backend validation, permissions, and business rules
- Building consistent API-driven workflows and reusable abstractions
- Writing clean, testable, and production-oriented code

---
