# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, join, and manage events with role-based permissions.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Tests](https://img.shields.io/badge/tests-357%20passing%20%28safe--scope%29-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-in%20progress-lightgrey)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React, Vite, and Axios**.

It provides a modern, responsive, and user-focused interface for interacting with the PlanTogether platform and backend API.

> **Frontend refactor in progress:** the feature, API, hook, route, context, and utility layers have been refactored and stabilized with reusable test helpers and factories. Legacy page and component tests are progressively being updated during the UI refactor.

The frontend focuses on usability, role-based interactions, scalability, and long-term maintainability across all core features.

---

## 🎯 Application Overview

The frontend provides a complete interface for interacting with the PlanTogether platform.

It allows users to:

- Authenticate securely using JWT
- Browse, search, filter, and manage events
- Join and leave events
- Manage roles within events (`organizer`, `co_organizer`, `participant`)
- Update their profile and password
- Upload and manage avatars and event images
- Manage session behavior with a "Remember me" feature
- Access a personal dashboard for created and joined events

The application is designed to provide a smooth and intuitive user experience, with clear navigation, responsive interactions, and role-based UI behavior across all core features.

---

## 🔧 Tech Stack

The frontend is built using modern and efficient tools to ensure performance, scalability, maintainability, and long-term reliability.

### Core Technologies

- **React** – component-based UI library
- **Vite** – fast development server and build tool
- **React Router** – client-side routing and navigation
- **Axios** – HTTP client for API communication

### State & Business Logic

- **Context API** – global authentication state management
- **Custom hooks** – reusable frontend state and business behavior
- **Session / Local Storage** – token persistence and session handling

### UI & User Experience

- **Drag and drop interactions** – avatar and event image uploads
- **FormData handling** – image upload and API integration
- **Responsive UI components** – reusable and consistent design patterns
- **Role-based UI rendering** – contextual actions and permissions

### Testing

- **Vitest** – unit and integration testing
- **React Testing Library** – user interaction and UI behavior testing

---

## 📁 Frontend Structure

The frontend follows a modular, feature-oriented architecture focused on scalability, maintainability, testability, and long-term reliability.

The codebase separates API communication, frontend business logic, routing, UI layers, and reusable testing utilities into dedicated domains.

```txt
frontend
│
├── docs/
│   └── testing.md
│
├── src/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── eventMemberships/
│   │   ├── users/
│   │   ├── apiClient.js
│   │   ├── apiError.js
│   │   └── apiResponse.js
│   │
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── context/
│   │   └── auth/
│   │       ├── AuthContext.jsx
│   │       └── AuthProvider.jsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── eventMemberships/
│   │   ├── users/
│   │   │   ├── authenticated/
│   │   │   └── public/
│   │   └── shared/
│   │
│   ├── hooks/
│   │   └── usePagination.js
│   │
│   ├── pages/
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── styles/
│   │
│   ├── tests/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── factories/
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── eventMemberships/
│   │   │   ├── shared/
│   │   │   └── users/
│   │   │       ├── authenticated/
│   │   │       └── public/
│   │   ├── features/
│   │   ├── helpers/
│   │   │   ├── hooks/
│   │   │   ├── mocks/
│   │   │   └── render/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── setup/
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── pagination.js
│   │   └── uploadedFile.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── index.html
└── README.md
```

### 🧩 Architecture Notes

- **Features** centralize domain-specific business logic, validation, filtering, query synchronization, permissions, and payload normalization
- **Hooks** encapsulate reusable frontend state and business behavior
- **API modules** isolate HTTP communication, request handling, and response normalization
- **Tests** use reusable factories, mocks, helpers, and render utilities to reduce duplication and improve maintainability
- **Shared utilities** centralize formatting, pagination, uploaded file handling, and reusable frontend helpers
- **Frontend testing architecture** is progressively being standardized during the frontend refactor

This architecture improves maintainability, scalability, consistency, and long-term frontend reliability.

---

## ✨ Features

### 🔐 Authentication

- Login and registration
- JWT-based authentication
- Protected route access
- Redirect users to the originally requested page after login
- Persist sessions with a "Remember me" feature

### 👤 User Profile

- View profile information
- Update name and email
- Change password with frontend validation
- Upload and update user avatars
- Preview avatars before upload
- Automatically refresh the UI after profile updates
- Display clear and contextual error feedback

### 📅 Event Management

- Browse all public events
- Create events
- Edit events
- Delete events
- Upload and update event images
- Preview images before upload

Additional capabilities:

- Validation aligned with backend business rules
- Date and time validation
- Dynamic UI behavior based on event state and permissions
- Role-aware event actions and permission handling

Frontend validation includes:

- Preventing past start dates
- Ensuring end dates occur after start dates
- Validating uploaded image types and sizes

