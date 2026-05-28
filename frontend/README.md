# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, discover, join, and manage events through a role-aware frontend interface.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-123%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1106%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-97.64%25%20statements%20%7C%2094.51%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React, Vite, Axios, and React Router**.

It provides a responsive, accessibility-focused, and role-aware interface for interacting with the PlanTogether backend API.

The frontend architecture emphasizes:

- feature-oriented architecture
- reusable hooks and reusable frontend patterns
- centralized API communication
- protected routing and authentication flows
- role-aware UI permissions and frontend access guards
- reusable filtering, listing, and query synchronization helpers
- comprehensive automated testing with Vitest and React Testing Library

The frontend focuses on scalable architecture, domain-driven frontend behavior, accessibility-focused UI patterns, maintainable testing workflows, and long-term reliability.

---

## 🎯 Application Overview

The frontend provides a complete interface for interacting with the PlanTogether platform.

It allows users to:

- Authenticate securely using JWT
- Browse, search, filter, and manage events across ongoing, upcoming, all, and archived views
- Join and leave events
- Interact with role-aware event actions (`organizer`, `co_organizer`, `participant`)
- Create, edit, and delete events
- Event status-aware actions and restrictions
- Started-event deletion protection aligned with backend authorization rules
- Manage profile information and passwords
- Upload avatars and event images
- Persist authenticated sessions with a "Remember me" feature
- Access personalized dashboards for created and joined events
- Navigate through protected frontend routes and access guards

The application is designed around reusable frontend workflows, centralized state and query synchronization, protected routing, and consistent role-aware user interactions across core features.

---

## 🔧 Tech Stack

The frontend is built using modern and efficient tools to ensure performance, scalability, maintainability, and long-term reliability.

### Core Technologies

- **React** – component-based UI library
- **Vite** – fast development server and build tool
- **React Router** – client-side routing and navigation
- **Axios** – HTTP client for API communication

### State & Business Logic

- **Feature-oriented architecture** – domain-based frontend organization
- **Context API** – global authentication state management
- **Custom hooks** – reusable hooks and centralized feature logic
- **Query synchronization** – reusable URL-driven filtering and pagination behavior
- **Session Storage / Local Storage** – token persistence and session handling
- **Shared utilities and configs** – reusable shared frontend utilities

### UI & User Experience

- **Responsive UI components** – reusable and consistent design patterns
- **Role-aware conditional rendering** – contextual actions and permissions
- **Frontend access guards** – protected UI flows synchronized with backend permissions
- **Drag-and-drop file uploads** – avatar and event image uploads
- **FormData-based upload flows** – image upload and API integration
- **URL-synchronized filtering and pagination** – filters, pages, and active views reflected in the browser URL
- **Contextual loading, error, and empty states** – clear UI feedback during async loading and empty results

### Testing

- **Vitest** – unit and integration testing
- **React Testing Library** – user interaction and UI behavior testing
- **Reusable factories, mocks, and render helpers** – maintainable frontend testing architecture

---

## 📁 Frontend Structure

The frontend follows a modular, feature-oriented architecture designed to improve frontend consistency, maintainability, scalability, and testability.

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
│   │   ├── auth/
│   │   ├── events/
│   │   ├── eventMemberships/
│   │   ├── users/
│   │   ├── layout/
│   │   └── ui/
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
│   │   ├── useClickOutside.js
│   │   ├── useFileUploadPreview.js
│   │   └── usePagination.js
│   │
│   ├── pages/
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── styles/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layout.css
│   │   ├── reset.css
│   │   └── theme.css
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
│   │   ├── setup/
│   │   └── App.test.jsx
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

- **API modules** isolate HTTP communication, authenticated requests, upload payloads, response normalization, and error extraction.

- **Context** stores global application state, currently focused on authentication and session restoration.

- **Components** focus on reusable UI rendering and are grouped by domain (`auth`, `events`, `eventMemberships`, `users`) or shared responsibility (`layout`, `ui`).

- **Pages** compose API calls, feature hooks, and reusable components into complete user-facing views.

- **Features** centralize domain-specific frontend business logic, validation, filtering, query synchronization, permissions, normalization helpers, payload builders, and reusable listing behavior.

- **User features** are split between `authenticated/` and `public/` flows to isolate current-user dashboards from public profile and public event pages.

- **Global hooks** in `hooks/` are reusable cross-feature utilities such as pagination, click-outside handling, and file upload previews.

- **Feature hooks** remain colocated inside their respective feature folders when they depend on domain-specific business logic.

- **Routes** centralize public and protected route definitions, authentication redirects, and frontend access guards.

