# PlanTogether Frontend - Testing Strategy

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Suites](https://img.shields.io/badge/test%20suites-55%20safe--scope%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-357%20safe--scope%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-in%20progress-lightgrey)

This document describes the testing architecture and overall testing strategy used in the PlanTogether frontend.

The project uses **Vitest** and **React Testing Library** to validate frontend business logic, API communication, routing, hooks, utilities, and progressively refactored UI behavior.

The testing architecture focuses on:

- frontend reliability and long-term maintainability
- reusable feature, hook, route, API, and utility testing
- role-based UI behavior and permission logic
- filtering, pagination, query synchronization, and upload behavior
- reusable test helpers, factories, mocks, and render utilities
- safer frontend refactoring during the page and component rewrite
- progressively restoring full frontend test coverage

---

## 🎯 Overview

The frontend testing architecture is designed to validate:

- authentication behavior and protected access
- API request helpers and response normalization
- frontend error handling
- event filtering and URL query synchronization
- event and membership business logic
- role-based permissions and protected frontend actions
- public and authenticated user logic
- reusable hooks and stateful frontend behavior
- shared utilities such as formatting, pagination, and uploaded file URL handling
- reusable factories and helpers used across the test suite

The current safe-scope frontend test suite includes:

- **55 passing safe-scope test suites**
- **357 passing safe-scope tests**

> The current safe-scope intentionally excludes legacy page and component tests while the frontend UI refactor is in progress.

Coverage metrics will be refreshed after the page and component refactor is finalized.

---

## 🛠️ Testing Stack

### Core Testing

- **Vitest** — test runner, mocking system, and assertion framework
- **React Testing Library** — React rendering and user-facing behavior testing

### Supporting Testing Utilities

- **@testing-library/jest-dom** — DOM-specific assertions
- **@testing-library/user-event** — realistic user interaction helpers
- **jsdom** — browser-like test environment

### Frontend Testing Utilities

- Reusable factories for consistent test data generation
- Reusable render helpers for providers and routing
- Reusable hook prop helpers
- Shared mocks for API behavior, uploads, dialogs, and paginated data
- Centralized frontend test setup and cleanup utilities

The testing stack is designed to support reliable frontend refactoring, reusable test setup, predictable assertions, and maintainable long-term test coverage.

---

## 📁 Test Folder Structure

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

The frontend testing structure mirrors the frontend architecture and separates reusable test utilities from feature, hook, route, API, context, and utility tests.

This organization improves readability, maintainability, consistency, and long-term test scalability as the frontend evolves.

---

## 🧪 Frontend Testing Layers

The current safe-scope covers the refactored frontend layers:

- API modules
- feature logic
- hooks
- context
- routes
- shared utilities
- reusable testing factories and helpers

Legacy page and component tests are being updated progressively during the frontend UI refactor.

---

## 🧩 Feature & Hook Testing

Feature and hook tests validate reusable frontend business logic independently from full page rendering.

Covered areas include:

- authentication normalization, validation, and token persistence
- event filtering, empty states, query params, and view configuration
- event validation and payload normalization
- membership validation, permissions, actions, and management behavior
- authenticated user event filters, views, query params, and normalizers
- public user filters, views, query params, normalizers, and event data
- shared frontend constants, upload rules, password rules, and listing helpers
- pagination hook behavior

These tests help keep business logic predictable, isolated, and easier to refactor.

---

## 🔌 API Layer Testing

API tests validate the frontend API abstraction without performing real HTTP requests.

Covered areas include:

- centralized Axios client behavior
- JWT authorization header injection
- API response unwrapping
- paginated payload normalization
- API error normalization
- auth API requests
- event API requests
- event membership API requests
- user API requests

API calls are mocked so tests can focus on:

- endpoint paths
- request payloads
- query params
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
- loading states during auth initialization
- authenticated context behavior

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
- paginated fetching and item merging

These tests help keep shared helpers stable across components, pages, and feature logic.

---

## 🧱 Factories

Factories generate reusable and customizable frontend test data.

They help reduce duplicated mock data and keep tests consistent across the test suite.

Examples include:

- authenticated user factories
- public user factories
- auth payload factories
- event factories
- event payload factories
- event view factories
- membership factories
- membership payload factories
- user event factories
- query params factories

Factories support overrides for scenario-specific test data.

Example pattern:

```js
createEvent({
    id: 2,
    title: "Updated Event"
});
```

This approach improves readability, reduces duplication, and makes large frontend refactors safer.

---

## 🔧 Helpers

Reusable helpers simplify common test setup.

Examples include:

- render helpers for providers and routing
- hook prop helpers
- mock API error helpers
- mock file helpers
- mock uploaded file URL helpers
- mock paginated fetch helpers
- mock confirmation dialog helpers
- centralized frontend test setup utilities

Helpers keep tests focused on behavior and assertions instead of repetitive setup logic.

They also improve consistency across feature, hook, route, API, and utility tests.

---

## 🔁 Mocking Strategy

The frontend uses targeted mocking depending on the tested layer.

### API Tests

API tests mock the centralized API client to validate:

- endpoint paths
- request payloads
- params
- response unwrapping

### Feature and Hook Tests

Feature and hook tests mock external dependencies when needed, such as:

- API modules
- navigation helpers
- confirmation dialogs
- hook callbacks
- upload files
- dates and timers

### Route and Context Tests

Route and context tests mock authentication state, API calls, and router behavior when necessary to isolate frontend access behavior.

### Utility Tests

Utility tests usually avoid mocking unless testing dates, files, or browser-specific behavior.

This strategy keeps tests fast, focused, deterministic, and easier to maintain during the frontend refactor.

---

## 🧪 Safe-Scope Testing Strategy

The project currently uses a safe-scope testing strategy while legacy page and component tests are being refactored.

The current safe-scope command is:

```bash
npm test -- src/tests/features src/tests/hooks src/tests/context src/tests/routes src/tests/api src/tests/utils
```

This scope includes the refactored and stabilized layers:

- features
- hooks
- context
- routes
- API
- utilities

It intentionally excludes:

- legacy page tests
- legacy component tests

This allows the refactor to progress safely while keeping the stabilized frontend logic covered by automated tests.

Once pages and components are fully refactored, the full test suite and coverage metrics will be restored.

---

## ▶️ Running Tests

Run the current safe-scope test suite:

```bash
npm test -- src/tests/features src/tests/hooks src/tests/context src/tests/routes src/tests/api src/tests/utils
```

Run all tests:

```bash
npm run test:run
```

Run tests with coverage:

```bash
npx vitest run --coverage
```

Run tests in watch mode:

```bash
npm test --watch
```

Run a specific test folder:

```bash
npm test -- src/tests/features/events
```

Run a specific test file:

```bash
npm test -- src/tests/features/events/eventValidation.test.js
```

---

## 🎯 Testing Design Goals

The frontend testing architecture aims to provide:

- reliable frontend business logic
- predictable API abstraction behavior
- safe role-based and permission-based interactions
- reusable test data and setup utilities
- reduced duplicated mocks and payloads
- isolated and deterministic tests
- clear separation between test layers
- safer frontend refactoring
- maintainable long-term test coverage
- progressive restoration of full page and component test coverage

These goals support long-term frontend maintainability, safer feature development, and smoother UI refactors.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- restoring full page and component test coverage
- extending lower-level reusable UI component tests
- adding end-to-end testing for complete user journeys
- improving accessibility-oriented UI tests
- expanding interaction tests for role-based event management flows
- further refining reusable factories and helpers as duplication appears
- refreshing full coverage metrics after the UI refactor
- improving reusable render helpers and test providers
