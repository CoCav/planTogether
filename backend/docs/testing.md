# PlanTogether Backend - Testing Strategy

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Test Suites](https://img.shields.io/badge/Test%20Suites-147%20passing-brightgreen)
![Tests](https://img.shields.io/badge/Tests-1472%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/Coverage-99.27%25%20Statements%20%7C%2089.46%25%20Branches-brightgreen)

---

## Table of Contents

- [Overview](#overview)
- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Folder Structure](#test-folder-structure)
- [Testing Layers](#testing-layers)
- [Shared Testing Utilities](#shared-testing-utilities)
- [Test Database](#test-database)
- [Mocking Strategy](#mocking-strategy)
- [Specialized Test Scenarios](#specialized-test-scenarios)
- [Running Tests](#running-tests)
- [Coverage](#coverage)
- [Testing Goals](#testing-goals)
- [Roadmap](#roadmap)

---

## Overview

This document describes the testing architecture and strategy used throughout the PlanTogether backend.

The backend testing architecture uses Jest and Supertest to validate isolated modules, complete API workflows, and business rules through a combination of unit and integration tests.

Core testing areas include:

- authentication and authorization
- event and membership workflows
- reviews, likes, and permissions
- geocoding and file uploads
- filtering, sorting, and pagination
- transaction safety and rollback behavior
- validation and error handling
- reusable testing utilities and helpers

---

## Testing Philosophy

The testing strategy is built around the following principles:

- deterministic and isolated test execution
- realistic integration testing with minimal mocking
- fast and focused unit testing
- reusable testing utilities and factories
- scalable and maintainable test organization
- comprehensive coverage of business rules and application behavior

---

## Testing Stack

The backend testing architecture relies on the following tools and technologies.

### Core Tools

- **Jest** – test runner, assertions, mocking, and coverage reporting.
- **Supertest** – HTTP integration testing for Express APIs.

### Database & Environment

- **PostgreSQL** – isolated test database used for integration tests.
- **Sequelize** – ORM queries, associations, and transaction validation.

### Continuous Integration

- **GitHub Actions** – automated test execution on pushes and pull requests.

### Testing Utilities

- Shared factories and helpers for test data generation and common workflows.
- Express request and response mocks.
- Database setup and cleanup utilities.
- Validation and query testing helpers.

---

## Test Folder Structure

```text
tests/
├── factories/
├── helpers/
├── integration/
│   ├── auth/
│   ├── events/
│   ├── eventLikes/
│   ├── eventMemberships/
│   ├── eventReviews/
│   ├── geocoding/
│   ├── users/
│   └── app.test.js
├── setup/
└── unit/
    ├── config/
    ├── constants/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── services/
    ├── utils/
    ├── validators/
    └── server.test.js
```

### Folder Responsibilities

| Folder | Purpose |
|--------|--------|
| `factories` | Provides reusable test data builders. |
| `helpers` | Contains shared testing utilities and custom assertions. |
| `integration` | Validates complete API workflows and business rules. |
| `setup` | Configures the test environment and database lifecycle. |
| `unit` | Tests individual modules in isolation. |

### Organizational Principles

- Unit tests mirror the backend source structure whenever possible.
- Integration tests validate complete request and business workflows.
- Shared factories and helpers reduce duplication across the test suite.
- Test utilities are centralized to improve readability and maintainability.
- Database setup and cleanup logic is isolated from test implementations.

---

## Testing Layers

The backend test suite combines integration and unit tests to validate both complete application workflows and isolated module behavior.

### Integration Tests

Integration tests validate the complete request lifecycle:

```text
Express → Middlewares → Controllers → Services → Sequelize → PostgreSQL
```

They use the real Express application, Sequelize models, and a dedicated PostgreSQL test database.

Integration tests focus on:

- complete API workflows
- authentication and authorization behavior
- validation and error responses
- database interactions
- transaction consistency
- business rules across multiple backend layers

Mocking is intentionally limited so that these tests remain close to real application behavior.

### Unit Tests

Unit tests validate individual modules in isolation from the HTTP server and external dependencies.

Unit tests focus on:

- controllers and services
- middlewares and validators
- models and configuration
- reusable utilities and query helpers
- route composition
- isolated business rules and error propagation

Dependencies are mocked when needed to keep tests focused, deterministic, and fast.

Together, both testing layers provide realistic API validation and precise feedback when individual modules fail.

---

## Shared Testing Utilities

The backend test suite provides reusable utilities to simplify test setup and reduce duplication across unit and integration tests.

### Helpers

Shared helpers are used to support common testing workflows and assertions.

They include utilities for:

- database setup and cleanup
- request and response mocking
- validation and query testing
- reusable test assertions
- common test setup logic

### Factories

Factories are used to generate consistent and reusable test data.

They provide:

- predefined entity builders
- realistic test payloads
- customizable test scenarios
- reusable data generation across test suites

### Design Principles

- Keep tests focused on their responsibilities.
- Centralize common testing logic.
- Reduce duplication across the test suite.
- Improve readability and maintainability.

Shared testing utilities help keep tests deterministic, concise, and easy to evolve as the backend grows.

---

## Test Database

Integration tests run against a dedicated PostgreSQL test database that is completely isolated from the development environment.

### Database Principles

- Integration tests never use the development database.
- Test data is created specifically for each test scenario.
- Database state is reset between test runs.
- Transactions and business workflows are validated against a real database.

### Benefits

- Realistic API and ORM behavior.
- Reliable validation of database interactions.
- Safe and repeatable test execution.
- Increased confidence in transaction-safe operations.

Using a dedicated test database helps ensure that integration tests remain deterministic, isolated, and representative of production behavior.

---

## Mocking Strategy

The backend uses different mocking strategies depending on the testing layer and the level of isolation required.

### Integration Tests

Integration tests minimize mocking and rely on the real application stack whenever possible.

They use:

- the Express application
- real middlewares and controllers
- service and model interactions
- Sequelize
- the dedicated PostgreSQL test database

External or non-deterministic dependencies may still be mocked when necessary to keep tests reliable and independent from third-party services.

### Unit Tests

Unit tests mock dependencies to isolate the module under test.

Commonly mocked dependencies include:

- Sequelize models and transactions
- service and utility dependencies
- filesystem and upload operations
- logging and configuration modules
- external provider responses
- date and environment-dependent behavior

### Mocking Principles

- Mock only what is outside the responsibility of the module under test
- Keep integration tests close to real application behavior
- Keep unit tests focused and deterministic
- Avoid reproducing implementation details inside mocks
- Prefer shared mocks and helpers when the same setup is reused

This strategy balances realistic integration coverage with fast and precise unit testing.

---

## Specialized Test Scenarios

Some backend workflows require additional testing beyond standard unit and integration coverage.

### Transaction Testing

Transaction tests verify that multi-step database operations remain consistent.

They validate that:

- transactions are started when required
- successful operations commit their changes
- failed operations roll back correctly
- errors are propagated without leaving partial data
- related database mutations remain consistent

This is especially important for ownership transfers, membership changes, reviews, likes, and other multi-step workflows.

### Upload Testing

Upload tests validate avatar and event image handling across middleware, services, and API workflows.

They cover:

- allowed file types and extensions
- file size limits
- generated filenames and upload paths
- image replacement and removal
- safe file deletion
- invalid upload rejection
- filesystem consistency during failed operations

### Validator Testing

Validators are tested independently to ensure request data is rejected before controller and service execution when necessary.

Validation tests cover:

- request bodies
- route parameters
- query parameters
- pagination and sorting
- authentication and password rules
- event, membership, review, and location payloads

Reusable validator helpers keep these tests consistent across the backend.

---

## Running Tests

The backend test suite can be executed using the following npm scripts.

| Command | Description |
|--------|--------|
| `npm test` | Runs the complete backend test suite. |
| `npm run test:coverage` | Runs the complete test suite and generates a coverage report. |

### Notes

- Tests are executed with `NODE_ENV=test`.
- Jest uses the Node.js test environment.
- The test environment is configured through `tests/setup/setupTests.js`.
- Some tests require the dedicated PostgreSQL test database to be properly configured.

---

## Coverage

The backend test suite maintains a high level of automated test coverage across all layers of the application.

| Metric | Coverage |
|--------|--------|
| Statements | 99.27% |
| Branches | 89.46% |
| Functions | 96.94% |
| Lines | 99.50% |

Current test suite:

- 147 test suites
- 1472 passing tests

Coverage reports are generated using Jest and are intended to help identify untested code paths and maintain long-term code quality.

---

## Testing Goals

The testing strategy aims to provide confidence when developing, refactoring, and extending the backend.

Its primary goals are to:

- prevent regressions during feature development
- validate business rules and permissions
- ensure reliable database interactions
- maintain a scalable and maintainable test suite
- support safe refactoring of existing code
- encourage consistent testing practices across the project

The test suite is designed to evolve alongside the backend architecture while remaining fast, deterministic, and easy to maintain.

---

## Roadmap

Potential future improvements to the testing strategy include:

- expanding coverage for future backend features
- adding performance and load testing when appropriate
- improving CI workflows as the project grows
- maintaining high automated test coverage standards

The testing architecture will continue to evolve alongside the backend while prioritizing maintainability, readability, and reliability.

---
