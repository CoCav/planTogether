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

![Backend Tests](https://img.shields.io/badge/backend-815%20passing-brightgreen)
![Backend Coverage](https://img.shields.io/badge/backend%20coverage-99.29%25%20statements%20%7C%2094.02%25%20branches-brightgreen)

![Frontend Tests](https://img.shields.io/badge/frontend-1522%20passing-brightgreen)
![Frontend Coverage](https://img.shields.io/badge/frontend%20coverage-96.39%25%20statements%20%7C%2093.27%25%20branches-brightgreen)

![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a fullstack event management platform that enables users to create, discover, join, review, and manage collaborative events through a secure role-aware system.

The project combines:

- a **Node.js / Express backend API** responsible for authentication, permissions, business logic, validation, uploads, and data persistence
- a **React frontend application** providing a responsive, accessibility-focused, and permission-aware user experience with advanced filtering, location-aware workflows, interactive maps, and protected routes

Together, these layers deliver secure data handling, synchronized permissions, automated testing, and a consistent end-to-end user experience.

---

## 🎯 Key Highlights

- 🧪 **2337 automated tests** across backend and frontend (Jest, Supertest, Vitest, React Testing Library)
- 📊 **High automated test coverage** (~99% backend / ~96% frontend)
- 🔁 **Dedicated backend and frontend CI pipelines** with GitHub Actions
- 🔐 **Secure authentication and RBAC** with centralized validation and permission management
- ⭐ **Event reviews and ratings** with review statistics and average scores
- 🧱 **Modular fullstack architecture** with layered backend services and a feature-oriented React frontend
- ♿ **Accessibility-focused frontend** with semantic HTML, ARIA support, and keyboard-friendly interactions
- 🌍 **Location-aware event workflows** powered by OpenStreetMap and geolocation services
- 🔄 **Transaction-safe backend workflows** with filtering, pagination and optimized database operations
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

- create, join, manage, and review events
- browse, search, filter, and discover events
- explore events through location search and interactive maps
- manage profiles, sessions, avatars, and event images
- interact with permission-aware event workflows
- browse public user profiles and event activity

The platform provides:

- secure authentication and role-based access control
- event reviews, ratings, and aggregated statistics
- filtering, pagination, and query synchronization
- geolocation-aware event discovery powered by OpenStreetMap
- responsive and accessibility-focused user interfaces
- transaction-safe backend workflows and consistent API behavior
- synchronized permissions across frontend and backend layers

Together, the frontend and backend deliver secure data handling, predictable behavior, and a consistent end-to-end user experience.

---

## ⚙️ Getting Started

### Requirements

- Node.js
- PostgreSQL
- npm

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

Create a `.env` file using `.env.example` as a reference.

Start the backend development server:

```bash
npm run dev
```

The backend API runs on:

```txt
http://localhost:3000/api
```

### 3️⃣ Setup the Frontend

```bash
# from the project root
cd frontend
npm install
```

Create a `.env` file using `.env.example` as a reference:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the frontend development server:

```bash
npm run dev
```

The frontend runs on:

```txt
http://localhost:5173
```

### 📌 Notes

- Ensure PostgreSQL is running before starting the backend.
- Create the configured development and test databases before running the application or automated tests.
- See the backend and frontend documentation for detailed setup and environment configuration.

---

## 📖 Project Documentation

Detailed documentation is available for both application layers and their testing architectures.

### Backend

👉 `/backend/README.md`

Covers backend architecture, API workflows, security, validation, geolocation services, database operations, and CI integration.

👉 `/backend/docs/testing.md`

Covers backend testing architecture, integration and unit testing, database isolation, reusable test utilities, and CI workflows.

### Frontend

👉 `/frontend/README.md`

Covers frontend architecture, features, authentication, maps, query synchronization, API integration, and UI patterns.

👉 `/frontend/docs/testing.md`

Covers frontend testing architecture, testing layers, reusable utilities, accessibility testing, and mocking strategies.

---

## 🛠️ Tech Stack

The project uses a modern fullstack stack combining a secure backend API, a responsive React frontend, and comprehensive automated testing.

### 🔧 Backend

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- bcrypt
- express-validator
- Multer
- Helmet
- express-rate-limit
- Pino

### ⚛️ Frontend

- React
- Vite
- React Router
- Axios
- Context API
- Custom Hooks
- Feature-Oriented Architecture
- React Leaflet
- OpenStreetMap / Nominatim

### 🧪 Testing Stack

#### Backend

- Jest
- Supertest
- PostgreSQL test database

#### Frontend

- Vitest
- React Testing Library
- jsdom

### 🔁 Continuous Integration

- GitHub Actions
- Separate backend and frontend CI workflows

---

## 📁 Fullstack Structure

The project is organized into two main applications: a backend API and a frontend client, each following a modular and maintainable architecture.

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

- **Backend** centralizes API endpoints, business logic, validation, security, database access, uploads, and testing.
- **Frontend** follows a feature-oriented architecture with reusable components, routing, API integration, location-aware workflows, and testing.
- **Testing** is maintained independently for each application with dedicated documentation and testing strategies.

This structure promotes separation of concerns, maintainability, and long-term scalability across the project.

---

## ✨ Features

### 🔐 Authentication

- JWT authentication and secure password management
- Profile management with avatar uploads
- Session persistence with optional "Remember me" support
- Protected routes, authentication restoration, and redirect handling

### 📅 Event Management

- Create, update, delete, and browse events
- Event image uploads and media management
- Status-aware workflows (`upcoming`, `ongoing`, `ended`)
- Filtering, sorting, pagination, and URL-synchronized views
- Validation, started-event restrictions, and transaction-safe operations

### ⭐ Reviews & Ratings

- Create, edit, and delete event reviews
- Interactive 1–5 star ratings
- Review ownership controls
- Review statistics and average event scores
- Completed-event review workflows

### 🌍 Location & Discovery

- OpenStreetMap and Nominatim integration
- Interactive event maps
- Location search and event discovery

### 👥 Participation & Community

- Join and leave events
- Role-aware event participation
- Ownership transfer and membership management
- Personalized dashboards and public user profiles

### 🔍 Search & Filtering

- Keyword, creator, type, theme, and location filters
- Exact-date and date-range filtering
- Combined sorting, pagination, and URL-synchronized views
- Centralized query synchronization

### 🎭 Roles & Permissions

The application enforces a strict role hierarchy:

```txt
organizer > co_organizer > participant
```

Access control includes:

- role-based access control (RBAC)
- centralized permission validation
- protected routes and access guards
- permission-aware UI behavior

### 🖼️ Uploads & Media

- Avatar and event image uploads
- Drag-and-drop uploads with previews
- Image preservation, replacement, and cleanup workflows

### 📄 User Experience

- Responsive and accessibility-focused UI
- Semantic HTML and ARIA-aware interactions
- Keyboard-friendly navigation
- Contextual loading, validation, and empty states

---

## 🧱 Architecture

PlanTogether follows a modular fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend uses a layered architecture organized around:

- Routes and Controllers → API endpoints and request handling
- Services → business logic, permissions, and workflows
- Models → database structure and Sequelize relations
- Validators and Middlewares → validation, authentication, authorization, uploads, rate limiting, and error handling
- Shared Utilities and Configuration → environment management, logging, and reusable helpers

This architecture provides centralized security, role-based access control (RBAC), transaction-safe operations, upload management, and consistent API behavior.

### ⚛️ Frontend

The frontend follows a feature-oriented architecture organized around:

- Pages and Components → application views and reusable UI elements
- API Layer → centralized API communication and normalization
- Context and Hooks → authentication state and reusable interaction logic
- Features → domain-specific business logic and query synchronization
- Shared Utilities and Tests → reusable helpers, testing utilities, and shared workflows

This architecture supports permission-aware interfaces, filtering and navigation workflows, location-aware features, protected routes, accessibility-focused interactions, and scalable feature development.

Together, these layers promote separation of concerns, predictable behavior, and long-term maintainability across the application.

---

## 🧪 Testing

PlanTogether includes a comprehensive automated testing architecture covering both backend and frontend layers.

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

- Backend: **815 tests** across **98 test suites**
- Frontend: **1522 tests** across **149 test files**
- Total: **2337 automated tests**
- ✅ High automated coverage across the fullstack application
- ✅ Dedicated backend and frontend CI workflows

### 📦 Coverage Areas

#### 🔧 Backend

- authentication, authorization, and security
- events, memberships, reviews, and permissions
- filtering, pagination, geolocation, and uploads
- validation, transactions, and database workflows

#### ⚛️ Frontend

- authentication, routing, and protected access
- business logic, reusable hooks, and state management
- filtering, pagination, query synchronization, and maps
- reviews, uploads, and permission-aware interactions
- accessibility, semantic structure, and user interactions

### 🔁 Test Strategy

- Backend combines integration and unit testing with an isolated PostgreSQL test database.
- Frontend validates business logic and user-facing behavior using Vitest and React Testing Library.
- API calls are mocked on the frontend to isolate UI behavior.
- GitHub Actions automatically validate backend and frontend changes.

Detailed testing documentation is available:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

These testing strategies support reliable workflows, safer refactoring, and long-term maintainability across the application.

---

## 🔐 Security

PlanTogether implements multiple security mechanisms to protect data, enforce access control, and maintain consistent behavior across the application.

### 🔑 Authentication & Access Control

- JWT-based authentication
- Password hashing with bcrypt
- Authentication rate limiting
- Protected API endpoints and frontend routes
- Role-based access control (RBAC)
- Centralized permission validation

### 🛡️ Validation & Data Protection

- Backend and frontend validation
- Password policy enforcement
- Sensitive data protection through Sequelize scopes
- Email normalization and consistent error handling

### 📁 Upload Security

- MIME type and file validation
- File size restrictions
- Secure upload handling and path normalization
- Upload cleanup and rollback protection

### ⚙️ Infrastructure & Application Security

- Helmet security headers
- Centralized CORS configuration
- SQL injection protection through Sequelize
- Transaction-safe database operations
- Structured logging and environment-based configuration

These security mechanisms help protect user data, enforce permissions, and maintain predictable application behavior across the platform.

---

## 🚀 Recent Improvements

### ⭐ Reviews & Ratings

- Added a complete event review and rating system
- Added review statistics and average event scores
- Added participant-only and completed-event review workflows
- Integrated review summaries across backend and frontend event pages

### ⚛️ Frontend

- Added review creation, editing, and deletion workflows
- Added interactive star ratings and paginated review listings
- Improved filtering, pagination, query synchronization, and URL behavior
- Expanded accessibility, responsive UI patterns, and reusable component architecture
- Enhanced upload workflows, location-aware features, and interactive maps

### 🔧 Backend

- Added review management, validation, and ownership controls
- Added review aggregation and event statistics workflows
- Expanded permissions, uploads, filtering, pagination, and geolocation features
- Improved transaction-safe operations and API consistency

### 🧪 Testing

- Reached **2337 automated tests** across backend and frontend
- Expanded coverage for reviews, permissions, uploads, geolocation, routing, accessibility, and business workflows
- Added dedicated backend and frontend testing documentation
- Maintained high automated coverage across the fullstack application

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Backend | ✅ Modular architecture, secure API, transaction-safe workflows, and comprehensive test coverage |
| Frontend | ✅ Feature-oriented architecture, responsive UI, accessibility-focused interactions, and permission-aware workflows |
| Authentication & Permissions | ✅ JWT authentication and RBAC synchronized across backend and frontend |
| Reviews & Ratings | ✅ Event reviews, ratings, statistics, and ownership controls implemented |
| Geolocation & Maps | ✅ Location search, geolocation workflows, and OpenStreetMap integration |
| Uploads & Media | ✅ Shared avatar and event image workflows with validation and lifecycle handling |
| Testing & CI | ✅ 2337 automated tests with dedicated backend and frontend CI pipelines |
| Documentation | ✅ Backend, frontend, and testing documentation available |

---

## 🔮 Future Improvements

### 🚀 Features

- Event invitations and sharing workflows
- Notifications and reminder systems
- Public and private event visibility
- Participation analytics and event reporting
- Event activity feeds and moderation tools

### 👥 Community & Moderation

- Membership history and role tracking
- Audit logs and moderation workflows
- Enhanced archived-event management
- Expanded community management features

### ⚛️ Frontend & User Experience

- Continued UI component extraction and architecture refinement
- Additional accessibility and responsive design improvements
- Richer feedback systems (toasts, notifications, async states)
- Enhanced animations and interaction feedback
- Further expansion of reusable hooks and frontend abstractions

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Cloud deployment and production environment setup
- Expanded CI/CD automation
- Production-ready file storage strategies
- OpenAPI / Swagger documentation

---

## 🧠 What I Learned

Through this project, I strengthened my fullstack development skills by building a production-oriented application focused on architecture, security, testing, maintainability, and scalability.

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
- Implementing permission-aware, status-aware, and accessibility-focused interfaces
- Synchronizing application state with URL parameters, filters, and navigation workflows
- Creating responsive user experiences with uploads, maps, forms, validation, and asynchronous interactions

### 🧪 Testing & Quality Assurance

- Writing automated tests with Jest, Supertest, Vitest, and React Testing Library
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
