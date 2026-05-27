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
![Test Suites](https://img.shields.io/badge/test%20suites-78%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-616%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-99.12%25%20statements%20%7C%2094.08%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **backend REST API** of PlanTogether, built with **Node.js, Express, PostgreSQL, and Sequelize**.

The API manages authentication, events, memberships, uploads, permissions, validation, and business rules through a modular and scalable architecture designed for maintainability and long-term growth.

Users can create, join, leave, update, and manage events depending on their role:

- `organizer`
- `co_organizer`
- `participant`

The backend architecture emphasizes:

- service-oriented architecture designed for scalability and maintainability
- layered role-based authorization and permissions
- centralized validation and security workflows
- consistent and predictable API responses
- reusable filtering, formatting, and pagination utilities
- secure upload and authentication flows
- transaction-safe workflows for sensitive operations
- optimized database query strategies
- structured logging with Pino
- automated CI testing with GitHub Actions
- extensive unit and integration test coverage

---

## 🎯 API Overview

PlanTogether provides a **RESTful API** designed for collaborative event management with **role-based access control**.

The API is built to be consumed by frontend applications or external clients and emphasizes security, consistency, scalability, and maintainability.

Clients can:

- authenticate users securely with JWT
- create, update, and manage collaborative events
- join and leave events
- manage membership roles and permissions
- retrieve authenticated and public user data
- upload and manage avatars and event images
- filter, search, sort, and paginate events efficiently
- retrieve creator-specific and participation-based event listings

The backend centralizes validation, authorization, and business logic to ensure:

- secure, predictable, and consistent API behavior
- strong role-based access control
- reliable data integrity across operations

Additional backend architecture features include:

- scalable query-builder and filtering utilities
- shared validation and error-handling middleware
- Sequelize transactions for sensitive workflows
- centralized security policies for passwords, uploads, and CORS
- standardized public and authenticated user formatting helpers
- optimized database queries and indexing strategies
- structured logging with Pino
- automated GitHub Actions CI testing
- extensive unit and integration test coverage

---

## 🛠️ Tech Stack

The backend is built with scalable and modular technologies focused on performance, security, maintainability, and reliable API behavior.

### Core Technologies

- **Node.js** – JavaScript runtime environment
- **Express** – web framework for REST APIs
- **PostgreSQL** – relational database system
- **Sequelize** – ORM for modeling, relationships, querying, and transactions

### Authentication & Security

- **JSON Web Tokens (JWT)** – stateless authentication
- **bcrypt** – password hashing
- **Helmet** – secure HTTP headers protection
- **express-rate-limit** – authentication rate limiting
- **Express Validator** – request validation and sanitization
- **Centralized security policies** – password, upload, and CORS configuration

### File Handling

- **Multer** – avatar and event image uploads
- **Custom upload utilities** – upload security, file cleanup, and path normalization

### Architecture & Backend Patterns

- **Middleware architecture** – authentication, validation, authorization, upload, and error handling layers
- **MVC architecture** – modular application structure
- **Service layer architecture** – centralized business logic abstraction
- **Soft-delete architecture** – membership and account lifecycle preservation
- **Centralized constants and utilities** - reusable business rules, formatting, and query helpers
- **Query optimization utilities** – grouped participant counts and scalable filtering strategies
- **Sequelize transactions** – critical operation safety and data consistency
- **Pino** – structured centralized logging

### Testing & Quality Assurance

- **Jest** – unit testing framework
- **Supertest** – API integration testing
- **GitHub Actions** – automated continuous integration testing
- **Comprehensive testing strategy** – validators, services, middlewares, controllers, query utilities, security flows, uploads, and full API integrations

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

The `config` layer centralizes environment-based configuration such as database connections, CORS, and reusable security policies.

The `constants` layer stores shared business values such as event roles, event modes and event statuses.

The `relations` folder contains linking models used to represent many-to-many relationships between users and events.

The `utils` layer centralizes reusable logic such as:

- pagination, filtering, and query optimization
- event status computation
- authentication token generation
- reusable response formatting
- file management and upload cleanup
- normalization utilities
- reusable HTTP errors

The `middlewares` layer contains reusable authentication, authorization, validation handling, upload handling, rate limiting, and centralized error-handling components.

The testing architecture mirrors the backend structure and separates reusable helpers, factories, unit tests, and full API integration flows to improve maintainability, readability, and testing consistency.

This structure promotes scalability, testability, reusable business logic, secure API design, soft-delete lifecycle management, transaction-safe database operations, and long-term maintainability.

---

## ✨ Features

The API provides a complete set of endpoints for managing users, events, memberships, and permissions through a scalable role-based architecture.

### 👤 User Management

- User registration
- Login with JWT authentication (stateless, token-based)
- Logout endpoint
- Authenticated user profile retrieval
- Public user profile retrieval
- Authenticated profile update
- Avatar upload and replacement (`multipart/form-data`)
- Automatic old avatar cleanup when replaced
- Secure password update flow with current password verification
- Email normalization and password hashing using **bcrypt**
- Centralized validation and error-handling middleware
- Secure authenticated account deletion with anonymization
- Soft-delete account lifecycle preservation
- Unified JSON responses

Additional security features:

- Helmet HTTP security protections
- Authentication rate limiting
- Centralized password policy
- Centralized CORS configuration

### 📅 Event Management

- Create events
- Retrieve all events
- Retrieve a single event
- Retrieve current authenticated user event access and permissions for frontend guards
- Update events *(organizer or co_organizer)*
- Delete events *(organizer only, before the event starts)*
- Event image upload and replacement (`multipart/form-data`)
- Automatic old event image cleanup when replaced
- Organizer ownership transfer between active event members

Additional capabilities:

- Event creator information included in API responses
- Event image paths included in API responses
- Strong validation and business rule enforcement
- Upload validation for supported image types, extensions, and file sizes
- Sequelize transactions for transaction-safe workflows
- Optimized database queries and indexing strategies
- Flexible registration deadline system with predefined and custom deadline support

Each event automatically assigns the creator as **organizer**.

### 👥 Event Membership & Roles

Users interact with events through a membership system that associates users with events and assigns specific roles.

#### Membership

- Join an event
- Leave an event
- View event members
- View event organizers and staff
- Retrieve authenticated user event listings
- Retrieve public user event listings
- Automatic membership restoration after rejoining an event
- Soft-delete membership lifecycle management

#### Roles

Each membership has a role stored in the `EventUserRole` model.

- `organizer`
- `co_organizer`
- `participant`

### 🔐 Permissions & Role Hierarchy

The API enforces a strict role hierarchy:

`organizer > co_organizer > participant`

#### Organizer capabilities

- Full event management permissions
- Edit and delete events
- Promote participants to co_organizers
- Demote co_organizers
- Remove participants and co_organizers

#### Co_organizer capabilities

- Edit events
- Remove participants from events

#### Participant capabilities

- Join events
- Leave events

#### Event access endpoint

Authenticated clients can retrieve the current user's role and action access for a specific event:

```http
GET /api/events/:eventId/me
```

This endpoint returns:

- the current user's event role
- the computed event status (`upcoming`, `ongoing`, or `past`)
- action access flags such as `canEdit` and `canDelete`
- deletion access automatically respects started-event restrictions

It is primarily used by frontend route guards and permission-based UI rendering.

This allows the frontend to:
- prevent unauthorized users from accessing edit pages
- conditionally render edit/delete actions
- centralize event access checks without duplicating backend authorization logic

The backend remains the source of truth through role authorization middlewares and service-layer business rules.

#### Public access

Unauthenticated users can access public event and public user data in read-only mode.

### 🚫 Protected Actions

The API prevents invalid or unsafe operations:

- Cannot change the role of the organizer
- Cannot promote another user to organizer
- Cannot remove the organizer
- Co_organizers cannot manage other co_organizers
- Started events cannot be deleted
- Past events remain protected from restricted actions
- Invalid memberships and unauthorized actions are blocked consistently
- Ownership transfer is restricted to active event members
- Inactive memberships cannot manage or receive protected roles
- Active organizers cannot delete their account before transferring ownership
- Protected actions are enforced consistently through centralized authorization and business-rule layers

### 🧠 Authorization System

The backend uses a layered middleware architecture:

- **Authentication**
  - `authenticateToken` verifies JWT access tokens

- **Authorization**
  - `authorizeEventRole`
  - `eventMemberAuthorization`

- **Business rules**
  - role hierarchy enforcement
  - organizer protection
  - membership management restrictions
  - event state restrictions
  - started event deletion protection
  - ownership transfer restrictions
  - soft-delete membership protection
  - inactive membership handling

This architecture ensures a clear separation between:

- authentication
- authorization
- validation
- business logic

The authorization system is centralized, reusable, and consistent across all event-related operations.

### 👥 Members & Roles Management

Organizers and co_organizers can:

- View all members of an event
- View organizers and co_organizers
- Change a user's role *(organizer only)*
- Remove a member *(with role restrictions)*

### 🔍 Event Search & Filtering

The API supports advanced filtering using query parameters.

Filtering is powered by a reusable query system, ensuring consistent results across public and authenticated event listings.

Supported filters:

- `search` → keyword search in title and description
- `creator` → filter by creator name
- `creatorId` → filter by creator ID
- `type` → filter by event type
- `theme` → filter by event theme
- `location` → filter by event location
- `mode` → online or in-person events
- `startDate` → filter events starting from a specific date
- `endDate` → filter events up to a specific date
- `date` → filter events for an exact day (overrides range)
- `status` → filter upcoming, ongoing or past events

Additional features:

- Pagination support
- Flexible sorting and ordering
- Creator filtering across public and authenticated event listings
- Consistent filtering behavior across public and authenticated endpoints
- Optimized participant count queries without N+1 database queries
- Active participant counting excluding soft-deleted memberships
- Scalable query-builder utilities for filtering logic

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
GET /api/events?creator=Luffy
```

Filter authenticated user events by view and creator:

```http
GET /api/users/me/events?view=joined&creator=Luffy&page=2
```

---

## 🧪 Testing

The API includes a comprehensive automated test suite built with **Jest** and **Supertest**, covering both full API flows and isolated internal application logic.

The testing architecture focuses on reliability, maintainability, security, and long-term backend stability.

### ▶️ Run Tests

```bash
npm test
```

### ▶️ Run Tests With Coverage

```bash
npm run test:coverage
```

### 📊 Testing Results

- ✅ 78 passing test suites
- ✅ 616 passing tests
- ✅ All tests passing

**Coverage**:
- 99.12% statements
- 94.08% branches
- 100% functions
- 99.19% lines

✅ High coverage across authentication, authorization, filtering, uploads, soft-delete flows, ownership transfer, transactions, query optimization, and full API flows.

### 🔁 Continuous Integration

The backend test suite runs automatically through GitHub Actions using:

- automated PostgreSQL test services
- isolated backend test configuration
- automated test execution on push and pull requests
- full integration and unit test validation in CI

This helps detect regressions early and ensures consistent backend reliability across development workflows.

### 📦 Test Coverage

The project includes two main testing layers:

#### 🔗 Integration Tests (API Flows)

These tests validate the complete request lifecycle:

```txt
Request → Middleware → Controller → Service → Database → Response
```

Integration tests run against the real Express application using Supertest and a dedicated PostgreSQL test database.

📌 Covered areas:

- **Authentication**
  - Register
  - Login
  - Logout
  - JWT authentication flows
  - Authentication rate limiting

- **User**
  - Authenticated profile retrieval and updates
  - Public profile retrieval
  - Password update flows
  - Avatar upload and replacement
  - Secure account deletion and anonymization
  - Soft-delete account lifecycle protection
  - Authenticated and public user event listings
  - Validation and protected user flows

- **Events**
  - CRUD operations
  - Current user event access retrieval
  - Event image upload and replacement
  - Filtering, sorting, and pagination
  - Creator-based filtering
  - Role-based permissions
  - Validation and protected actions
  - Event state restrictions
  - Started event deletion restrictions
  - Event access permission resolution

- **Event Membership**
  - Join and leave events
  - Event member and organizer listing
  - Role management and access control
  - Membership restrictions and edge cases
  - Ownership transfer flows
  - Automatic membership restoration
  - Soft-delete membership lifecycle handling
  - Inactive membership protection

- **Application**
  - Health check endpoint (`/api/health`)
  - Root endpoint
  - 404 handling
  - Global error handling

#### 🧩 Unit Tests (Internal Modules)

These tests validate isolated internal application logic independently of HTTP requests.

📌 Covered modules:

- **Controllers**
  - Request handling
  - Response formatting
  - Error propagation

- **Services**
  - Business logic
  - Database operations
  - Rule enforcement
  - Transaction-based flows
  - Soft-delete lifecycle handling
  - Query optimization helpers
  - Scalable query-builder utilities
  - Event access resolution

- **Middlewares**
  - Authentication (`authenticateToken`)
  - Authorization (`authorizeEventRole`, `eventMemberAuthorization`)
  - Validation error handling (`handleValidationErrors`)
  - Upload handling (`uploadFiles`)
  - Rate limiting (`authRateLimiter`)
  - Centralized error handling (`errorHandler`)

- **Validators**
  - Request validation using `express-validator`
  - Invalid payload handling
  - Edge cases and security rules

- **Utils**
  - Authentication token utilities
  - Event filtering, query-builder, query optimization, and status utilities
  - Grouped participant count helpers
  - Event status and started-event helpers
  - Pagination utilities
  - User formatting utilities
  - Uploaded file storage and cleanup
  - Reusable HTTP error helpers

### 🔁 Testing Strategy

- Integration tests use the real Express application
- API flows are tested with minimal mocking
- A dedicated PostgreSQL test database ensures isolation
- Tests clean up their own data between runs
- Internal modules are tested independently to improve maintainability and robustness
- Reusable factories and helpers reduce duplication
- Validation, permissions, uploads, filtering, and business rules are extensively tested
- High coverage helps ensure strong reliability across critical backend features
- Query optimization and soft-delete edge cases are validated through both unit and integration tests

For more details about the testing architecture, factories, helpers, database isolation, transaction testing, and mocking strategy, see [`docs/testing.md`](./docs/testing.md).

---

## 🔐 Security

The API implements multiple security layers to protect sensitive data, enforce strict access control, and ensure safe and predictable API behavior across all endpoints.

### 🔑 Authentication

- JWT-based authentication using Bearer tokens
- Protected routes require a valid JWT authentication token
- Password updates require current password verification
- `authRateLimiter` middleware helps protect authentication endpoints against brute-force attacks
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

- organizer protection rules
- membership hierarchy enforcement
- protected role management operations
- past event restrictions
- started event deletion restrictions
- unauthorized action prevention
- ownership transfer restrictions
- inactive membership protection
- soft-delete membership access protection

Unauthenticated users only have read-only access to public resources.

### 🧾 Input Validation

- Request validation using **express-validator**
- Centralized validation and error handling
- Sanitization and normalization of incoming data
- Centralized password policy enforcement
- Validation of query parameters, route params, and request bodies
- Validation of filtering, sorting, and pagination inputs

### 📁 Upload Security

- MIME type validation
- File extension validation
- File size limits
- Restricted and normalized upload destinations
- Secure upload cleanup and path normalization protection

### 🔒 Data Protection

- Password hashing using **bcrypt**
- Sensitive fields excluded through Sequelize scopes
- Email normalization before persistence
- Safe public user formatting utilities
- Secure account anonymization during soft-delete flows
- Consistent JSON API response structures

### ⚙️ Additional Security Measures

- Helmet security headers protection
- Centralized CORS configuration
- SQL injection protection through Sequelize parameterized queries
- Query optimization strategies to avoid inefficient N+1 database access patterns
- Sequelize transactions for critical operations
- Database indexes for optimized query performance
- Centralized HTTP error utilities and reusable API error patterns
- Centralized global error handling through `errorHandler`
- Environment-based configuration for database, CORS, uploads, logging, and test behavior

These mechanisms help ensure secure data handling, reusable security patterns, predictable API behavior, soft-delete lifecycle protection, and strong protection against unauthorized access across the application.

---

## 📦 API Response Format

The API uses a consistent JSON response structure to ensure predictable frontend integration, centralized error handling, and easier client-side consumption.

### ✅ Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Possible success payloads may include:

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

### 🔍 Notes

- `JWT_SECRET` → used to sign and verify JWT authentication tokens
- `NODE_ENV` → defines the current environment (`development`, `production`, `test`)
- `DB_NAME_TEST` → dedicated database used for automated tests
- `DB_LOGGING` → enables Sequelize SQL query logging (`true` or `false`)
- `DB_SSL` → enables SSL for production or cloud-hosted databases
- `LOG_LEVEL` → configures the Pino logger level (`info`, `debug`, `error`, etc.)
- `AUTH_RATE_LIMIT_WINDOW_MS` → authentication rate limit window in milliseconds
- `AUTH_RATE_LIMIT_MAX` → maximum authentication attempts allowed during the configured window
- `CORS_ORIGIN` → allowed frontend origins (comma-separated values supported)
- `UPLOAD_DIR` → configurable upload root directory for avatars and event images

`.env.example` and `.env.test` files are provided as reference configurations.

---

## ▶️ Running the API

To start the server:

```bash
npm start
```

For development with automatic reload:

```bash
npm run dev
```

To run the automated test suite:

```bash
npm test
```

To run tests with coverage:

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

The API exposes the following main endpoints grouped by functional area.

All endpoints return standardized JSON responses as described in the API Response Format section.

Path parameters use the `:paramName` syntax (e.g. `:eventId`).

> ⚠️ Some endpoints require `multipart/form-data` requests for avatar and event image uploads.

### 🔐 Authentication

Endpoints related to authentication and account access.

```http
POST   /api/auth/register              (supports avatar upload via multipart/form-data)
POST   /api/auth/login
POST   /api/auth/logout                (authenticated)
```

### 👤 Users

Endpoints related to authenticated and public user data.

```http
GET    /api/users/me
PUT    /api/users/me                   (authenticated, supports avatar upload via multipart/form-data)
PUT    /api/users/me/password          (authenticated)
DELETE /api/users/me                   (authenticated)

GET    /api/users/me/events            (authenticated user events)

GET    /api/users/:id                  (authenticated, public user profile)
GET    /api/users/:id/events           (authenticated, public user events)
```

### 📅 Events

Endpoints for event management and public event access.

```http
GET    /api/events                     (filtering, sorting, and pagination)
GET    /api/events/:eventId
GET    /api/events/:eventId/me         (authenticated, current user event access)

POST   /api/events                     (authenticated, supports image upload via multipart/form-data)
PUT    /api/events/:eventId            (organizer or co_organizer, supports image upload via multipart/form-data)
DELETE /api/events/:eventId            (organizer only, before the event starts)
```

### 👥 Event Membership

Endpoints for event participation and role management.

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

- Reorganized the backend into dedicated layers for authentication, authorization, error handling, configuration, constants, and reusable utilities
- Centralized shared business constants (`EVENT_ROLES`, `EVENT_MODES`, `EVENT_STATUS`)
- Introduced reusable normalization, query-builder, and HTTP error utilities
- Standardized JSON API response structures across endpoints
- Added centralized structured logging with Pino

### 🔐 Security & Validation

- Added Helmet security protections and configurable authentication rate limiting
- Centralized password, upload, and CORS security policies
- Strengthened upload security with MIME type, extension, file size validation, cleanup, and path normalization protections
- Improved centralized validation and error-handling middleware
- Added global error handling through `errorHandler`

### 📅 Events & Membership System

- Added organizer ownership transfer flows
- Added soft-delete membership and account deletion lifecycle handling
- Refined layered role-based authorization and membership protection rules
- Improved event status handling, past-event restrictions, and membership restoration flows
- Added Sequelize transactions for transaction-safe workflows
- Added current user event access endpoint for frontend route and UI permission guards
- Improved registration deadline handling for create and update workflows
- Added started-event deletion restrictions across authorization and business-rule layers
- Added reusable hasEventStarted and assertEventNotStarted helpers
- Extended event status support with ongoing event handling
- Improved frontend permission alignment through event access rules

### 🗄️ Database & Performance

- Added database indexes for optimized query performance
- Standardized Sequelize association aliases and relationship consistency
- Optimized participant count queries to avoid inefficient N+1 database queries
- Improved filtering, pagination, and sorting consistency
- Expanded reusable query-builder utilities for scalable filtering logic

### 🧪 Testing

- Standardized the testing architecture for improved maintainability
- Expanded unit and integration test coverage across all backend layers
- Added coverage for configuration, constants, security policies, soft-delete flows, ownership transfer, account deletion, and query optimization
- Added automated GitHub Actions continuous integration testing
- Reached 78 passing test suites and 616 passing tests
- Achieved high coverage across authentication, authorization, filtering, uploads, validation, business rules, and API flows
- Expanded coverage for registration deadline flows and authentication rate limiting
- Expanded coverage for started-event restrictions and event access permissions

---

## 📌 Project Status

| Area | Status |
|---|---|
| Backend API | ✅ Stable, scalable, and production-oriented |
| Architecture | ✅ Modular, scalable, and layered |
| Authentication & Users | ✅ JWT authentication, profile management, password updates, and secure account deletion |
| Authorization | ✅ Advanced role-based access control and ownership transfer |
| Membership System | ✅ Role management, restoration flows, and soft-delete lifecycle handling |
| Security | ✅ Helmet, rate limiting, validation, upload protection, and centralized security policies |
| File Uploads | ✅ Avatar and event image uploads supported |
| Logging | ✅ Centralized structured logging with Pino |
| Database | ✅ PostgreSQL + Sequelize with transactions, indexes, and optimized queries |
| API Consistency | ✅ Standardized JSON responses and centralized error handling |
| Testing | ✅ 616 tests across 78 test suites |
| Coverage | ✅ 99.12% statements / 94.08% branches / 100% functions / 99.19% lines |
| Continuous Integration | ✅ Automated GitHub Actions backend testing |
| Frontend Integration | 🔗 Connected and functional |

---

## 🔮 Future Improvements

### 🚀 Features

- Event invitation system (email invitations or shareable links)
- Email notifications for invitations, reminders, and event updates
- Public and private event visibility management
- Membership role history and audit logs
- Archived events lifecycle and cleanup strategy
- Improved event participation and moderation workflows
- Event activity feeds and moderation audit trails

### 🧠 Backend & Architecture

- Advanced query aggregation and analytics optimization
- Advanced database performance tuning
- API versioning strategy (`/api/v1`)
- Further business-rule centralization and abstraction
- Swagger / OpenAPI documentation support
- Additional reusable filtering, formatting, and query-builder utilities

### 🧪 Testing & Developer Experience

- Additional end-to-end testing flows
- Further test deduplication and simplification
- Extended edge-case coverage
- Expanded backend architecture and testing documentation

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Cloud deployment (AWS, Render, Fly.io, etc.)
- Production-ready environment configuration improvements
- Extended CI/CD pipeline workflows
- Secure cloud-based production file storage strategy

---