### 👥 My Events

- View created events
- View joined events
- Leave events directly from the interface
- Filter events by active views (`created`, `joined`, history)

### 🔍 Event Filtering

Users can filter events using:

- Keyword search
- Creator search
- Type
- Theme
- Location
- Exact date
- Date range

#### Filtering Behavior

- Selecting an exact date disables date range inputs
- Multiple filters can be combined
- Resetting filters reloads all events
- Filters, pagination, and active views are synchronized with the URL

### 🧭 Navigation & State Management

- URL-synchronized filters, pagination, and active views
- Persistent UI state across refresh and navigation
- Config-driven event views (`All`, `Upcoming`, `Archives`, etc.)

### 🎭 Role System

Authenticated users can have different permissions within events:

```txt
organizer
co_organizer
participant
```

#### Organizer

- Edit events
- Delete events
- Promote participants
- Demote co-organizers
- Remove participants and co-organizers
- Transfer event ownership

#### Co-organizer

- Edit events
- Remove participants

#### Participant

- Join events
- Leave events

### 🌐 Public Access

Unauthenticated visitors can:

- Browse public event information
- Access public user profiles
- Receive login prompts for protected actions

The UI dynamically adapts based on the user's permissions and authentication state.

### 📄 User Experience

- Contextual empty states based on filters and active views
- Loading states for asynchronous operations
- Responsive layouts and reusable UI components
- Consistent UI behavior across pages and features

---

## 🔌 Frontend API Layer

The frontend uses a centralized API architecture built on top of **Axios** to ensure consistency, scalability, and maintainable API communication across the application.

The API base URL is configured through environment variables:

```env
VITE_API_URL=http://localhost:3000/api
```

### 📦 API Structure

```txt
api/
├── auth/
├── events/
├── eventMemberships/
├── users/
├── apiClient.js
├── apiError.js
└── apiResponse.js
```

### 🧩 API Responsibilities

The frontend API layer centralizes:

- authenticated API requests
- JWT token injection
- multipart uploads for avatars and event images
- API response normalization
- frontend-friendly error handling
- reusable paginated payload extraction

### ⚙️ Core API Utilities

#### `apiClient.js`

Centralized Axios configuration used across the application.

Handles:

- base API URL configuration
- authorization header injection
- authenticated request behavior
- shared request configuration

#### `apiError.js`

Reusable API error normalization helpers.

Handles:

- Axios error normalization
- validation error extraction
- fallback error handling
- consistent frontend error objects

#### `apiResponse.js`

Reusable API response extraction helpers.

Handles:

- response unwrapping
- payload extraction
- paginated payload normalization
- reusable frontend response formatting

### 📌 API Architecture Notes

- JWT tokens are automatically attached to authenticated requests
- API responses are normalized before being consumed by the UI
- Errors are standardized through reusable helpers
- Upload requests support `FormData`
- Feature-based API modules improve scalability and maintainability

This architecture improves consistency, maintainability, scalability, and long-term frontend reliability.

---

## 🧠 Frontend Logic Layer

The frontend business logic is organized using a modular, feature-oriented architecture designed for scalability, reuse, and maintainability.

### 📦 Feature Structure

```txt
features/
├── auth/
├── events/
├── eventMemberships/
├── users/
│   ├── authenticated/
│   └── public/
└── shared/
```

### 🧩 Logic Responsibilities

The feature layer centralizes reusable frontend logic such as:

- frontend validation
- event filtering and query synchronization
- payload normalization
- role-based permissions
- event view configuration
- empty state management
- pagination synchronization
- membership interaction behavior

### 🔐 Authentication Logic

The authentication layer handles:

- login and registration flows
- token persistence
- protected frontend access
- authentication state management
- redirect behavior after login

### 📅 Event Logic

The event layer handles:

- event filtering
- sorting and pagination
- query parameter synchronization
- event validation
- event payload normalization
- dynamic event state behavior

### 👥 Membership Logic

The membership layer handles:

- joining and leaving events
- role-based permissions
- protected membership actions
- organizer/co_organizer restrictions
- confirmation flows for sensitive actions

### 👤 User Logic

The user layer separates:

- authenticated user behavior
- public user behavior
- profile normalization
- event dashboard logic
- contextual empty states

### 🔁 Shared Frontend Utilities

Shared frontend logic includes:

- reusable hooks
- formatting utilities
- uploaded file helpers
- pagination helpers
- reusable constants and configs

### 📌 Frontend Logic Notes

- Business logic is separated from UI rendering whenever possible
- Query synchronization is centralized through reusable helpers
- Payload normalization improves frontend consistency
- Shared utilities reduce duplicated logic
- Feature isolation improves long-term maintainability

