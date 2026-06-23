# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, discover, join, and manage events through a role-aware frontend interface.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-149%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1522%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-96.39%25%20statements%20%7C%2093.27%25%20branches-brightgreen)

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
- create, edit, and delete events
- join and leave events
- interact with role-aware event actions (`organizer`, `co_organizer`, `participant`)
- create, edit, and manage event reviews and ratings
- view review summaries and average ratings on completed events
- manage profile information and passwords
- upload, preview, and manage avatars and event images
- persist authenticated sessions with a "Remember me" feature
- access personalized dashboards for created and joined events
- browse public profiles and public event listings
- interact with location autocomplete and interactive event maps
- access protected routes through authentication and access guards

The application is built around reusable frontend workflows, centralized query synchronization, responsive UI interactions, protected routing, and consistent role-aware user experiences.

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
- **Custom hooks** – reusable feature and UI logic
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
- **Location autocomplete workflows** – reusable geolocation-aware interactions
- **Contextual loading, error, and empty states** – clear async UI feedback
- **Shared upload preview architecture** – reusable avatar and event image previews
- **Accessibility-focused feedback patterns** – alerts, loading states, and validation feedback
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
│   │   ├── eventReviews/
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
│   │   ├── eventReviews/
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
│   │   ├── eventReviews/
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

- **API modules** isolate HTTP communication, authenticated requests, uploads, response normalization, pagination handling, and error extraction.

- **Context** manages global application state, currently focused on authentication and session restoration.

- **Components** focus on reusable UI rendering and are grouped by domain (`auth`, `events`, `eventMemberships`, `eventReviews`, `users`) or shared responsibility (`forms`, `layout`, `ui`).

- **Pages** compose API calls, feature hooks, and reusable components into complete user-facing views.

- **Features** centralize domain-specific business logic, validation, filtering, pagination, query synchronization, permission rules, normalization helpers, payload builders, and reusable workflows.

- **User features** are separated between `authenticated/` and `public/` flows to isolate current-user dashboards from public profiles and event pages.

- **Global hooks** in `hooks/` provide reusable cross-feature behavior such as pagination state, click-outside handling, upload previews, and shared UI interactions.

- **Feature hooks** remain colocated inside their respective feature folders when tied to domain-specific logic.

- **Routes** centralize public and protected route definitions, authentication redirects, and access guards.

- **Styles** are separated into global, layout, page, and component styles to improve maintainability, responsive consistency, and reusable UI behavior.

- **Shared UI components and layouts** follow consistent responsive patterns, semantic structure, and accessibility conventions.

- **Tests** mirror the frontend architecture through reusable factories, mocks, render helpers, and feature-based organization.

This architecture separates UI rendering, business logic, routing, API communication, styling, and testing concerns into maintainable frontend layers while promoting accessible interactions, reusable workflows, and consistent responsive behavior across the application.

---

## ✨ Features

### 🔐 Authentication

- Login and registration
- JWT-based authentication
- Protected routes and access guards
- Session restoration after refresh
- Persistent sessions with a "Remember me" feature
- Redirect users back to protected routes after login
- Shared authentication forms, validation, and state management

### 👤 User Profile

- View and update profile information
- Change passwords with validation
- Upload, preview, replace, and remove avatars
- Drag-and-drop avatar uploads
- Delete account with ownership-transfer safeguards
- Public user profiles with event history and statistics
- Automatic authenticated user refresh after profile updates

### 📅 Event Management

- Browse public events across ongoing, upcoming, all, and archived views
- Create, edit, and delete events
- Upload, preview, replace, and remove event images
- Shared event forms and validation workflows
- URL-synchronized filtering, sorting, and pagination
- Interactive maps and location autocomplete
- Public and authenticated event map support

Frontend behavior includes:

- role-aware and permission-aware interactions
- event status awareness (`upcoming`, `ongoing`, `ended`)
- started-event editing restrictions
- responsive event details and member management workflows
- image preservation, replacement, and validation handling

### ⭐ Event Reviews & Ratings

- Create, edit, and delete event reviews
- Interactive 1–5 star ratings
- Review ownership enforcement
- Paginated review listings
- Review summaries with average ratings and review counts
- Completed-event review workflows
- Collapsible forms and inline editing
- Backend-synchronized review statistics

### 👥 Event Memberships

- Join and leave events
- Transfer event ownership
- Promote participants and demote co-organizers
- Remove members through permission-aware actions
- Role-aware member management
- Member avatars with public profile navigation

### 📂 My Events Dashboard

- View created and joined events
- Separate active and historical views
- Leave joined events directly from the dashboard
- Shared filtering, sorting, and pagination behavior

### 📤 Shared Upload System

- Reusable drag-and-drop upload workflows
- Shared upload previews for avatars and event images
- Responsive upload layouts and accessibility support
- Centralized validation feedback

