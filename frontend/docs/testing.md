# PlanTogether Frontend - Testing Strategy

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-136%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1363%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-96.49%25%20statements%20%7C%2093.01%25%20branches-brightgreen)

This document describes the frontend testing architecture and overall testing strategy used in the PlanTogether frontend.

The project uses **Vitest** and **React Testing Library** to validate isolated frontend business logic, reusable UI behavior, and complete user-facing application workflows.

The testing architecture focuses on:

- frontend reliability, maintainability, and long-term stability
- authentication, routing, and protected access workflows
- reusable business logic, query synchronization, and state management
- API abstraction, normalization, and frontend error handling
- accessibility, semantic structure, and responsive UI behavior
- reusable factories, mocks, helpers, and testing utilities
- isolated, predictable, and scalable testing workflows

---

## 🎯 Overview

The frontend testing architecture is designed to validate:

- authentication flows, protected access behavior, and route restoration
- API modules, response normalization, and frontend error handling
- frontend validation, reusable business logic, and shared utilities
- event, membership, and role-aware permission workflows
- filtering, pagination, listing behavior, and URL query synchronization
- location search, geolocation workflows, and interactive map behavior
- public and authenticated user workflows
- reusable hooks, page rendering, and state management behavior
- accessibility, semantic structure, ARIA behavior, and keyboard interactions
- responsive UI behavior and reusable component interactions
- event status synchronization, started-event restrictions, and datetime validation
- image upload, preservation, replacement, and removal workflows

The current frontend test suite includes:

- **136 passing test files**
- **1363 passing tests**
- **96.49% statement coverage**
- **93.01% branch coverage**
- **94.87% function coverage**
- **97.21% line coverage**

The combination of integration-style frontend testing, isolated business-logic testing, route testing, reusable UI testing, and shared utility testing helps ensure frontend reliability, accessibility consistency, predictable behavior, and scalable long-term frontend evolution.

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
- Reusable render and hook testing helpers for providers, routing, and protected flows
- Shared mocks for API behavior, uploads, dialogs, pagination, and routing
- Centralized test setup, cleanup, and frontend testing utilities
- Shared helpers for semantic structure, ARIA validation, and accessibility-focused assertions

### Coverage Scope

The testing stack is designed to support reliable frontend evolution and long-term maintainability across:

- API modules, request helpers, and normalization utilities
- reusable frontend business logic, hooks, state management, and query synchronization
- routing, protected access behavior, and navigation flows
- page-level rendering and interaction behavior
- reusable UI interaction patterns and responsive upload behavior
- semantic structure, accessibility-focused UI patterns, and ARIA-aware interactions

This testing architecture helps maintain predictable frontend behavior, reliable business-logic validation, accessibility consistency, and scalable long-term frontend maintainability.

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
- consistent frontend business-logic validation
- scalable and maintainable page, route, feature, and utility-level test coverage

---

## 🧪 Frontend Testing Layers

The frontend test suite combines API testing, route testing, reusable hook testing, page-level interaction testing, and isolated business-logic validation across the application.

Covered testing layers include:

- API modules, normalization helpers, and frontend error handling
- centralized frontend business logic and reusable hooks
- authentication context, routing, and protected access behavior
- page rendering, user interactions, and navigation flows
- query synchronization, listing architecture, and frontend state management
- upload workflows, image lifecycle handling, and validation behavior
- shared utilities, factories, mocks, and render helpers
- semantic structure, ARIA behavior, and accessibility-focused interactions

The testing architecture separates frontend business logic from rendering concerns whenever possible, helping keep tests predictable, scalable, reusable, and maintainable as the frontend architecture evolves.

---

## 🧩 Feature & Hook Testing

Feature and hook tests validate reusable frontend business logic, state management, and interaction behavior independently from full page rendering.

Covered areas include:

- authentication normalization, validation, redirect behavior, and token persistence
- event filtering, pagination, query synchronization, clean URL generation, view configuration, and status-aware listing behavior
- event validation, payload normalization, and contextual datetime validation
- started-event restrictions and permission-aware access behavior
- membership validation, permissions, actions, and management workflows
- authenticated and public user profiles, listings, pagination, filtering, normalization, and view synchronization
- reusable hooks, listing helpers, shared constants, and validation rules
- upload interactions, image preservation, replacement, removal, and lifecycle handling
- ownership transfer validation, account deletion safeguards, and ownership requirements
- accessible form validation behavior and accessibility-focused interaction flows