---

## 🧪 Testing

The frontend includes a progressively standardized automated test suite built with **Vitest** and **React Testing Library**.

The current refactored test scope focuses on frontend business logic, routing, hooks, API layers, utilities, and reusable feature behavior.

### ▶️ Run Tests

```bash
npm run test:run
```

### ▶️ Run Tests with Coverage

```bash
npx vitest run --coverage
```

### ▶️ Run Current Safe Test Scope

```bash
npm test -- src/tests/features src/tests/hooks src/tests/context src/tests/routes src/tests/api src/tests/utils
```

This command is currently used while legacy page and component tests are being progressively refactored during the frontend UI rewrite.

### 📊 Current Safe-Scope Results

- 55 safe test suites
- 357 safe-scope tests
- ✅ Passing for refactored layers

> The current safe test scope intentionally excludes legacy page and component tests until the frontend UI refactor is complete.

### 📦 Current Refactored Test Scope

The current refactored scope includes:

- API modules and normalization helpers
- frontend business logic and feature utilities
- authentication and protected routing
- reusable hooks and query synchronization
- pagination and formatting utilities
- uploaded file helpers
- reusable factories, mocks, and render helpers

### 🔁 Testing Strategy

- Tests simulate realistic frontend behavior using `React Testing Library`
- API calls are mocked to isolate frontend logic
- Routing behavior is tested through the application router
- Authentication and protected access flows are validated
- Critical frontend logic is tested in isolation
- Reusable factories and helpers reduce duplicated test setup

For more details about the frontend testing architecture, reusable factories, mocks, helpers, and safe-scope testing strategy, see [`docs/testing.md`](./docs/testing.md).

---

## ⚙️ Environment Variables

The frontend relies on environment variables to configure API communication and runtime behavior.

Create a `.env` file at the root of the project and define the following variable:

```env
VITE_API_URL=http://localhost:3000/api
```

### 🔍 Notes

- `VITE_API_URL` → base URL of the backend API
- This value must match the backend server URL
- Used by the centralized Axios client for all API requests

👉 A `.env.example` file can be used as a reference configuration.

---

## ▶️ Running the App

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application will be available at:

`http://localhost:5173` (default Vite port)

---

## 🚀 Recent Improvements

### 🔧 Frontend Features & UX

Recent frontend improvements include:

- Avatar and event image upload UI with preview and drag-and-drop support
- URL-synchronized filters, pagination, and active views
- Creator-based search and advanced event filtering
- Config-driven event views for improved scalability
- Improved loading states and contextual empty states

### 🔌 Frontend Architecture

Recent frontend architecture improvements include:

- Refactored centralized API layer and normalization helpers
- Standardized feature-oriented frontend architecture
- Better separation between UI rendering and frontend business logic
- Shared reusable frontend utilities and helpers
- Improved authentication and protected route handling

### 🧪 Frontend Testing

Recent testing improvements include:

- Expanded frontend test coverage using **Vitest** and **React Testing Library**
- Refactored feature, hook, context, route, API, and utility tests
- Added reusable factories, mocks, and render helpers
- Introduced reusable upload, pagination, and query parameter test helpers
- Added a progressive safe-scope testing strategy during the frontend refactor
- Added dedicated frontend testing documentation under `docs/testing.md`

---

## 📌 Project Status

| Area | Status |
|---|---|
| Frontend UI / Pages | 🚧 Refactor in progress |
| Reusable Components | 🚧 Refactor in progress |
| Frontend Business Logic | ✅ Refactored and tested |
| Routing & Protected Access | ✅ Refactored and tested |
| API Communication Layer | ✅ Refactored and tested |
| File Upload System | ✅ Avatars & event images supported |
| Frontend Testing | 🚧 357 safe-scope tests passing |
| UX Improvements | 🚧 Ongoing |

### 📍 Current Frontend Refactor Focus

The frontend refactor currently focuses on:

- modernizing pages and reusable UI components
- improving frontend consistency and maintainability
- stabilizing feature-oriented frontend architecture
- expanding reusable frontend testing utilities
- progressively restoring full frontend test coverage

---

## 🔮 Future Improvements

### 🚀 Frontend Features & UX

Planned frontend improvements include:

- Notifications and reminder features
- Improved mobile responsiveness across devices
- Accessibility improvements (`ARIA`, labels, semantic structure)
- Enhanced UI feedback (toasts, async feedback, contextual states)
- Expanded role-aware event management interactions
- Improved dashboard and event management flows

### 🧪 Frontend Testing

Planned testing improvements include:

- Restoring full page and component test coverage
- Extending tests to lower-level reusable UI components
- Adding end-to-end (E2E) testing for complete user journeys
- Expanding frontend testing documentation and conventions

---
