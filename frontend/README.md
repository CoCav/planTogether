# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, discover, join, and manage events through a role-aware frontend interface.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-136%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1363%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-96.49%25%20statements%20%7C%2093.01%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React, Vite, Axios, and React Router**.

It provides a responsive, accessibility-focused, and role-aware interface for discovering, managing, and participating in collaborative events.

The frontend architecture emphasizes:

- feature-oriented architecture
- centralized API communication
- protected routing and authentication flows
- role-aware access guards and permission-aware UI behavior
- reusable hooks, UI patterns, and query synchronization helpers
- interactive event maps and geolocation-aware event workflows
- comprehensive automated testing with Vitest and React Testing Library

The application is designed around scalable frontend architecture, reusable UI patterns, accessibility-focused interactions, maintainable testing workflows, and long-term reliability.

---

## 🎯 Application Overview

The frontend provides a complete interface for interacting with the PlanTogether platform.

It allows users to:

- authenticate securely using JWT
- browse, search, filter, and manage events across ongoing, upcoming, all, and archived views
- join and leave events
- interact with role-aware event actions (`organizer`, `co_organizer`, `participant`)
- create, edit, and delete events
- handle status-aware actions and started-event restrictions
- manage profile information and passwords
- upload, preview, and manage avatars and event images
- persist authenticated sessions with a "Remember me" feature
- access personalized dashboards for created and joined events
- browse public profiles and public event listings
- interact with location autocomplete and interactive event maps
- access protected routes through authentication and access guards

The application is built around reusable frontend workflows, centralized query synchronization, responsive UI interactions, protected routing, and consistent role-aware user experiences across the platform.

---

## 🔧 Tech Stack

The frontend is built using modern tools and scalable patterns focused on performance, maintainability, accessibility, and long-term reliability.

### Core Technologies

- **React** – component-based UI library
- **Vite** – fast development server and build tool
- **React Router** – client-side routing and navigation
- **Axios** – HTTP client for API communication
- **Lucide React** – accessible and reusable icon library

### State & Business Logic

- **Feature-oriented architecture** – domain-based frontend organization
- **Context API** – global authentication state management
- **Custom hooks** – reusable feature logic and shared UI behaviors
- **Query synchronization** – URL-driven filtering and pagination workflows
- **Session Storage / Local Storage** – authentication persistence and session handling
- **Shared utilities and configs** – centralized helpers and frontend configuration

### UI & User Experience

- **Responsive UI components** – reusable and consistent interface patterns
- **Role-aware rendering** – contextual actions and permission-aware UI behavior
- **Frontend access guards** – protected flows aligned with backend permissions
- **Drag-and-drop file uploads** – avatar and event image upload interactions
- **FormData-based upload flows** – image upload and API integration
- **URL-synchronized filtering and pagination** – filters and active views reflected in the browser URL
- **Interactive event maps** – React Leaflet and OpenStreetMap integration
- **Location autocomplete workflows** – reusable geolocation-aware event interactions
- **Contextual loading, error, and empty states** – clear async UI feedback
- **Shared upload preview architecture** – reusable avatar and event image previews
- **Accessibility-focused UI feedback patterns** – alerts, loading states, and validation feedback
- **Responsive form and upload layouts** – adaptive layouts for forms, uploads, and previews
- **Semantic and ARIA-aware components** – accessible landmarks, lists, labels, and interactive elements

### Testing

- **Vitest** – unit and integration testing
- **React Testing Library** – user interaction and UI behavior testing
- **Reusable factories, mocks, render helpers, and testing utilities** – maintainable frontend testing architecture

---

## 📁 Frontend Structure

The frontend follows a modular, feature-oriented architecture designed to improve consistency, maintainability, scalability, and testability.

The codebase separates API communication, business logic, routing, UI layers, styling, and testing utilities into dedicated modules.

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
│   │   ├── locations/
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
│   │   ├── forms/
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
│   │   └── uploadedFiles.js
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

- **Context** manages global application state, currently focused on authentication and session restoration.

- **Components** focus on reusable UI rendering and are grouped by domain (`auth`, `events`, `eventMemberships`, `users`) or shared responsibility (`forms`, `layout`, `ui`).

- **Pages** compose API calls, feature hooks, and reusable components into complete user-facing views.

