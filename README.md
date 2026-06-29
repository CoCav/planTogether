# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)
![Accessibility](https://img.shields.io/badge/Accessibility-Semantic%20HTML%20%26%20ARIA-009688)

![Backend Tests](https://img.shields.io/badge/backend-815%20passing-brightgreen)
![Frontend Tests](https://img.shields.io/badge/frontend-1619%20passing-brightgreen)
![Architecture](https://img.shields.io/badge/Architecture-Fullstack%20Modular-blueviolet)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-success)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a fullstack event management platform where users can create, discover, join, review, and manage collaborative events through a secure role-aware system.

The project combines:

- a **Node.js / Express backend API** responsible for authentication, authorization, business logic, validation, file handling, and data persistence
- a **React frontend application** delivering a responsive, accessibility-first, and permission-aware user experience with interactive maps, advanced filtering, and protected navigation

Together, these layers provide secure data handling, synchronized permissions, comprehensive automated testing, and a consistent end-to-end experience.

---

## 🎯 Key Highlights

- 🧪 **2434 automated tests** across backend and frontend
- 📊 **High automated test coverage** across both application layers
- 🔁 **Dedicated CI pipelines** for backend and frontend with GitHub Actions
- 🔐 **JWT authentication and role-based access control (RBAC)** across the full stack
- ⭐ **Event reviews, ratings, and aggregated statistics**
- 🧱 **Modular fullstack architecture** with layered backend services and a feature-oriented React frontend
- ♿ **Accessibility-first frontend** with semantic HTML, ARIA support, and keyboard-friendly interactions
- 🌍 **Location-aware event discovery** powered by OpenStreetMap and backend geocoding services
- 🔄 **Transaction-safe backend operations** with optimized filtering, pagination, and query handling
- 🔍 **Advanced event discovery** with synchronized filtering, sorting, pagination, and URL state
- 👤 **Public profiles, personalized dashboards, and permission-aware workflows**
- 🖼️ **Shared upload system** with previews, validation, replacement, and lifecycle management

---

## 📚 Table of Contents

- [🎯 Application Overview](#-application-overview)
- [⚡ Getting Started](#-getting-started)
- [📖 Project Documentation](#-project-documentation)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Fullstack Structure](#-fullstack-structure)
- [✨ Features](#-features)
- [🧱 Architecture](#-architecture)
- [🧪 Testing & Quality Assurance](#-testing--quality-assurance)
- [🔐 Security](#-security)
- [🚀 Recent Improvements](#-recent-improvements)
- [📌 Project Status](#-project-status)
- [🗺️ Roadmap](#️-roadmap)
- [🧠 What I Learned](#-what-i-learned)

---

## 🚀 Application Overview

PlanTogether combines a secure backend API with a modern React frontend to deliver a complete collaborative event management experience.

Users can:

- create, join, manage, and review events
- browse and discover events through advanced search and filtering
- explore events with location search and interactive maps
- manage profiles, sessions, avatars, and event images
- interact with role-aware and permission-aware workflows
- browse public profiles and personalized event dashboards

Across the platform, users benefit from:

- secure authentication and role-based access control
- review and rating workflows with aggregated statistics
- synchronized filtering, pagination, and navigation state
- geolocation-powered event discovery
- responsive, accessibility-first interfaces
- consistent validation and permission enforcement
- reliable end-to-end workflows backed by transaction-safe operations

Together, the frontend and backend provide a scalable, secure, and consistent user experience.

---

## ⚡ Getting Started

### Requirements

- Node.js
- PostgreSQL
- npm

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`.

Start the development server:

```bash
npm run dev
```

API available at:

```txt
http://localhost:3000/api
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the development server:

```bash
npm run dev
```

Application available at:

```txt
http://localhost:5173
```

### 📌 Notes

- Ensure PostgreSQL is running before starting the backend.
- Create development and test databases if needed.
- Refer to backend and frontend documentation for advanced configuration and environment details.

---

## 📖 Project Documentation

Full documentation is available for both application layers and their testing strategies.

### Backend

👉 `/backend/README.md`
Backend architecture, API workflows, security, validation, geolocation, database, and CI.

👉 `/backend/docs/testing.md`
Testing strategy, integration/unit tests, database isolation, helpers, and CI workflows.

### Frontend

👉 `/frontend/README.md`
Frontend architecture, features, authentication, maps, API integration, and UI patterns.

👉 `/frontend/docs/testing.md`
Testing strategy, UI/logic testing layers, mocks, accessibility testing, and utilities.

---

## 🛠️ Tech Stack

The project is built on a modern fullstack architecture combining a secure Node.js API, a React frontend, and a comprehensive testing and CI pipeline.

### 🔧 Backend

Core backend technologies:

- Node.js
- Express
- PostgreSQL
- Sequelize

Authentication & security:

- JWT (authentication)
- bcrypt (password hashing)
- Helmet (security headers)
- express-rate-limit (rate limiting)
- express-validator (request validation)

Infrastructure & utilities:

- Multer (file uploads)
- Pino (structured logging)

### ⚛️ Frontend

Core frontend stack:

- React
- Vite
- React Router
- Axios

Architecture & patterns:

- Context API
- Custom Hooks
- Feature-oriented architecture

External integrations:

- React Leaflet
- OpenStreetMap / Nominatim (geolocation services)

### 🧪 Testing

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
- Separate CI pipelines for backend and frontend
- Automated test execution on push and pull requests

---

## 📁 Fullstack Structure

The project is organized as two independent but connected applications: a backend API and a frontend client. Each follows its own modular architecture and includes dedicated documentation and testing strategies.

```txt id="structure-tree"
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

### 🧩 Architecture Overview

- The **backend** encapsulates API routes, business logic, validation, security layers, database access, file uploads, and automated testing.
- The **frontend** implements a feature-oriented architecture with reusable components, client-side routing, API integration, geolocation workflows, and testing utilities.
- Each application maintains its own dedicated test suite, documentation, and development workflow.

### 📌 Design Principles

- Clear separation between backend and frontend responsibilities
- Modular and scalable folder structures on both sides
- Independent testing strategies per application layer
- Shared focus on maintainability, reusability, and long-term scalability

This structure enables parallel development while keeping the codebase organized, predictable, and easy to extend.

---

## ✨ Features

### 🔐 Authentication & Account

- Secure authentication with JWT
- Profile management with avatar support
- Session persistence with optional "Remember me"
- Protected routes, session restoration, and redirect handling

### 📅 Event Management

- Full event lifecycle (create, update, delete, browse)
- Media handling with image upload and management
- Status-aware events (`upcoming`, `ongoing`, `ended`)
- Filtering, sorting, pagination, and URL-synchronized navigation
- Validation, transactional safety, and business-rule enforcement

### ⭐ Reviews & Ratings

- Event reviews with full CRUD support
- 1–5 star rating system
- Ownership-protected review actions
- Aggregated statistics (average rating, review counts)
- Completed-event review workflows

### 🌍 Discovery & Location

- OpenStreetMap / Nominatim integration
- Interactive event maps
- Location-based search and discovery

### 👥 Participation & Community

- Join and leave events
- Role-aware participation system
- Ownership transfer and membership management
- Public user profiles and personalized dashboards

### 🔍 Search & Filtering

- Multi-criteria filtering (keyword, creator, type, theme, location)
- Exact-date and date-range queries
- Sorting, pagination, and URL-synchronized state
- Centralized query management across views

### 🎭 Roles & Permissions

Strict role hierarchy:

```txt
organizer > co_organizer > participant
```

Core principles:

- Role-based access control (RBAC)
- Centralized permission enforcement
- Protected routes and guards
- Permission-aware UI behavior

### 🖼️ Media & Uploads

- Avatar and event image uploads
- Drag-and-drop with preview support
- Image lifecycle management (replace, preserve, delete)

### 📄 User Experience

- Responsive, accessibility-first interface
- Semantic HTML and ARIA compliance
- Keyboard-friendly navigation
- Consistent loading, empty, and error states

---

## 🧱 Architecture

PlanTogether follows a modular fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend is structured around dedicated layers responsible for:

- API routing and request handling
- business logic and permission enforcement
- database models and persistence
- authentication, validation, authorization, uploads, and error handling
- shared configuration, logging, and supporting utilities

This layered architecture provides secure API behavior, centralized business rules, transaction-safe operations, and consistent data management.

### ⚛️ Frontend

The frontend follows a feature-oriented architecture built around:

- pages and reusable UI components
- centralized API communication
- shared state, hooks, and interaction logic
- feature-specific business logic
- styling, testing, and shared utilities

This architecture supports responsive interfaces, permission-aware workflows, location-based features, accessibility, and scalable frontend development.

Together, these application layers promote separation of concerns, predictable behavior, and long-term maintainability across the platform.

---

## 🧪 Testing & Quality Assurance

PlanTogether includes a comprehensive testing strategy spanning both backend and frontend applications.

### ▶️ Run Tests

#### Backend

```bash
npm test
```

#### Frontend

```bash
npm run test:run
```

### 📊 Testing Results

- **Backend:** 815 passing tests across 98 test suites
- **Frontend:** 1619 passing tests across 153 test files
- **Total:** **2434 automated tests**
- ✅ High automated coverage across the entire platform
- ✅ Dedicated GitHub Actions CI pipelines for backend and frontend

### 📦 Coverage Overview

#### 🔧 Backend

- authentication, authorization, and security
- events, memberships, reviews, and permissions
- filtering, pagination, uploads, and geolocation
- validation, transactions, and database operations

#### ⚛️ Frontend

- authentication, routing, and protected navigation
- business logic, hooks, and state management
- filtering, pagination, query synchronization, and maps
- reviews, uploads, and permission-aware workflows
- accessibility, semantic HTML, and user interactions

### 🔁 Testing Approach

- The backend combines integration and unit tests using an isolated PostgreSQL test database.
- The frontend validates business logic and user-facing behavior with Vitest and React Testing Library.
- Frontend API requests are mocked to isolate UI behavior.
- GitHub Actions automatically validate changes across both applications.

For detailed testing documentation, see:

👉 [`/backend/docs/testing.md`](./backend/docs/testing.md)

👉 [`/frontend/docs/testing.md`](./frontend/docs/testing.md)

Together, these testing strategies help ensure reliable releases, safer refactoring, and long-term maintainability across the platform.

---

## 🔐 Security

PlanTogether implements a layered security model to ensure data protection, controlled access, and consistent application behavior across the full stack.

### 🔑 Authentication & Access Control

- JWT-based authentication
- Secure password hashing with bcrypt
- Protected routes and API endpoints
- Role-based access control (RBAC)
- Centralized permission validation
- Authentication rate limiting

### 🛡️ Data Protection & Validation

- Consistent validation across backend and frontend
- Password policy enforcement
- Sensitive data protection via ORM scopes
- Email normalization and unified error handling

### 📁 Upload Security

- File type and size validation
- Secure upload handling with path normalization
- Safe cleanup and rollback protection for failed operations

### ⚙️ Infrastructure Security

- HTTP security headers (Helmet)
- Centralized CORS configuration
- SQL injection protection via ORM parameterization
- Transaction-safe database operations
- Structured logging and environment-based configuration

Together, these mechanisms help ensure secure data handling, consistent authorization, and predictable behavior across the platform.

---

## 🚀 Recent Improvements

### ⭐ Reviews & Ratings System

- Introduced a complete event review and rating system
- Added review statistics with aggregated average scores
- Implemented participant-only and completed-event review workflows
- Integrated review insights across event listings and detail views

### ⚛️ Frontend Enhancements

- Implemented complete review workflows with interactive star ratings and paginated review views
- Introduced a global toast notification system for consistent user feedback
- Improved filtering, pagination, and URL-synchronized navigation
- Enhanced accessibility, responsive layouts, and reusable component architecture
- Refined upload workflows, geolocation features, and interactive maps
- Strengthened permission-aware interactions and auth-ready loading behavior

### 🔧 Backend Enhancements

- Added review management with ownership validation and business rules
- Implemented review aggregation and event-level statistics
- Expanded geolocation services with caching and fallback search
- Strengthened permission management, validation, and transaction-safe operations
- Improved API consistency through shared response, error, and pagination handling

### 🧪 Testing & Quality Assurance

- Reached **2434 automated tests** across backend and frontend
- Expanded coverage across reviews, permissions, uploads, geolocation, routing, and accessibility
- Strengthened integration between frontend and backend test strategies
- Maintained high automated coverage across the full platform

---

## 📌 Project Status

| Area                         | Status                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Backend                      | ✅ Modular architecture, secure API, transaction-safe workflows, and comprehensive test coverage                   |
| Frontend                     | ✅ Feature-oriented architecture with responsive UI, accessibility improvements, and permission-aware interactions |
| Authentication & Permissions | ✅ JWT-based authentication and RBAC consistently enforced across the stack                                        |
| Reviews & Ratings            | ✅ Full review system with ratings, statistics, and ownership validation                                           |
| Geolocation & Maps           | ✅ Location search, geocoding workflows, and OpenStreetMap integration                                             |
| Uploads & Media              | ✅ Shared upload system with validation, previews, and lifecycle management                                        |
| Testing & CI                 | ✅ 2434 automated tests with dedicated backend and frontend CI pipelines                                           |
| Documentation                | ✅ Backend, frontend, and testing documentation fully maintained and synchronized                                  |

---

## 🗺️ Roadmap

### 🚀 Product Features

- Event invitations and sharing improvements
- Notification and reminder system expansion
- Enhanced event visibility (public/private controls)
- Activity feeds and richer event discovery
- Event analytics and reporting features

### 👥 Community & Moderation

- Membership history and role tracking
- Moderation tools and audit logging
- Improved archived-event lifecycle management
- Expanded community management capabilities

### ⚛️ Frontend & User Experience

- Continued UI architecture refinement and component extraction
- Further accessibility and responsive design improvements
- Enhanced feedback systems (toasts, async states, notifications)
- Improved interaction feedback and micro-animations
- Expansion of reusable hooks and frontend abstractions

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Production environment setup and cloud deployment
- Expanded CI/CD automation
- Production-ready file storage strategy
- API documentation with OpenAPI / Swagger

---

## 🧠 What I Learned

Developing PlanTogether strengthened my fullstack engineering skills by designing a production-oriented application with a strong focus on architecture, security, testing, maintainability, and long-term scalability.

### 🔧 Backend Engineering

- Designing modular and maintainable REST APIs
- Implementing secure authentication, authorization, and role-based access control (RBAC)
- Modeling relational data and complex business workflows with PostgreSQL and Sequelize
- Building shared validation, filtering, pagination, upload, and query utilities
- Working with transactions, soft-delete workflows, and data consistency patterns
- Designing secure file upload and lifecycle management systems

### ⚛️ Frontend Engineering

- Structuring a scalable feature-oriented React application
- Managing authentication, routing, shared state, and user feedback
- Building reusable hooks, providers, components, and business logic
- Developing permission-aware, accessibility-first, and responsive interfaces
- Synchronizing application state with URLs, filters, pagination, and navigation
- Integrating maps, uploads, forms, validation, and asynchronous workflows

### 🧪 Testing & Quality

- Building comprehensive automated test suites with Jest, Supertest, Vitest, and React Testing Library
- Validating business rules, permissions, validation, uploads, and end-user workflows
- Creating shared factories, mocks, helpers, and isolated testing environments
- Improving reliability through CI pipelines, database isolation, and regression testing


### 🧱 Software Architecture

- Applying clear separation of concerns across backend and frontend layers
- Designing scalable, maintainable, and testable application architectures
- Aligning frontend and backend validation, permissions, and business rules
- Building consistent API-driven workflows and shared abstractions
- Writing clean, production-ready code with long-term maintainability in mind

---
