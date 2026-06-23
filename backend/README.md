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
![Test Suites](https://img.shields.io/badge/test%20suites-98%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-815%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-99.29%25%20statements%20%7C%2094.02%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **backend REST API** of PlanTogether, built with **Node.js**, **Express**, **PostgreSQL**, and **Sequelize**.

The API handles authentication, events, memberships, uploads, permissions, validation, backend-powered geocoding, and event map workflows through a modular architecture focused on scalability, maintainability, and predictable backend behavior.

Users can create, join, leave, update, and manage events depending on their role:

- `organizer`
- `co_organizer`
- `participant`

The backend also provides:

- authenticated and public location search
- reusable geocoding, caching, and normalized location workflows
- interactive event map support
- event reviews and ratings
- participant-only review permissions and ownership management
- review statistics, pagination, and average rating aggregation

The architecture emphasizes:

- layered and service-oriented backend design
- centralized validation, security, permissions, and error handling
- reusable filtering, pagination, formatting, and query utilities
- secure authentication, uploads, and protected file handling
- transaction-safe workflows
- structured logging with Pino
- automated CI workflows with extensive unit and integration test coverage

## 🎯 API Overview

PlanTogether exposes a secure **RESTful API** for collaborative event management and role-based interactions.

The API allows clients to:

- authenticate users with JWT
- create and manage collaborative events
- manage memberships and permissions
- create, update, delete, and browse event reviews and ratings
- access aggregated review statistics
- upload avatars and event images
- search, filter, sort, and paginate event listings
- retrieve public and authenticated user data
- search and geocode event locations
- display event maps through authenticated or public location endpoints

The backend centralizes validation, permissions, security, business rules, review workflows, and geolocation services to ensure consistent and reliable API behavior across sensitive operations.

---

## 🛠️ Tech Stack

The backend is built with modular and scalable technologies focused on security, maintainability, and reliable API behavior.

### Core Technologies

- **Node.js** – JavaScript runtime environment
- **Express** – web framework for REST APIs
- **PostgreSQL** – relational database system
- **Sequelize** – ORM for modeling, querying, relationships, and transactions

### Authentication & Security

- **JSON Web Tokens (JWT)** – stateless authentication
- **bcrypt** – password hashing
- **Helmet** – secure HTTP header protection
- **express-rate-limit** – reusable authentication and public API rate limiting
- **express-validator** – request validation and sanitization

Security architecture also includes centralized policies for:

- password validation
- uploads and file handling
- request validation
- CORS configuration

### File Handling

- **Multer** – avatar and event image uploads
- **Custom upload utilities** – upload validation, cleanup, rollback protection, and path normalization

### Architecture & Backend Patterns

- **Layered architecture** – routes, controllers, services, middlewares, validators, and utilities
- **Service-oriented business logic** – centralized permissions, validation, filtering, review management, and reusable workflows
- **Soft-delete lifecycle workflows** – membership and account preservation logic
- **Reusable query and formatting utilities** – filtering, pagination, aggregation, participant counts, review statistics, and normalization helpers
- **Sequelize transactions** – critical operation safety and database consistency
- **Backend-powered geocoding** – cached location search, normalized labels, and fallback search workflows
- **Reusable rate limiter factories** – shared middleware architecture for protected and public endpoints
- **Pino** – structured centralized logging

### Testing & Quality Assurance

- **Jest** – unit testing framework
- **Supertest** – API integration testing
- **GitHub Actions** – automated CI workflows
- **Comprehensive test coverage** – services, middlewares, validators, controllers, uploads, utilities, security flows, review workflows, and API integrations

---

## 📁 Backend Structure

The backend follows a modular **MVC architecture** with a clear separation of concerns between controllers, services, models, middlewares, validators, configuration, and reusable utilities.

```txt
backend/
│
├── docs/
│   └── testing.md
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cors.js
│   │   ├── logger.js
│   │   ├── location.js
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
│   │   ├── rateLimiters/
│   │   └── uploadFiles.js
│   │
│   ├── models/
│   │   ├── relations/
│   │   │   ├── eventReviewModel.js
│   │   │   └── eventUserRoleModel.js
│   │   ├── userModel.js
│   │   ├── eventModel.js
│   │   ├── locationModel.js
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
│   │   ├── eventReviews/
│   │   ├── users/
│   │   └── locations/
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

- **Config** centralizes environment configuration, database connections, CORS handling, logging, geolocation providers, and reusable security policies.

- **Constants** store shared business values such as event roles, modes, and statuses.

- **Middlewares** handle reusable authentication, authorization, validation, uploads, rate limiting, and centralized error handling.

- **Models** define database structures, Sequelize relations, event reviews, and linking models used for many-to-many relationships between users and events.

- **Routes** connect API endpoints to controllers, validation, authentication, authorization, and reusable middleware workflows.

- **Services** centralize business logic, permissions, review workflows, transaction-safe operations, geolocation handling, and reusable domain services.

- **Utils** centralize reusable backend helpers for filtering, pagination, aggregation, formatting, event state computation, upload cleanup, token generation, query normalization, and HTTP errors.

- **Validators** isolate reusable request validation rules for routes, uploads, query parameters, and protected actions.

- **Tests** mirror the backend architecture through reusable helpers, factories, isolated unit testing, and full API integration coverage.

The backend architecture emphasizes reusable business logic, transaction-safe operations, scalable query handling, soft-delete lifecycle management, and consistent permission-aware behavior across the API.

---

## ✨ Features

The API provides a complete set of endpoints for managing users, events, memberships, permissions, uploads, and role-aware interactions through a scalable backend architecture.

### 👤 User Management

- User registration and JWT-based authentication
- Authenticated and public user profile retrieval
- Public user event listings with filtering, sorting, pagination, and created/joined views
- Public user statistics for organized and joined event activity
- Authenticated profile updates and secure password changes
- Avatar upload, replacement, and automatic cleanup (`multipart/form-data`)
- Email normalization and password hashing with **bcrypt**
- Soft-delete account preservation and secure account deletion flows
- Centralized validation, authentication, and error handling
- Consistent JSON API responses

Security features include:

- Helmet HTTP security protections
- authentication rate limiting
- centralized password, upload, and CORS policies

### 📅 Event Management

- Create, retrieve, update, and delete events
- Event image upload, replacement, removal, and cleanup (`multipart/form-data`)
- Organizer ownership transfer between active event members
- Flexible registration deadline support with predefined and custom deadlines
- Event creator and image metadata included in API responses
- Transaction-safe operations with Sequelize transactions
- Strong validation, upload protection, and business-rule enforcement
- Optimized filtering, pagination, participant count, and review statistics queries
- Backend-powered geocoding and location caching
- Persistent event coordinates and normalized location labels
- Public and authenticated location search endpoints
- Progressive fallback location search for detailed addresses

Each event automatically assigns the creator as **organizer**.

### ⭐ Event Reviews & Ratings

Participants can leave reviews and ratings for completed events through a dedicated review system.

Supported review capabilities include:

- review creation, update, and deletion
- one review per participant and event
- participant-only review permissions
- completed-event review restrictions
- review ownership enforcement
- paginated review retrieval and sorting
- rating support (1–5 stars)
- review statistics and average rating aggregation

Review responses include:

- rating and comment data
- reviewer public profile information
- pagination metadata
- aggregated review statistics (review count and average rating)

### 👥 Memberships, Roles & Permissions

Users interact with events through a role-based membership system:

```txt
organizer
co_organizer
participant
```

Role hierarchy:

```txt
organizer > co_organizer > participant
```

Supported membership capabilities include:

- joining and leaving events
- membership restoration after rejoining
- organizer ownership transfer
- participant and co-organizer management
- role promotion and demotion
- organizer-only protected actions
- soft-delete membership lifecycle handling

Protected behaviors include:

- organizer ownership protection
- started-event deletion restrictions
- inactive membership protection
- role hierarchy enforcement
- permission-aware membership management
- protection against unauthorized operations

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

It is primarily used for frontend route guards, permission-aware rendering, and protected event workflows.

The backend remains the source of truth through centralized authorization middleware and service-layer business rules.

### 🔍 Event Search & Filtering

The API supports advanced filtering, sorting, and pagination through reusable query utilities shared across public events, authenticated user listings, and public user event listings.

Supported filters include:

- keyword search
- creator filtering
- event type, theme, mode, and location
- exact date and date range filtering
- event status filtering (`upcoming`, `ongoing`, `past`)

Additional capabilities include:

- pagination and sorting support
- reusable query-builder utilities
- optimized participant count and review statistics queries
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

### 🗺️ Location & Geocoding System

The backend includes a reusable geocoding and location caching architecture used for event maps, autocomplete workflows, and future location-aware features.

Location search is powered by OpenStreetMap Nominatim and protected through centralized rate limiting and caching workflows.

Features include:

- authenticated and public location search endpoints
- backend-powered geocoding workflows
- reusable location caching
- normalized provider location formatting
- progressive fallback search queries for detailed addresses
- persisted event coordinates and display labels
- public-safe map lookup support for event pages
- centralized provider error handling and rate limiting

Location endpoints:

```http
GET /api/locations/search          (authenticated)
GET /api/locations/public-search   (public)
```

---

## 🧪 Testing

The API includes a comprehensive automated testing architecture built with **Jest** and **Supertest**, covering both full API workflows and isolated backend modules.

The testing strategy focuses on maintainability, security, database consistency, and predictable long-term backend behavior.

### ▶️ Run Tests

```bash
npm test
```

### ▶️ Run Tests With Coverage

```bash
npm run test:coverage
```

### 📊 Testing Results

- ✅ 98 passing test suites
- ✅ 815 passing tests
- ✅ 100% passing rate

**Coverage**:
- 99.29% statements
- 94.02% branches
- 100% functions
- 99.35% lines

✅ High automated coverage across authentication, permissions, uploads, filtering, pagination, review systems, transactions, geocoding, rate limiting, and full API behavior.

### 🔁 Continuous Integration

The backend test suite runs automatically through GitHub Actions using:

- isolated PostgreSQL test services
- dedicated backend test configuration
- automated test execution on pushes and pull requests
- full integration and unit test validation in CI

This helps detect regressions early and maintain stable backend behavior across development workflows.

### 📦 Test Layers

The testing architecture is separated into two primary layers.

#### 🔗 Integration Tests (API Workflows)

Integration tests validate complete request lifecycles using the real Express application, middleware stack, services, database layer, and HTTP responses.

```txt
Request → Middleware → Controller → Service → Database → Response
```

Tests run against a dedicated **PostgreSQL** test database through **Supertest**.

📌 Covered areas include:

- JWT authentication and protected auth workflows
- authentication rate limiting and security behavior
- authenticated and public user flows
- profile updates, password changes, and account deletion
- avatar and event image upload lifecycle handling
- event CRUD operations and permission-aware workflows
- event review workflows, ratings, pagination, permissions, and statistics
- filtering, sorting, pagination, and query synchronization behavior
- role-based permissions and authorization flows
- membership management and ownership transfer
- started-event restrictions and protected business rules
- soft-delete lifecycle handling and membership restoration
- validation, edge cases, and global error handling
- public and authenticated geocoding workflows
- fallback location search, caching, and persistence
- protected and public endpoint rate limiting
- health checks and application-level routes

#### 🧩 Unit Tests (Internal Backend Modules)

Unit tests validate isolated backend modules independently of HTTP request flows.

📌 Covered modules include:

- controllers and response handling
- services, review workflows, permissions, and business-rule enforcement
- transaction-safe operations and query aggregation utilities
- filtering, pagination, and review statistics helpers
- authentication, authorization, validation, upload, and rate-limiter middleware
- request validators and security rules
- pagination, formatting, normalization, and event status utilities
- uploaded file cleanup and rollback helpers
- reusable HTTP error and authentication token helpers
- backend geocoding, fallback query builders, and location formatting utilities

### 🔁 Testing Strategy

- Integration tests use the real Express application with minimal mocking
- A dedicated PostgreSQL test database ensures isolated and deterministic behavior
- Internal modules are tested independently for maintainability and reliability
- Reusable factories and helpers reduce duplicated test setup
- Core workflows, permissions, reviews, uploads, filtering, and business rules are extensively tested
- Soft-delete flows, review permissions, authorization rules, and query edge cases are covered through both integration and unit testing
- High automated coverage helps maintain predictable long-term backend stability

For more details about the testing architecture, factories, helpers, database isolation, transaction testing, and mocking strategies, see [`docs/testing.md`](./docs/testing.md).

---

## 🔐 Security

The API implements multiple security layers to protect sensitive data, enforce strict access control, and ensure predictable behavior across all endpoints.

### 🔑 Authentication

- JWT-based authentication with Bearer tokens
- Protected routes secured through centralized authentication middleware
- Current password verification required for sensitive account changes
- Reusable and configurable rate limiting for authentication and public endpoints

### 🛡️ Authorization

The API uses a centralized role-based authorization system.

Supported roles:

- `organizer`
- `co_organizer`
- `participant`

Authorization is enforced through reusable middleware and service-layer business rules:

- `authenticateToken`
- `authorizeEventRole`
- `eventMemberAuthorization`

Additional protections include:

- role hierarchy, ownership, review ownership, and event-state protections
- inactive membership and soft-delete access protection
- prevention of unauthorized operations

Unauthenticated users only have read-only access to public resources.

### 🧾 Input Validation

- Request validation using **express-validator**
- Centralized validation and error handling
- Sanitization and normalization of incoming data
- Password policy enforcement
- Validation for route parameters, request bodies, filtering, sorting, and pagination inputs

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
- Query optimization, database indexing, and transaction-safe operations
- Centralized HTTP error utilities and global error handling
- Environment-based configuration for database, uploads, CORS, logging, and test behavior

These measures help ensure secure data handling, consistent authorization, and reliable long-term API behavior.

---

## 📦 API Response Format

The API uses a consistent JSON response structure to ensure predictable frontend integration and centralized error handling.

### ✅ Success Response

```json
{
  "success": true,
  "message": "Operation successful"
}
```

Success responses may also include:

- resource payloads (`user`, `event`, `review`, etc.)
- collections (`events`, `reviews`, etc.)
- pagination metadata
- aggregated statistics

#### Example:

```json
{
  "success": true,
  "message": "Event reviews retrieved successfully",
  "page": 1,
  "pageSize": 10,
  "totalReviews": 5,
  "totalPages": 1,
  "averageRating": 4.6,
  "reviews": []
}
```

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
- resource fields (`user`, `event`, `review`, `events`, `reviews`, etc.) contain endpoint-specific data
- pagination fields are included when relevant
- `errors` → optional validation or request error details

Validation and application errors are normalized through centralized middleware and reusable HTTP error utilities, ensuring consistent API responses across the application.

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether/backend
npm install
```

The following sections explain environment configuration, database setup, and available development commands.

---

## ⚙️ Environment Variables

The application relies on environment variables to configure authentication, database access, uploads, logging, rate limiting, geolocation services, and frontend integration.

Create a `.env` file in the project root and define the following variables:

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

### 🔍 Environment Notes

- `NODE_ENV` → defines the current environment (`development`, `production`, `test`)
- `JWT_SECRET` → used to sign and verify JWT authentication tokens

- `DB_NAME_TEST` → dedicated database used for automated testing
- `DB_LOGGING` → enables Sequelize SQL query logging (`true` or `false`)
- `DB_SSL` → enables SSL for production or cloud-hosted databases

- `LOG_LEVEL` → defines the Pino logger level (`info`, `debug`, `error`, etc.)

- `AUTH_RATE_LIMIT_*` → authentication rate limiting configuration
- `LOCATION_RATE_LIMIT_*` → geolocation API rate limiting configuration

- `LOCATION_PROVIDER` → active geolocation provider configuration
- `GEOCODING_USER_AGENT` → user agent sent to the geolocation provider
- `GEOCODING_RESULT_LIMIT` → maximum number of returned geolocation results

- `CORS_ORIGIN` → allowed frontend origins (comma-separated values supported)
- `UPLOAD_DIR` → upload root directory for avatars and event images

`.env.example` and `.env.test` are provided as reference configurations for local development and automated testing.

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

Run tests with coverage reporting:

```bash
npm run test:coverage
```

The server starts after a successful database connection and model synchronization.

API base URL:

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

> ⚠️ Some endpoints require `multipart/form-data` for avatar and event image uploads.

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
PUT    /api/users/me                   (authenticated, supports avatar upload)
PUT    /api/users/me/password          (authenticated)
DELETE /api/users/me                   (authenticated)

GET    /api/users/me/events            (authenticated user events with filtering, sorting, and pagination)

GET    /api/users/:id                  (public user profile)
GET    /api/users/:id/events           (public user events with filtering, sorting, and pagination)
```

### 📅 Events

Event management and public event access endpoints.

```http
GET    /api/events                     (filtering, sorting, pagination, review statistics)
GET    /api/events/:eventId            (includes review statistics)
GET    /api/events/:eventId/me         (authenticated event permissions and access)

POST   /api/events                     (authenticated, supports image upload)
PUT    /api/events/:eventId            (organizer or co_organizer, supports image upload)
DELETE /api/events/:eventId            (organizer only, before event start)
```

### ⭐ Event Reviews

Review and rating endpoints.

```http
GET    /api/events/:eventId/reviews                     (public, paginated)
POST   /api/events/:eventId/reviews                     (authenticated participant)
PUT    /api/events/reviews/:reviewId                    (review owner)
DELETE /api/events/reviews/:reviewId                    (review owner)
```

### 👥 Event Memberships

Event participation and role-management endpoints.

```http
POST   /api/events/:eventId/members/join          (authenticated)
DELETE /api/events/:eventId/members/leave         (authenticated)

GET    /api/events/:eventId/members
GET    /api/events/:eventId/staff

PUT    /api/events/:eventId/members/:userId/role  (organizer only)
PUT    /api/events/:eventId/ownership             (organizer only)
DELETE /api/events/:eventId/members/:userId       (organizer or co_organizer, with role restrictions)
```

### 🗺️ Locations

Backend-powered geocoding and cached location lookup endpoints.

```http
GET    /api/locations/search          (authenticated)
GET    /api/locations/public-search   (public)
```

### ❤️ Application Health

```http
GET    /api/health
GET    /
```
---

## 🚀 Recent Improvements

### ⭐ Event Reviews & Ratings

- Added a complete event review system with ratings (1–5 stars)
- Added review creation, update, retrieval, and deletion workflows
- Added participant-only and completed-event review restrictions
- Added review ownership validation and duplicate-review prevention
- Added paginated review retrieval with average rating aggregation

### 📊 Event Statistics

- Added review count and average rating aggregation to event queries
- Integrated review statistics into event listing and detail endpoints
- Exposed review insights across event discovery workflows

### 🗺️ Location & Geocoding System

- Added backend-powered geocoding with OpenStreetMap Nominatim
- Added location caching and normalized location formatting
- Added authenticated and public location search endpoints
- Added progressive fallback search for detailed addresses

### 🔐 Security & Architecture

- Added reusable rate limiter architecture
- Improved centralized validation, permissions, and middleware organization
- Expanded coverage for authorization, filtering, pagination, and review workflows

### 🧪 Testing & Reliability

- Expanded unit and integration coverage across review, event, membership, and geolocation workflows
- Reached 98 passing test suites and 815 passing tests
- Achieved:
  - 99.29% statement coverage
  - 94.02% branch coverage
  - 100% function coverage
  - 99.35% line coverage

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Backend API | ✅ Stable, scalable, and production-oriented |
| Architecture | ✅ Modular, layered, and maintainable |
| Authentication & Users | ✅ JWT authentication, profile management, password updates, and secure account deletion |
| Authorization & Permissions | ✅ Role-based access control, protected actions, and ownership transfer |
| Membership System | ✅ Role management, restoration flows, and soft-delete lifecycle handling |
| Event Reviews & Ratings | ✅ Review creation, updates, ratings, ownership validation, pagination, and review statistics |
| Event Statistics | ✅ Participant counts, review counts, and average rating aggregation |
| Location & Geocoding | ✅ Backend-powered geocoding, caching, fallback search, and public map support |
| Security | ✅ Helmet, validation, upload protection, centralized security policies, and reusable rate limiting |
| File Uploads | ✅ Avatar and event image upload, replacement, cleanup, and rollback-safe workflows |
| Logging | ✅ Centralized structured logging with Pino |
| Database | ✅ PostgreSQL + Sequelize with transactions, indexes, caching, and optimized query behavior |
| API Consistency | ✅ Standardized JSON responses and centralized error handling |
| Testing | ✅ 815 tests across 98 test suites |
| Coverage | ✅ 99.29% statements / 94.02% branches / 100% functions / 99.35% lines |
| Continuous Integration | ✅ Automated GitHub Actions testing workflows |

---

## 🔮 Future Improvements

### 🚀 Features

- Event moderation and reporting workflows
- Review replies and organizer responses
- Event invitation system (shareable links and invitation workflows)
- Email notifications for invitations, reminders, and event updates
- Public and private event visibility management
- Archived-event lifecycle management

### 🧠 Backend & Architecture

- API versioning strategy (`/api/v1`)
- Swagger / OpenAPI documentation
- Advanced analytics and aggregation queries
- Additional database indexing and query optimization
- Further business-rule and query-builder abstraction

### 🧪 Testing & Developer Experience

- Additional end-to-end testing workflows
- Expanded regression and edge-case coverage
- Further test simplification and shared test utilities
- Improved architecture and testing documentation

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Cloud deployment (AWS, Render, Fly.io, etc.)
- CI/CD pipeline expansion
- Production environment hardening
- Cloud-based file storage (S3-compatible providers)

---
