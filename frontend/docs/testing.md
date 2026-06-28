# PlanTogether Frontend - Testing Strategy

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-153%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1619%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-97.26%25%20statements%20%7C%2093.37%25%20branches-brightgreen)

This document describes the testing architecture and strategy used throughout the PlanTogether frontend.

The project uses **Vitest** and **React Testing Library** to validate business logic, UI components, routing, accessibility, and complete user-facing workflows.

The testing strategy focuses on:

- reliability, maintainability, and long-term stability
- authentication, routing, and permission-aware interactions
- business logic, feature hooks, and state management
- filtering, pagination, query synchronization, and payload normalization
- centralized API abstraction and error handling
- event, membership, and review workflows
- accessibility, semantic HTML, and ARIA behavior
- shared factories, mocks, testing helpers, and utilities

---

## 🎯 Overview

The frontend test suite validates:

- authentication, protected navigation, and redirect restoration
- API modules, payload normalization, pagination, and error handling
- event, membership, review, and permission workflows
- filtering, query synchronization, and listing behavior
- location search, interactive maps, and geolocation workflows
- authenticated and public user experiences
- custom hooks, context providers, UI components, and shared application state
- semantic HTML, ARIA relationships, accessibility, and keyboard interactions
- upload workflows, image lifecycle management, and validation behavior
- global toast notifications and transient user feedback

The current frontend test suite includes:

- **153 passing test files**
- **1619 passing tests**
- **97.26% statement coverage**
- **93.37% branch coverage**
- **96.03% function coverage**
- **97.92% line coverage**

By combining component, feature, hook, page, route, API, context, and utility testing, the suite helps ensure reliable, accessible, and maintainable behavior across the entire frontend.

---

## 🛠️ Testing Stack

The frontend testing architecture is built around a modern toolchain focused on reliability, maintainability, and realistic user interactions.

### Core Testing

- **Vitest** — test runner, assertions, mocking, and coverage reporting
- **React Testing Library** — component rendering and user-centric testing

### Browser & Interaction Testing

- **@testing-library/jest-dom** — DOM-specific assertions
- **@testing-library/user-event** — realistic user interactions
- **jsdom** — browser-like testing environment

### Testing Utilities

The project includes a shared testing infrastructure built around:

- factories for generating consistent test data
- render and hook testing helpers
- mocks for API modules, uploads, dialogs, routing, and browser APIs
- centralized test setup and cleanup
- accessibility-focused testing utilities

### Coverage Scope

The testing stack supports validation of:

- API modules, payload normalization, pagination, and error handling
- business logic, custom hooks, context providers, and state management
- routing, protected navigation, and authentication flows
- page rendering and user interactions
- uploads, image lifecycle management, and responsive UI behavior
- semantic HTML, ARIA relationships, and accessibility

This testing stack provides a solid foundation for validating both isolated units and complete feature workflows while keeping the test suite scalable as the application grows.

---

## 📁 Test Folder Structure

The frontend test suite is organized by architectural layer, mirroring the application structure while separating shared testing utilities from feature-specific tests.

```txt
src/tests
├── api/
├── components/
├── context/
├── factories/
│   ├── auth/
│   ├── events/
│   ├── eventMemberships/
│   ├── shared/
│   └── users/
│       ├── authenticated/
│       └── public/
├── features/
├── helpers/
│   ├── hooks/
│   ├── mocks/
│   └── render/
├── hooks/
├── pages/
├── routes/
├── setup/
│   └── testSetup.js
└── utils/
```

The test structure closely follows the frontend architecture, making it easy to locate tests alongside their corresponding application layer while keeping shared testing infrastructure isolated.

This organization promotes:

- clear separation of testing responsibilities
- consistent test setup through shared helpers and factories
- maintainable feature and business-logic testing
- scalable test coverage across the application

---

## 🧪 Frontend Testing Layers

The test suite combines API, feature, component, hook, page, route, and utility tests to validate the application across every architectural layer.

Covered areas include:

- API modules, payload normalization, pagination, and error handling
- business logic, custom hooks, and state management
- authentication, routing, and protected access behavior
- page rendering, user interactions, and navigation flows
- filtering, query synchronization, and listing workflows
- uploads, image lifecycle management, and validation
- shared factories, mocks, render helpers, and testing utilities
- semantic HTML, ARIA relationships, and accessibility

Business logic is tested independently from UI rendering whenever possible, making the test suite easier to understand, maintain, and extend.

---

## 🧩 Feature & Hook Testing

Feature and hook tests focus on domain-specific logic without relying on full page rendering.

Covered areas include:

- authentication, validation, redirects, and session persistence
- event filtering, pagination, query synchronization, and lifecycle rules
- event validation, payload builders, and normalization helpers
- membership permissions, role-aware interactions, and management workflows
- review creation, ratings, statistics, and completed-event workflows
- user profiles, dashboards, and public listing behavior
- upload management, image lifecycle handling, and ownership safeguards
- shared helpers, constants, and validation utilities
- accessibility-focused form interactions and validation

