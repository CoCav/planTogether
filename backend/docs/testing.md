# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Tests](https://img.shields.io/badge/tests-478%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98%25%20statements%20%7C%2091%25%20branches-brightgreen)

This document describes the testing architecture and overall testing strategy used in the PlanTogether backend.

The project uses **Jest** and **Supertest** to validate both isolated internal modules and complete API workflows across the application.

The testing architecture focuses on:

- backend reliability and long-term maintainability
- API consistency and business rule validation
- security and authorization testing
- reusable test helpers and factories
- isolated and predictable automated test flows

---

## 🎯 Overview

The testing architecture is designed to validate:

- API behavior and response consistency
- business rules and authorization flows
- authentication and access control
- validation logic and error handling
- upload handling and security protections
- service-layer business logic
- database interactions and transactions
- filtering, pagination, and query behavior

The current backend test suite includes:

- **64 test suites**
- **478 passing tests**
- **98.40% statement coverage**
- **90.59% branch coverage**
- **99.26% function coverage**
- **98.57% line coverage**

The combination of integration and unit testing helps ensure backend reliability, maintainability, security, and safer long-term refactoring across the application.

---

## 🛠️ Testing Stack

The backend testing architecture relies on the following tools and libraries:

### Core Testing

- **Jest** — test runner, mocking system, and assertion framework
- **Supertest** — HTTP integration testing for Express APIs

### Database & Environment

- **PostgreSQL** — dedicated isolated test database
- **Sequelize** — ORM testing, association validation, and transaction testing

### Testing Utilities

- Reusable factories for consistent test data generation
- Reusable helpers for API flows, validation, authentication, and database setup
- Express request/response mocks for isolated middleware and controller testing
- Shared mock utilities for dates, console output, and isolated behaviors

The testing stack is designed to support reliable integration testing, isolated unit testing, safer refactoring, and maintainable long-term backend development.

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
│   ├── eventMembership/
│   └── users/
│
└── unit/
    ├── controllers/
    ├── middlewares/
    ├── services/
    ├── utils/
    └── validators/