- **Features** centralize domain-specific business logic, validation, filtering, query synchronization, permission rules, normalization helpers, payload builders, and reusable listing workflows.

- **User features** are separated between `authenticated/` and `public/` flows to isolate current-user dashboards from public profiles and event pages.

- **Global hooks** in `hooks/` provide reusable cross-feature behavior such as pagination state, click-outside handling, upload previews, and shared UI interactions.

- **Feature hooks** remain colocated inside their respective feature folders when tied to domain-specific logic.

- **Routes** centralize public and protected route definitions, authentication redirects, and access guards.

- **Styles** are separated into global, layout, page, and component styles to improve maintainability, responsive consistency, and reusable UI behavior.

- **Shared UI components and layouts** follow consistent responsive patterns, semantic structure, and accessibility conventions.

- **Tests** mirror the frontend architecture through reusable factories, mocks, render helpers, and domain-based organization.

This architecture separates UI rendering, business logic, routing, API communication, styling, and testing concerns into maintainable frontend layers.

The frontend also emphasizes semantic structure, accessible interactions, reusable UI workflows, and consistent responsive behavior across the application.

---

## ✨ Features

### 🔐 Authentication

- Login and registration
- JWT-based authentication
- Protected frontend routes and access guards
- Session restoration after refresh
- Persistent authenticated sessions with a "Remember me" feature
- Redirect users back to protected routes after login
- Automatic authenticated user restoration and navbar refresh
- Local storage and session storage token handling
- Reusable authentication form architecture
- Shared form validation and authentication state handling

### 👤 User Profile

- View and update profile information
- Change passwords with validation
- Upload, preview, replace, and remove avatars
- Drag-and-drop avatar upload support
- Delete account with ownership-transfer safeguards
- Automatic authenticated user refresh after profile updates
- Public user profiles with created and joined event listings
- Public profile statistics and synchronized pagination behavior
- Shared validation, upload handling, and contextual error feedback

### 📅 Event Management

- Browse public events across ongoing, upcoming, all, and archived views
- Create, edit, and delete events
- Upload, preview, replace, and remove event images
- Shared event form architecture and validation handling
- URL-synchronized filtering, pagination, and active views (`ongoing`, `upcoming`, `all`, `archives`)
- Shared listing architecture across public and authenticated dashboards
- Interactive event maps with React Leaflet and OpenStreetMap
- Location autocomplete and geolocation-aware event workflows
- Public and authenticated event map support

Frontend behavior includes:

- validation aligned with backend business rules
- role-aware and permission-aware UI behavior
- event status awareness (`upcoming`, `ongoing`, `ended`)
- responsive event details layouts and metadata presentation
- contextual member actions and protected event interactions
- hiding restricted actions when events have already started
- started-event date preservation and editing restrictions
- uploaded image validation, replacement, and preservation workflows

### 👥 Event Memberships

- Join and leave events
- Transfer event ownership
- Promote participants and demote co-organizers
- Remove members through permission-aware actions
- Role-aware membership interactions and access helpers
- Member avatars with public profile navigation
- Responsive member actions and dropdown interactions

### 📂 My Events Dashboard

- View active and historical created events
- View active and historical joined events
- Leave events directly from the interface
- Filter events by active dashboard views (`created`, `created history`, `joined`, `joined history`)
- Shared listing behavior with public event pages
- Centralized listing state and reusable query helpers

### 📤 Shared Upload System

- Shared drag-and-drop upload workflows
- Reusable upload previews for avatars and event images
- Responsive upload layouts and preview interactions
- Conditional dropzone and upload rendering behavior
- Shared validation feedback and upload accessibility patterns

### 🔍 Filtering & Navigation

Users can filter events using:

- keyword search
- creator search
- event type, theme, and location
- exact dates and date ranges
- sorting and pagination

Filtering behavior includes:

- synchronized URL query parameters and active views
- persistent navigation and listing state
- centralized query parameter handling
- dynamic filter resets and view-aware synchronization
- exact-date filtering that disables date range inputs
- combined multi-filter support
- clean URL generation without fallback query parameters

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

- Join and leave events

### 🌐 Public Access

Unauthenticated visitors can:

