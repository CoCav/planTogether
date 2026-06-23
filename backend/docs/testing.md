# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Jest-testing-red)
![Supertest](https://img.shields.io/badge/Supertest-integration%20testing-6E9F18)
![Suites](https://img.shields.io/badge/Test%20Suites-98%20passing-brightgreen)
![Tests](https://img.shields.io/badge/Tests-815%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-99.29%25%20statements%20%7C%2094.02%25%20branches-brightgreen)

This document describes the testing strategy used in the PlanTogether backend.

The project uses **Jest** and **Supertest** to validate both isolated backend modules and complete API workflows.

The test suite focuses on:

- backend reliability and maintainability
- API consistency and business-rule validation
- authentication, authorization, reviews, and rate-limiting workflows
- uploads, geolocation services, pagination, and transaction-safe operations
- soft-delete lifecycle handling and ownership protection
- reusable helpers, factories, and testing utilities
- deterministic and scalable automated testing

---

## 🎯 Overview

Core testing coverage includes:

- API behavior, response consistency, and error handling
- authentication, authorization, and access-control workflows
- event reviews, ratings, pagination, and review statistics
- current user event access resolution and frontend guard support
- service-layer business rules and permission enforcement
- upload handling, image lifecycle behavior, and filesystem safety
- filtering, pagination, query utilities, and aggregation helpers
- backend geocoding, location caching, and fallback search workflows
- database consistency and transaction behavior
- soft-delete lifecycle handling and ownership protection
- participant counts, review statistics, and event-state restrictions
- public and authenticated rate-limited API behavior

The current backend test suite includes:

- **98** passing test suites
- **815** passing tests
- **99.29%** statement coverage
- **94.02%** branch coverage
- **100%** function coverage
- **99.35%** line coverage

The combination of integration and unit testing helps ensure secure, stable, and predictable backend behavior across the application.

---

## 🛠️ Testing Stack

The backend test suite relies on the following tools and libraries.

### Core Testing

- **Jest** — test runner, assertions, and mocking framework
- **Supertest** — HTTP integration testing for Express APIs

### Database & Environment

- **PostgreSQL** — isolated test database
- **Sequelize** — ORM associations, query behavior, and transaction validation

### Continuous Integration

- **GitHub Actions** — automated test execution with isolated PostgreSQL services and CI validation on pushes and pull requests

### Testing Utilities

- reusable factories for consistent test data generation
- shared helpers for authentication, validation, API workflows, and database setup
- query, formatting, pagination, and validation utilities
- Express request/response mocks for middleware and controller testing
- shared date utilities for deterministic testing

The testing stack supports reliable integration testing, isolated unit testing, transaction validation, and long-term backend maintainability.

---

## 📁 Test Folder Structure

The backend test suite is organized into reusable helpers, factories, integration workflows, and isolated unit tests.

```txt
tests
├── helpers/
│   ├── api/
│   ├── database/
│   ├── express/
│   ├── mocks/
│   └── validation/
│
├── factories/
│
├── integration/
│   ├── app/
│   ├── auth/
│   ├── events/
│   ├── eventMemberships/
│   ├── eventReviews/
│   ├── users/
│   └── locations/
│
└── unit/
    ├── config/
    ├── constants/
    ├── controllers/
    ├── middlewares/
    ├── security/
    ├── services/
    ├── utils/
    └── validators/
```

The testing structure mirrors the backend architecture and separates reusable utilities, isolated modules, and full API workflows into dedicated layers.

This organization improves readability, maintainability, and scalability as the backend evolves.

---

## 🔗 Integration Tests

Integration tests validate the complete backend request lifecycle:

```txt
Express → Middleware → Controller → Service → Sequelize → PostgreSQL
```

These tests use the real Express application, PostgreSQL test database, and Sequelize models.

Covered areas include:

- authentication, authorization, and rate limiting
- user profiles, statistics, and event listings
- event CRUD operations, memberships, and role management
- event reviews, ratings, pagination, and review statistics
- filtering, sorting, pagination, and query behavior
- upload handling and image lifecycle workflows
- geocoding, location caching, and fallback search flows
- soft-delete lifecycles and ownership protections
- event access permissions and business-rule enforcement
- validation, application routes, and global error handling

Integration tests intentionally minimize mocking to validate:

- real application behavior
- database interactions and transaction consistency
- middleware and authorization workflows
- end-to-end business rules and lifecycle protections
- consistent API responses

This approach provides strong confidence during backend evolution and helps prevent regressions in production workflows.

---

## 🧩 Unit Tests

Unit tests validate isolated backend modules independently from HTTP requests and full database workflows.

Covered modules include:

- controllers, services, middlewares, and validators
- review services, aggregation helpers, and query utilities
- pagination, filtering, formatting, and normalization helpers
- configuration modules (`database`, `logger`, `cors`)
- security helpers, upload policies, and rate limiter factories
- event permissions, status helpers, and business-rule utilities
- geocoding services and location utilities
- shared constants and reusable backend helpers

Unit tests verify:

- business rules, permissions, and ownership restrictions
- review workflows, rating calculations, and aggregations
- validation chains, middleware behavior, and error propagation
- upload handling and filesystem utilities
- transaction-related logic
- soft-delete lifecycle handling
- query, formatter, and utility output
- configuration, security, and rate-limiting behavior

Dependencies are mocked when necessary to keep tests fast, focused, and deterministic.

This layer provides rapid feedback during development while ensuring reliable business logic and reusable backend components.

---

## 🔧 Helpers

Reusable helpers reduce duplication and simplify common testing workflows.

Examples include:

- authenticated API request helpers
- event access and permission utilities
- database setup, reset, and cleanup helpers
- pagination, filtering, and query-testing utilities
- Express request/response mocks
- shared date utilities for deterministic testing
- validation helpers for `express-validator` chains

Helpers keep tests focused on business behavior rather than repetitive setup code while improving consistency and maintainability across the test suite.

---

## 🏗️ Factories

Factories generate consistent and customizable test data for integration and unit tests.

Examples include:

- user factories
- event factories
- membership factories
- mock Sequelize model instances
- reusable payload builders

Factories support:

- service and integration testing
- middleware and validation scenarios
- transaction and rollback workflows
- soft-delete and ownership-transfer scenarios
- filtering, query, and pagination workflows
- complex business-rule validation

This approach reduces duplicated setup while improving test readability, flexibility, and long-term maintainability.

---

## 🧪 Database Isolation

Integration tests use a dedicated PostgreSQL database isolated from development and production environments.

The test database is synchronized, reset, and cleaned between test runs to ensure:

- deterministic and isolated execution
- no dependency on test order
- safe database mutations during API testing
- reliable transaction and integration behavior

The testing environment relies on:

- `NODE_ENV=test`
- a dedicated `DB_NAME_TEST`
- isolated `.env.test` configuration
- Sequelize synchronization utilities
- automated database cleanup helpers
- dedicated PostgreSQL services in GitHub Actions

This approach ensures reliable automated testing, transaction validation, query consistency, and complete separation from development data.

---

## 🔁 Mocking Strategy

The project uses different mocking strategies depending on the testing layer and required level of isolation.

### 🔗 Integration Tests

Integration tests use minimal mocking and rely on the real application stack.

```txt
Express → Middlewares → Controllers → Services → Sequelize → PostgreSQL
```

This approach validates:

- real API and middleware behavior
- authorization and validation workflows
- database interactions and transactions
- filtering, pagination, and query behavior
- business rules, permissions, and lifecycle protections

### 🧩 Unit Tests

Unit tests mock dependencies when necessary to isolate the module under test.

Commonly mocked dependencies include:

- Sequelize models and transactions
- service dependencies
- upload and filesystem utilities
- event permissions and status helpers
- query builders and filtering utilities
- configuration, logging, and date utilities
- reusable HTTP error helpers

This approach keeps unit tests fast, focused, deterministic, and easy to maintain.

---

## 🧱 Transaction Testing

Critical service operations are tested using Sequelize transaction mocks.

Tests verify that:

- transactions start when expected
- successful operations trigger `commit`
- failed operations trigger `rollback`
- errors propagate correctly
- database and filesystem operations remain consistent

Covered scenarios include:

- event creation, updates, and deletion
- image upload, replacement, preservation, and removal
- event joining workflows
- organizer ownership transfers
- profile updates with avatar replacement
- account deletion and anonymization

Transaction testing is particularly important for workflows that combine database mutations and file operations.

This layer helps ensure transaction safety, rollback protection, and reliable write operations across critical backend workflows.

---

## 📤 Upload Testing

Upload behavior is covered through both middleware and integration tests.

Covered scenarios include:

- avatar and event image uploads
- file size, MIME type, and extension validation
- invalid upload rejection
- image replacement, removal, and preservation workflows
- file cleanup after successful updates
- rollback protection during failed operations
- upload path normalization and protected file handling

These tests help ensure secure upload handling, safe filesystem operations, and consistent behavior during backend mutations.

---

## 🧾 Validator Testing

Validators are tested independently using reusable validation helpers and `express-validator` chains.

Covered validation areas include:

- authentication payloads and password policies
- event creation and update payloads
- event reviews, ratings, and review update rules
- membership parameters, role validation, and ownership transfers
- account deletion and profile update workflows
- upload validation rules
- filtering, sorting, pagination, and query parameters

Validator testing helps ensure:

- consistent validation behavior and error formatting
- protection against invalid or malformed input
- reusable security-policy enforcement
- safe request handling before controller and service execution

---

## ▶️ Running Tests

Run the full test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode during development:

```bash
npm test --watch
```

Run all tests inside a specific folder:

```bash
npm test -- tests/integration/events
```

Run a specific test file:

```bash
npm test -- tests/unit/validators/authValidator.test.js
```

These commands make it easy to target specific areas of the backend during development, debugging, and validation.

---

## 🎯 Testing Design Goals

The testing architecture aims to provide:

- reliable and consistent API behavior
- strong business-rule, authorization, and permission coverage
- clear and scalable test organization
- reusable helpers and factories
- deterministic database isolation
- maintainable and readable test suites
- filtering, pagination, and query validation
- transaction and rollback coverage
- reliable event-state and lifecycle enforcement
- confidence during refactors and feature development

These goals support long-term maintainability, predictable production behavior, and safe backend evolution.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- end-to-end testing workflows
- further test deduplication and simplification
- additional decoupling of Sequelize-dependent unit tests
- expanded edge-case coverage for reviews, memberships, and authorization rules
- deeper transaction rollback and failure-state validation
- performance-oriented testing for complex filtering, pagination, and query behavior

---
