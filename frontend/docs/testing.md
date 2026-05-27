# PlanTogether Frontend - Testing Strategy

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-123%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1103%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-97.64%25%20statements%20%7C%2094.51%25%20branches-brightgreen)

This document describes the testing architecture and overall testing strategy used in the PlanTogether frontend.

The project uses **Vitest** and **React Testing Library** to validate both isolated frontend business logic and complete user-facing application behavior.

The testing architecture focuses on:

- frontend reliability and long-term maintainability
- reusable frontend interaction logic and query synchronization
- routing, authentication, and frontend access guard validation
- filtering, pagination, listing, and state synchronization behavior
- reusable factories, mocks, helpers, and render utilities
- API abstraction and normalization consistency
- isolated and predictable frontend test flows
- scalable and maintainable frontend testing workflows

---

## 🎯 Overview

The frontend testing architecture is designed to validate:

- authentication flows and protected access behavior
- API request helpers and response normalization
- frontend error handling and validation behavior
- event filtering, pagination, and URL query synchronization
- event and membership workflows and permissions
- role-based permissions and frontend access guards
- public and authenticated user behavior
- reusable hooks and frontend state management
- page rendering and routing behavior
- shared frontend utilities and formatting helpers
- reusable factories, mocks, and render helpers
- semantic structure, ARIA validation, and accessible interaction testing
- ongoing event view behavior
- event status synchronization and status badges
- started-event restrictions and permission-aware actions

The current frontend test suite includes:

- **123 passing test files**
- **1103 passing tests**
- **97.64% statement coverage**
- **94.51% branch coverage**
- **94.6% function coverage**
- **97.87% line coverage**

The combination of integration-style frontend testing, isolated business-logic testing, route testing, and reusable utility testing helps ensure frontend reliability, UI consistency, predictable behavior, and scalable long-term frontend development.

---

## 🛠️ Testing Stack

The frontend testing architecture relies on the following tools and libraries:

### Core Testing

- **Vitest** — test runner, mocking system, and assertion framework
- **React Testing Library** — React rendering and user-facing behavior testing

### Browser & Interaction Testing

- **@testing-library/jest-dom** — DOM-specific assertions
- **@testing-library/user-event** — realistic user interaction helpers
- **jsdom** — browser-like test environment

### Testing Utilities

- Reusable factories for consistent frontend test data generation
- Reusable render helpers for providers, routing, and protected flows
- Reusable hook testing utilities
- Shared mocks for API behavior, uploads, dialogs, pagination, and routing
- Centralized frontend test setup and cleanup utilities
- Shared helpers for semantic structure and accessibility-oriented assertions

### Coverage Scope

The testing stack is designed to support reliable frontend evolution and long-term maintainability across:

- API modules and normalization helpers
- reusable frontend business logic
- routing and protected access behavior
- query synchronization and listing architecture
- reusable hooks and state management
- page-level rendering and interaction behavior
- reusable UI interaction patterns, upload behavior, and accessibility patterns
- semantic structure, ARIA validation, and accessibility-focused interaction behavior

This testing architecture helps maintain predictable frontend behavior, isolated business-logic validation, reusable testing workflows, and long-term frontend maintainability.

---

## 📁 Test Folder Structure

The frontend test suite is organized into reusable helpers, factories, page rendering and interaction tests, route tests, API tests, and isolated frontend business-logic tests.

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

The frontend testing structure mirrors the frontend architecture and separates reusable testing utilities from feature, hook, page, route, API, context, and utility testing layers.

This organization improves:

- readability and long-term maintainability
- reusable test setup and rendering behavior
- consistent frontend business-logic validation
- scalable page and routing test coverage
- scalable frontend testing workflows

---

## 🧪 Frontend Testing Layers

The frontend test suite combines isolated business-logic validation, reusable hook testing, route testing, API testing, and page-level interaction testing across the application.

Covered testing layers include:

- API modules and normalization helpers
- centralized frontend logic
- reusable hooks and state management
- authentication context behavior
- protected routes and routing flows
- page rendering and interaction behavior
- query synchronization and listing architecture
- upload interactions and validation behavior
- shared frontend utilities and helpers
- reusable testing factories, mocks, and render utilities
- semantic structure and accessibility-oriented testing
- ARIA attributes and accessible interaction behavior

The testing architecture separates frontend business logic from rendering concerns whenever possible, helping keep tests predictable, scalable, and maintainable as the frontend architecture evolves.

---

## 🧩 Feature & Hook Testing

Feature and hook tests validate reusable frontend behavior independently from full page rendering.

Covered areas include:

- authentication normalization, validation, and token persistence
- event filtering, empty states, URL query synchronization, view configuration, and status handling
- event validation and payload normalization
- membership validation, permissions, actions, and management behavior
- authenticated user event filters, views, URL query synchronization, and normalizers
- public user filters, views, URL query synchronization, normalizers, and event data
- shared frontend constants, upload rules, password rules, and listing helpers
- reusable listing state management and query synchronization
- pagination hook behavior
- accessible form validation behavior
- query synchronization and accessible navigation flows
- ongoing event view behavior
- started-event restriction logic
- event status badge configuration