- browse public event information
- browse public user profiles
- view public membership information
- access public event pages and maps
- receive login prompts for protected actions

The UI dynamically adapts based on authentication state and event permissions.

### 📄 User Experience

- Contextual loading, empty, and error states
- Responsive and consistent UI behavior across features
- Semantic HTML structure and ARIA-aware UI patterns
- Keyboard-friendly navigation and accessible interactions
- Shared accessibility-focused feedback patterns for alerts, badges, forms, pagination, and loading states
- Consistent semantic landmarks, labels, and list structures across reusable components

---

## 🛡️ Routing & Access Control

The frontend centralizes routing, protected navigation, authentication persistence, and permission-aware UI access behavior through dedicated routing and frontend guard logic.

### 🔐 Protected Routing

Protected frontend routes are handled through:

```txt
AppRouter.jsx
ProtectedRoute.jsx
```

Protected frontend pages include:

- event creation
- event editing
- profile management
- personalized event dashboards
- role-aware membership management actions

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

- redirecting users back to intended protected pages after authentication
- preserving route state and query parameters during authentication redirects
- navigation state restoration between login and registration flows
- shared authentication redirect helpers

### 🔒 Frontend Access Guards

The frontend uses centralized event access checks to:

- prevent unauthorized users from accessing edit pages
- conditionally render edit and delete actions
- hide deletion actions for events that have already started
- lock started event start date fields during editing
- synchronize frontend permissions and role-aware behavior with backend authorization rules

Frontend event access and permissions are synchronized through:

```http
GET /events/:eventId/me
```

This endpoint allows the frontend to retrieve centralized membership and event access information, including:

- current membership role
- event status
- edit permissions
- delete permissions
- started-event restrictions

These frontend guards improve UX consistency, permission-aware interactions, and frontend reliability while keeping the backend as the source of truth for protected actions and authorization rules.

---

## 🔌 Frontend API Layer

The frontend uses a centralized API communication architecture built on top of **Axios**.

The API base URL is configured through environment variables:

```env
VITE_API_URL=http://localhost:3000/api
```

### 📦 API Responsibilities

The frontend API layer centralizes:

- authenticated API requests
- JWT token injection
- multipart uploads with `FormData`
- reusable request and response handling
- reusable error extraction helpers
- paginated payload handling
- centralized request configuration
- frontend access and permission requests

### ⚙️ Core API Utilities

#### `apiClient.js`

Centralized Axios configuration used across the application.

Handles:

- base API URL configuration
- authenticated request configuration and authorization header injection
- shared request configuration

#### `apiError.js`

Reusable API error normalization helpers.

Handles:

- Axios error normalization
- validation error extraction
- fallback error handling
- consistent frontend-friendly error objects

#### `apiResponse.js`

Reusable API response extraction helpers.

Handles:

- response unwrapping
- payload extraction
- paginated payload handling
- reusable payload formatting helpers

### 📌 API Architecture Notes

- JWT tokens are automatically injected into authenticated requests
- Upload requests support `FormData` with image preservation, replacement, and removal flows
- API responses are normalized before being consumed by frontend features and UI components
- API errors are standardized through reusable normalization helpers
- Frontend access guards are synchronized through dedicated event access endpoints
- Shared API helpers reduce duplicated request and response handling across features
- Feature modules consume centralized API utilities instead of raw Axios requests

---

## 🧠 Frontend Logic Layer

The frontend business logic is organized through reusable feature-oriented modules designed to separate UI rendering from frontend behavior, state management, and domain-specific logic.

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
- event filtering, pagination, and query synchronization
- payload normalization
- role-based permissions
- frontend access and permission synchronization
- event view configuration
- empty state management
- membership interaction behavior

### 🔐 Authentication Logic

The authentication layer handles:

- login and registration flows
- token persistence
- protected routing and frontend access guards
- authentication state management
- redirect behavior after login
- authenticated session restoration

### 📅 Event Logic

The event layer handles:

- event filtering, sorting, and pagination
- query parameter synchronization and reusable listing behavior
- event validation
- event payload normalization
- event status-aware frontend behavior
- started-event editing restrictions
- contextual create/edit datetime validation behavior
- event image lifecycle handling

### 👥 Membership Logic

The membership layer handles:

