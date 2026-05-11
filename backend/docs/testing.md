# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Tests](https://img.shields.io/badge/tests-478%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98.29%25%20statements%20%7C%2089.27%25%20branches-brightgreen)

This document describes the testing architecture and testing strategy used in the PlanTogether backend.

The project uses **Jest** and **Supertest** to validate both isolated internal modules and complete API workflows across the application.

---

## 🎯 Overview

The testing architecture is designed to validate:

- API behavior
- business rules
- authentication and authorization flows
- validation logic
- upload handling
- service-layer logic
- database interactions
- error handling
- security-related behavior

The current backend test suite includes:

- **64 test suites**
- **478 passing tests**
- **98.29% statement coverage**
- **89.27% branch coverage**
- **98.52% function coverage**
- **98.45% line coverage**

The combination of integration and unit testing helps ensure backend reliability, maintainability, and safe long-term refactoring.

---

## 🛠️ Testing Stack

The backend testing architecture relies on the following tools and libraries:

### Core Testing

- **Jest** — test runner and assertion framework
- **Supertest** — HTTP integration testing for Express APIs

### Database & Environment

- **PostgreSQL** — dedicated isolated test database
- **Sequelize** — ORM testing and transaction validation

### Testing Utilities

- Custom factories for reusable test data
- Reusable helpers for API flows, validation, and database setup
- Express request/response mocks for isolated middleware and controller testing

The testing stack is designed to support reliable integration testing, isolated unit testing, and maintainable long-term backend development.

---

## 📁 Test Folder Structure

The test suite is separated into reusable helpers, factories, integration tests, and isolated unit tests.

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

This structure keeps the test suite scalable, maintainable, and easier to navigate as the backend grows.

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
- event membership actions
- role-based authorization
- upload workflows
- validation errors
- global error handling
- public and authenticated user routes

Integration tests intentionally avoid heavy mocking in order to validate real application behavior, database interactions, middleware chaining, and end-to-end business rules across the full backend stack.

This approach provides stronger confidence during refactors and helps ensure consistent API behavior under realistic backend conditions.

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
- transaction behavior
- validation chains
- middleware responses
- utility output
- error propagation
- reusable helper behavior

Dependencies are mocked when necessary to isolate the module under test and keep unit tests fast, focused, and deterministic.

This testing layer helps validate internal backend behavior with rapid feedback during development and refactoring.

---

## 🔧 Helpers

Reusable helpers reduce duplication across the test suite and simplify common testing workflows.

Examples include:

- API helpers for authenticated request flows
- database helpers for initialization, reset, and cleanup
- Express mocks for controller and middleware testing
- console and date mocks for stable test behavior
- validation helpers for `express-validator` chains

Helpers keep tests focused on behavior and assertions instead of repetitive setup logic.

They also improve readability, maintainability, and consistency across the testing architecture.

---

## 🏗️ Factories

Factories generate reusable and customizable test data.

They help keep tests consistent, flexible, and easier to maintain by allowing overrides for specific scenarios.

Examples include:

- user factories
- event factories
- mock Sequelize-like event instances
- reusable payload builders

Factories are especially useful for service-layer tests, integration flows, and complex business rule scenarios.

This approach reduces duplicated test data and improves long-term test scalability.

---

## 🧪 Database Isolation

Integration tests use a dedicated PostgreSQL test database isolated from development and production environments.

The test database is synchronized and reset between test runs to ensure:

- isolated test cases
- repeatable and deterministic results
- no dependency on test execution order
- safe database mutation during API testing
- reliable integration behavior across the full backend stack

The testing environment uses:

- `NODE_ENV=test`
- a dedicated `DB_NAME_TEST`
- Sequelize test synchronization

This approach helps maintain stable automated testing and prevents accidental interaction with development data.

---

## 🔁 Mocking Strategy

The project uses different mocking strategies depending on the testing layer and the level of isolation required.

### 🔗 Integration Tests

Integration tests use minimal mocking and rely on the real application stack.

They validate real behavior across:

```txt
Express → Middlewares → Controllers → Services → Sequelize → PostgreSQL
```

This approach helps verify real API behavior, middleware chaining, database interactions, and business rules under realistic backend conditions.

### 🧩 Unit Tests

Unit tests mock dependencies when necessary to isolate the module under test.

Examples include:

- Sequelize models
- database transactions
- uploaded file cleanup
- event status helpers
- query builders
- service dependencies

This approach keeps unit tests fast, focused, deterministic, and easier to maintain.

---

## 🧱 Transaction Testing

Critical service operations are tested using Sequelize transaction mocks.

The tests verify that:

- transactions are started when expected
- successful operations call `commit`
- failed operations call `rollback`
- uploaded files are deleted only after successful commits
- database errors are propagated correctly

This helps ensure database consistency and prevents partial or unsafe operations during critical backend workflows.

Covered transaction scenarios include:

- event creation
- event update
- event deletion
- event joining
- profile update with avatar replacement

Transaction testing is especially important for operations involving both database mutations and file system changes.

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

These tests help ensure secure, predictable, and consistent upload behavior across the backend.

Upload testing is especially important because file handling combines HTTP requests, filesystem operations, validation logic, and database updates.

---

## 🧾 Validator Testing

Validators are tested independently using reusable validation helpers and `express-validator` chains.

Covered validation areas include:

- authentication payloads
- password policy enforcement
- event creation and update payloads
- event membership parameters and roles
- user profile updates
- query parameters
- pagination and sorting inputs

This helps keep validation behavior explicit, consistent, and easier to maintain across the backend.

Validator testing also helps ensure predictable API responses and stronger protection against invalid or malformed input data.

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

These commands help target specific backend layers during development, debugging, and refactoring workflows.

---

## 🎯 Testing Design Goals

The testing architecture aims to provide:

- reliable API behavior
- strong business rule coverage
- clear test organization
- reusable setup utilities
- predictable database isolation
- confidence during refactors
- maintainable test files
- strong coverage across critical backend layers

These design goals help support long-term backend maintainability, safer feature development, and more reliable production behavior.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing flows
- further duplicate test cleanup
- reduced coupling in some Sequelize unit tests
- more edge-case coverage for event membership rules
- dedicated testing documentation for frontend integration
- automated test pipelines using GitHub Actions

---