- **Styles** are separated into global styles, layout styles, page styles, and component styles to improve maintainability and UI consistency.

- **Tests** mirror the frontend architecture with reusable factories, mocks, render helpers, and domain-based test organization.

This architecture separates UI rendering, frontend behavior, routing, API communication, styling, and testing concerns into clear and maintainable frontend domains.

The frontend also emphasizes semantic structure, reusable accessible UI patterns, and consistent accessibility-focused component behavior.

---

## ✨ Features

### 🔐 Authentication

- Login and registration
- JWT-based authentication
- Protected frontend routes
- Session restoration after refresh
- Persistent authenticated sessions with a "Remember me" feature
- Redirect users back to protected routes after login
- Automatic authenticated user restoration on application load
- Automatic navbar refresh after authentication changes
- Local storage and session storage token handling
- Reusable authentication form architecture
- Centralized authentication validation behavior
- Shared form state handling across login and registration flows

### 👤 User Profile

- View and update profile information
- Change passwords with validation
- Upload and preview avatars
- Drag-and-drop avatar upload support
- Reusable profile form architecture
- Shared validation and upload handling behavior
- Automatic authenticated user refresh after updates
- Contextual validation and error feedback

### 📅 Event Management

- Browse all public events
- View events across ongoing, upcoming, all, and archived views
- Create, edit, and delete events
- Upload and preview event images
- URL-synchronized event filtering
- Shared listing behavior with private event pages
- Reusable event form state and validation handling
- Filter events by active views (`ongoing`, `upcoming`, `all`, `archives`)

Frontend behavior includes:

- Validation aligned with backend business rules
- Role-aware UI actions and frontend access behavior based on event state and permissions
- Event status awareness (`upcoming`, `ongoing`, `ended`)
- Status badge display across event listings and event details
- Hiding restricted actions when events have already started
- Preventing past start dates
- Ensuring end dates occur after start dates
- Validating uploaded image types and sizes
- Event image preservation when editing without image changes
- Event image replacement and removal support

### 👥 Event Memberships

- Join and leave events
- Promote participants
- Demote co-organizers
- Remove members
- Transfer event ownership
- Role-aware membership actions
- Membership permission and access helpers

### 📂 My Events Dashboard

- View created events
- View created event history
- View joined events
- View joined event history
- Leave events directly from the interface
- Filter events by active views (`created`, `created history`, `joined`, `joined history`)
- Shared listing behavior with public event pages

The dashboard uses:

- shared listing query helpers
- reusable event listing hooks
- reusable event normalization helpers
- centralized listing state management

### 🔍 Event Filtering

Users can filter events using:

- keyword search
- creator search
- event type
- theme
- location
- exact date
- date ranges
- sorting options
- pagination

Filtering behavior includes:

- synchronized URL query parameters
- persistent navigation state
- dynamic filter resets
- centralized query parameter handling
- view-aware filter synchronization

#### 🔍 Filtering Behavior

- Selecting an exact date disables date range inputs
- Multiple filters can be combined
- Resetting filters reloads all events
- Filters, pagination, and active views are synchronized with the URL

### 🧭 Navigation & State Management

- URL-synchronized filters, pagination, and active views
- Persistent UI state across refresh and navigation
- Config-driven event views (`Ongoing`, `Upcoming`, `All`, `Archives` / `Created`, `Created History`, `Joined`, `Joined History`)
- Shared view configuration architecture
- Reusable query parameter synchronization helpers

### 🎭 Role System

Authenticated users can have different permissions within events:

```txt
organizer
co_organizer
participant
```

#### Organizer

- Edit events
- Delete events before they start
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
- Access public event and user profile pages
- Receive login prompts for protected actions

The UI dynamically adapts based on the user's permissions and authentication state.

### 📄 User Experience

- Contextual empty states based on filters and active views
- Loading states for asynchronous operations
- Responsive and consistent UI behavior across pages and features
- Semantic HTML structure and accessibility-focused UI patterns
- Accessible forms, validation feedback, and ARIA support
- Keyboard-friendly navigation and interactive behaviors

---

## 🛡️ Routing & Access Control

The frontend centralizes routing, protected navigation, authentication persistence, and permission-aware access behavior through dedicated routing and frontend guard logic.

### 🔐 Protected Routing

Protected frontend routes are handled through:

```txt
AppRouter.jsx
ProtectedRoute.jsx
```

Authenticated-only pages include:

- event creation
- event editing
- profile management
- personalized event dashboards
- membership management actions

Unauthenticated users attempting to access protected pages are redirected to the login page.