- joining and leaving events
- role-based permissions
- protected membership actions
- organizer and co-organizer permission restrictions
- confirmation flows for sensitive actions
- reusable membership permission helpers

### 👤 User Logic

The user layer separates:

- authenticated user behavior
- public user profile and event listing behavior
- authenticated and public user data normalization
- personalized event dashboard and listing behavior
- contextual empty states

### 🔁 Shared Frontend Utilities

Shared frontend utilities include:

- reusable cross-feature hooks and frontend helpers
- formatting utilities
- uploaded file helpers
- pagination helpers
- reusable constants and configs
- reusable query synchronization helpers

### 📌 Frontend Logic Notes

- Business logic is separated from UI rendering whenever possible
- Query synchronization is centralized through reusable helpers
- Shared utilities reduce duplicated frontend logic across features
- Feature isolation improves testing maintainability and frontend scalability
- Payload normalization and reusable listing architecture improve consistency across frontend features and event pages

---

## 🎨 Styling Architecture

The frontend styling architecture is organized to separate global styles, layout behavior, reusable component styling, responsive UI behavior, and page-specific presentation concerns.

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
- reusable design variables and shared UI tokens

`layout.css`

Handles shared application layout behavior including:

- page structure
- shared containers
- responsive layout utilities and page spacing
- reusable layout patterns

`styles/components/`

Contains reusable component-level styling for:

- buttons
- forms
- cards
- modals
- navigation
- reusable UI feedback and interaction patterns

`styles/pages/`

Contains page-specific styling separated from reusable component styles.

Examples include:

- event page
- authentication pages
- dashboard pages
- profile page
- public user profile page

### 📌 Styling Notes

- Shared styles and reusable layouts reduce duplicated UI and responsive behavior across pages
- Component styles are separated from page-specific presentation
- Styling organization improves long-term maintainability, UI consistency, and reusable frontend behavior
- Shared event listing pages reuse common styling architecture
- Shared component styles support accessible and semantic UI patterns

---

## 🧪 Testing

The frontend includes a comprehensive automated testing architecture built with **Vitest** and **React Testing Library**, covering reusable UI components, frontend business logic, routing, query synchronization, accessibility behavior, and protected workflows.

The testing strategy focuses on reliability, maintainability, accessibility, and long-term frontend stability.

### ▶️ Run Tests

```bash
npm run test:run
```

### ▶️ Run Tests with Coverage

```bash
npm run test:coverage
```

### 📊 Testing Results

- ✅ 136 passing test files
- ✅ 1363 passing tests
- ✅ All tests passing

**Coverage**:
- 96.49% statement coverage
- 93.01% branch coverage
- 94.87% function coverage
- 97.21% line coverage

✅ High automated coverage across routing, authentication flows, query synchronization, uploads, accessibility behavior, reusable hooks, and role-aware frontend interactions.

### 📦 Tested Areas

The frontend test suite covers:

- pages, routing, protected navigation, and authentication redirect restoration
- reusable hooks, query synchronization, filtering, pagination, and listing behavior
- API modules, payload normalization, and frontend business logic
- role-aware UI behavior and frontend access guards
- upload previews, drag-and-drop interactions, and image lifecycle handling
- reusable factories, mocks, render helpers, and testing utilities
- accessibility behavior, semantic structure, and ARIA-aware interactions
- event status synchronization and started-event restrictions
- public user profile and public user event listing workflows
- reusable shared components and interaction patterns

### 🔁 Testing Strategy

- Tests simulate realistic frontend behavior using React Testing Library
- API calls are mocked to isolate frontend feature behavior
- Routing and protected access flows are validated through the application router
- Critical frontend business logic is tested independently from UI rendering
- Reusable factories, mocks, and helpers reduce duplicated test setup
- Accessibility behavior and semantic UI structure are validated across reusable frontend components

For more details about the frontend testing architecture, reusable factories, mocks, render helpers, and testing workflows, see [`docs/testing.md`](./docs/testing.md).

---

## ⚙️ Environment Variables

The frontend relies on environment variables to configure API communication and runtime behavior.

Create a `.env` file at the root of the project and define the following variable:

```env
VITE_API_URL=http://localhost:3000/api
```

### 🔍 Environment Notes

