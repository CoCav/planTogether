# PlanTogether Frontend - Testing Strategy

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-128%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1218%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-97.89%25%20statements%20%7C%2095.07%25%20branches-brightgreen)

This document describes the frontend testing architecture and overall testing strategy used in the PlanTogether frontend.

The project uses **Vitest** and **React Testing Library** to validate isolated frontend business logic, reusable UI behavior, and complete user-facing application workflows.

The testing architecture focuses on:

- frontend reliability and long-term maintainability
- reusable frontend interaction logic and query synchronization
- routing, authentication, and frontend access guard validation
- filtering, pagination, listing, and state synchronization behavior
- reusable factories, mocks, helpers, and render utilities
- API abstraction and normalization consistency
- semantic structure, ARIA behavior, and accessibility-focused UI interactions
- isolated and predictable frontend test flows
- scalable and maintainable frontend testing workflows

---

## 🎯 Overview

The frontend testing architecture is designed to validate:

- authentication flows, protected access behavior, and route synchronization
- API request helpers, response normalization, and frontend error handling
- frontend validation behavior and reusable business logic
- event filtering, pagination, listing behavior, and URL query synchronization
- event workflows, membership workflows, and role-aware frontend permissions
- public and authenticated user workflows, including public profile and event listing behavior
- reusable hooks, frontend state management, and shared utilities
- page rendering, routing behavior, and navigation flows
- reusable factories, mocks, render helpers, and testing utilities
- semantic structure, ARIA behavior, accessibility-focused interactions, and accessible navigation patterns
- responsive component behavior and reusable UI interaction patterns
- event status synchronization, status-aware UI behavior, and status badge rendering
- event image preservation, replacement, removal, and metadata handling
- started-event editing restrictions and contextual datetime validation behavior

The current frontend test suite includes:

- **128 passing test files**
- **1218 passing tests**
- **97.89% statement coverage**
- **95.07% branch coverage**
- **95.03% function coverage**
- **98.12% line coverage**

The combination of integration-style frontend testing, isolated business logic testing, route testing, reusable UI testing, and shared utility testing helps ensure frontend reliability, accessibility consistency, predictable behavior, and scalable long-term frontend development.

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
- Shared helpers for semantic structure, ARIA validation, and accessibility-oriented assertions

### Coverage Scope

The testing stack is designed to support reliable frontend evolution and long-term maintainability across:

- API modules, request helpers, and normalization utilities
- reusable frontend business logic and query synchronization
- routing, protected access behavior, and navigation flows
- reusable hooks and frontend state management
- page-level rendering and interaction behavior
- reusable UI interaction patterns and responsive upload behavior
- semantic structure, accessibility-focused UI patterns, and ARIA-aware interactions

This testing architecture helps maintain predictable frontend behavior, isolated business logic validation, reusable testing workflows, accessibility consistency, and scalable long-term frontend maintainability.

---

## 📁 Test Folder Structure

The frontend test suite is organized into reusable helpers, factories, API tests, route tests, page interaction tests, and isolated frontend business-logic tests.

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

The testing structure mirrors the frontend architecture and separates reusable testing utilities from feature, hook, page, route, API, context, and utility testing layers.

This organization improves:

- readability and long-term maintainability
- reusable test setup, rendering, and interaction behavior
- consistent frontend business logic validation
- scalable page, route, and feature-level test coverage
- maintainable and reusable frontend testing workflows

---

## 🧪 Frontend Testing Layers

The frontend test suite combines isolated business logic validation, reusable hook testing, route testing, API testing, and page-level interaction testing across the application.

Covered testing layers include:

- API modules and normalization helpers
- centralized frontend business logic
- reusable hooks and frontend state management
- authentication context behavior
- protected routes, routing flows, and navigation behavior
- page rendering and interaction behavior
- query synchronization and listing architecture
- upload interactions, image lifecycle handling, and validation behavior
- shared frontend utilities, factories, mocks, and render helpers
- semantic structure, ARIA behavior, and accessibility-focused interaction testing

The testing architecture separates frontend business logic from rendering concerns whenever possible, helping keep tests predictable, scalable, reusable, and maintainable as the frontend architecture evolves.

---

## 🧩 Feature & Hook Testing

Feature and hook tests validate reusable frontend behavior independently from full page rendering.

Covered areas include:

- authentication normalization, validation, redirect behavior, and token persistence
- event filtering, pagination, listing state management, and URL query synchronization
- event view configuration, status handling, and status badge behavior
- event validation, payload normalization, and contextual datetime validation
- started-event editing restrictions and frontend access behavior
- membership validation, permissions, actions, and management workflows
- authenticated and public user event filters, views, normalizers, and listing behavior
- public user profile loading, normalization, pagination, and view synchronization
- clean URL generation across event listing pages
- reusable listing helpers, shared constants, upload rules, and password rules
- upload interactions, image preservation, replacement, removal, and lifecycle handling
- ownership transfer validation, account deletion safeguards, and ownership requirements
- accessible form validation behavior and accessibility-focused interaction flows
- pagination hooks, query synchronization hooks, and reusable frontend state management

