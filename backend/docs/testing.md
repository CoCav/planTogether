# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Test Suites](https://img.shields.io/badge/test%20suites-78%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-595%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-99.11%25%20statements%20%7C%2093.93%25%20branches-brightgreen)

This document describes the testing architecture and overall testing strategy used in the PlanTogether backend.

The project uses **Jest** and **Supertest** to validate both isolated internal modules and complete API workflows across the application.

The testing architecture focuses on:

- backend reliability and long-term maintainability
- API consistency and business-rule validation
- security, authorization, and upload testing
- soft-delete lifecycle and ownership protection testing
- reusable test helpers, factories, and utilities
- isolated and reliable automated test flows

---

## 🎯 Overview

The testing architecture is designed to validate:

- API behavior and response consistency
- business rules and authorization flows
- authentication and access control
- current user event access validation and frontend guard support
- validation logic and error handling
- upload handling and security protections
- service-layer business logic
- database interactions and transaction behavior
- filtering, pagination, and query behavior
- soft-delete lifecycle handling
- ownership transfer and membership protection flows
- optimized query and participant count behavior

The current backend test suite includes:

- **78 passing test suites**
- **595 passing tests**
- **99.11% statement coverage**
- **93.93% branch coverage**
- **100% function coverage**
- **99.18% line coverage**

The combination of integration and unit testing helps ensure backend reliability, maintainability, security, query consistency, transaction safety, and safer long-term backend stability across the application.

---

## 🛠️ Testing Stack

The backend testing architecture relies on the following tools and libraries:

### Core Testing

- **Jest** — test runner, mocking system, and assertion framework
- **Supertest** — HTTP integration testing for Express APIs

### Database & Environment

- **PostgreSQL** — dedicated isolated test database
- **Sequelize** — ORM testing, association validation, and transaction behavior validation

### Continuous Integration

- **GitHub Actions** — automated backend test execution using isolated PostgreSQL test services and CI validation on push and pull requests

### Testing Utilities

- Factories for consistent test data generation
- Helpers for API flows, validation, authentication, and database setup
- Shared query, formatting, and validation test utilities
- Express request/response mocks for isolated middleware and controller testing
- Shared mock utilities for dates and isolated behaviors

The testing stack is designed to support reliable integration testing, isolated unit testing, safer backend evolution, transaction safety validation, and maintainable backend development.

---

## 📁 Test Folder Structure

The test suite is organized into reusable helpers, factories, integration tests, and isolated unit tests.

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

The testing structure mirrors the backend architecture and separates reusable test utilities from isolated test flows.

This organization improves readability, maintainability, scalability, and test consistency as the backend evolves.

---

## 🔗 Integration Tests

Integration tests validate the complete backend request lifecycle:

```txt
Request → Middleware → Controller → Service → Database → Response
```

These tests use the real Express application together with a dedicated PostgreSQL test database and real Sequelize models.

Covered areas include:

- authentication flows
- authentication rate limiting
- user profile, password, and account deletion flows
- public and authenticated user routes
- event CRUD operations
- current user event access endpoint
- event filtering, sorting, pagination, and query behavior
- event membership workflows
- organizer ownership transfer flows
- soft-delete membership restoration flows
- inactive membership protection rules
- role-based authorization
- upload workflows and upload security protections
- validation errors
- health check and application routes
- global error handling

Integration tests intentionally avoid heavy mocking in order to validate:

- real application behavior
- database interactions, transactions, filtering, pagination, and optimized query behavior
- middleware chaining
- authorization flows
- end-to-end business rules and membership lifecycle protections
- consistent API responses

This approach provides stronger confidence during backend evolution and helps ensure stable backend behavior under realistic application conditions.

---

## 🧩 Unit Tests

Unit tests validate isolated internal modules independently from HTTP requests and full database flows.

Covered modules include:

- controllers
- services
- middlewares
- validators
- utilities
- formatters
- configuration modules (`database`, `logger`, `cors`)
- shared constants and business values (`EVENT_ROLES`, `EVENT_STATUS`, `EVENT_MODES`)
- security-related helpers and policies
- query builders and query utility helpers

Unit tests are used to verify:

- service business rules
- event access resolution logic
- transaction-related behavior
- soft-delete lifecycle handling
- ownership transfer restrictions
- validation chains
- middleware responses
- utility and query-builder output
- configuration and security behavior
- error propagation
- reusable helper and formatter behavior

Dependencies are mocked when necessary to isolate the module under test and keep unit tests fast, focused, and deterministic.

This testing layer provides rapid feedback during development while helping maintain query optimization consistency, reusable business-rule validation, and predictable internal module behavior.

---

## 🔧 Helpers

Reusable helpers reduce duplication across the test suite and simplify common testing workflows.

Examples include:

- API helpers for authenticated request flows
- event access request helpers
- database helpers for initialization, reset, and cleanup
- shared pagination, filtering, query-builder, and query testing helpers
- Express request/response mocks for controller and middleware testing
- shared date mocks for stable and reliable test behavior
- validation helpers for `express-validator` chains

Helpers keep tests focused on assertions and business behavior instead of repetitive setup logic.

They also improve readability, maintainability, consistency, and scalability across the testing architecture.

---

