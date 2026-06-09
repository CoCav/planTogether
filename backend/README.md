# PlanTogether - Backend API (Node.js)

PlanTogether is a collaborative event management platform where users can create, join, and manage events through a role-based permission system.

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)

![API](https://img.shields.io/badge/API-REST-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Test Suites](https://img.shields.io/badge/test%20suites-79%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-650%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-99.14%25%20statements%20%7C%2094.65%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **backend REST API** of PlanTogether, built with **Node.js, Express, PostgreSQL, and Sequelize**.

The API manages authentication, events, memberships, uploads, permissions, validation, and business rules through a modular architecture focused on scalability, maintainability, and predictable backend behavior.

Users can create, join, leave, update, and manage events depending on their role:

- `organizer`
- `co_organizer`
- `participant`

The backend architecture emphasizes:

- service-oriented and layered backend architecture
- centralized validation, security, permissions, and error handling
- reusable filtering, pagination, formatting, and query utilities
- secure authentication, uploads, and protected file handling
- transaction-safe workflows and optimized query strategies
- consistent API responses and predictable business logic
- structured logging with Pino
- automated CI workflows with extensive unit and integration test coverage

The backend is designed to provide secure data handling, scalable event and membership workflows, consistent permission enforcement, and maintainable long-term backend architecture.

---

## 🎯 API Overview

PlanTogether provides a **RESTful API** designed for collaborative event management with **role-based access control**.

The API is built to support frontend applications and external clients through secure, scalable, and consistent backend workflows.

Users can:

- authenticate users securely with JWT
- create, update, and manage collaborative events
- join and leave events
- manage membership roles and permissions
- retrieve authenticated and public user data
- upload and manage avatars and event images
- filter, search, sort, and paginate event listings
- retrieve created and joined event activity

The backend centralizes validation, authorization, permissions, and business rules to ensure predictable API behavior and reliable data integrity across sensitive operations.

Additional backend architecture features include:

- reusable filtering, pagination, and query-builder utilities
- shared validation, security, and error-handling middleware
- Sequelize transactions for sensitive workflows
- centralized security policies for passwords, uploads, and CORS
- standardized public and authenticated user formatting helpers
- optimized query and indexing strategies
- structured logging with Pino
- automated CI workflows with extensive unit and integration test coverage

The API architecture is designed to provide scalable event and membership management, secure data handling, reusable backend workflows, and consistent long-term maintainability across the application.

---

## 🛠️ Tech Stack

The backend is built with modular and scalable technologies focused on performance, security, maintainability, and reliable API behavior.

### Core Technologies

- **Node.js** – JavaScript runtime environment
- **Express** – web framework for REST APIs
- **PostgreSQL** – relational database system
- **Sequelize** – ORM for modeling, relationships, querying, and transactions

### Authentication & Security

- **JSON Web Tokens (JWT)** – stateless authentication
- **bcrypt** – password hashing
- **Helmet** – secure HTTP header protection
- **express-rate-limit** – authentication rate limiting
- **Express Validator** – request validation and sanitization
- **Centralized security policies** – password, upload, validation, and CORS configuration

### File Handling

- **Multer** – avatar and event image uploads
- **Custom upload utilities** – upload validation, file cleanup, rollback protection, and path normalization

### Architecture & Backend Patterns

- **Layered backend architecture** – routes, controllers, services, middlewares, validators, and utilities
- **Service-oriented business logic** – centralized permissions, validation, filtering, and reusable workflows
- **Soft-delete lifecycle architecture** – membership and account preservation workflows
- **Reusable query and formatting utilities** – filtering, pagination, participant counts, and normalization helpers
- **Sequelize transactions** – critical operation safety and database consistency
- **Pino** – structured centralized logging

### Testing & Quality Assurance

- **Jest** – unit testing framework
- **Supertest** – API integration testing
- **GitHub Actions** – automated continuous integration workflows
- **Comprehensive testing architecture** – validators, services, middlewares, controllers, security flows, uploads, query utilities, and full API integrations

---

## 📁 Backend Structure

The backend follows a modular **MVC architecture** with a clear separation of concerns between controllers, services, models, middlewares, validators, configuration, and reusable utilities.

```txt
backend/
│
├── docs/
│   └── testing.md
│
├── src
│   ├── config/
│   │   ├── database.js
│   │   ├── cors.js
│   │   ├── logger.js
│   │   └── security/
│   │       ├── passwordPolicy.js
│   │       └── uploadPolicy.js
│   │
│   ├── constants/
│   │   ├── eventModes.js
│   │   ├── eventRoles.js
│   │   └── eventStatus.js
│   │
│   ├── controllers/
│   ├── middlewares/
│   │   ├── auth/
│   │   ├── authorization/
│   │   ├── errors/
│   │   ├── authRateLimiter.js
│   │   └── uploadFiles.js
│   │
│   ├── models/
│   │   ├── relations/
│   │   ├── userModel.js
│   │   ├── eventModel.js
│   │   └── index.js
│   │
│   ├── routes/
│   ├── services/
│   │
│   ├── utils/
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── events/
│   │   ├── files/
│   │   ├── formatting/
│   │   ├── users/
│   │   ├── normalize.js
│   │   └── pagination.js
│   │
│   ├── validators/
│   ├── app.js
│   └── server.js
│
├── tests
│   ├── helpers/
│   ├── factories/
│   ├── integration/
│   │   ├── app/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── eventMemberships/
│   │   └── users/
│   │
│   └── unit/
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── middlewares/
│       ├── security/
│       ├── services/
│       ├── utils/
│       └── validators/
│
├── uploads/
│   ├── avatars/
│   └── events/
│
├── .env
├── .env.example
├── .env.test
├── package.json
└── README.md
```

### 🧩 Architecture Notes

- **Config** centralizes environment configuration, database connections, CORS handling, logging, and reusable security policies.

- **Constants** store shared business values such as event roles, modes, and statuses.

- **Middlewares** handle reusable authentication, authorization, validation, uploads, rate limiting, and centralized error-handling workflows.

- **Models** define database structures, Sequelize relations, and linking models used for many-to-many relationships between users and events.

- **Routes** define API endpoints and connect request flows to controllers, validation, authentication, and authorization layers.

- **Services** centralize business logic, permissions, transaction-safe workflows, and domain-specific operations.

- **Utils** centralize reusable backend logic including filtering, pagination, query helpers, event status computation, token generation, response normalization, upload cleanup, and HTTP error helpers.

- **Validators** isolate request validation and reusable input rules for routes, query parameters, uploads, and protected actions.

- **Tests** mirror the backend architecture through reusable helpers, factories, isolated unit testing, and full API integration workflows.

This architecture separates routing, business logic, validation, permissions, database interactions, uploads, and reusable utilities into maintainable backend layers.

The backend also emphasizes reusable business logic, transaction-safe workflows, scalable query handling, soft-delete lifecycle management, and consistent permission-aware behavior across the API.

---

## ✨ Features

The API provides a complete set of endpoints for managing users, events, memberships, permissions, uploads, and role-aware interactions through a scalable backend architecture.

### 👤 User Management

- User registration and JWT-based authentication
- Authenticated and public user profile retrieval
- Public user event listings with filtering, sorting, pagination, and created/joined views
- Public user statistics distinguishing organized and joined event activity
- Authenticated profile updates and secure password changes
- Avatar upload, replacement, and automatic cleanup (`multipart/form-data`)
- Email normalization and password hashing with **bcrypt**
- Soft-delete account lifecycle preservation and secure account deletion workflows
- Centralized validation, authentication, and error-handling middleware
- Unified JSON API responses

Additional security features include:

- Helmet HTTP security protections
- Authentication rate limiting
- Centralized password, upload, and CORS policies

### 📅 Event Management

- Create, retrieve, update, and delete events
- Event image upload, replacement, removal, and cleanup (`multipart/form-data`)
- Organizer ownership transfer between active event members
- Flexible registration deadline support with predefined and custom deadlines
- Event creator and image metadata included in API responses
- Transaction-safe workflows using Sequelize transactions
- Strong validation, upload protection, and business-rule enforcement
- Optimized filtering, pagination, participant count, and query behavior

Each event automatically assigns the creator as **organizer**.

### 👥 Memberships, Roles & Permissions

Users interact with events through a membership system that assigns event-specific roles:

```txt
organizer
co_organizer
participant
```

The API enforces a strict role hierarchy:

```txt
organizer > co_organizer > participant
```

Role-aware capabilities include:

- joining and leaving events
- membership restoration after rejoining
- organizer ownership transfer
- participant and co_organizer management
- role promotion and demotion workflows
- protected organizer-only actions
- soft-delete membership lifecycle handling

The backend also protects sensitive operations through centralized authorization and business-rule enforcement.

Protected behaviors include:

- organizer protection and ownership restrictions
- started-event deletion restrictions
- inactive membership protection
- role hierarchy enforcement
- permission-aware membership management
- protection against unauthorized or invalid operations

### 🔐 Event Access & Frontend Permissions

Authenticated clients can retrieve event-specific permissions through:

```http
GET /api/events/:eventId/me
```

This endpoint returns:

- the current user's event role
- computed event status (`upcoming`, `ongoing`, `past`)
- permission flags such as `canEdit` and `canDelete`
- started-event access restrictions

It is primarily used by frontend route guards, permission-aware rendering, and protected frontend event flows.

The backend remains the source of truth through centralized authorization middlewares and service-layer business rules.

### 🔍 Event Search & Filtering

The API supports advanced filtering, sorting, and pagination through reusable query utilities shared across public events, authenticated user listings, and public user event listings.

Supported filters include:

- keyword search
- creator filtering
- event type, theme, mode, and location
- exact date and date range filtering
- event status filtering (`upcoming`, `ongoing`, `past`)

Additional filtering capabilities include:

- pagination and sorting support
- reusable query-builder utilities
- scalable filtering behavior
- optimized participant count queries
- soft-delete-aware participant counting
- consistent filtering behavior across public and authenticated endpoints

#### Examples

Filter events using keyword and date range:
```http
GET /api/events?search=party&type=music&startDate=2026-04-01&endDate=2026-04-30
```

Filter events for an exact date:
```http
GET /api/events?date=2026-04-16
```

Filter events by creator:
```http
GET /api/events?creator=John
```

Filter authenticated user events by view and creator:
```http
GET /api/users/me/events?view=joined&creator=John&page=2
```

---

## 🧪 Testing

The API includes a comprehensive automated testing architecture built with **Jest** and **Supertest**, covering both full API workflows and isolated backend modules.

The testing strategy focuses on reliability, maintainability, security, database consistency, and long-term reliability.

### ▶️ Run Tests

```bash
npm test
```

### ▶️ Run Tests With Coverage

```bash
npm run test:coverage
```

### 📊 Testing Results

- ✅ 79 passing test suites
- ✅ 650 passing tests
- ✅ All tests passing

**Coverage**:
- 99.14% statements
- 94.65% branches
- 100% functions
- 99.21% lines

✅ High automated coverage across authentication, permissions, uploads, filtering, transactions, soft-delete workflows, query optimization, and full API behavior.

### 🔁 Continuous Integration

The backend test suite runs automatically through GitHub Actions using:

- isolated PostgreSQL test services
- dedicated backend test configuration
- automated test execution on pushes and pull requests
- full integration and unit test validation in CI

This helps detect regressions early and maintain reliable backend behavior across development workflows.

### 📦 Test Layers

The backend testing architecture is separated into two primary layers.

#### 🔗 Integration Tests (API Workflows)

Integration tests validate complete request lifecycles using the real Express application, middleware stack, services, database layer, and HTTP responses.

```txt
Request → Middleware → Controller → Service → Database → Response
```

Tests run against a dedicated PostgreSQL test database through Supertest.

📌 Covered areas include:

- JWT authentication and protected auth workflows
- authentication rate limiting and security behavior
- authenticated and public user flows
- profile updates, password changes, and account deletion
- avatar and event image upload lifecycle handling
- event CRUD operations and permission-aware event workflows
- filtering, sorting, pagination, and query synchronization behavior
- role-based permissions and authorization flows
- membership management and ownership transfer workflows
- event state restrictions and started-event protections
- soft-delete lifecycle handling and membership restoration
- validation, edge cases, and protected business rules
- application-level routes, health checks, and global error handling

#### 🧩 Unit Tests (Internal Backend Modules)

Unit tests validate isolated backend modules independently of HTTP request flows.

📌 Covered modules include:

- controllers and response handling
- services and business-rule enforcement
- transaction-safe workflows and permission resolution
- reusable query-builder and filtering utilities
- authentication, authorization, validation, and upload middlewares
- request validators and security rules
- pagination, formatting, normalization, and event status utilities
- uploaded file storage, cleanup, and rollback helpers
- reusable HTTP error and authentication token helpers

### 🔁 Testing Strategy

- Integration tests use the real Express application with minimal mocking
- A dedicated PostgreSQL test database ensures isolated and deterministic behavior
- Internal modules are tested independently to improve maintainability and reliability
- Reusable factories and helpers reduce duplicated test setup
- Validation, permissions, uploads, filtering, transactions, and business rules are extensively tested
- Query optimization, soft-delete flows, and permission edge cases are validated through both integration and unit testing
- High automated coverage helps maintain predictable and reliable long-term backend behavior

For more details about the testing architecture, factories, helpers, database isolation, transaction testing, and mocking strategies, see [`docs/testing.md`](./docs/testing.md).

---

## 🔐 Security

The API implements multiple security layers to protect sensitive data, enforce strict access control, and ensure secure and predictable behavior across all endpoints.

### 🔑 Authentication

- JWT-based authentication using Bearer tokens
- Protected routes require valid authentication tokens
- Password updates require current password verification
- `authRateLimiter` helps protect authentication endpoints against brute-force attacks
- Authentication rate limiting is configurable through environment variables

### 🛡️ Authorization

The API uses a centralized role-based authorization system.

Supported roles:

- `organizer`
- `co_organizer`
- `participant`

Authorization is enforced through reusable middleware and centralized business-rule layers:

- `authenticateToken`
- `authorizeEventRole`
- `eventMemberAuthorization`

Additional protections include:

- organizer and ownership protection rules
- membership hierarchy and role restrictions
- started-event and past-event protections
- inactive membership and soft-delete access protection
- prevention of unauthorized or invalid actions

Unauthenticated users only have read-only access to public resources.

### 🧾 Input Validation

- Request validation using **express-validator**
- Centralized validation and error handling
- Sanitization and normalization of incoming data
- Password policy enforcement
- Validation of query parameters, route params, request bodies, filtering, sorting, and pagination inputs

### 📁 Upload Security

- MIME type, extension, and file size validation
- Restricted and normalized upload destinations
- Secure upload cleanup and path normalization
- Safe image replacement and removal workflows

### 🔒 Data Protection

- Password hashing using **bcrypt**
- Sensitive fields excluded through Sequelize scopes
- Email normalization before persistence
- Safe public user formatting utilities
- Secure account anonymization during soft-delete workflows
- Consistent and predictable JSON API responses

### ⚙️ Additional Security Measures

- Helmet security headers protection
- Centralized CORS configuration
- SQL injection protection through Sequelize parameterized queries
- Query optimization strategies to avoid inefficient database access patterns
- Sequelize transactions for critical operations
- Database indexes for optimized query performance
- Centralized HTTP error utilities and global error handling
- Environment-based configuration for database, uploads, CORS, logging, and test behavior

These mechanisms help ensure secure data handling, reusable security workflows, permission-aware protection, soft-delete lifecycle safety, and reliable long-term API behavior across the application.

---

## 📦 API Response Format

The API uses a consistent JSON response structure to ensure predictable frontend integration, centralized error handling, and reliable client-side consumption.

### ✅ Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Success payloads may include:

- objects
- arrays
- pagination metadata
- filtered query results

### ❌ Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### 📌 Response Structure Notes

- `success` → indicates whether the request completed successfully
- `message` → short human-readable description
- `data` → response payload (object or array depending on the endpoint)
- `errors` → optional detailed validation or request errors

Validation and application errors are normalized through centralized middleware, reusable HTTP error utilities, and the global `errorHandler` middleware to ensure consistent API responses across all endpoints.

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether/backend
npm install
```

---

## ⚙️ Environment Variables

The application relies on environment variables to configure authentication, database access, uploads, logging, security behavior, and frontend integration.

Create a `.env` file in the project root and define the following variables:

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

AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=10

NODE_ENV=development

CORS_ORIGIN=http://localhost:5173
```

### 🔍 Environment Notes

- `JWT_SECRET` → used to sign and verify JWT authentication tokens
- `NODE_ENV` → defines the current environment (`development`, `production`, `test`)
- `DB_NAME_TEST` → dedicated database used for automated testing
- `DB_LOGGING` → enables Sequelize SQL query logging (`true` or `false`)
- `DB_SSL` → enables SSL for production or cloud-hosted databases
- `LOG_LEVEL` → defines the Pino logger level (`info`, `debug`, `error`, etc.)
- `AUTH_RATE_LIMIT_WINDOW_MS` → authentication rate-limit window duration in milliseconds
- `AUTH_RATE_LIMIT_MAX` → maximum authentication attempts allowed during the configured window
- `CORS_ORIGIN` → allowed frontend origins (comma-separated values supported)
- `UPLOAD_DIR` → upload root directory for avatars and event images

`.env.example` and `.env.test` files are provided as reference configurations.

---

## ▶️ Running the API

Start the production server:

```bash
npm start
```

Start the development server with automatic reload:

```bash
npm run dev
```

Run the automated test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

The server starts only if the database connection and model synchronization succeed.

The API will be available at:

```txt
http://localhost:3000
```

Health check endpoint:

```http
GET /api/health
```

---

## 🔗 API Endpoints

The API exposes the following endpoint groups.

All endpoints return standardized JSON responses as described in the API Response Format section.

Path parameters use the `:paramName` syntax (e.g. `:eventId`).

> ⚠️ Some endpoints require `multipart/form-data` requests for avatar and event image uploads.

### 🔐 Authentication

Authentication and account access endpoints.

```http
POST   /api/auth/register              (supports avatar upload via multipart/form-data)
POST   /api/auth/login
POST   /api/auth/logout                (authenticated)
```

### 👤 Users

Authenticated and public user endpoints.

```http
GET    /api/users/me
PUT    /api/users/me                   (authenticated, supports avatar upload via multipart/form-data)
PUT    /api/users/me/password          (authenticated)
DELETE /api/users/me                   (authenticated)

GET    /api/users/me/events            (authenticated user events with filtering, sorting, and pagination)

GET    /api/users/:id                  (public user profile)
GET    /api/users/:id/events           (public user events with filtering, sorting, and pagination)
```

### 📅 Events

Event management and public event access endpoints.

```http
GET    /api/events                     (filtering, sorting, and pagination)
GET    /api/events/:eventId
GET    /api/events/:eventId/me         (authenticated, current user event access)

POST   /api/events                     (authenticated, supports image upload via multipart/form-data)
PUT    /api/events/:eventId            (organizer or co_organizer, supports image upload via multipart/form-data)
DELETE /api/events/:eventId            (organizer only, before the event starts)
```

### 👥 Event Membership

Event participation and role-management endpoints.

```http
POST   /api/events/:eventId/members/join       (authenticated)
DELETE /api/events/:eventId/members/leave      (authenticated)

GET    /api/events/:eventId/members
GET    /api/events/:eventId/staff

PUT    /api/events/:eventId/members/:userId/role   (organizer only)
PUT    /api/events/:eventId/ownership              (organizer only)
DELETE /api/events/:eventId/members/:userId        (organizer or co_organizer, with role restrictions)
```

### ❤️ Application Health

```http
GET    /api/health
GET    /
```

---

## 🚀 Recent Improvements

### 🏗️ Architecture & Organization

- Added reusable public user event query builders for created and joined event views
- Centralized pagination count and total-page helpers
- Expanded reusable filtering, sorting, and pagination utilities
- Improved consistency across public and authenticated event listing workflows

### 👤 Users & Event Listings

- Added public user event listings with filtering, sorting, and pagination support
- Added created and joined event views for public user profiles
- Added participant count and event status enrichment for public user event responses
- Improved public user statistics by excluding organizer memberships from joined event counts

### 🧪 Testing

- Added unit coverage for pagination helpers and public user query builders
- Expanded controller, service, validator, and integration test coverage
- Reached 79 passing test suites and 650 passing tests
- Achieved 99.14% statement coverage, 94.65% branch coverage, 100% function coverage, and 99.21% line coverage

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Backend API | ✅ Stable, scalable, and production-oriented |
| Architecture | ✅ Modular, layered, and maintainable |
| Authentication & Users | ✅ JWT authentication, profile management, password updates, and secure account deletion |
| Authorization & Permissions | ✅ Role-based access control, protected actions, and ownership transfer |
| Membership System | ✅ Role management, restoration flows, and soft-delete lifecycle handling |
| Security | ✅ Helmet, rate limiting, validation, upload protection, and centralized security policies |
| File Uploads | ✅ Avatar and event image upload, replacement, removal, and cleanup workflows |
| Logging | ✅ Centralized structured logging with Pino |
| Database | ✅ PostgreSQL + Sequelize with transactions, indexes, and optimized query behavior |
| API Consistency | ✅ Standardized JSON responses and centralized error handling |
| Testing | ✅ 650 tests across 79 test suites |
| Coverage | ✅ 99.14% statements / 94.65% branches / 100% functions / 99.21% lines |
| Continuous Integration | ✅ Automated GitHub Actions testing workflows |

---

## 🔮 Future Improvements

### 🚀 Features

- Event invitation system (email invitations or shareable links)
- Email notifications for invitations, reminders, and event updates
- Public and private event visibility management
- Membership role history and moderation audit logs
- Archived-event lifecycle management and cleanup workflows
- Expanded event participation and moderation workflows
- Event activity feeds and moderation tracking

### 🧠 Backend & Architecture

- Advanced query aggregation and analytics optimization
- Additional database performance and indexing improvements
- API versioning strategy (`/api/v1`)
- Further business-rule centralization and abstraction
- Swagger / OpenAPI documentation support
- Expanded reusable filtering, formatting, and query-builder utilities

### 🧪 Testing & Developer Experience

- Additional end-to-end testing workflows
- Further test deduplication and simplification
- Expanded edge-case and regression coverage
- Expanded backend architecture and testing documentation

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Cloud deployment (AWS, Render, Fly.io, etc.)
- Production-ready environment configuration improvements
- Expanded CI/CD automation workflows
- Secure cloud-based production file storage strategies

---
