# PlanTogether - Backend API (Node.js)

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Framework](https://img.shields.io/badge/Framework-Express-black)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![ORM](https://img.shields.io/badge/ORM-Sequelize-orange)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)
![Architecture](https://img.shields.io/badge/Architecture-Layered%20%26%20Service--Oriented-blueviolet)
![Security](https://img.shields.io/badge/Security-JWT%20%7C%20Helmet%20%7C%20Rate%20Limiting-009688)

![API](https://img.shields.io/badge/API-REST-blue)
![Node](https://img.shields.io/badge/Node-%3E%3D20-green)

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Test%20Suites](https://img.shields.io/badge/Test%20Suites-147%20passing-brightgreen)
![Tests](https://img.shields.io/badge/Tests-1472%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-99%25%2B-brightgreen)

A secure and extensively tested REST API powering the PlanTogether event management platform.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Backend Structure](#backend-structure)
- [Architecture Decisions](#architecture-decisions)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication and Security](#authentication-and-security)
- [User System](#user-system)
- [File Uploads](#file-uploads)
- [Geocoding](#geocoding)
- [Event System](#event-system)
- [Membership System](#membership-system)
- [Reviews and Likes](#reviews-and-likes)
- [Testing](#testing)
- [Available Scripts](#available-scripts)
- [Project Status](#project-status)
- [Roadmap](#roadmap)

---

## Overview

PlanTogether is a collaborative event management platform that allows users to create, discover, join, and manage events through a secure, role-based REST API.

This backend is built with Node.js, Express, PostgreSQL, and Sequelize and follows a layered, service-oriented architecture focused on scalability, maintainability, and clear separation of responsibilities.

Core capabilities include:

- JWT authentication and role-based authorization
- Event creation and management
- Membership and ownership management
- Event reviews and likes
- File uploads for avatars and event images
- Location search and geocoding with caching
- Filtering, sorting, and pagination utilities
- Transaction-safe business operations
- Extensive automated testing and continuous integration

The API centralizes validation, authorization, business rules, and error handling to provide a consistent and maintainable backend architecture.

---

## Features

### Authentication

- JWT-based authentication
- Protected and public API endpoints
- Password hashing with bcrypt
- Role-based authorization

### User Management

- Authenticated user profile management
- Public user profiles
- Profile updates and avatar uploads
- Password updates and account deletion
- Public and authenticated user event listings

### Event Management

- Create, update, and delete events
- Event filtering, sorting, and pagination
- Online and in-person event support
- Event status management (upcoming, ongoing, past)

### Event Membership System

- Join and leave events
- Organizer, co-organizer, and participant roles
- Ownership transfer between members
- Soft-deleted memberships support

### Event Reviews and Likes

- Event likes with duplicate prevention
- Participant-only event reviews
- Review ownership management
- Average ratings and paginated reviews

### Geocoding & Locations

- Location search and autocomplete
- Geocoding with provider caching
- Structured address normalization
- Interactive map support

### File Management

- Avatar uploads
- Event image uploads
- Safe uploaded file deletion utilities

### Architecture & Utilities

- Layered and service-oriented architecture
- Centralized validation and error handling
- Transaction-safe operations
- Shared filtering, pagination, and query utilities
- Structured logging with Pino

---

## Tech Stack

| Category | Technologies |
|----------|----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Sequelize |
| Authentication | JWT, bcrypt |
| Validation | express-validator |
| Security | Helmet, CORS, Rate Limiting |
| File Uploads | Multer |
| Geocoding | Nominatim (OpenStreetMap) |
| Testing | Jest, Supertest |
| Logging | Pino |
| CI | GitHub Actions |

---

## Backend Structure

```text
backend/
├── docs/
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   │   ├── associations/
│   │   └── index.js
│   ├── routes/
│   │   └── users/
│   ├── services/
│   │   └── users/
│   ├── utils/
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── eventLikes/
│   │   ├── eventMemberships/
│   │   ├── eventReviews/
│   │   ├── events/
│   │   ├── files/
│   │   ├── geocoding/
│   │   └── users/
│   ├── validators/
│   │   ├── shared/
│   │   └── users/
│   ├── app.js
│   └── server.js
│
├── tests/
│   ├── factories/
│   ├── helpers/
│   ├── setup/
│   ├── integration/
│   └── unit/
│
├── uploads/
├── .env.example
├── package.json
└── README.md
```

### Architectural Principles

- Layered and service-oriented architecture
- Clear separation of concerns across modules
- Domain-oriented module organization
- Centralized validation and error handling
- Transaction-safe business operations
- Reusable query, filtering, and pagination helpers
- Comprehensive unit and integration test coverage

---

## Architecture Decisions

### Layered Architecture

The backend follows a layered architecture that separates responsibilities across routes, controllers, services, models, middlewares, validators, and reusable utilities.

This separation improves maintainability, readability, and scalability while keeping business logic independent from HTTP concerns.

### Domain-Oriented Utilities

Shared business logic is organized by domain (events, memberships, reviews, likes, geocoding, files, users, etc.) instead of becoming large generic utility files.

This approach improves discoverability and encourages reusable, focused helpers.

### Service-Oriented Business Logic

Business rules are centralized inside service modules. Controllers remain lightweight and are responsible for orchestrating requests and responses only.

This keeps the API behavior predictable and simplifies testing.

### Transaction-Safe Operations

Critical workflows use database transactions when multiple operations must succeed together.

Examples include:

- event ownership transfers
- membership creation and restoration
- event likes management
- event reviews creation

### Soft Deletes for Memberships

Event memberships are soft deleted using a `deletedAt` field.

This allows users to leave and rejoin events while preserving historical membership data and preventing duplicate records.

### Centralized Validation and Error Handling

Request validation is handled with `express-validator`, while business and authorization errors are centralized through reusable HTTP error utilities and a global error handler.

### Pagination, Filtering and Sorting

Reusable pagination, filtering, and sorting helpers are shared across list endpoints to provide a consistent API experience.

### Testing Strategy

The project uses both unit and integration tests with Jest and Supertest. Tests are organized to validate business logic, API behavior, middleware responsibilities, and database interactions independently.

---

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether/backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Copy the provided `.env.example` file and create your local .env file.

```bash
cp .env.example .env
```

### Start the Development Server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:3000
```

---

## Environment Variables

Copy the provided `.env.example` file and update the values for your local environment.

| Variable | Description | Default / Example |
|---------|---------|---------|
| NODE_ENV | Application environment | development |
| PORT | API server port | 3000 |
| JWT_SECRET | JWT signing secret | replace_with_a_long_random_secret |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_USER | PostgreSQL username | postgres |
| DB_PASSWORD | PostgreSQL password | your_database_password |
| DB_NAME | Development database name | plantogether_db |
| DB_NAME_TEST | Test database name | plantogether_test |
| DB_SSL | Enable SSL for PostgreSQL | false |
| UPLOAD_DIR | Uploaded files directory | uploads |
| LOG_LEVEL | Logger level | info |
| BCRYPT_SALT_ROUNDS | bcrypt salt rounds | 10 |
| AUTH_RATE_LIMIT_WINDOW_MS | Authentication rate limit window | 900000 |
| AUTH_RATE_LIMIT_MAX | Maximum authentication requests per window | 10 |
| GEOCODING_PROVIDER | Geocoding provider | nominatim |
| GEOCODING_USER_AGENT | User agent sent to the provider | PlanTogether/1.0 (https://github.com/CoCav/planTogether) |
| NOMINATIM_SEARCH_URL | Nominatim search endpoint | https://nominatim.openstreetmap.org/search |
| GEOCODING_RESULT_LIMIT | Maximum number of geocoding results | 5 |
| GEOCODING_RATE_LIMIT_WINDOW_MS | Geocoding rate limit window | 60000 |
| GEOCODING_RATE_LIMIT_MAX | Maximum geocoding requests per window | 30 |
| CORS_ORIGIN | Allowed frontend origin | http://localhost:5173 |

### Notes

- `DB_NAME_TEST` is used exclusively by the automated test suite.
- `JWT_SECRET` should always be replaced with a strong random value in production.
- `GEOCODING_USER_AGENT` is required by the Nominatim usage policy.
- `CORS_ORIGIN` supports multiple frontend origins using a comma-separated list.

Example:

```env
CORS_ORIGIN=http://localhost:5173,https://my-app.com
```

---

## API Endpoints

The API is organized by domain and follows RESTful conventions.

| Route Group | Description |
|------------|------------|
| `/api/auth` | Authentication and account access |
| `/api/users` | Authenticated and public user profiles and event listings |
| `/api/events` | Event creation, retrieval, updates and deletion |
| `/api/events/:eventId/members` | Membership and role management |
| `/api/events/:eventId/reviews` | Event reviews and ratings |
| `/api/events/:eventId/likes` | Event likes management |
| `/api/locations` | Geocoding and location search |

### Route Overview

#### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

#### Users

```
GET    /api/users/me
PUT    /api/users/me
PUT    /api/users/me/password
DELETE /api/users/me

GET    /api/users/me/events

GET    /api/users/:id
GET    /api/users/:id/events
```

#### Events

```
GET    /api/events
GET    /api/events/:eventId
GET    /api/events/:eventId/me

POST   /api/events
PUT    /api/events/:eventId
DELETE /api/events/:eventId
```

#### Memberships

```
POST   /api/events/:eventId/members/join
DELETE /api/events/:eventId/members/leave

GET    /api/events/:eventId/members
GET    /api/events/:eventId/staff

PUT    /api/events/:eventId/members/:userId/role
DELETE /api/events/:eventId/members/:userId

PUT    /api/events/:eventId/ownership
```

#### Reviews

```
GET    /api/events/:eventId/reviews
POST   /api/events/:eventId/reviews

PUT    /api/events/reviews/:reviewId
DELETE /api/events/reviews/:reviewId
```

#### Likes

```
POST   /api/events/:eventId/likes
DELETE /api/events/:eventId/likes
```

#### Locations

```
GET    /api/locations/search
GET    /api/locations/public-search
```

---

## Authentication and Security

### Authentication

The API uses JWT (JSON Web Tokens) for authenticated endpoints.

Protected routes require an access token provided through the `Authorization` header using the following format:

```http
Authorization: Bearer <your_token>
```

Authenticated user information is extracted from the token and made available through dedicated authentication middlewares.

### Authorization

PlanTogether uses role-based authorization for event management.

Supported event roles are:

- `organizer`
- `co_organizer`
- `participant`

Role-specific permissions are enforced through dedicated authorization middlewares and business rules implemented at the service layer.

### Request Validation

All incoming requests are validated using `express-validator`.

Validation responsibilities include:

- request body validation
- route parameter validation
- query parameter validation
- pagination and sorting validation
- geocoding and location validation

Validation errors are centralized through a dedicated error handling middleware.

### Security Features

The backend includes several security mechanisms:

- JWT authentication
- bcrypt password hashing
- Helmet security headers
- CORS configuration
- Authentication rate limiting
- Geocoding rate limiting
- Protected file uploads
- Safe uploaded file deletion utilities

### Error Handling

Business and HTTP errors are centralized using reusable utilities and a global Express error handler.

This approach ensures consistent API responses and predictable error behavior across the application.

---

## User System

The user system supports both authenticated and public user experiences.

### Authenticated Users

Authenticated users can:

- retrieve their profile
- update their profile information
- upload or update their avatar
- change their password
- delete their account
- retrieve their own event listings

### Current User Events

Authenticated users can retrieve their events using different views:

- created events
- joined events
- created event history
- joined event history

Event listings support:

- filtering
- sorting
- pagination
- event status filtering

### Public User Profiles

Public user endpoints expose limited user information while protecting sensitive data.

Public profiles include:

- display name
- avatar

### Public User Events

Public user event listings support:

- created events
- joined events
- filtering
- sorting
- pagination

When authenticated, public event responses can also include personalized information such as the current user's like state.

### User Data Protection

Sensitive user information is never exposed through public endpoints.

Authenticated and public user responses are intentionally separated to provide different levels of access depending on the request context.

---

## File Uploads

The backend supports file uploads for user avatars and event images using Multer.

### Supported Uploads

- User avatars
- Event images

### Upload Handling

Uploaded files are:

- validated before persistence
- stored inside the configured upload directory
- served as static assets by the API
- associated with their corresponding database records

### File Safety

The backend includes dedicated utilities to safely manage uploaded files.

Security measures include:

- upload directory normalization
- directory traversal protection
- safe file deletion
- missing file handling
- centralized logging for file operation failures

The upload directory can be configured through the `UPLOAD_DIR` environment variable.

---

## Geocoding

The backend provides location search capabilities powered by the Nominatim geocoding service (OpenStreetMap).

### Features

- Public and authenticated location search endpoints
- Location autocomplete support
- Structured address normalization
- Provider response caching
- Configurable geocoding result limits
- Geocoding rate limiting

### Structured Location Data

Location results are normalized before being persisted and can include:

- location label
- street address
- city
- region or province
- postal code
- country
- latitude and longitude

### Caching Strategy

Geocoding results are cached in the database to:

- reduce unnecessary external requests
- improve response times
- preserve normalized location data
- minimize provider rate limit issues

### Provider Fallbacks

Location queries can be progressively simplified when no exact match is found. This improves geocoding reliability when users provide overly specific or partially formatted addresses.

### Event Integration

Structured geocoding data is used throughout the event system to support:

- in-person event locations
- location filtering
- interactive maps
- normalized address persistence

---

## Event System

The event system is the core domain of the application and supports both online and in-person events.

### Event Management

Authenticated users can:

- create events
- update their events
- delete their events
- retrieve event details
- access personalized event information

### Event Types

PlanTogether supports two event modes:

- `online`
- `in_person`

In-person events can include structured geocoding data, while online events do not persist physical location information.

### Event Lifecycle

Events are automatically categorized based on their dates:

- `upcoming`
- `ongoing`
- `past`

Event status is derived from the event's start and end dates and is used throughout the application to enforce business rules.

### Filtering and Sorting

The API provides reusable filtering utilities for event listings.

Supported filters include:

- status
- creator
- mode
- type
- theme
- location
- city
- region
- country
- search queries
- date ranges

Pagination and sorting are also supported across list endpoints.

### Business Rules

The event system enforces several business rules, including:

- registration deadlines
- participant limits
- event ownership restrictions
- time-based event restrictions
- structured location requirements for in-person events

### Event Statistics

Event responses can include aggregated statistics such as:

- participant counts
- likes counts
- average review ratings
- current user like state

These statistics are retrieved through shared utilities designed to avoid unnecessary database queries.

---

## Membership System

The membership system manages event participation, roles, and ownership transfers.

### Event Participation

Authenticated users can:

- join events
- leave events
- view event members
- view event staff members

Membership records are preserved using soft deletes, allowing users to rejoin events without creating duplicate participation records.

### Event Roles

The following roles are supported:

- `organizer`
- `co_organizer`
- `participant`

Role-based permissions are enforced throughout the application to control access to sensitive event operations.

### Ownership Management

Organizers can:

- transfer event ownership to another member
- promote or demote members
- remove members from an event

Ownership transfers are performed using database transactions to guarantee consistency.

### Business Rules

The membership system enforces several business rules, including:

- participant limits
- registration deadlines
- organizer ownership restrictions
- role assignment restrictions
- past event restrictions
- duplicate participation prevention

### Soft Delete Strategy

Memberships are never permanently removed when users leave an event.

Instead, the system uses a `deletedAt` field to:

- preserve membership history
- restore previous memberships when users rejoin
- prevent duplicate participation records

This approach simplifies membership management while maintaining data integrity.

---

## Reviews and Likes

The review and like systems allow users to interact with events beyond simple participation.

### Event Likes

Authenticated users can like and unlike events.

The like system includes:

- duplicate like prevention
- like count aggregation
- current user like state
- idempotent unlike operations

Likes are integrated into event listing endpoints to provide personalized responses when applicable.

### Event Reviews

Participants can leave reviews only after an event has been completed.

The review system includes:

- participant-only reviews
- one review per user and event
- review ownership validation
- review updates and deletion
- paginated review listings
- average rating aggregation

### Review Permissions

The following business rules are enforced:

- only completed events can be reviewed
- only event participants can leave reviews
- users can only manage their own reviews
- duplicate reviews are not allowed

### Review Statistics

Review endpoints provide aggregated information, including:

- average event rating
- total review count
- paginated review listings

These statistics are calculated through shared utilities to ensure consistent behavior across the API.

---

## Testing

The backend is extensively tested using Jest and Supertest.

### Testing Strategy

The test suite is organized into:

- unit tests
- integration tests
- factories
- shared test helpers
- dedicated test setup utilities

The project follows a layered testing approach to validate:

- business logic
- API behavior
- route definitions
- controllers
- services
- middlewares
- validators
- models and associations
- reusable utilities
- database interactions

### Test Coverage

Current test metrics:

| Metric | Value |
|-------|-------|
| Test Suites | 147 passing |
| Tests | 1472 passing |
| Statements | 99.27% |
| Branches | 89.46% |
| Functions | 96.94% |
| Lines | 99.50% |

### Testing Tools

The following tools are used throughout the project:

- Jest
- Supertest

### Continuous Integration

Automated tests are executed through GitHub Actions to ensure code quality and prevent regressions.

The backend test suite is designed to provide high confidence when refactoring or introducing new features.

---

## Available Scripts

The following scripts are available from the backend root directory.

| Script | Description |
|--------|--------|
| `npm run dev` | Starts the development server with Nodemon |
| `npm start` | Starts the production server |
| `npm test` | Runs the complete test suite |
| `npm run test:coverage` | Generates the test coverage report |

---

## Project Status

Current highlights include:

- Layered and service-oriented architecture
- Comprehensive automated test coverage
- JWT authentication and role-based authorization
- Event, membership, review, and like systems
- Geocoding with caching and structured location data
- File upload management
- Extensive filtering, sorting, and pagination support
- Automated CI workflows

The project continues to evolve through documentation improvements, architectural refinements, and future feature additions.

---

## Roadmap

Planned improvements include:

- Additional technical documentation
- API documentation improvements
- Performance and developer experience enhancements
- Future backend feature additions

The roadmap intentionally remains flexible as the project continues to evolve.

---