By isolating business logic from presentation, these tests remain focused, predictable, and easier to evolve alongside the application.

---

## 🔌 API Layer Testing

API tests validate the application's API abstraction without performing real HTTP requests.

Covered areas include:

- centralized Axios client configuration
- JWT authorization header injection
- response unwrapping, pagination, and payload normalization
- API error normalization and consistent error handling
- authentication, event, membership, review, user, and permission requests
- multipart uploads and image lifecycle management

API calls are mocked to verify:

- endpoint paths and query parameters
- request payloads and response data
- payload normalization and error handling

---

## 🛣️ Route & Authentication Testing

Route tests validate navigation, protected access, and authentication-aware user flows.

Covered areas include:

- public and protected route rendering
- authentication initialization and loading guards
- unauthenticated redirects and redirect restoration
- event permission checks and protected edit workflows
- ownership transfer and started-event restrictions
- public user profile navigation

Authentication state and routing utilities are mocked to validate navigation independently from backend services.

---

## 🧰 Utility Testing

Utility tests validate the shared helpers used throughout the application.

Covered areas include:

- date, time, count, and text formatting
- uploaded file helpers, URL resolution, and fallback behavior
- pagination helpers, item merging, and listing normalization
- query synchronization, URL generation, and event status utilities
- map and location utilities

These tests help keep the application's shared utilities stable, predictable, and easy to evolve.

---

## 🧱 Factories

Factories generate consistent, customizable test data for the application.

They eliminate duplicated test data and make tests easier to read, maintain, and extend.

Examples include:

- authenticated and public user factories
- authentication payload factories
- event, listing, and view factories
- membership and membership payload factories
- user event factories
- URL query parameter factories

Factories support scenario-specific overrides whenever customized test data is needed.

Example:

```js
createEvent({
  id: 2,
  title: "Updated Event"
});
```

This approach promotes readability, flexibility, and consistency throughout the test suite.

---

## 🔧 Helpers

Shared helpers simplify common test setup and interaction patterns.

Examples include:

- render helpers for providers, routing, and protected flows
- navigation and route utilities
- hook testing helpers
- mocks for API errors, uploads, dialogs, and paginated data
- centralized test setup and cleanup
- event listing and pagination helpers

By moving repetitive setup into shared utilities, tests remain focused on user behavior and assertions rather than implementation details.

---

## 🔁 Mocking Strategy

The test suite uses targeted mocking based on the architectural layer being validated.

### 🔌 API Tests

API tests mock the centralized API client to verify:

- endpoint paths and query parameters
- request payloads
- response unwrapping and payload normalization
- API error handling

### 🧩 Feature & Hook Tests

Feature and hook tests mock external dependencies only when necessary to isolate domain logic.

Examples include:

- API modules and navigation helpers
- confirmation dialogs and callback handlers
- uploads, image state transitions, dates, timers, and browser APIs

### 🛣️ Route & Context Tests

Route and context tests mock authentication state, API calls, and router behavior to validate protected navigation and access control independently from backend services.

### 🧰 Utility Tests

Utility tests avoid unnecessary mocking whenever possible and primarily focus on:

- dates and timers
- uploaded file helpers
- browser-specific APIs
- URL generation and query parameter helpers

This layered mocking strategy keeps the test suite fast, deterministic, and easy to maintain while providing confidence in each architectural layer.

---

## ▶️ Running Tests

Run the complete test suite:

```bash
npm run test:run
```

Generate a coverage report:

```bash
npm run test:coverage
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Run all tests within a specific directory:

```bash
npm test -- src/tests/features/events
```

Run a single test file:

```bash
npm test -- src/tests/features/events/eventValidation.test.js
```

These commands make it easy to execute the entire suite or focus on specific features while developing, debugging, or investigating regressions.

---

## 🎯 Testing Design Goals

The testing architecture is designed to provide:

- reliable validation of business logic
- predictable API abstraction, payload normalization, and error handling
- safe permission-aware and role-aware interactions
- consistent test data, mocks, and testing utilities
- isolated, deterministic, and maintainable tests
- clear separation between architectural layers
- scalable testing patterns
- accessible, semantically correct user interfaces
- reliable validation of permissions, event lifecycle rules, uploads, and datetime constraints

These principles support long-term maintainability, safer feature development, and confidence when evolving the application.

---

## 🗺️ Roadmap

Potential improvements include:

- end-to-end testing for complete user journeys
- expanded accessibility and interaction testing
- deeper coverage for complex role and permission workflows
- continued refinement of factories, mocks, render helpers, and testing infrastructure
- additional coverage for advanced filtering, pagination, and navigation scenarios
- continued standardization of testing patterns and documentation

---