### 🔍 Filtering & Navigation

Users can filter events using:

- keyword search
- creator search
- event type, theme, mode, and location
- exact dates and date ranges
- sorting and pagination

Filtering behavior includes:

- URL synchronization
- persistent navigation state
- view-aware filter management
- mutually exclusive exact-date and date-range filters
- clean URL generation

### 🎭 Role System

Authenticated users can have different permissions within events:

```txt
organizer
co_organizer
participant
```

#### Organizer

- Edit and delete events
- Manage members and roles
- Transfer event ownership

#### Co-organizer

- Edit events
- Remove participants

#### Participant

- Join and leave events
- Create, edit, and delete reviews for completed events they participated in

### 🌐 Public Access

Unauthenticated visitors can:

- browse public event information
- browse public user profiles
- view public membership information
- access public event pages and maps
- view event reviews and ratings
- receive login prompts for protected actions

### 📄 User Experience

- Contextual loading, empty, and error states
- Responsive UI patterns
- Semantic HTML and ARIA support
- Keyboard-friendly interactions
- Reusable accessibility-focused feedback components

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
- "Remember me" persistence
- automatic authenticated user restoration on application load

Authentication state is centralized through:

```txt
AuthContext.jsx
AuthProvider.jsx
```

### ↩️ Redirect Restoration

The routing layer preserves intended navigation during authentication flows.

Examples include:

- redirecting users back to protected pages after authentication
- preserving route state and query parameters
- restoring navigation state between login and registration flows
- shared authentication redirect helpers

### 🔒 Frontend Access Guards

The frontend uses centralized event access checks to:

- prevent unauthorized users from accessing edit pages
- conditionally render edit and delete actions
- hide deletion actions for events that have already started
- lock started event start date fields during editing
- synchronize frontend permissions with backend authorization rules

Frontend event access and permissions are synchronized through:

```http
GET /api/events/:eventId/me
```

This endpoint allows the frontend to retrieve centralized membership and event access information, including:

- current membership role
- event status
- edit permissions
- delete permissions
- started-event restrictions

These guards improve UX consistency and permission-aware interactions while keeping the backend as the source of truth for protected actions and authorization rules.

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
- reusable request, response, and normalization handling
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
- pagination metadata extraction
- reusable payload formatting helpers

### 📌 API Architecture Notes