These tests help keep frontend business logic predictable, scalable, maintainable, and easier to evolve over time.

---

## 🔌 API Layer Testing

API tests validate the frontend API abstraction without performing real HTTP requests.

Covered areas include:

- centralized Axios client behavior
- JWT authorization header injection
- paginated and normalized payload handling
- API response unwrapping
- API error normalization
- frontend access and permission endpoints
- multipart upload request handling
- auth API requests
- event API requests
- event membership API requests
- user API requests

API calls are mocked so tests can focus on:

- endpoint paths
- request payloads
- URL query parameters
- returned payload shapes
- error and response handling helpers

---

## 🛣️ Route & Authentication Testing

Route tests validate routing and protected access behavior.

Covered areas include:

- application route registration
- public route rendering
- protected route rendering
- unauthenticated redirects
- redirect restoration behavior
- protected event edit access flows
- loading states during auth initialization
- authenticated context behavior
- event access permission flows
- started-event deletion restrictions

The route tests use mocked auth state and router utilities to validate navigation behavior in isolation.

---

## 🧰 Utility Testing

Utility tests validate reusable frontend helpers.

Covered areas include:

- date and time formatting
- event date range formatting
- count and text formatting
- uploaded file URL resolution
- avatar and event image fallbacks
- accessible uploaded file and fallback behavior
- paginated fetching and item merging
- query parameter synchronization helpers
- event listing normalization helpers
- event status helpers

These tests help keep shared helpers stable across components, pages, and feature logic.

---

## 🧱 Factories

Factories generate reusable and customizable frontend test data.

They help reduce duplicated mock data and keep tests consistent across the frontend test suite.

Examples include:

- authenticated user factories
- public user factories
- auth payload factories
- event factories
- event payload factories
- event listing and view factories
- membership factories
- membership payload factories
- user event factories
- URL query parameter factories

Factories support overrides for scenario-specific test data.

Example pattern:

```js
createEvent({
    id: 2,
    title: "Updated Event"
});
```

This approach improves readability, reduces duplication, and helps make large frontend architecture changes easier to maintain.

---

## 🔧 Helpers

Reusable helpers simplify common frontend test setup.

Examples include:

- render helpers for providers and routing
- reusable route and navigation helpers
- hook prop helpers
- mock API error helpers
- mock file helpers
- mock uploaded file URL helpers
- mock paginated fetch helpers
- mock confirmation dialog helpers
- centralized frontend test setup utilities
- event listing test helpers

Helpers keep tests focused on behavior and assertions instead of repetitive setup logic.

They also improve consistency across feature, hook, route, API, page, and utility tests.

---

## 🔁 Mocking Strategy

The frontend uses targeted mocking depending on the tested layer and the level of isolation required.

### 🔌 API Tests

API tests mock the centralized API client to validate:

- endpoint paths
- request payloads
- URL query parameters
- response unwrapping
- normalized payload handling
- error handling behavior

### 🧩 Feature & Hook Tests

Feature and hook tests mock external dependencies when necessary to isolate frontend business logic.

Examples include:

- API modules
- navigation helpers
- confirmation dialogs
- hook callbacks
- upload files
- dates and timers
- browser APIs

### 🛣️ Route & Context Tests

Route and context tests mock authentication state, API calls, and router behavior when necessary to isolate frontend access and navigation behavior.

### 🧰 Utility Tests

Utility tests usually avoid heavy mocking unless testing:

- dates and timers
- uploaded files
- browser-specific behavior
- URL-related utilities

This strategy helps keep tests fast, focused, deterministic, and easier to maintain during long-term frontend development and architecture evolution.

---

## ▶️ Running Tests

Run the full frontend test suite:

```bash
npm run test:run
```

Run tests with coverage:

```bash
npx vitest run --coverage
```

Run tests in watch mode during development:

```bash
npm test --watch
```

Run all tests inside a specific folder:

```bash
npm test -- src/tests/features/events
```

Run a specific test file:

```bash
npm test -- src/tests/features/events/eventValidation.test.js
```

These commands help target specific frontend layers during development, debugging, feature implementation, testing, and maintenance workflows.

---

## 🎯 Testing Design Goals

The frontend testing architecture aims to provide:

- reliable frontend business logic validation
- predictable API abstraction behavior
- safe role-based and permission-aware interactions
- reusable test data and setup utilities
- reduced duplicated mocks and payloads
- isolated and deterministic test behavior
- clear separation between testing layers
- scalable frontend testing architecture
- maintainable long-term frontend testing workflows
- consistent semantic and accessibility-focused component behavior
- reliable event status and permission validation

These goals support long-term frontend maintainability, safer feature development, predictable UI behavior, and scalable frontend architecture evolution.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing for complete user journeys
- expanded reusable UI component testing
- expanded accessibility-oriented UI testing
- expanded interaction testing for role-based event management flows
- further refinement of reusable factories, mocks, and helpers
- improved reusable render helpers and test providers
- deeper coverage for complex listing and query synchronization flows
- continued frontend testing architecture improvements and standardization

---
