# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Jest-testing-red)
![Supertest](https://img.shields.io/badge/Supertest-integration%20testing-6E9F18)
![Suites](https://img.shields.io/badge/Test%20Suites-88%20passing-brightgreen)
![Tests](https://img.shields.io/badge/Tests-715%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-99.23%25%20statements%20%7C%2094.13%25%20branches-brightgreen)

This document describes the overall testing strategy used in the PlanTogether backend.

The project uses **Jest** and **Supertest** to validate both isolated backend modules and complete API workflows across the application.

The test suite focuses on:

- backend reliability, maintainability, and long-term stability
- API consistency and business-rule validation
- authentication, authorization, and rate-limiting workflows
- upload handling, geolocation services, and transaction-safe operations
- soft-delete lifecycle handling and ownership protection
- reusable helpers, factories, and testing utilities
- isolated, deterministic, and scalable automated testing workflows

---

## 🎯 Overview

Core testing coverage includes:

- API behavior, response consistency, and error handling
- authentication, authorization, and access-control workflows
- current user event access resolution and frontend guard support
- service-layer business rules and permission enforcement
- upload handling, image lifecycle behavior, and filesystem safety
- filtering, pagination, query utilities, and optimized query behavior
- backend geocoding, location caching, and fallback search workflows
- database consistency and rollback behavior
- soft-delete lifecycle handling and ownership protection workflows
- participant count, event status, and event-state restriction behavior
- started-event protections and restricted action enforcement
- public and authenticated rate-limited API behavior

The current backend test suite includes:

- **88** passing test suites
- **715** passing tests
- **99.23%** statement coverage
- **94.13%** branch coverage
- **100%** function coverage
- **99.29%** line coverage

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
- shared helpers for authentication, validation, API flows, and database setup
- query, formatting, and validation utilities
- Express request/response mocks for middleware and controller testing
- shared utilities for dates and deterministic testing

The testing stack supports reliable integration testing, isolated unit testing, transaction validation, and scalable long-term backend maintainability.

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

This organization improves readability, maintainability, and long-term scalability as the backend evolves.

---

## 🔗 Integration Tests

Integration tests validate the complete backend request lifecycle:

```txt
Request → Middleware → Controller → Service → Database → Response
```

These tests use the real Express application together with a dedicated PostgreSQL test database and real Sequelize models.

Covered areas include:

- authentication flows and rate limiting
- authenticated and public user routes
- profile updates, password changes, and secure account deletion
- public user profiles, statistics, and event listings
- event CRUD operations and protected event flows
- filtering, sorting, pagination, and query behavior
- membership management and ownership transfer
- role-based authorization and protected action enforcement
- soft-delete restoration and inactive membership protection
- current user event access and permission resolution
- upload handling, upload security, and image lifecycle behavior
- backend geocoding, location caching, and fallback search flows
- public and authenticated location endpoints
- ongoing event filtering and started-event restrictions
- validation errors, application routes, and global error handling

Integration tests intentionally avoid heavy mocking in order to validate:

- real application behavior
- database interactions, transactions, and query consistency
- middleware chaining and authorization flows
- end-to-end business rules and lifecycle protections
- consistent API responses and permission-aware behavior

This approach provides stronger confidence during backend evolution and helps ensure stable behavior under realistic application conditions.

---

## 🧩 Unit Tests

Unit tests validate isolated backend modules independently from HTTP requests and full database workflows.

Covered modules include:

- controllers, services, middlewares, and validators
- reusable utilities, formatters, and query helpers
- configuration modules (`database`, `logger`, `cors`)
- shared constants and business values (`EVENT_ROLES`, `EVENT_STATUS`, `EVENT_MODES`)
- event status, permissions, and started-event helpers
- security helpers, upload policies, and rate limiter factories
- pagination, filtering, formatting, and query-builder utilities
- geocoding services, fallback search utilities, and location formatters

Unit tests verify:

- service-layer business rules and permission enforcement
- event access resolution and restricted action handling
- upload handling, image lifecycle behavior, and filesystem utilities
- transaction and rollback-related logic
- soft-delete lifecycle handling and ownership restrictions
- validation chains, middleware responses, and error propagation
- reusable utility, formatter, and query-builder output
- configuration, security, and rate-limiting behavior
- public user statistics and event enrichment logic

Dependencies are mocked when necessary to isolate the module under test and keep unit tests fast, focused, and deterministic.

This testing layer provides rapid feedback during development while helping maintain reliable business logic, reusable utilities, and consistent internal backend behavior.

---

## 🔧 Helpers

Reusable helpers reduce duplication across the test suite and simplify common testing workflows.

Examples include:

- authenticated API request helpers
- event access and permission request utilities
- database setup, reset, and cleanup helpers
- pagination, filtering, and query-testing utilities
- Express request/response mocks for middleware and controller testing
- shared date mocks for deterministic test behavior
- validation helpers for `express-validator` chains

Helpers keep tests focused on assertions and business behavior instead of repetitive setup logic.

They also improve consistency, readability, and long-term maintainability across the testing architecture.

---

## 🏗️ Factories

Factories generate consistent and customizable test data for integration and unit tests.

Examples include:

- user factories
- event factories
- membership factories
- Sequelize-like mock model instances
- reusable payload builders

Factories are commonly used for:

- service-layer and integration testing
- middleware and validation scenarios
- transaction and rollback-related workflows
- soft-delete lifecycle and ownership-transfer scenarios
- filtering, query, and pagination workflows
- complex business-rule validation

This approach reduces duplicated test setup while improving test clarity, flexibility, and long-term maintainability.

---

## 🧪 Database Isolation

Integration tests use a dedicated PostgreSQL database isolated from development and production environments.

The test database is synchronized, cleaned, and reset between test runs to ensure:

- deterministic and isolated test execution
- no dependency on execution order
- safe database mutation during API testing
- reliable transaction and integration behavior

The testing environment relies on:

- `NODE_ENV=test`
- a dedicated `DB_NAME_TEST`
- isolated `.env.test` configuration
- Sequelize synchronization utilities
- automated database cleanup helpers
- dedicated PostgreSQL services in GitHub Actions CI

This approach helps maintain reliable automated testing, transaction validation, query consistency, and safe separation from development data.

---

## 🔁 Mocking Strategy

The project uses different mocking strategies depending on the testing layer and required level of isolation.

### 🔗 Integration Tests

Integration tests use minimal mocking and rely on the real application stack.

They validate real behavior across:

```txt
Express → Middlewares → Controllers → Services → Sequelize → PostgreSQL
```

This approach helps verify:

- real API and middleware flows
- authorization and validation workflows
- database interactions and transaction handling
- filtering, pagination, and query behavior
- soft-delete lifecycle protections
- end-to-end business rules and permission enforcement

### 🧩 Unit Tests

Unit tests mock dependencies when necessary to isolate the module under test.

Examples include:

- Sequelize models and transactions
- upload cleanup and image lifecycle utilities
- event status, permission, and started-event helpers
- query builders and filtering utilities
- soft-delete and ownership-transfer helpers
- configuration, logger, and shared date utilities
- reusable HTTP error helpers
- service dependencies

This approach keeps unit tests fast, focused, deterministic, and maintainable as the backend evolves.

---

## 🧱 Transaction Testing

Critical service operations are tested using Sequelize transaction mocks.

The tests verify that:

- transactions start when expected
- successful operations trigger `commit`
- failed operations trigger `rollback`
- uploaded files are deleted only after successful commits
- transaction failures properly propagate application errors
- soft-delete operations preserve historical consistency
- partial failures do not leave inconsistent database state

Covered transaction scenarios include:

- event creation
- event updates, including image preservation, replacement, and removal
- event deletion and started-event restrictions
- event joining workflows
- organizer ownership transfer
- secure account deletion and anonymization
- profile updates with avatar replacement

Transaction testing is especially important for workflows involving both database mutations and filesystem operations.

This layer helps validate transaction safety, upload rollback protection, and reliable write operations across critical backend workflows.

---

## 📤 Upload Testing

Upload behavior is tested through both middleware-level and full integration coverage.

Covered upload scenarios include:

- avatar and event image uploads
- file size, MIME type, and extension validation
- invalid upload rejection
- explicit event image removal
- event image preservation when updates omit image changes
- old file cleanup after replacement or removal
- upload rollback protection during failed operations
- upload path normalization and protected file handling

These tests help ensure secure and reliable upload handling across the backend.

Upload testing is especially important because file handling combines:

- HTTP requests
- filesystem operations
- validation logic
- database updates
- transaction-aware workflows

This testing layer validates secure upload flows, rollback protection, and safe filesystem operations during backend mutations.

---

## 🧾 Validator Testing

Validators are tested independently using reusable validation helpers and `express-validator` chains.

Covered validation areas include:

- authentication payloads and password policy enforcement
- event creation and update payloads, including event mode and registration deadline validation
- membership parameters, role validation, and ownership transfer rules
- account deletion protection workflows
- user profile updates
- upload validation rules
- query, filtering, pagination, and sorting parameters

This helps keep validation behavior explicit, centralized, and consistent across the backend.

Validator testing also helps ensure:

- predictable API responses
- consistent validation error formatting
- stronger protection against invalid or malformed input
- reusable security-policy enforcement
- safer request handling before controller and service execution

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

These commands help target specific backend layers during development, debugging, feature work, and test validation.

---

## 🎯 Testing Design Goals

The testing architecture aims to provide:

- reliable and consistent API behavior
- strong business-rule and authorization coverage
- current user event access and permission validation
- clear and scalable test organization
- reusable helpers and factories
- deterministic database isolation and test execution
- maintainable and readable test suites
- filtering, pagination, and query validation
- transaction and rollback-related coverage
- reliable event-state restriction enforcement
- confidence during large-scale refactors and feature development

These goals help support long-term maintainability, safer backend evolution, predictable production behavior, and scalable development workflows.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing workflows
- further test deduplication and simplification
- additional decoupling of Sequelize-related unit tests
- expanded edge-case coverage for memberships and authorization rules
- deeper transaction rollback and failure-state integration coverage
- performance-oriented testing for complex filtering and query behavior

---