- JWT tokens are automatically injected into authenticated requests
- Upload requests support `FormData` with image preservation, replacement, and removal flows
- API responses and pagination metadata are normalized before being consumed by frontend features and UI components
- API errors are standardized through reusable normalization helpers
- Frontend access guards are synchronized through dedicated event access endpoints
- Shared API helpers reduce duplicated API handling across features
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
├── eventReviews/
├── users/
│   ├── authenticated/
│   └── public/
└── shared/
```

### 🧩 Logic Responsibilities

The feature layer centralizes reusable domain logic such as:

- frontend validation
- filtering, pagination, and query synchronization
- payload normalization
- role-based permissions
- frontend access and permission synchronization
- event view configuration
- review workflows and statistics
- membership interaction behavior
- empty state management

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
- query synchronization and reusable listing behavior
- event validation
- event payload normalization
- event status-aware behavior
- started-event editing restrictions
- datetime validation workflows
- event image lifecycle handling

### ⭐ Event Review Logic

The review layer handles:

- review creation, editing, and deletion
- rating validation and state management
- paginated review retrieval
- review payload normalization
- review ownership workflows
- review statistics and average rating display
- review form and inline editing interactions

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
- Shared normalization and pagination patterns improve consistency across frontend features

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
- feedback, status, and interaction patterns

`styles/pages/`

Contains page-specific styling separated from reusable component styles.

Examples include:

- event pages
- authentication pages
- dashboard pages
- profile pages

### 📌 Styling Notes

- Shared styles and layouts reduce duplicated UI and responsive behavior across the application
- Component styles are separated from page-specific presentation concerns
- The styling architecture promotes maintainability, consistency, accessibility, and reusable UI patterns
- Event, dashboard, profile, and review interfaces reuse common styling foundations

---

## 🧪 Testing

The frontend includes a comprehensive automated testing architecture built with **Vitest** and **React Testing Library**.

Testing focuses on business logic, routing, accessibility, feature workflows, and long-term maintainability.

### ▶️ Run Tests

```bash
npm run test:run
```

### ▶️ Run Tests with Coverage

```bash
npm run test:coverage
```

### 📊 Testing Results

- ✅ 149 passing test files
- ✅ 1522 passing tests
- ✅ 100% passing rate

**Coverage**:
- 96.39% statement coverage
- 93.27% branch coverage
- 95.25% function coverage
- 97.03% line coverage

✅ High automated coverage across authentication, routing, filtering, pagination, reviews, uploads, accessibility, and role-aware interactions.

### 📦 Tested Areas

The frontend test suite covers:

- routing, protected navigation, and authentication flows
- filtering, pagination, query synchronization, and listing behavior
- API modules, payload normalization, and response handling
- event reviews, ratings, pagination, and review statistics
- role-aware UI behavior and frontend access guards
- uploads, image lifecycle workflows, and drag-and-drop interactions
- accessibility, semantic structure, and ARIA-aware interactions
- public profiles, dashboards, and event management workflows
- reusable components, hooks, factories, mocks, and testing utilities

### 🔁 Testing Strategy

- React Testing Library is used to simulate realistic user behavior
- API calls are mocked to isolate frontend feature logic
- Routing, access control, and business logic are validated independently from UI rendering when appropriate
- Reusable factories, mocks, and helpers reduce duplicated test setup
- Accessibility and semantic UI behavior are validated across reusable components

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
- Used by the centralized Axios client for all frontend requests
- Supports environment-specific configurations

An `.env.example` file is provided as a reference configuration.

---

## ▶️ Running the App

Install dependencies:

```bash
npm install
```

Available commands:

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

Development server:

```txt
http://localhost:5173
```

Production preview:

```txt
http://localhost:4173
```

---

## 🚀 Recent Improvements

### ⭐ Event Reviews & Ratings

- Added a complete review system for completed events
- Added review creation, editing, and deletion workflows
- Added interactive 1–5 star ratings
- Added review summaries with average ratings and review counts
- Added paginated review listings and review statistics
- Improved review UX with collapsible forms and inline editing

### 📅 Event Experience

- Added review statistics to event cards and event details pages
- Improved event filtering with mutually exclusive exact-date and date-range filters
- Refined event form layouts, optional field handling, and location search wording
- Improved responsive event details and member management workflows

### 🔧 Frontend Architecture & UX

- Expanded shared pagination and normalization patterns
- Improved accessibility, semantic structure, and ARIA behavior
- Refined reusable UI components, loading states, forms, and dropdown interactions
- Improved responsive consistency across pages and reusable components

### 🧪 Frontend Testing

- Reached 1522 passing tests across 149 passing test files
- Expanded coverage for reviews, ratings, pagination, and review statistics
- Added coverage for review editing, ownership controls, and dropdown interactions
- Continued expanding accessibility, routing, and feature workflow coverage

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Frontend UI & Pages | ✅ Responsive, role-aware, accessibility-focused, and geolocation-enabled |
| Event Management | ✅ Event creation, editing, filtering, maps, and status-aware workflows |
| Event Reviews & Ratings | ✅ Review creation, editing, deletion, ratings, pagination, and review statistics |
| Membership & Permissions | ✅ Role-aware interactions, ownership transfer, and permission-aware UI |
| Reusable Components | ✅ Modular, accessible, and consistently tested |
| Frontend Business Logic | ✅ Feature-oriented, validation-driven, and fully tested |
| Routing & Access Control | ✅ Protected routing, redirect restoration, and frontend access guards |
| API Communication Layer | ✅ Centralized Axios architecture with normalized request, response, and error handling |
| Location & Maps | ✅ Location autocomplete, geolocation workflows, and interactive event maps |
| File Upload System | ✅ Shared upload previews and image lifecycle handling |
| Query Synchronization | ✅ URL-synchronized filtering, sorting, pagination, and active view management |
| UX & Accessibility | ✅ Responsive UI, semantic structure, ARIA support, and accessibility-focused interactions |
| Testing | ✅ 1522 tests across 149 passing test files |
| Coverage | ✅ 96.39% statements / 93.27% branches / 95.25% functions / 97.03% lines |

---

## 🔮 Future Improvements

### 🚀 Features & User Experience

- Toast notifications and richer async feedback
- Event likes and lightweight social interactions
- Event discussions and comment threads
- Event invitations and shareable links
- Email notifications, reminders, and event updates
- Additional dashboard, profile, and event management improvements
- Continued accessibility and keyboard-navigation enhancements

### 🏗️ Frontend Architecture

- Further reuse of shared pagination, normalization, and listing patterns
- Additional business-logic extraction into reusable feature modules
- Continued component and styling consolidation
- Expanded frontend documentation

### 🗺️ Location & Maps

- Map clustering and performance optimizations
- Additional geolocation filters and map-based discovery
- Enhanced location search and autocomplete experiences

### 🧪 Frontend Testing

Planned testing improvements include:

- End-to-end testing for complete user journeys
- Expanded accessibility and integration testing
- Additional coverage for complex filtering and pagination workflows
- Additional map and geolocation workflow testing
- Continued regression coverage for new frontend features

---