### 🔄 Authentication Persistence

The frontend supports persistent authenticated sessions through:

- JWT token storage
- session restoration after refresh
- persistent login behavior through the "Remember me" feature
- automatic authenticated user restoration on application load

Authentication state is centralized through:

```txt
AuthContext.jsx
AuthProvider.jsx
```

### ↩️ Redirect Restoration

The routing layer preserves intended navigation during authentication flows.

Examples include:

- redirecting users back to protected pages after login
- restoring navigation after successful authentication
- preserving route state during protected access redirects

### 🔒 Frontend Access Guards

The frontend uses centralized event access checks to:

- prevent unauthorized users from accessing edit pages
- conditionally render edit and delete actions
- hide deletion actions for events that have already started
- synchronize frontend permissions with backend authorization rules
- preserve consistent role-aware UI behavior

Frontend event edit access is synchronized through:

```http
GET /events/:eventId/me
```

This endpoint allows the frontend to retrieve:

- current membership role
- event status
- edit permissions
- delete permissions
- started-event restrictions

These frontend guards improve UX consistency while keeping the backend as the source of truth for protected actions and authorization rules.

---

## 🔌 Frontend API Layer

The frontend uses a centralized API architecture built on top of **Axios**.

The API base URL is configured through environment variables:

```env
VITE_API_URL=http://localhost:3000/api
```

### 📦 API Responsibilities

The frontend API layer centralizes:

- authenticated API requests
- JWT token injection
- multipart uploads with `FormData`
- API response normalization
- reusable error extraction helpers
- paginated payload handling
- centralized request configuration
- frontend access and permission requests

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
- Upload requests support `FormData` with image preservation, replacement, and removal flows
- API responses are normalized before being consumed by the UI
- Errors are standardized through reusable helpers
- Frontend access guards are synchronized through dedicated event access endpoints
- Shared API helpers reduce duplicated request and response handling across features

---

## 🧠 Frontend Logic Layer

The frontend business logic is organized using reusable feature-oriented modules designed to separate UI rendering from frontend behavior and state management.

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

The feature layer centralizes reusable domain logic such as:

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
- authenticated session restoration

### 📅 Event Logic

The event layer handles:

- event filtering
- sorting and pagination
- query parameter synchronization
- reusable listing behavior
- event validation
- event payload normalization
- dynamic event status behavior
- ongoing event handling
- started-event restriction handling
- event image lifecycle handling

### 👥 Membership Logic

The membership layer handles:

- joining and leaving events
- role-based permissions
- protected membership actions
- organizer/co_organizer restrictions
- confirmation flows for sensitive actions
- reusable membership permission helpers

### 👤 User Logic

The user layer separates:

- authenticated user behavior
- public user behavior
- profile normalization
- event dashboard logic
- contextual empty states
- personalized event listing behavior

### 🔁 Shared Frontend Utilities

Shared frontend utilities include:

- reusable cross-feature hooks
- formatting utilities
- uploaded file helpers
- pagination helpers
- reusable constants and configs
- reusable query synchronization helpers

### 📌 Frontend Logic Notes

- Business logic is separated from UI rendering whenever possible
- Query synchronization is centralized through reusable helpers
- Payload normalization improves frontend consistency
- Shared utilities reduce duplicated logic
- Feature isolation improves long-term maintainability
- Reusable listing architecture improves consistency across event pages

---

## 🎨 Styling Architecture

The frontend styling system is organized to separate global styles, layout behavior, reusable component styling, and page-specific presentation concerns.

### 📁 Styling Structure

```txt
styles/
├── components/
├── pages/
├── layout.css
├── reset.css
└── theme.css
```

### 🧩 Styling Responsibilities

`reset.css`

Handles:

- browser style normalization
- consistent base element rendering
- default spacing and typography resets

`theme.css`

Centralizes reusable design tokens and shared visual configuration such as:

- colors
- typography
- spacing
- reusable design variables

`layout.css`

Handles shared application layout behavior including:

- page structure
- shared containers
- responsive layout utilities
- reusable layout patterns

`styles/components/`

Contains reusable component-level styling for:

- buttons
- forms
- cards
- modals
- navigation
- reusable UI elements

`styles/pages/`

Contains page-specific styling separated from reusable component styles.

Examples include:

- event pages
- authentication pages
- dashboard pages
- profile pages

### 📌 Styling Notes

- Shared styles reduce duplicated UI behavior across pages
- Component styles are separated from page-specific presentation
- Layout concerns are centralized through reusable layout styles
- Styling organization improves long-term maintainability and UI consistency
- Shared event listing pages reuse common styling architecture

