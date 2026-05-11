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
![Test Suites](https://img.shields.io/badge/test%20suites-64%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-478%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98%25%20statements%20%7C%2091%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **backend REST API** of PlanTogether, built with **Node.js, Express, PostgreSQL, and Sequelize**.

The API handles authentication, event management, memberships, uploads, permissions, validation, and business rules through a modular and scalable architecture.

Users can create, join, leave, update, and manage events depending on their role:

- `organizer`
- `co_organizer`
- `participant`

The backend focuses on:

- scalability and maintainability
- modular service-oriented architecture
- centralized validation and error handling
- API consistency and predictable responses
- security and role-based access control
- high automated test coverage

It also includes advanced backend features such as:

- secure JWT authentication
- role-based authorization system
- reusable event filtering system (search, creator, categories, dates, status)
- consistent filtering across public and authenticated event listings
- secure avatar and event image upload handling
- centralized security policies (passwords, uploads, CORS)
- Helmet, CORS, and authentication rate limiting protections
- Sequelize transactions for critical operations
- database query optimization through indexes
- reusable formatting and pagination utilities
- extensive unit and integration test coverage

---

## 🎯 API Overview

PlanTogether provides a **RESTful API** designed for collaborative event management with **role-based access control**.

The API is intended to be consumed by frontend applications or external clients and focuses on security, consistency, scalability, and maintainability.

The API allows clients to:

- authenticate users securely using JWT
- create, update, and manage collaborative events
- join and leave events
- manage membership roles within events
- retrieve authenticated and public user data
- upload and manage user avatars and event images
- filter, search, sort, and paginate events efficiently
- retrieve creator-specific and participation-based event listings

The backend enforces centralized validation, authorization, and business rules to ensure:

- data integrity
- predictable API behavior
- secure role-based access control
- consistent JSON API responses

It also includes:

- reusable filtering and pagination utilities
- centralized validation and error-handling middleware
- Sequelize transactions for critical database operations
- centralized security policies for passwords, uploads, and CORS
- reusable user formatting utilities
- optimized database queries through indexing
- extensive unit and integration test coverage

---

## 🛠️ Tech Stack

The backend is built using scalable and modular technologies focused on performance, security, maintainability, and reliable API behavior.

### Core Technologies

- **Node.js** – JavaScript runtime environment
- **Express** – web framework for building REST APIs
- **PostgreSQL** – relational database system
- **Sequelize** – ORM for database modeling, relationships, querying, and transactions

### Authentication & Security

- **JSON Web Tokens (JWT)** – secure stateless authentication
- **bcrypt** – password hashing
- **Helmet** – secure HTTP headers protection
- **express-rate-limit** – authentication rate limiting
- **Express Validator** – request validation and sanitization
- **Centralized security policies** – password, upload, and CORS configuration

### File Handling

- **Multer** – file upload handling for avatars and event images
- **Custom upload utilities** – upload security, file cleanup, and path normalization

### Architecture & Patterns

- **Middleware architecture** – authentication, validation, authorization, upload, and error handling layers
- **MVC architecture** – modular and maintainable application structure
- **Service layer** – centralized business logic abstraction
- **Centralized constants and utilities** – reusable business rules and API consistency
- **Reusable formatting and pagination utilities**
- **Sequelize transactions** – critical operation safety and data consistency

### Testing

- **Jest** – unit testing framework
- **Supertest** – integration testing for API endpoints
- **Comprehensive testing strategy** – validators, services, middlewares, controllers, utilities, and full API flows

---

## 📁 Backend Structure

The backend follows a modular **MVC architecture** with a clear separation of concerns between controllers, services, models, middlewares, validators, configuration, and reusable utilities.

```txt
project-root
│
├── docs/
│   └── testing.md
│
├── src
│   ├── config/
│   │   ├── database.js
│   │   ├── cors.js
│   │   └── security/
│   │       ├── passwordPolicy.js
│   │       └── uploadPolicy.js
│   │
│   ├── constants/
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
│   │   ├── eventMembership/
│   │   └── users/
│   │
│   └── unit/
│       ├── controllers/
│       ├── middlewares/
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
├── package.json
└── README.md
```

The `config` layer centralizes environment-based configuration such as database connection, CORS, and reusable security policies.

The `constants` layer stores shared business values such as event roles and event statuses.

The `relations` folder contains linking models used to represent many-to-many relationships between users and events.

The `utils` layer centralizes reusable logic such as:

- pagination and filtering
- event status computation
- authentication token generation
- reusable response formatting
- file management and upload cleanup
- normalization utilities
- reusable HTTP errors

The `middlewares` layer contains reusable authentication, authorization, validation error handling, upload handling, rate limiting, and centralized error-handling components.

The testing architecture mirrors the backend structure and separates reusable helpers, factories, unit tests, and full API integration flows to improve maintainability, readability, and coverage consistency.

This structure promotes scalability, testability, reusable business logic, secure API design, and safer database operations through transactions and centralized validation patterns

---

## ✨ Features

The API provides a complete set of endpoints to manage users, events, memberships, and permissions with fine-grained access control and consistent API behavior.

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
- Centralized validation and error handling middleware
- Consistent JSON API responses

Additional security features:

- Helmet HTTP security protections
- Authentication rate limiting
- Centralized password policy
- Centralized CORS configuration

### 📅 Event Management

- Create events
- Retrieve all events
- Retrieve a single event
- Update events *(organizer or co_organizer)*
- Delete events *(organizer only)*
- Event image upload and replacement (`multipart/form-data`)
- Automatic old event image cleanup when replaced

Additional capabilities:

- Event creator information included in API responses
- Event image paths included in API responses
- Strong validation and business rule enforcement
- Upload validation for supported image types, extensions, and file sizes
- Sequelize transactions for critical operations
- Optimized database queries through indexing

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

#### Roles

Each membership has a role stored in the `EventUserRole` model.

- `organizer`
- `co_organizer`
- `participant`

### 🔐 Permissions & Role Hierarchy

The API enforces a strict role hierarchy:

`organizer > co_organizer > participant`

#### Organizer capabilities

- Full control over the event
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

#### Public access

Unauthenticated users can access public event and public user data in read-only mode.

### 🚫 Protected Actions

The API prevents invalid or unsafe operations:

- Cannot change the role of the organizer
- Cannot promote another user to organizer
- Cannot remove the organizer
- Co_organizers cannot manage other co_organizers
- Past events cannot be modified through protected actions
- Invalid memberships and unauthorized actions are blocked consistently

### 🧠 Authorization System

The backend uses a layered middleware architecture:

- **Authentication**
  - `authenticateToken` verifies JWT access tokens

- **Authorization**
  - `authorizeEvent`
  - `eventMemberAuthorization`

- **Business rules**
  - role hierarchy enforcement
  - organizer protection
  - membership management restrictions
  - event state restrictions

This ensures a clear separation between:

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

Filtering is powered by a centralized and reusable system, ensuring consistent results across public and authenticated event listings.

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
- `status` → filter upcoming or past events

Additional features:

- Sorting and ordering
- Pagination support
- Creator filtering across public and authenticated event listings
- Consistent filtering behavior across endpoints

#### Examples

Filter events using keyword and date range:

```http
GET /api/events/filtered?search=party&type=music&startDate=2026-04-01&endDate=2026-04-30
```

Filter events for an exact date:

```http
GET /api/events/filtered?date=2026-04-16
```

Filter events by creator:

```http
GET /api/events/filtered?creator=Luffy
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

### 📊 Results

- 64 test suites
- 478 tests
- ✅ All passing

**Coverage:**
- 98.40% statements coverage
- 90.59% branch coverage
- 99.26% functions coverage
- 98.57% lines coverage

✅ High coverage across authentication, authorization, filtering, uploads, business rules, transactions, and API flows.

### 📦 Test Coverage

The project includes two main testing layers:

#### 🔗 Integration Tests (API Flows)

These tests validate the complete request lifecycle:

```txt
Request → Middleware → Controller → Service → Database → Response
```

Integration tests run against the real Express application using Supertest and a dedicated PostgreSQL test database

📌 Covered areas:

- **Authentication**
  - Register
  - Login
  - Logout
  - Profile retrieval and updates
  - Password updates
  - Avatar upload and replacement
  - Authentication rate limiting

- **Events**
  - CRUD operations
  - Event image upload and replacement
  - Filtering, sorting, and pagination
  - Creator-based filtering
  - Role-based permissions
  - Validation and protected actions
  - Event state restrictions

- **Event Membership**
  - Join and leave events
  - Event member and organizer listing
  - Role management and access control
  - Membership restrictions and edge cases
  - Authenticated and public user event listings

- **Application**
  - Health check endpoint (`/api/health`)
  - Root endpoint
  - 404 handling
  - Global error handling

#### 🧩 Unit Tests (Internal Modules)

These tests validate isolated internal application logic independently from HTTP requests.

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

- **Middlewares**
  - Authentication (`authenticateToken`)
  - Authorization (`authorizeEvent`, `eventMemberAuthorization`)
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
  - Event filtering and status utilities
  - Pagination utilities
  - User formatting utilities
  - Uploaded file storage and cleanup
  - Reusable HTTP error helpers

### 🔁 Testing Strategy

- Integration tests use the real Express application
- API flows are tested with minimal mocking
- A dedicated PostgreSQL test database ensures isolation
- Tests clean up their own data between runs
- Internal modules are tested independently for maintainability and robustness
- Reusable factories and helpers reduce duplication
- Validation, permissions, uploads, filtering, and business rules are extensively tested
- High coverage helps ensure strong reliability across critical backend features

For more details about the testing architecture, factories, helpers, database isolation, transaction testing, and mocking strategy, see [`docs/testing.md`](./docs/testing.md).

---

## 🔐 Security

The API implements multiple security layers to protect sensitive data, enforce strict access control, and ensure safe and predictable API behavior across all endpoints.

### 🔑 Authentication

- JWT-based authentication using Bearer tokens
- Protected routes require a valid authentication token
- Password updates require current password verification
- Authentication rate limiting helps protect against brute-force attacks

### 🛡️ Authorization

The API uses a centralized role-based authorization system.

Supported roles:

- `organizer`
- `co_organizer`
- `participant`

Authorization is enforced through reusable middleware and business rule layers:

- `authenticateToken`
- `authorizeEvent`
- `eventMemberAuthorization`

Additional protections include:

- organizer protection rules
- membership hierarchy enforcement
- protected role management operations
- past event restrictions
- unauthorized action prevention

Unauthenticated users only have read-only access to public resources.

### 🧾 Input Validation

- Request validation using **express-validator**
- Centralized validation error handling
- Sanitization and normalization of incoming data
- Centralized password policy enforcement
- Validation of query parameters, route params, and request bodies
- Validation of filtering, sorting, and pagination inputs

Upload validation includes:

- MIME type validation
- File extension validation
- File size limits
- Controlled upload destinations

### 🔒 Data Protection

- Password hashing using **bcrypt**
- Sensitive fields excluded through Sequelize scopes
- Email normalization before persistence
- Safe public user formatting utilities
- Consistent JSON API response structures

### ⚙️ Additional Security Measures

- Helmet security headers protection
- Centralized CORS configuration
- SQL injection protection through Sequelize parameterized queries
- Centralized HTTP error utilities and global error handling
- Secure upload handling with path normalization and cleanup protection
- Sequelize transactions for critical operations
- Database indexes for optimized query performance

These mechanisms help ensure secure data handling, reusable security patterns, predictable API behavior, and strong protection against unauthorized access and unsafe operations across the application.

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

- `success` → indicates whether the request succeeded
- `message` → short human-readable description
- `data` → response payload (object or array depending on the endpoint)
- `errors` → optional detailed validation or request errors

Validation and application errors are normalized through centralized middleware and reusable HTTP error utilities to ensure consistent API responses across all endpoints.

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

NODE_ENV=development

CORS_ORIGIN=http://localhost:5173
```

### 🔍 Notes

- `JWT_SECRET` → used to sign and verify JWT authentication tokens
- `NODE_ENV` → defines the environment (`development`, `production`, `test`)
- `DB_NAME_TEST` → dedicated database used for automated tests
- `DB_LOGGING` → enables Sequelize query logging (`true` or `false`)
- `DB_SSL` → enables SSL for production/cloud-hosted databases
- `CORS_ORIGIN` → allowed frontend origins (comma-separated values supported)
- `UPLOAD_DIR` → base directory used for avatar and event image uploads

👉 A `.env.example` file is provided as a reference configuration.

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

The server starts only if the database connection succeeds.

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

The API exposes the following main endpoints grouped by feature.

All endpoints return standardized JSON responses as described in the API Response Format section.

Path parameters use the `:paramName` syntax (e.g. `:eventId`).

> ⚠️ Some endpoints require `multipart/form-data` requests for avatar and event image uploads.

### 🔐 Authentication

Endpoints related to authentication and account access.

```http
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### 👤 Users

Endpoints related to authenticated and public user data.

```http
GET    /api/users/me
PUT    /api/users/me                   (supports avatar upload via multipart/form-data)
PUT    /api/users/me/password

GET    /api/users/:id
GET    /api/users/:id/events
GET    /api/users/me/events
```

### 📅 Events

Endpoints for event management and public event access.

```http
GET    /api/events
GET    /api/events/filtered
GET    /api/events/:eventId

POST   /api/events                     (supports image upload via multipart/form-data)
PUT    /api/events/:eventId            (supports image upload via multipart/form-data)
DELETE /api/events/:eventId
```

### 👥 Event Membership

Endpoints for event participation and role management.

```http
POST   /api/events/:eventId/members/join
DELETE /api/events/:eventId/members/leave

GET    /api/events/:eventId/members
GET    /api/events/:eventId/organizers

PUT    /api/events/:eventId/members/:userId/role
DELETE /api/events/:eventId/members/:userId
```

### ❤️ Health Check
```http
GET    /api/health
GET    /
```

---

## 🚀 Recent Improvements

### 🏗️ Architecture & Organization

- Reorganized the backend into dedicated layers for authentication, authorization, error handling, configuration, constants, and reusable utilities
- Centralized shared business constants (`EVENT_ROLES`, `EVENT_STATUS`)
- Improved service and middleware consistency across the application
- Introduced reusable formatting, normalization, pagination, and HTTP error utilities
- Standardized JSON API response structures across endpoints
- Refactored reusable test helpers and factories for better maintainability

### 🔐 Security & Validation

- Added Helmet security protections
- Added authentication rate limiting
- Centralized password policy configuration
- Centralized upload validation policies
- Strengthened upload security with MIME type, extension, and file size validation
- Added secure uploaded file cleanup and path normalization protections
- Improved centralized validation and error-handling middleware

### 📅 Events & Membership System

- Centralized event filtering and query-building logic
- Added reusable creator filtering utilities
- Refined role-based authorization architecture
- Simplified membership authorization flows
- Strengthened organizer and co-organizer protection rules
- Improved event status handling and past-event restrictions
- Added Sequelize transactions for critical operations

### 🗄️ Database & Performance

- Added database indexes for optimized query performance
- Standardized Sequelize association aliases and relationship consistency
- Optimized filtering and membership query behavior
- Improved pagination and sorting consistency

### 🧪 Testing

- Refactored the testing architecture for improved maintainability
- Added reusable factories and test helpers
- Expanded unit and integration test coverage across all backend layers
- Added tests for security policies, uploads, formatting utilities, and middleware behavior
- Improved isolation and consistency of automated test flows
- Reached 64 passing test suites and 478 passing tests
- Achieved high coverage across authentication, authorization, filtering, uploads, validation, and business rules

---

## 📌 Project Status

| Area | Status |
|---|---|
| Backend API | ✅ Fully functional |
| Architecture | ✅ Modular, scalable, and layered |
| Authentication | ✅ JWT authentication, profile management, password updates |
| Authorization | ✅ Advanced role-based access control |
| Security | ✅ Helmet, rate limiting, validation, upload protection |
| File Uploads | ✅ Avatar and event image uploads supported |
| Database | ✅ PostgreSQL + Sequelize with transactions and indexes |
| API Consistency | ✅ Standardized JSON responses and centralized error handling |
| Testing | ✅ 478 tests across 64 test suites |
| Coverage | ✅ ~98% statements / ~91% branches / ~99% functions |
| Frontend Integration | 🔗 Connected and functional |

---

## 🔮 Future Improvements

### 🚀 Features

- Event invitation system (email invitations or shareable links)
- Email notifications for invitations, reminders, and event updates
- Public and private event visibility management
- Organizer ownership transfer system
- Soft-delete support for memberships and archived events
- Improved event participation and moderation workflows

### 🧠 Backend & Architecture

- Additional query and aggregation optimization
- Advanced database performance tuning
- Improved logging system using Pino or Winston
- API versioning strategy (`/api/v1`)
- Extended business rule centralization
- Swagger / OpenAPI documentation support
- Additional reusable filtering and formatting utilities

### 🧪 Testing & Developer Experience

- Additional end-to-end testing flows
- Further test deduplication and simplification
- Extended edge-case coverage
- Expanded backend architecture and testing documentation

### ⚙️ Infrastructure & Deployment

- Docker containerization
- Cloud deployment (AWS, Render, Fly.io, etc.)
- Production-ready environment configuration improvements
- CI/CD pipeline integration
- Secure production file storage strategy

---
