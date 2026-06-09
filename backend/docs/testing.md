# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Test Suites](https://img.shields.io/badge/test%20suites-79%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-650%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-99.14%25%20statements%20%7C%2094.65%25%20branches-brightgreen)

This document describes the testing architecture and overall testing strategy used in the PlanTogether backend.

The project uses **Jest** and **Supertest** to validate both isolated backend modules and complete API workflows across the application.

The testing architecture focuses on:

- backend reliability, maintainability, and long-term stability
- API consistency and business-rule validation
- security, authorization, upload, and transaction-safe workflow testing
- soft-delete lifecycle handling and ownership protection
- reusable helpers, factories, and testing utilities
- isolated, deterministic, and scalable automated testing workflows

---

## 🎯 Overview

The testing architecture is designed to validate:

- API behavior, response consistency, and error handling
- authentication, authorization, and access-control workflows
- current user event access resolution and frontend guard support
- service-layer business rules and permission enforcement
- upload handling, upload security, and image lifecycle behavior
- filtering, pagination, query utilities, and optimized query behavior
- database interactions, transaction safety, and rollback behavior
- soft-delete lifecycle handling and ownership protection workflows
- participant count, event status, and event-state restriction behavior
- started-event protections and restricted action enforcement

The current backend test suite includes:

- **650 passing tests**
- **99.14% statement coverage**
- **94.65% branch coverage**
- **100% function coverage**
- **99.21% line coverage**

The combination of integration and unit testing helps ensure backend reliability, maintainability, security, transaction safety, query consistency, and predictable long-term backend behavior across the application.

---

## 🛠️ Testing Stack

The backend testing architecture relies on the following tools and libraries.

### Core Testing

- **Jest** — test runner, assertions, and mocking framework
- **Supertest** — HTTP integration testing for Express APIs

### Database & Environment

- **PostgreSQL** — isolated backend test database
- **Sequelize** — ORM behavior, associations, and transaction workflow validation

### Continuous Integration

- **GitHub Actions** — automated backend test execution using isolated PostgreSQL services and CI validation on pushes and pull requests

### Testing Utilities

- reusable factories for consistent test data generation
- shared helpers for authentication, validation, API flows, and database setup
- query, formatting, and validation testing utilities
- Express request/response mocks for middleware and controller testing
- shared mock utilities for dates and deterministic test behavior

The testing stack is designed to support reliable integration testing, isolated unit testing, transaction-safe workflow validation, maintainable backend evolution, and scalable long-term testing workflows.

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
│   └── users/
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

The testing structure mirrors the backend architecture and separates reusable utilities from isolated testing layers and integration workflows.

This organization improves readability, maintainability, scalability, and long-term testing consistency as the backend evolves.

---

## 🔗 Integration Tests

Integration tests validate the complete backend request lifecycle:

```txt
Request → Middleware → Controller → Service → Database → Response
```

These tests use the real Express application together with a dedicated PostgreSQL test database and real Sequelize models.

Covered areas include:

- authentication and authentication rate-limiting workflows
- authenticated and public user routes
- profile updates, password changes, and secure account deletion
- public user profiles, statistics, and event listings
- event CRUD operations and protected event workflows
- filtering, sorting, pagination, and query behavior
- membership management and ownership transfer workflows
- role-based authorization and protected action enforcement
- soft-delete lifecycle restoration and inactive membership protection
- current user event access and permission resolution
- upload handling, upload security, and image lifecycle behavior
- ongoing event status filtering and started-event restrictions
- validation errors, application routes, and global error handling

Integration tests intentionally avoid heavy mocking in order to validate:

- real application behavior
- database interactions, transactions, and optimized query behavior
- middleware chaining and authorization flows
- end-to-end business rules and lifecycle protections
- consistent API responses and permission-aware behavior

This approach provides stronger confidence during backend evolution and helps ensure stable backend behavior under realistic application conditions.

---

## 🧩 Unit Tests

Unit tests validate isolated backend modules independently from HTTP requests and full database workflows.

Covered modules include:

- controllers, services, middlewares, and validators
- reusable utilities, formatters, and query helpers
- configuration modules (`database`, `logger`, `cors`)
- shared constants and business values (`EVENT_ROLES`, `EVENT_STATUS`, `EVENT_MODES`)
- event status, started-event, and permission helpers
- security-related helpers and policies
- pagination, filtering, and query-builder utilities

Unit tests are used to verify:

- service-layer business rules and permission enforcement
- event access resolution and restricted action handling
- event image lifecycle behavior and upload-related utilities
- transaction-safe behavior and rollback-related flows
- soft-delete lifecycle handling and ownership restrictions
- validation chains, middleware responses, and error propagation
- reusable utility, formatter, and query-builder output
- configuration and security behavior
- public user statistics and event enrichment logic

Dependencies are mocked when necessary to isolate the module under test and keep unit tests fast, focused, and deterministic.