---

## 🧪 Testing

The frontend includes a comprehensive automated test suite built with **Vitest** and **React Testing Library**.

### ▶️ Run Tests

```bash
npm run test:run
```

### ▶️ Run Tests with Coverage

```bash
npx vitest run --coverage
```

### 📊 Testing Results

- ✅ 123 passing test files
- ✅ 1106 passing tests
- ✅ All tests passing

**Coverage:**
- 97.64% statements coverage
- 94.51% branch coverage
- 94.6% function coverage
- 97.87% line coverage

### 📦 Tested Areas

The frontend test suite covers:

- pages and routing
- authentication and protected access flows
- API modules and reusable helpers
- frontend business logic and feature utilities
- reusable hooks and query synchronization
- event permissions and frontend access guards
- filtering, pagination, and listing behavior
- reusable factories, mocks, and render utilities
- semantic structure and accessibility behavior
- ARIA attribute validation
- accessible navigation and interaction flows
- ongoing event view behavior
- status badge rendering
- started-event restrictions
- event status synchronization
- event image preservation, replacement, and removal behavior

### 🔁 Testing Strategy

- Tests simulate realistic frontend behavior using `React Testing Library`
- API calls are mocked to isolate feature behavior
- Routing behavior is tested through the application router
- Authentication and protected access flows are validated
- Critical frontend logic is tested in isolation
- Reusable factories and helpers reduce duplicated test setup

For more details about the frontend testing architecture, reusable factories, mocks, and helpers, see [`docs/testing.md`](./docs/testing.md).

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

An `.env.example` file can be used as a reference configuration.

---

## ▶️ Running the App

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The application will be available at:

`http://localhost:5173` (default Vite port)

---

## 🚀 Recent Improvements

### 🔧 Frontend Features & UX

- Shared event listing architecture across public and authenticated pages
- Role-aware event access guards
- Centralized authentication redirect and route restoration flows
- Reusable loading, error, and empty-state UI patterns
- Accessibility-focused UI architecture with semantic HTML and ARIA support
- Added ongoing event view support and default event listing behavior
- Added centralized event status badge system
- Added status-aware event actions and restrictions
- Aligned started-event deletion behavior with backend authorization rules
- Added event image lifecycle handling for preservation, replacement, and removal
- Fixed My Events image rendering using authenticated user event image metadata

### 🔌 Frontend Architecture

- Feature-oriented frontend architecture and reusable business logic
- Reusable event listing hooks and centralized listing state management
- Centralized protected route and access guard architecture
- Centralized event status configuration and badge rendering
- Shared ongoing event view configuration and filtering behavior

### 🧪 Frontend Testing

- Query synchronization and listing architecture testing
- Role-aware access guard and permission testing
- Expanded listing architecture and filtering tests
- Added accessibility-oriented component and interaction testing
- Added coverage for ongoing event views
- Added coverage for status badge rendering
- Added coverage for started-event restrictions
- Added coverage for event image preservation, replacement, and removal flows
- Added coverage for authenticated user event image metadata handling

---

## 📌 Project Status

| Area | Status |
|---|---|
| Frontend UI / Pages | ✅ Standardized, role-aware, and accessibility-focused |
| Reusable Components | ✅ Standardized, reusable, and accessibility-focused |
| Frontend Business Logic | ✅ Modular, reusable, and fully tested |
| Routing & Access Control | ✅ Centralized, role-aware, and fully tested |
| API Communication Layer | ✅ Centralized Axios architecture and normalized API handling |
| File Upload System | ✅ Avatar and event image upload, replacement, and removal supported |
| Testing | ✅ 1106 tests across 123 test files |
| Coverage | ✅ 97.64% statements / 94.51% branches / 94.6% functions / 97.87% lines |
| UX Improvements | 🚧 Ongoing |

---

## 🔮 Future Improvements

### 🚀 Frontend Features & UX

- Notifications and reminder features
- Improved mobile responsiveness across devices
- Continued accessibility improvements and broader keyboard interaction coverage
- Enhanced UI feedback (toasts, async feedback, contextual states)
- Expanded role-aware event management interactions
- Improved dashboard and event management flows
- Additional reusable UI component extraction
- Continued frontend styling consistency improvements

### 🧪 Frontend Testing

Planned testing improvements include:

- End-to-end testing for complete user journeys
- Additional reusable UI component coverage
- Expanded frontend testing documentation
- Expanded frontend integration and accessibility testing workflows
- Improved integration coverage for complex listing flows

---