These tests help keep frontend business logic predictable, scalable, maintainable, and easier to evolve over time.

---

## 🔌 API Layer Testing

API tests validate the frontend API abstraction without performing real HTTP requests.

Covered areas include:

- centralized Axios client behavior
- JWT authorization header injection
- paginated payload normalization and API response unwrapping
- API error normalization and reusable error handling
- frontend access and permission endpoints
- multipart upload requests and image lifecycle handling
- authentication, event, membership, and user API requests

API calls are mocked so tests can focus on:

- endpoint paths
- request payloads
- URL query parameters
- returned payload structures
- response normalization and error handling behavior

---

## 🛣️ Route & Authentication Testing

Route tests validate routing, protected access behavior, and authentication-aware navigation flows.

Covered areas include:

- application route registration
- public and protected route rendering
- unauthenticated redirects and redirect restoration behavior
- loading states during authentication initialization
- authenticated context behavior
- protected event edit access and permission flows
- started-event deletion protection and edit restrictions
- started-event start datetime lock behavior
- protected ownership transfer workflows
- public user profile page routing

Route tests use mocked authentication state and router utilities to validate navigation behavior in isolation.

---

## 🧰 Utility Testing

Utility tests validate reusable frontend helpers and shared normalization behavior.

Covered areas include:

- date, time, range, count, and text formatting
- uploaded file URL resolution and fallback handling
- avatar and event image lifecycle helpers
- accessible uploaded file and fallback behavior
- paginated fetching and item merging
- query parameter synchronization helpers
- event listing normalization helpers
- event status helpers and clean URL generation

These tests help keep shared frontend helpers stable, reusable, and predictable across components, pages, hooks, and feature logic.

---

## 🧱 Factories

Factories generate reusable and customizable frontend test data.

They reduce duplicated mock data and help keep tests consistent across the frontend test suite.

Examples include:

- authenticated and public user factories
- authentication payload factories
- event and event payload factories
- event listing and view factories
- membership and membership payload factories
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

This approach improves readability, reduces duplication, and helps keep large frontend architecture changes easier to maintain over time.

---

## 🔧 Helpers

Reusable helpers simplify common frontend test setup and interaction behavior.

Examples include:

- render helpers for providers, routing, and protected flows
- reusable route and navigation helpers
- hook testing helpers
- mock API error helpers
- mock file and uploaded file URL helpers
- mock paginated fetch helpers
- mock confirmation dialog helpers
- centralized frontend test setup utilities
- reusable event listing test helpers

Helpers keep tests focused on behavior and assertions instead of repetitive setup logic.

They also improve consistency across feature, hook, route, API, page, and utility testing layers.

---

## 🔁 Mocking Strategy

The frontend uses targeted mocking depending on the tested layer and the level of isolation required.

### 🔌 API Tests

API tests mock the centralized API client to validate:

- endpoint paths
- request payloads and URL query parameters
- response unwrapping and normalized payload handling
- API error handling behavior

### 🧩 Feature & Hook Tests

Feature and hook tests mock external dependencies when necessary to isolate frontend business logic.

Examples include:

- API modules and navigation helpers
- confirmation dialogs and hook callbacks
- upload files and uploaded image state transitions
- dates, timers, and browser APIs

### 🛣️ Route & Context Tests

Route and context tests mock authentication state, API calls, and router behavior to isolate frontend access control, protected navigation, and routing behavior.

### 🧰 Utility Tests

Utility tests generally avoid heavy mocking unless testing:

- dates and timers
- uploaded files and image helpers
- browser-specific behavior
- URL and query parameter utilities

This strategy helps keep tests fast, focused, deterministic, and maintainable as the frontend architecture evolves over time.

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

These commands help target specific frontend testing layers during development, debugging, feature implementation, and maintenance workflows.

---

## 🎯 Testing Design Goals

The frontend testing architecture aims to provide:

- reliable frontend business logic validation
- predictable API abstraction and normalization behavior
- safe role-aware and permission-aware interactions
- reusable test data, mocks, and setup utilities
- reduced duplicated test setup and payload generation
- isolated and deterministic test behavior
- clear separation between testing layers
- scalable and maintainable frontend testing workflows
- consistent semantic structure and accessibility-focused UI behavior
- reliable event status, permission, and started-event restriction validation
- reliable event image lifecycle handling
- reliable create/edit datetime validation behavior

These goals support long-term frontend maintainability, safer feature development, predictable UI behavior, and scalable frontend architecture evolution.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing for complete user journeys
- expanded reusable UI component and accessibility-focused testing
- expanded interaction testing for role-aware event management flows
- further refinement of reusable factories, mocks, helpers, and render utilities
- improved reusable test providers and render helper architecture
- deeper coverage for advanced listing edge cases and navigation flows
- continued frontend testing architecture improvements and standardization

---