## 🏗️ Factories

Factories generate reusable and customizable test data.

They help keep tests consistent, flexible, and easier to maintain by supporting overrides for specific scenarios.

Examples include:

- user factories
- event factories
- membership factories
- mock Sequelize-like model instances
- reusable payload builders

Factories are especially useful for:

- service-layer tests
- integration flows
- middleware testing
- transaction-related scenarios
- soft-delete lifecycle scenarios
- ownership transfer and membership role scenarios
- filtering and query-related scenarios
- complex business-rule validation

This approach reduces duplicated test data and improves test maintainability, readability, and scalability.

---

## 🧪 Database Isolation

Integration tests use a dedicated PostgreSQL test database isolated from development and production environments.

The test database is synchronized, cleaned, and reset between test runs to ensure:

- isolated test cases
- repeatable and deterministic results
- no dependency on test execution order
- safe database mutation during API testing
- reliable integration behavior across the full backend and transaction stack

The testing environment uses:

- `NODE_ENV=test`
- a dedicated `DB_NAME_TEST`
- isolated `.env.test` configuration
- Sequelize test synchronization utilities
- automated database cleanup helpers
- isolated PostgreSQL test services in GitHub Actions CI

This approach helps maintain stable automated testing, transaction safety validation, predictable query behavior, and prevents accidental interaction with development data.

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

- real API behavior
- middleware chaining
- authorization flows
- database interactions and transactions
- optimized query behavior
- validation behavior
- soft-delete lifecycle protections
- end-to-end business rules

### 🧩 Unit Tests

Unit tests mock dependencies when necessary to isolate the module under test.

Examples include:

- Sequelize models
- database transactions
- uploaded file cleanup
- event status helpers
- query builders and optimization utilities
- soft-delete lifecycle utilities
- ownership transfer business rules
- configuration and logger behavior
- reusable HTTP error utilities
- service dependencies
- shared date utilities

This approach keeps unit tests fast, focused, deterministic, and easier to maintain during backend development, testing, and maintenance workflows.

---

## 🧱 Transaction Testing

Critical service operations are tested using Sequelize transaction mocks.

The tests verify that:

- transactions are started when expected
- successful operations trigger `commit`
- failed operations trigger `rollback`
- uploaded files are deleted only after successful commits
- transaction failures properly propagate application errors
- soft-delete operations preserve historical consistency
- partial operations do not leave inconsistent backend state
- failed operations correctly preserve transaction-safe behavior

This helps ensure database consistency and prevents partial or unsafe operations during critical backend workflows.

Covered transaction scenarios include:

- event creation
- event update
- event deletion
- event joining
- organizer ownership transfer
- secure account deletion and anonymization
- profile update with avatar replacement

Transaction testing is especially important for operations involving both database mutations and filesystem changes.

This testing layer helps validate safe backend behavior, upload rollback protection, and transaction-safe write operations during backend development and maintenance.

---

## 📤 Upload Testing

Upload behavior is tested through both middleware-level and full integration coverage.

Covered upload behavior includes:

- avatar uploads
- event image uploads
- file size validation
- MIME type validation
- file extension validation
- invalid upload rejection
- old file cleanup on replacement
- safe uploaded file deletion
- upload rollback protection during failed operations
- upload path normalization and protection

These tests help ensure secure and reliable upload behavior across the backend.

Upload testing is especially important because file handling combines:

- HTTP requests
- filesystem operations
- validation logic
- database updates
- transaction-safe workflows

This testing layer helps validate secure upload handling, upload rollback protection, and safer file operations during backend mutations.

---

## 🧾 Validator Testing

Validators are tested independently using reusable validation helpers and `express-validator` chains.

Covered validation areas include:

- authentication payloads
- password policy enforcement
- event creation and update payloads, including event mode and registration deadline validation
- event membership parameters and role validation
- ownership transfer validation
- account deletion protection flows
- user profile updates
- upload validation rules
- query parameters
- filtering, pagination, and sorting inputs

This helps keep validation behavior explicit, consistent, centralized, and easier to maintain across the backend.

Validator testing also helps ensure:

- predictable API responses
- consistent validation error formatting
- stronger protection against invalid or malformed input data
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
npm test -- --watch
```

Run all tests inside a specific folder:

```bash
npm test -- tests/integration/events
```

Run a specific test file:

```bash
npm test -- tests/unit/validators/authValidator.test.js
```

These commands help target specific backend layers during development, debugging, feature implementation, testing, and maintenance workflows.

---

## 🎯 Testing Design Goals

The testing architecture aims to provide:

- reliable and consistent API behavior
- strong business-rule and authorization coverage
- current user event access validation
- clear and scalable test organization
- shared setup helpers and factories
- predictable database isolation
- confidence during large-scale backend changes
- maintainable and readable test files
- filtering and query behavior consistency
- query optimization validation
- transaction-safe workflow validation

These design goals help support long-term backend maintainability, safer feature development, more reliable production behavior, and easier large-scale backend evolution.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing flows
- further test deduplication and simplification
- further decoupling of selected Sequelize unit tests
- expanded edge-case coverage for membership and authorization rules
- deeper integration coverage for complex transaction rollback scenarios
- performance-oriented testing for complex query behavior

---
