# PlanTogether Frontend - Testing Strategy

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-149%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1522%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-96.39%25%20statements%20%7C%2093.27%25%20branches-brightgreen)

This document describes the frontend testing architecture and strategy used in the PlanTogether frontend.

The project uses **Vitest** and **React Testing Library** to validate frontend business logic, reusable UI behavior, routing, accessibility, and user-facing workflows.

The testing architecture focuses on:

- reliability, maintainability, and long-term stability
- authentication, routing, and permission-aware interactions
- business logic, state management, filtering, and pagination
- API abstraction, normalization, and error handling
- reviews, ratings, and feature workflows
- accessibility, semantic structure, and responsive UI behavior
- reusable factories, mocks, helpers, and testing utilities

---

## 🎯 Overview

The frontend test suite validates:

- authentication, protected navigation, and route restoration
- API modules, normalization helpers, and error handling
- event, membership, review, and permission workflows
- filtering, pagination, query synchronization, and listing behavior
- location search, maps, and geolocation workflows
- public and authenticated user experiences
- reusable hooks, components, and state management
- accessibility, semantic structure, and keyboard interactions
- uploads, image lifecycle workflows, and validation behavior

The current frontend test suite includes:

- **149 passing test files**
- **1522 passing tests**
- **96.39% statement coverage**
- **93.27% branch coverage**
- **95.25% function coverage**
- **97.03% line coverage**

The combination of component, feature, route, API, and utility testing helps ensure reliable, accessible, and maintainable frontend behavior across the application.

---

## 🛠️ Testing Stack

The frontend testing architecture relies on the following tools and libraries.

### Core Testing

- **Vitest** — test runner, assertions, and mocking
- **React Testing Library** — component rendering and user interaction testing

### Browser & Interaction Testing

- **@testing-library/jest-dom** — DOM-specific assertions
- **@testing-library/user-event** — realistic user interactions
- **jsdom** — browser-like test environment

### Testing Utilities

- reusable factories for test data generation
- shared render and hook testing helpers
- mocks for API behavior, uploads, dialogs, routing, and pagination
- centralized test setup and cleanup utilities
- accessibility and ARIA-focused testing helpers

### Coverage Scope

The testing stack supports:

- API modules, normalization helpers, and error handling
- business logic, hooks, state management, and query synchronization
- routing, protected access, and navigation flows
- page rendering and user interactions
- uploads, image lifecycle workflows, and responsive UI behavior
- accessibility, semantic structure, and ARIA-aware interactions

This architecture helps maintain reliable, accessible, and scalable frontend behavior as the application evolves.

---

## 📁 Test Folder Structure

The frontend test suite is organized into reusable helpers, factories, API tests, route tests, page interactions, and isolated business-logic tests.

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

The testing structure mirrors the frontend architecture and separates reusable testing utilities from API, feature, route, page, hook, and utility testing layers.

This organization improves:

- readability and maintainability
- reusable test setup and rendering utilities
- consistent business-logic validation
- scalable test coverage across frontend layers

---

## 🧪 Frontend Testing Layers

The frontend test suite combines API, route, hook, page, and business-logic testing.

Covered layers include:

- API modules, normalization helpers, and error handling
- business logic, reusable hooks, and state management
- authentication, routing, and protected access behavior
- page rendering, user interactions, and navigation flows
- filtering, pagination, query synchronization, and listing workflows
- uploads, image lifecycle handling, and validation behavior
- shared utilities, factories, mocks, and render helpers
- accessibility, semantic structure, and ARIA-aware interactions

The architecture separates business logic from UI rendering whenever possible, helping keep tests predictable, reusable, and maintainable.

---

## 🧩 Feature & Hook Testing

Feature and hook tests validate reusable business logic independently from full page rendering.

Covered areas include:

- authentication flows, validation, redirects, and token persistence
- event filtering, pagination, query synchronization, and status-aware behavior
- event validation, payload normalization, and datetime rules
- event reviews, ratings, pagination, and review statistics
- membership permissions, actions, and management workflows
- user profiles, dashboards, listings, and view synchronization
- uploads, image lifecycle workflows, and ownership-related safeguards
- reusable hooks, shared helpers, constants, and validation rules
- accessibility-focused form validation and interaction patterns

These tests help ensure reliable business logic while keeping feature workflows easier to maintain and evolve.

---

## 🔌 API Layer Testing

