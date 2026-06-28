# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Jest-testing-red)
![Supertest](https://img.shields.io/badge/Supertest-integration%20testing-6E9F18)
![Suites](https://img.shields.io/badge/Test%20Suites-98%20passing-brightgreen)
![Tests](https://img.shields.io/badge/Tests-815%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-99.29%25%20statements%20%7C%2094.02%25%20branches-brightgreen)

This document describes the testing architecture and strategy used throughout the PlanTogether backend.

The project uses **Jest** and **Supertest** to validate isolated backend modules, complete API workflows, and long-term application reliability.

The testing strategy focuses on:

- reliability, maintainability, and long-term stability
- API consistency, business rules, and permission enforcement
- authentication, authorization, reviews, and rate limiting
- uploads, geolocation services, pagination, and transaction safety
- soft-delete lifecycles and ownership protection
- shared factories, helpers, and testing utilities
- deterministic and scalable automated testing

---

## 🛠️ Testing Stack

The backend testing architecture relies on the following tools and libraries.

### Core Testing

- **Jest** — test runner, assertions, and mocking
- **Supertest** — HTTP integration testing for Express APIs

### Database & Environment

- **PostgreSQL** — isolated test database
- **Sequelize** — ORM queries, associations, and transaction validation

### Continuous Integration

- **GitHub Actions** — automated test execution with isolated PostgreSQL services on pushes and pull requests

### Testing Utilities

- shared factories for consistent test data generation
- shared helpers for authentication, API workflows, and database setup
- Express request and response mocks
- formatting, pagination, validation, and query helpers
- deterministic date and time utilities

### Coverage Scope

The testing stack supports:

- API integration and request lifecycle validation
- isolated unit testing for backend modules
- transaction and database consistency verification
- authentication, authorization, and permission testing
- uploads, geolocation, validation, and business-rule enforcement
- long-term maintainability and regression prevention

---

## 📁 Test Folder Structure

The backend test suite is organized into helpers, factories, integration tests, and isolated unit tests.

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

The test structure mirrors the backend architecture, separating shared testing utilities, isolated modules, and end-to-end API request flows into dedicated layers.

This organization promotes:

- readability and maintainability
- consistent test organization
- scalable coverage across backend layers
- clear separation between unit and integration testing

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
- reviews, ratings, pagination, and aggregated statistics
- filtering, sorting, pagination, and query handling
- uploads, image lifecycle management, and filesystem safety
- geocoding, location caching, and fallback searches
- soft-delete lifecycles and ownership protection
- event permissions and business-rule enforcement
- validation, application routes, and global error handling

Integration tests intentionally minimize mocking to verify:

- complete request lifecycles
- database interactions and transaction consistency
- middleware and authorization behavior
- end-to-end business rules
- consistent API responses

This approach provides confidence when evolving the backend while helping prevent production regressions.

---

## 🧩 Unit Tests

Unit tests validate isolated backend modules independently of HTTP requests and database interactions.

Covered modules include:

- controllers, services, middlewares, and validators
- review services, aggregation helpers, and query utilities
- filtering, pagination, formatting, and normalization helpers
- configuration modules (`database`, `logger`, `cors`)
- security helpers, upload policies, and rate limiter factories
- event permissions, status helpers, and business-rule utilities
- geocoding services and location helpers
- shared constants and supporting utilities

Unit tests verify:

- business rules, permissions, and ownership constraints
- review workflows, rating calculations, and aggregations
- validation chains, middleware logic, and error propagation
- upload handling and filesystem utilities
- transaction-related logic
- soft-delete lifecycles
- formatting, query, and utility output
- configuration, security, and rate-limiting behavior

Dependencies are mocked when appropriate to keep tests fast, focused, and deterministic.

This layer provides rapid feedback during development while ensuring reliable business logic and maintainable backend modules.

---

## 🔧 Helpers

Reusable helpers reduce duplication and simplify common testing workflows across the backend test suite.

Examples include:

- authenticated API request utilities
- event access and permission helpers
- database setup, reset, and cleanup utilities
- pagination, filtering, and query testing helpers
- Express request and response mocks
- deterministic date and time utilities
- validation helpers for `express-validator` chains

Helpers ensure tests remain focused on business behavior rather than repetitive setup logic, while improving consistency and maintainability across the test suite.

---

## 🏗️ Factories

Factories generate consistent and customizable test data for both integration and unit tests.

Examples include:

- user factories
- event factories
- membership factories
- mock Sequelize model instances
- reusable payload builders

Factories support a wide range of scenarios, including:

- service and integration testing
- middleware and validation workflows
- transaction and rollback cases
- soft-delete and ownership transfer flows
- filtering, query, and pagination behavior
- complex business-rule validation

This approach reduces duplicated setup logic while improving readability, flexibility, and long-term maintainability of tests.

---

## 🗄️ Test Database

Integration tests use a dedicated PostgreSQL database that is completely isolated from development and production environments.

The database is synchronized, reset, and cleaned between test runs to ensure:

- deterministic and isolated execution
- independence from test execution order
- safe database mutations during API testing
- reliable transaction validation and integration testing

The test environment relies on:

- `NODE_ENV=test`
- a dedicated `DB_NAME_TEST`
- an isolated `.env.test` configuration
- Sequelize synchronization utilities
- automated database cleanup helpers
- dedicated PostgreSQL services in GitHub Actions

This setup ensures reliable automated testing, transaction consistency, and complete separation from development data.

---

## 🔁 Mocking Strategy

The backend adopts different mocking strategies depending on the testing layer and the level of isolation required.

### 🔗 Integration Tests

Integration tests intentionally minimize mocking and rely on the complete application stack.

```txt
Express → Middlewares → Controllers → Services → Sequelize → PostgreSQL
```

This approach validates:

- end-to-end request processing
- authentication, authorization, and validation
- database interactions and transaction consistency
- filtering, pagination, and query handling
- business rules, permissions, and lifecycle protections

### 🧩 Unit Tests

Unit tests mock dependencies when appropriate to isolate the module under test.

Commonly mocked dependencies include:

- Sequelize models and transactions
- service dependencies
- upload and filesystem utilities
- event permissions and status helpers
- query builders and filtering utilities
- configuration, logging, and date utilities
- shared HTTP error helpers

This approach keeps unit tests fast, focused, deterministic, and easy to maintain.

---

## 🧱 Transaction Testing

Critical service operations are tested using Sequelize transaction mocks.

Tests verify that:

- transactions are correctly initiated
- successful operations trigger `commit`
- failed operations trigger `rollback`
- errors are properly propagated
- database and filesystem states remain consistent

Covered scenarios include:

- event creation, updates, and deletion
- image upload, replacement, preservation, and removal
- event joining workflows
- organizer ownership transfers
- profile updates with avatar replacement
- account deletion and anonymization

Transaction testing is especially important for workflows that combine database mutations with file system operations.

This layer ensures transaction safety, rollback reliability, and consistent write behavior across critical backend operations.

---

## 📤 Upload Testing

Upload behavior is covered through middleware-level and integration tests.

Covered scenarios include:

- avatar and event image uploads
- file size, MIME type, and extension validation
- invalid upload rejection
- image replacement, removal, and preservation
- file cleanup after successful operations
- rollback protection during failed requests
- upload path normalization and secure file handling

These tests ensure safe upload processing, filesystem integrity, and consistent behavior across backend mutations.

---

## 🧾 Validator Testing

Validators are tested independently using reusable helpers and `express-validator` chains.

Covered validation areas include:

- authentication payloads and password policies
- event creation and update payloads
- event reviews, ratings, and update rules
- membership parameters, role validation, and ownership transfers
- account deletion and profile updates
- upload validation rules
- filtering, sorting, pagination, and query parameters

Validator testing ensures:

- consistent validation rules and error formatting
- protection against malformed or invalid input
- centralized enforcement of security rules
- request safety before controller and service execution

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

Run all tests in a specific folder:

```bash
npm test -- tests/integration/events
```

Run a specific test file:

```bash
npm test -- tests/unit/validators/authValidator.test.js
```

These commands help target specific areas of the backend during development, debugging, and validation.

---

## 🎯 Testing Design Goals

The backend testing architecture aims to provide:

- reliable and consistent API validation
- comprehensive coverage of business rules, authorization, and permissions
- clear and scalable test organization
- shared factories, helpers, and testing utilities
- deterministic database isolation
- readable, maintainable, and deterministic test suites
- robust validation of filtering, pagination, and query logic
- transaction safety and rollback verification
- reliable enforcement of event states and lifecycle rules
- confidence during refactoring and feature development

These goals support long-term maintainability, predictable backend behavior, and safe application evolution.

---

## 🗺️ Roadmap

### 🧪 Testing

- Expand end-to-end testing
- Continue simplifying shared helpers and test utilities
- Further reduce Sequelize-dependent unit tests
- Increase coverage for edge cases involving reviews, memberships, and authorization
- Expand transaction rollback and failure-state validation
- Add performance-oriented testing for complex filtering, pagination, and query scenarios

---