These tests help keep frontend business logic predictable, maintainable, and easier to evolve as frontend features and workflows grow.

---

## 🔌 API Layer Testing

API tests validate the frontend API abstraction without performing real HTTP requests.

Covered areas include:

- centralized Axios client behavior
- JWT authorization header injection
- paginated payload normalization and API response unwrapping
- API error normalization and reusable error handling
- authentication, event, membership, user, and access-permission API requests
- multipart upload requests and image lifecycle handling

API calls are mocked so tests can focus on:

- endpoint paths and URL query parameters
- request payloads and returned data structures
- response normalization and error-handling behavior

---

## 🛣️ Route & Authentication Testing

Route tests validate routing, protected access behavior, and authentication-aware navigation flows.

Covered areas include:

- application route registration
- public and protected route rendering
- unauthenticated redirects and redirect restoration behavior
- loading states during authentication initialization
- authentication context initialization and state management behavior
- protected event access, permission, and ownership-transfer workflows
- started-event deletion protection, edit restrictions, and datetime lock behavior
- public user profile page routing

Route tests use mocked authentication state and router utilities to validate navigation behavior in isolation.

---

## 🧰 Utility Testing

Utility tests validate reusable frontend helpers and shared normalization behavior.

Covered areas include:

- date, time, range, count, and text formatting
- uploaded file URL resolution, fallback handling, image lifecycle helpers, and accessibility behavior
- paginated fetching, item merging, and event listing normalization
- query synchronization, clean URL generation, and event status helpers

These tests help keep shared frontend helpers stable, reusable, and predictable across components, pages, hooks, and feature logic.

---

## 🧱 Factories

Factories generate reusable and customizable frontend test data.

They reduce duplicated mock data and help keep tests consistent across the frontend test suite.

Examples include:

- authenticated and public user factories
- authentication payload factories
- event, event payload, listing, and view factories
- membership and membership payload factories
- user event factories
- URL query parameter factories

Factories support scenario-specific overrides when tests require customized data.

Example pattern:

```js
createEvent({
    id: 2,
    title: "Updated Event"
});
```

This approach improves readability, reduces duplication, and helps keep frontend tests maintainable as the application evolves.

---

## 🔧 Helpers

Reusable helpers simplify common frontend test setup and interaction behavior.

Examples include:

- render helpers for providers, routing, and protected flows
- reusable route and navigation helpers
- hook testing helpers
- mock helpers for API errors, uploads, dialogs, and paginated data
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
- uploads, image state transitions, dates, timers, and browser APIs

### 🛣️ Route & Context Tests

Route and context tests mock authentication state, API calls, and router behavior to isolate frontend access control and protected navigation flows.

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

These commands help target specific frontend testing layers during development, debugging, feature implementation, and maintenance workflows.

---

## 🎯 Testing Design Goals

The frontend testing architecture aims to provide:

- reliable frontend business-logic validation
- predictable API abstraction, normalization, and error-handling behavior
- safe role-aware and permission-aware interactions
- reusable test data, mocks, and setup utilities
- reduced duplicated test setup and payload generation
- isolated and deterministic test behavior
- clear separation between testing layers
- scalable and maintainable frontend testing workflows
- consistent semantic structure and accessibility-focused UI behavior
- reliable validation of event status, permissions, started-event restrictions, image lifecycle workflows, and datetime rules

These goals support long-term frontend maintainability, safer feature development, predictable UI behavior, and scalable frontend architecture evolution.

---

## 🔮 Future Improvements

Potential future testing improvements include:

- additional end-to-end testing for complete user journeys
- expanded reusable UI component and accessibility-focused testing
- expanded interaction testing for role-aware event management flows
- further refinement of reusable factories, mocks, render helpers, providers, and testing utilities
- deeper coverage for advanced listing edge cases and navigation flows
- continued frontend testing architecture improvements and standardization

---