API tests validate the frontend API abstraction without performing real HTTP requests.

Covered areas include:

- centralized Axios client behavior
- JWT authorization header injection
- response unwrapping, pagination, and payload normalization
- API error normalization and reusable error handling
- authentication, event, review, membership, user, and permission requests
- multipart uploads and image lifecycle workflows

API calls are mocked to validate:

- endpoint paths and query parameters
- request payloads and returned data structures
- response normalization and error handling

---

## 🛣️ Route & Authentication Testing

Route tests validate routing, protected access behavior, and authentication-aware navigation flows.

Covered areas include:

- public and protected route rendering
- authentication initialization and loading states
- unauthenticated redirects and redirect restoration
- protected event access and permission workflows
- ownership-transfer and started-event restrictions
- public user profile routing

Route tests use mocked authentication state and router utilities to validate navigation behavior in isolation.

---

## 🧰 Utility Testing

Utility tests validate reusable helpers and shared normalization behavior.

Covered areas include:

- date, time, count, and text formatting
- uploaded file helpers, URL resolution, and fallback handling
- pagination, item merging, and listing normalization
- query synchronization, URL generation, and event status helpers

These tests help keep shared utilities stable, reusable, and predictable across the application.

---

## 🧱 Factories

Factories generate reusable and customizable frontend test data.

They reduce duplicated mock data and help keep tests consistent across the application.

Examples include:

- authenticated and public user factories
- authentication payload factories
- event, listing, and view factories
- membership and membership payload factories
- user event factories
- URL query parameter factories

Factories support scenario-specific overrides when customized test data is required.

Example:

```js
createEvent({
  id: 2,
  title: "Updated Event"
});
```

This approach improves readability, flexibility, and test maintainability.

---

## 🔧 Helpers

Reusable helpers simplify common test setup and interaction workflows.

Examples include:

- render helpers for providers, routing, and protected flows
- route and navigation helpers
- hook testing helpers
- mocks for API errors, uploads, dialogs, and paginated data
- centralized test setup utilities
- event listing and pagination helpers

Helpers keep tests focused on behavior and assertions instead of repetitive setup code while promoting consistency across API, route, page, hook, and feature tests.

---

## 🔁 Mocking Strategy

The frontend uses targeted mocking depending on the tested layer and required level of isolation.

### 🔌 API Tests

API tests mock the centralized API client to validate:

- endpoint paths and query parameters
- request payloads
- response unwrapping and payload normalization
- API error handling behavior

### 🧩 Feature & Hook Tests

Feature and hook tests mock external dependencies when necessary to isolate business logic.

Examples include:

- API modules and navigation helpers
- confirmation dialogs and hook callbacks
- uploads, image state transitions, dates, timers, and browser APIs

### 🛣️ Route & Context Tests

Route and context tests mock authentication state, API calls, and router behavior to isolate access control and protected navigation flows.

### 🧰 Utility Tests

Utility tests generally avoid heavy mocking unless testing:

- dates and timers
- uploaded file and image helpers
- browser-specific behavior
- URL and query parameter utilities

This strategy helps keep tests fast, focused, deterministic, and maintainable as the frontend evolves.

---

## ▶️ Running Tests

Run the full frontend test suite:

```bash
npm run test:run
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

Run all tests inside a specific folder:

```bash
npm test -- src/tests/features/events
```

Run a specific test file:

```bash
npm test -- src/tests/features/events/eventValidation.test.js
```

These commands help target specific testing layers during development, debugging, and feature work.

---

## 🎯 Testing Design Goals

The frontend testing architecture aims to provide:

- reliable business-logic validation
- predictable API abstraction, normalization, and error handling
- safe permission-aware and role-aware interactions
- reusable test data, mocks, and testing utilities
- isolated, deterministic, and maintainable tests
- clear separation between testing layers
- scalable frontend testing workflows
- accessible and semantically consistent UI behavior
- reliable validation of permissions, event-state restrictions, uploads, and datetime rules

These goals support long-term maintainability, safer feature development, and predictable frontend behavior.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- end-to-end testing for complete user journeys
- expanded accessibility and reusable component testing
- deeper coverage for role-aware event management workflows
- continued refinement of factories, mocks, render helpers, and testing utilities
- additional coverage for complex listing, filtering, pagination, and navigation flows
- continued testing architecture standardization and documentation improvements

---