This testing layer provides rapid feedback during development while helping maintain reusable business-rule validation, query consistency, and predictable internal backend behavior.

---

## 🔧 Helpers

Reusable helpers reduce duplication across the test suite and simplify common testing workflows.

Examples include:

- API helpers for authenticated request flows
- event access and permission request helpers
- database setup, reset, and cleanup helpers
- pagination, filtering, and query-testing utilities
- Express request/response mocks for middleware and controller testing
- shared date mocks for deterministic test behavior
- validation helpers for `express-validator` chains

Helpers keep tests focused on assertions and business behavior instead of repetitive setup logic.

They also improve readability, maintainability, consistency, and scalability across the testing architecture.

---

## 🏗️ Factories

Factories generate reusable and customizable test data.

They help keep tests consistent, flexible, and maintainable by supporting scenario-specific overrides.

Examples include:

- user factories
- event factories
- membership factories
- Sequelize-like mock model instances
- reusable payload builders

Factories are especially useful for:

- service-layer and integration testing
- middleware and validation scenarios
- transaction-safe workflow testing
- soft-delete lifecycle and ownership-transfer scenarios
- filtering, query, and pagination scenarios
- complex business-rule validation

This approach reduces duplicated test data and improves long-term test maintainability, readability, and scalability.

---

## 🧪 Database Isolation

Integration tests use a dedicated PostgreSQL test database isolated from development and production environments.

The test database is synchronized, cleaned, and reset between test runs to ensure:

- isolated and deterministic test execution
- no dependency on test execution order
- safe database mutation during API testing
- reliable integration behavior across the backend and transaction stack

The testing environment uses:

- `NODE_ENV=test`
- a dedicated `DB_NAME_TEST`
- isolated `.env.test` configuration
- Sequelize synchronization utilities
- automated database cleanup helpers
- isolated PostgreSQL services in GitHub Actions CI

This approach helps maintain predictable automated testing, transaction-safe validation, query consistency, and protection against accidental interaction with development data.

---

## 🔁 Mocking Strategy

The project uses different mocking strategies depending on the testing layer and the level of isolation required.

### 🔗 Integration Tests

Integration tests use minimal mocking and rely on the real application stack.

They validate real behavior across:

```txt
Express → Middlewares → Controllers → Services → Sequelize → PostgreSQL
```

This approach helps verify:

- real API and middleware behavior
- authorization and validation workflows
- database interactions and transaction behavior
- filtering, query optimization, and pagination behavior
- soft-delete lifecycle protections
- end-to-end business rules and permission enforcement

### 🧩 Unit Tests

Unit tests mock dependencies when necessary to isolate the module under test.

Examples include:

- Sequelize models and database transactions
- upload cleanup and event image lifecycle utilities
- event status, started-event, and permission helpers
- query builders and query optimization utilities
- soft-delete lifecycle and ownership-transfer utilities
- configuration, logger, and shared date utilities
- reusable HTTP error helpers
- service dependencies

This approach keeps unit tests fast, focused, deterministic, and maintainable during long-term backend development and testing.

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
- partial operations do not leave inconsistent backend state
- failed operations preserve database consistency and rollback behavior

This helps ensure database consistency and prevents partial or unsafe operations during critical backend workflows.

Covered transaction scenarios include:

- event creation
- event updates, including image preservation, replacement, and removal
- event deletion and started-event restrictions
- event joining workflows
- organizer ownership transfer
- secure account deletion and anonymization
- profile updates with avatar replacement

Transaction testing is especially important for workflows involving both database mutations and filesystem operations.

This testing layer helps validate transaction-safe backend behavior, upload rollback protection, and reliable write operations during backend development and long-term maintenance.

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

These tests help ensure secure and reliable upload behavior across the backend.

Upload testing is especially important because file handling combines:

- HTTP requests
- filesystem operations
- validation logic
- database updates
- transaction-safe workflows

This testing layer helps validate secure upload handling, rollback protection, and reliable filesystem operations during backend mutations.

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

This helps keep validation behavior explicit, centralized, consistent, and maintainable across the backend.

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

These commands help target specific backend layers during development, debugging, feature implementation, and testing workflows.

---

## 🎯 Testing Design Goals

The testing architecture aims to provide:

- reliable and consistent API behavior
- strong business-rule and authorization coverage
- current user event access and permission validation
- clear and scalable testing organization
- reusable setup helpers and factories
- predictable database isolation and deterministic test execution
- maintainable and readable test suites
- filtering, pagination, and query consistency validation
- transaction-safe workflow and rollback validation
- reliable event-state restriction enforcement
- confidence during large-scale backend refactors and feature development

These design goals help support long-term backend maintainability, safer backend evolution, predictable production behavior, and scalable backend development workflows.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing workflows
- further test deduplication and simplification
- further decoupling of selected Sequelize unit tests
- expanded edge-case coverage for membership and authorization rules
- deeper transaction rollback and failure-state integration coverage
- performance-oriented testing for complex filtering and query behavior

---
