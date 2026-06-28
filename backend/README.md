# PlanTogether - Backend API (Node.js)

PlanTogether is a collaborative event management platform where users can create, join, and manage events through a secure, role-based backend API.

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Framework](https://img.shields.io/badge/Framework-Express-black)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![ORM](https://img.shields.io/badge/ORM-Sequelize-orange)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)
![Architecture](https://img.shields.io/badge/Architecture-Layered%20%26%20Service--Oriented-blueviolet)
![Security](https://img.shields.io/badge/Security-JWT%20%7C%20Helmet%20%7C%20Rate%20Limiting-009688)

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

It provides secure, role-aware endpoints for authentication, event management, memberships, reviews, uploads, geolocation, and interactive map features through a layered, service-oriented architecture designed for scalability, maintainability, and predictable API behavior.

Users can interact with events according to their role:

- `organizer`
- `co_organizer`
- `participant`

Core backend capabilities include:

- authenticated and public location search
- backend-powered geocoding, caching, and normalized location data
- interactive event map support
- event reviews and ratings
- participant-only review permissions and ownership management
- review statistics, pagination, and average rating aggregation

The architecture is built around:

- layered and service-oriented design
- centralized validation, security, permissions, and error handling
- shared filtering, pagination, formatting, and query utilities
- secure authentication, uploads, and protected file handling
- transaction-safe operations
- structured logging with Pino
- automated CI workflows with extensive unit and integration testing

---

## 📚 Table of Contents

- [🎯 API Overview](#-api-overview)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Backend Structure](#-backend-structure)
- [✨ Features](#-features)
- [🧪 Testing](#-testing)
- [🔐 Security](#-security)
- [📦 API Response Format](#-api-response-format)
- [⚡ Getting Started](#-getting-started)
- [🔗 API Endpoints](#-api-endpoints)
- [🚀 Recent Improvements](#-recent-improvements)
- [📌 Project Status](#-project-status)
- [🗺️ Roadmap](#️-roadmap)

---

## 🎯 API Overview

PlanTogether exposes a secure **RESTful API** for collaborative event management and role-based interactions.

The API enables the frontend application to:

- authenticate users with JWT
- create and manage collaborative events
- manage memberships and permissions
- create, update, delete, and browse event reviews and ratings
- access aggregated review statistics
- upload avatars and event images
- search, filter, sort, and paginate event listings
- retrieve public and authenticated user data
- search and geocode event locations
- display interactive event maps through authenticated and public endpoints

The API centralizes validation, authorization, security, business rules, review management, and geolocation services to provide consistent and reliable behavior across every protected operation.

---

## 🛠️ Tech Stack

The backend is built on modern technologies and architectural patterns designed to deliver secure, maintainable, and reliable REST APIs.

### Core Technologies

- **Node.js** – JavaScript runtime environment
- **Express** – web framework for building REST APIs
- **PostgreSQL** – relational database management system
- **Sequelize** – ORM for data modeling, querying, relationships, and transactions

### Authentication & Security

- **JSON Web Tokens (JWT)** – stateless authentication
- **bcrypt** – password hashing
- **Helmet** – secure HTTP headers
- **express-rate-limit** – configurable rate limiting for public and protected endpoints
- **express-validator** – request validation and sanitization

The security layer also provides centralized handling for:

- password validation
- request validation
- uploads and file handling
- CORS configuration

### File Handling

- **Multer** – avatar and event image uploads
- **Custom upload utilities** – validation, cleanup, rollback protection, and path normalization

### Architecture & Design Patterns

- **Layered architecture** – routes, controllers, services, middlewares, validators, and utilities
- **Service-oriented business logic** – permissions, validation, filtering, review management, and domain services
- **Soft-delete workflows** – membership and account preservation
- **Shared query and formatting utilities** – filtering, pagination, aggregations, participant counts, review statistics, and response normalization
- **Sequelize transactions** – consistency for critical database operations
- **Backend-powered geocoding** – cached location search, normalized labels, and fallback strategies
- **Rate limiter factories** – shared middleware for public and protected endpoints
- **Pino** – structured application logging

### Testing & Quality Assurance

- **Jest** – unit testing framework
- **Supertest** – API integration testing
- **GitHub Actions** – continuous integration workflows
- **Comprehensive automated coverage** – services, controllers, middlewares, validators, uploads, utilities, security, review workflows, and API integrations

---

## 📁 Backend Structure

The backend follows a modular **MVC architecture** with a clear separation between configuration, routing, business logic, data access, validation, and supporting infrastructure.

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
├── tests/
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

- **Config** manages environment configuration, database connectivity, CORS, logging, geolocation providers, and security policies.

- **Constants** define shared business values such as event roles, modes, and statuses.

- **Middlewares** provide authentication, authorization, validation, upload handling, rate limiting, and centralized error processing.

- **Models** define database entities, Sequelize relationships, event reviews, and junction models for many-to-many associations.

- **Routes** map API endpoints to controllers, validators, authentication, authorization, and middleware pipelines.

- **Services** encapsulate business rules, permissions, review management, transaction-safe operations, geolocation services, and domain logic.

- **Utils** provide common helpers for filtering, pagination, aggregations, formatting, event state computation, upload cleanup, token generation, query normalization, and HTTP errors.

- **Validators** isolate request validation rules for routes, uploads, query parameters, and protected operations.

- **Tests** mirror the application architecture through dedicated helpers, factories, unit tests, and integration suites.

The architecture promotes a clear separation of concerns while supporting transaction-safe operations, scalable query handling, soft-delete workflows, and consistent permission enforcement across the API.

---

## ✨ Features

The API provides a complete set of endpoints for user management, events, memberships, reviews, uploads, geolocation, and role-based authorization through a scalable backend architecture.

### 👤 User Management

- User registration and JWT-based authentication
- Authenticated and public profile retrieval
- Public user event listings with filtering, sorting, pagination, and created/joined views
- Public user statistics for organized and joined events
- Authenticated profile updates and secure password changes
- Avatar upload, replacement, and automatic cleanup (`multipart/form-data`)
- Email normalization and password hashing with **bcrypt**
- Soft-delete account preservation and secure account deletion
- Centralized validation, authentication, and error handling
- Consistent JSON API responses

Security features include:

- Helmet HTTP protections
- authentication rate limiting
- centralized password, upload, and CORS policies

### 📅 Event Management

- Create, retrieve, update, and delete events
- Upload, replace, remove, and clean up event images (`multipart/form-data`)
- Organizer ownership transfer between active event members
- Flexible registration deadlines with predefined and custom options
- Event creator and image metadata included in API responses
- Transaction-safe operations using Sequelize transactions
- Validation, upload protection, and business rule enforcement
- Optimized filtering, pagination, participant counts, and review statistics
- Backend-powered geocoding and location caching
- Persistent event coordinates and normalized location labels
- Public and authenticated location search
- Progressive fallback location lookup for detailed addresses

Each newly created event automatically assigns its creator as the **organizer**.

### ⭐ Event Reviews & Ratings

Participants can submit reviews for completed events through a dedicated review system.

Capabilities include:

- creating, updating, and deleting reviews
- one review per participant and event
- participant-only review permissions
- completed-event restrictions
- review ownership enforcement
- paginated retrieval and sorting
- 1–5 star ratings
- aggregated review statistics

Review responses include:

- ratings and comments
- reviewer public profile information
- pagination metadata
- aggregated statistics (review count and average rating)

### 👥 Memberships, Roles & Permissions

Users interact with events through a role-based membership model:

```txt id="o0s5m8"
organizer
co_organizer
participant
```

Role hierarchy:

```txt id="uj3vwv"
organizer > co_organizer > participant
```

Membership features include:

- joining and leaving events
- membership restoration after rejoining
- organizer ownership transfer
- participant and co-organizer management
- role promotion and demotion
- organizer-only protected actions
- soft-delete membership handling

Built-in protections include:

- organizer ownership protection
- started-event deletion restrictions
- inactive membership safeguards
- role hierarchy enforcement
- permission-aware membership management
- protection against unauthorized operations

### 🔐 Event Access & Frontend Permissions

Authenticated clients can retrieve event-specific permissions through:

```http id="dghqf4"
GET /api/events/:eventId/me
```

The endpoint returns:

- the current user's membership role
- computed event status (`upcoming`, `ongoing`, `past`)
- permission flags such as `canEdit` and `canDelete`
- started-event restrictions

This endpoint primarily supports frontend route guards, permission-aware rendering, and protected event workflows.

Authorization remains fully centralized through middleware and service-layer business rules.

### 🔍 Event Search & Filtering

The API supports advanced filtering, sorting, and pagination through shared query utilities used across public events, authenticated user listings, and public user event listings.

Supported filters include:

- keyword search
- creator filtering
- event type, theme, mode, and location
- exact date and date range filtering
- event status (`upcoming`, `ongoing`, `past`)

Additional capabilities include:

- pagination and sorting
- shared query builders
- optimized participant counts and review statistics
- soft-delete-aware participant counting
- consistent filtering across public and authenticated endpoints

#### Examples

Filter events using keywords and a date range:

```http id="j0e7eu"
GET /api/events?search=party&type=music&startDate=2026-04-01&endDate=2026-04-30
```

Filter events for an exact date:

```http id="wgy9tb"
GET /api/events?date=2026-04-16
```

Filter events by creator:

```http id="4a3dci"
GET /api/events?creator=John
```

Filter authenticated user events by view and creator:

```http id="nslwyo"
GET /api/users/me/events?view=joined&creator=John&page=2
```

### 🗺️ Location & Geocoding

The backend provides a dedicated geolocation layer supporting event maps, autocomplete, and future location-aware features.

Location search is powered by OpenStreetMap Nominatim and protected through centralized caching and rate limiting.

Capabilities include:

- authenticated and public location search
- backend-powered geocoding
- location caching
- normalized provider responses
- progressive fallback searches for detailed addresses
- persisted event coordinates and display labels
- public-safe map lookups
- centralized provider error handling

Location endpoints:

```http id="c4h4kb"
GET /api/locations/search          (authenticated)
GET /api/locations/public-search   (public)
```

---

## 🧪 Testing

The backend includes a comprehensive automated test suite built with **Jest** and **Supertest**, covering both complete API workflows and isolated application modules.

The testing strategy emphasizes reliability, security, database consistency, and long-term maintainability.

### ▶️ Run Tests

```bash
npm test
```

### ▶️ Run Tests with Coverage

```bash
npm run test:coverage
```

### 📊 Test Results

- ✅ **98** passing test suites
- ✅ **815** passing tests
- ✅ **100%** passing rate

**Coverage**
- **99.29%** statements
- **94.02%** branches
- **100%** functions
- **99.35%** lines

The suite delivers extensive automated coverage across authentication, authorization, uploads, filtering, pagination, reviews, transactions, geolocation, rate limiting, and end-to-end API behavior.

### 🔁 Continuous Integration

Tests run automatically through GitHub Actions using:

- isolated PostgreSQL test services
- dedicated backend test configuration
- automated execution on pushes and pull requests
- complete validation of unit and integration suites

This workflow helps detect regressions early and maintain a stable, reliable API.

### 📦 Test Layers

The testing architecture is organized into two complementary layers.

#### 🔗 Integration Tests

Integration tests validate complete request lifecycles using the real Express application, middleware pipeline, services, database layer, and HTTP responses.

```txt
Request → Middleware → Controller → Service → Database → Response
```

Tests execute against a dedicated **PostgreSQL** test database using **Supertest**.

Coverage includes:

- JWT authentication and protected authentication flows
- authentication rate limiting and security rules
- authenticated and public user workflows
- profile updates, password changes, and account deletion
- avatar and event image lifecycle management
- event CRUD operations and permission-aware behavior
- reviews, ratings, pagination, permissions, and aggregated statistics
- filtering, sorting, pagination, and query handling
- role-based authorization and membership management
- ownership transfers and started-event restrictions
- soft-delete workflows and membership restoration
- validation, edge cases, and global error handling
- public and authenticated geolocation
- fallback location search, caching, and persistence
- public and protected endpoint rate limiting
- health checks and application routes

#### 🧩 Unit Tests

Unit tests validate isolated modules independently from HTTP request processing.

Coverage includes:

- controllers and response handling
- services, permissions, reviews, and business rules
- transaction handling and query aggregation
- filtering, pagination, and review statistics
- authentication, authorization, validation, upload, and rate-limiting middleware
- request validators and security policies
- formatting, pagination, normalization, and event status utilities
- upload cleanup and rollback helpers
- HTTP error and authentication token utilities
- geocoding services, fallback queries, and location formatting

### 🔁 Testing Approach

- Integration tests use the real Express application with minimal mocking.
- A dedicated PostgreSQL database ensures isolated and deterministic execution.
- Internal modules are validated independently to simplify maintenance.
- Shared factories and helpers reduce duplicated test setup.
- Critical workflows, permissions, uploads, filtering, reviews, and business rules receive extensive coverage.
- Authorization, soft-delete behavior, review permissions, and query edge cases are validated through both integration and unit tests.
- High automated coverage helps maintain predictable backend behavior as the project evolves.

For a detailed overview of the testing architecture, factories, helpers, database isolation, transaction testing, and mocking strategies, see [`docs/testing.md`](./docs/testing.md).

---

## 🔐 Security

The API implements multiple security layers to protect sensitive data, enforce role-based access control, and ensure predictable behavior across every endpoint.

### 🔑 Authentication

- JWT-based authentication using Bearer tokens
- Protected routes secured through centralized authentication middleware
- Current password verification for sensitive account changes
- Configurable rate limiting for authentication and public endpoints

### 🛡️ Authorization

The API uses a centralized role-based authorization model.

Supported roles:

- `organizer`
- `co_organizer`
- `participant`

Authorization is enforced through dedicated middleware and service-layer business rules:

- `authenticateToken`
- `authorizeEventRole`
- `eventMemberAuthorization`

Built-in protections include:

- role hierarchy enforcement
- ownership and review ownership validation
- event-state restrictions
- inactive membership and soft-delete protection
- prevention of unauthorized operations

Unauthenticated users have read-only access to public resources.

### 🧾 Input Validation

- Request validation using **express-validator**
- Centralized validation and error handling
- Input sanitization and normalization
- Password policy enforcement
- Validation for route parameters, request bodies, filtering, sorting, and pagination

### 📁 Upload Security

- MIME type, extension, and file size validation
- Restricted and normalized upload destinations
- Secure upload cleanup and path normalization
- Safe image replacement and removal

### 🔒 Data Protection

- Password hashing with **bcrypt**
- Sensitive fields excluded through Sequelize scopes
- Email normalization before persistence
- Public-safe user formatting
- Secure account anonymization during soft-delete workflows
- Consistent JSON API responses

### ⚙️ Additional Security Measures

- Helmet security headers
- Centralized CORS configuration
- SQL injection protection through Sequelize parameterized queries
- Query optimization, database indexing, and transaction-safe operations
- Centralized HTTP error handling
- Environment-based configuration for database, uploads, CORS, logging, and testing

Together, these layers help ensure secure data handling, consistent authorization, and reliable API behavior across the application.

---

## 📦 API Response Format

The API returns a consistent JSON response structure to simplify frontend integration, error handling, and predictable client behavior.

### ✅ Success Response

```json
{
  "success": true,
  "message": "Operation successful"
}
```

Successful responses may also include:

- resource payloads (`user`, `event`, `review`, etc.)
- collections (`events`, `reviews`, etc.)
- pagination metadata
- aggregated statistics

#### Example

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

### 📌 Response Notes

- `success` indicates whether the request completed successfully.
- `message` provides a concise, human-readable description.
- Resource fields (`user`, `event`, `review`, `events`, `reviews`, etc.) contain endpoint-specific data.
- Pagination metadata is included when applicable.
- `errors` contains optional validation or request error details.

Validation and application errors are normalized through centralized middleware and shared HTTP error utilities, ensuring a consistent response format across the API.

---

## ⚡ Getting Started

### Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether/backend
npm install
```

### Environment

Create a `.env` file in the project root and configure the following variables:

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

Environment notes:

- `NODE_ENV` selects the active environment (`development`, `production`, `test`).
- `JWT_SECRET` signs and verifies JWT authentication tokens.
- `DB_NAME_TEST` specifies the dedicated database used during automated testing.
- `DB_LOGGING` enables or disables Sequelize SQL logging.
- `DB_SSL` enables SSL connections for production or managed databases.
- `LOG_LEVEL` configures the Pino logging level (`info`, `debug`, `error`, etc.).
- `AUTH_RATE_LIMIT_*` configures authentication rate limiting.
- `LOCATION_RATE_LIMIT_*` configures geolocation endpoint rate limiting.
- `LOCATION_PROVIDER` selects the active geolocation provider.
- `GEOCODING_USER_AGENT` identifies requests sent to the geolocation provider.
- `GEOCODING_RESULT_LIMIT` limits the number of returned geocoding results.
- `CORS_ORIGIN` defines allowed frontend origins (comma-separated values supported).
- `UPLOAD_DIR` specifies the root upload directory for avatars and event images.

`.env.example` and `.env.test` are included as reference configurations for local development and automated testing.

### Run the API

Start the development server:

```bash
npm run dev
```

Start the production server:

```bash
npm start
```

Run the test suite:

```bash
npm test
```

Run the test suite with coverage:

```bash
npm run test:coverage
```

The server starts after establishing a successful database connection and synchronizing the Sequelize models.

**API Base URL**

```txt
http://localhost:3000
```

**Health Check**

```http
GET /api/health
```

---

## 🔗 API Endpoints

The API exposes the following endpoint groups.

All endpoints return standardized JSON responses as described in the **API Response Format** section.

Path parameters use the `:parameterName` syntax (for example, `:eventId`).

> ⚠️ Avatar and event image uploads require `multipart/form-data`.

### 🔐 Authentication

Authentication and account management endpoints.

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

Event management and public event endpoints.

```http
GET    /api/events                     (filtering, sorting, pagination, review statistics)
GET    /api/events/:eventId            (includes review statistics)
GET    /api/events/:eventId/me         (authenticated event permissions)

POST   /api/events                     (authenticated, supports image upload)
PUT    /api/events/:eventId            (organizer or co_organizer, supports image upload)
DELETE /api/events/:eventId            (organizer only, before the event starts)
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

Membership and role management endpoints.

```http
POST   /api/events/:eventId/members/join          (authenticated)
DELETE /api/events/:eventId/members/leave         (authenticated)

GET    /api/events/:eventId/members
GET    /api/events/:eventId/staff

PUT    /api/events/:eventId/members/:userId/role  (organizer only)
PUT    /api/events/:eventId/ownership             (organizer only)
DELETE /api/events/:eventId/members/:userId       (organizer or co_organizer, subject to role restrictions)
```

### 🗺️ Locations

Geocoding and cached location lookup endpoints.

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

### 🧩 Backend Architecture

- Introduced a dedicated event review and rating domain
- Expanded shared query builders, response normalization, and aggregation helpers
- Improved service-layer organization and reusable business logic
- Strengthened transaction-safe workflows and permission handling

### ⭐ Event Reviews & Ratings

- Added participant-only reviews for completed events
- Introduced review ownership validation and duplicate-review prevention
- Added paginated review retrieval with aggregated rating statistics
- Integrated review summaries into event listing and detail endpoints

### 🗺️ Location & Geocoding

- Added backend-powered geocoding with OpenStreetMap Nominatim
- Introduced location caching and normalized provider responses
- Added authenticated and public location search endpoints
- Improved fallback searches for detailed addresses

### 🔐 Security & Reliability

- Expanded configurable rate limiting for public and protected endpoints
- Improved centralized validation, authorization, and middleware organization
- Strengthened filtering, pagination, and permission enforcement

### 🧪 Testing

- Expanded unit and integration coverage across reviews, memberships, geolocation, and event workflows
- Increased test coverage for permissions, validation, and transaction-safe operations
- Reached **98 passing test suites**, **815 passing tests**, and over **99% statement coverage**

---

## 📌 Project Status

| Area                        | Status                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| Backend API                 | ✅ Stable, scalable, and production-ready                                                  |
| Architecture                | ✅ Modular, layered, service-oriented, and maintainable                                    |
| Authentication & Users      | ✅ JWT authentication, account management, profile updates, and secure deletion            |
| Authorization & Permissions | ✅ Role-based access control, ownership transfer, and permission enforcement               |
| Membership System           | ✅ Role management, restoration flows, and soft-delete support                             |
| Event Management            | ✅ CRUD operations, filtering, uploads, transactions, and business-rule enforcement        |
| Event Reviews & Ratings     | ✅ Reviews, ratings, ownership validation, pagination, and aggregated statistics           |
| Location & Geocoding        | ✅ Geocoding, location caching, fallback search, and public map support                    |
| Security                    | ✅ Validation, upload protection, rate limiting, Helmet, and centralized security policies |
| File Uploads                | ✅ Avatar and event image lifecycle management                                             |
| Logging                     | ✅ Structured application logging with Pino                                                |
| Database                    | ✅ PostgreSQL, Sequelize, transactions, optimized queries, and caching                     |
| API Consistency             | ✅ Standardized JSON responses and centralized error handling                              |
| Testing                     | ✅ **815 passing tests** · **98 passing test suites**                                      |
| Coverage                    | ✅ **99.29%** statements · **94.02%** branches · **100%** functions · **99.35%** lines     |
| Continuous Integration      | ✅ Automated testing with GitHub Actions                                                   |

---

## 🗺️ Roadmap

### 🚀 Features

- Event moderation and reporting
- Review replies and organizer responses
- Event invitations and shareable links
- Email notifications, reminders, and event updates
- Public and private event visibility
- Archived event lifecycle management

### 🏗️ Backend Architecture

- Introduce API versioning (`/api/v1`)
- Publish Swagger / OpenAPI documentation
- Expand analytics and aggregation capabilities
- Continue optimizing database queries and indexing
- Further consolidate business logic and shared query builders

### 🧪 Testing & Developer Experience

- Expand end-to-end testing
- Increase regression and edge-case coverage
- Continue simplifying test helpers and shared utilities
- Improve backend architecture and testing documentation

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Cloud deployment (AWS, Render, Fly.io, etc.)
- CI/CD pipeline enhancements
- Production environment hardening
- Cloud-based object storage (S3-compatible providers)

---