```

The testing structure mirrors the backend architecture and separates reusable test utilities from isolated test flows.

This organization improves readability, maintainability, scalability, and long-term test consistency as the backend evolves.

---

## 🔗 Integration Tests

Integration tests validate the complete backend request lifecycle:

```txt
Request → Middleware → Controller → Service → Database → Response
```

These tests use the real Express application together with a dedicated PostgreSQL test database and real Sequelize models.

Covered areas include:

- authentication flows
- user profile and password flows
- event CRUD operations
- event filtering, sorting, and pagination
- event membership workflows
- role-based authorization
- upload workflows
- validation errors
- global error handling
- public and authenticated user routes

Integration tests intentionally avoid heavy mocking in order to validate:

- real application behavior
- database interactions and transactions
- middleware chaining
- authorization flows
- end-to-end business rules
- consistent API responses

This approach provides stronger confidence during refactors and helps ensure stable backend behavior under realistic application conditions.

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
- security-related helpers

Unit tests are used to verify:

- service business rules
- transaction-related behavior
- validation chains
- middleware responses
- utility output
- error propagation
- reusable helper and formatter behavior

Dependencies are mocked when necessary to isolate the module under test and keep unit tests fast, focused, and deterministic.

This testing layer provides rapid feedback during development while helping maintain safer long-term backend refactoring.

---

## 🔧 Helpers

Reusable helpers reduce duplication across the test suite and simplify common testing workflows.

Examples include:

- API helpers for authenticated request flows
- database helpers for initialization, reset, and cleanup
- Express request/response mocks for controller and middleware testing
- console and date mocks for stable and predictable test behavior
- validation helpers for `express-validator` chains

Helpers keep tests focused on assertions and business behavior instead of repetitive setup logic.

They also improve readability, maintainability, consistency, and long-term scalability across the testing architecture.

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
- complex business rule validation

This approach reduces duplicated test data and improves long-term test maintainability and scalability.

---

## 🧪 Database Isolation

Integration tests use a dedicated PostgreSQL test database isolated from development and production environments.

The test database is synchronized, cleaned, and reset between test runs to ensure:

- isolated test cases
- repeatable and deterministic results
- no dependency on test execution order
- safe database mutation during API testing
- reliable integration behavior across the full backend stack

The testing environment uses:

- `NODE_ENV=test`
- a dedicated `DB_NAME_TEST`
- Sequelize test synchronization utilities
- automated database cleanup helpers

This approach helps maintain stable automated testing, safer backend refactoring, and prevents accidental interaction with development data.

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
- validation behavior
- end-to-end business rules

### 🧩 Unit Tests

Unit tests mock dependencies when necessary to isolate the module under test.

Examples include:

- Sequelize models
- database transactions
- uploaded file cleanup
- event status helpers
- query builders
- service dependencies
- console and date utilities

This approach keeps unit tests fast, focused, deterministic, and easier to maintain during long-term backend development and refactoring.

---

## 🧱 Transaction Testing

Critical service operations are tested using Sequelize transaction mocks.

The tests verify that:

- transactions are started when expected
- successful operations trigger `commit`
- failed operations trigger `rollback`
- uploaded files are deleted only after successful commits
- transaction failures properly propagate application errors
- partial operations do not leave inconsistent backend state

This helps ensure database consistency and prevents partial or unsafe operations during critical backend workflows.

Covered transaction scenarios include:

- event creation
- event update
- event deletion
- event joining
- profile update with avatar replacement

Transaction testing is especially important for operations involving both database mutations and file system changes.

This testing layer helps validate safer backend behavior during critical write operations and refactoring.

---

## 📤 Upload Testing

Upload behavior is tested through both middleware-level and integration-level coverage.

Covered upload behavior includes:

- avatar uploads
- event image uploads
- file size validation
- MIME type validation
- file extension validation
- invalid upload rejection
- old file cleanup on replacement
- safe uploaded file deletion
- upload path normalization and protection

These tests help ensure secure, predictable, and consistent upload behavior across the backend.

Upload testing is especially important because file handling combines:

- HTTP requests
- filesystem operations
- validation logic
- database updates
- transaction-related workflows

This testing layer helps validate secure upload handling and prevents unsafe file operations during backend mutations.

---

## 🧾 Validator Testing

Validators are tested independently using reusable validation helpers and `express-validator` chains.

Covered validation areas include:

- authentication payloads
- password policy enforcement
- event creation and update payloads
- event membership parameters and role validation
- user profile updates
- query parameters
- filtering, pagination, and sorting inputs

This helps keep validation behavior explicit, consistent, centralized, and easier to maintain across the backend.

Validator testing also helps ensure:

- predictable API responses
- consistent validation error formatting
- stronger protection against invalid or malformed input data
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

Run all tests inside a specific folder:

```bash
npm test -- tests/integration/events
```

Run a specific test file:

```bash
npm test -- tests/unit/validators/authValidator.test.js
```

These commands help target specific backend layers during development, debugging, feature implementation, and refactoring workflows.

---

## 🎯 Testing Design Goals

The testing architecture aims to provide:

- reliable and consistent API behavior
- strong business rule and authorization coverage
- clear and scalable test organization
- reusable setup helpers and factories
- predictable database isolation
- confidence during refactors
- maintainable and readable test files
- strong coverage across critical backend layers

These design goals help support long-term backend maintainability, safer feature development, more reliable production behavior, and easier large-scale backend refactoring.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing flows
- further test deduplication and simplification
- reduced coupling in selected Sequelize unit tests
- expanded edge-case coverage for membership and authorization rules
- additional integration coverage for transaction-related workflows
- dedicated testing documentation for frontend integration
- automated test pipelines using GitHub Actions

---