- `VITE_API_URL` defines the base URL of the backend API
- The value must match the backend server URL
- Used by the centralized Axios client for all frontend API requests
- Supports local development and environment-specific configurations

An `.env.example` file is provided as a reference configuration.

---

## ▶️ Running the App

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The development server is available at:

```txt
http://localhost:5173
```

The production preview server is available at:

```txt
http://localhost:4173
```

---

## 🚀 Recent Improvements

### 🗺️ Event Location & Maps

- Added backend-powered location search and geolocation integration
- Added location autocomplete workflows for event creation and editing
- Added interactive event maps using React Leaflet and OpenStreetMap
- Added public and authenticated map support across event workflows
- Improved location selection UX and geolocation-aware event interactions

### 🔧 Frontend Features & UX

- Added reusable file upload preview architecture shared across user and event forms
- Improved drag-and-drop upload UX, conditional preview rendering, and responsive upload behavior
- Improved public user profiles, profile statistics, and responsive profile layouts
- Improved authentication redirect restoration and protected navigation flows
- Added clean URL synchronization across public events, dashboards, and public user listings
- Expanded accessibility semantics, ARIA behavior, semantic landmarks, and decorative icon handling
- Refined shared UI components including alerts, badges, loading states, pagination, selects, and password fields
- Improved responsive UI consistency across reusable components, layouts, and pages

### 🔌 Frontend Architecture

- Extracted reusable FileUploadPreviewField component architecture
- Centralized shared upload behavior, validation feedback, and preview rendering logic
- Expanded reusable accessibility-focused UI patterns
- Strengthened reusable event listing and query synchronization architecture
- Added centralized frontend support for location and map workflows
- Improved CSS organization, reusable component styling, and responsive layout consistency

### 🧪 Frontend Testing

- Reached 1363 passing tests across 136 passing test files
- Expanded accessibility, semantic structure, and ARIA behavior coverage
- Added upload preview architecture and drag-and-drop interaction coverage
- Added authentication redirect and navigation restoration coverage
- Added location API coverage and geolocation workflow testing
- Added decorative icon accessibility assertions
- Expanded reusable component, page, hook, and feature regression coverage
- Added semantic landmark, accessible form, loading, alert, pagination, and interaction coverage

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Frontend UI / Pages | ✅ Responsive, role-aware, accessibility-focused, and geolocation-enabled |
| Reusable Components | ✅ Reusable, accessibility-aware, and consistently tested |
| Frontend Business Logic | ✅ Modular, validation-driven, role-aware, and fully tested |
| Routing & Access Control | ✅ Centralized protected routing, redirect restoration, and permission-aware access guards |
| API Communication Layer | ✅ Centralized Axios architecture with normalized request, response, and error handling |
| Location & Maps | ✅ Location autocomplete, geolocation workflows, and interactive event maps |
| File Upload System | ✅ Shared upload preview architecture with avatar and event image lifecycle handling |
| Query Synchronization | ✅ URL-synchronized filtering, pagination, sorting, and active view management |
| Testing | ✅ 1363 tests across 136 passing test files |
| Coverage | ✅ 96.49% statements / 93.01% branches / 94.87% functions / 97.21% lines |
| UX & Accessibility | ✅ Responsive UI polish, semantic structure, ARIA support, and accessibility-focused interactions |

---

## 🔮 Future Improvements

### 🚀 Frontend Features & UX

- Notifications and reminder features
- Expanded event discovery and map exploration workflows
- Continued accessibility improvements and expanded keyboard interaction support
- Enhanced UI feedback (toasts, contextual async feedback, and richer loading states)
- Expanded role-aware event management interactions
- Improved dashboard, profile, and event management workflows
- Additional frontend personalization and user experience improvements

### 🗺️ Location & Maps

- Interactive map clustering and performance optimizations
- Additional geolocation filters and map-based event discovery features
- Enhanced location search and autocomplete experiences
- Improved map interactions for event browsing and navigation

### 🧪 Frontend Testing

Planned testing improvements include:

- End-to-end testing for complete user journeys
- Additional reusable UI component coverage
- Expanded frontend testing documentation
- Expanded integration and accessibility testing workflows
- Improved coverage for complex listing, filtering, pagination, and query synchronization workflows
- Additional map and geolocation workflow testing

---
