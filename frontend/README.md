# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, discover, join, and manage events through a role-aware frontend interface.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-128%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1218%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-97.89%25%20statements%20%7C%2095.07%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React, Vite, Axios, and React Router**.

It provides a responsive, accessibility-focused, and role-aware user interface for discovering, managing, and participating in collaborative events.

The frontend architecture emphasizes:

- feature-oriented architecture
- reusable hooks and shared frontend patterns
- centralized API communication
- protected routing and authentication flows
- role-aware frontend behavior and access guards
- reusable filtering, listing, and query synchronization helpers
- comprehensive automated testing with Vitest and React Testing Library

The frontend emphasizes scalable architecture, domain-driven frontend behavior, accessibility-focused UI patterns, maintainable testing workflows, and long-term reliability.

---

## 🎯 Application Overview

The frontend provides a complete interface for interacting with the PlanTogether platform.

It allows users to:

- Authenticate securely using JWT
- Browse, search, filter, and manage events across ongoing, upcoming, all, and archived views
- Join and leave events
- Interact with role-aware event actions (`organizer`, `co_organizer`, `participant`)
- Create, edit, and delete events
- Handle event status-aware actions and restrictions
- Prevent deletion of started events in alignment with backend authorization rules
- Prevent editing of started events through frontend validation rules
- Manage profile information and passwords
- Upload avatars and event images
- Persist authenticated sessions with a "Remember me" feature
- Access personalized event dashboards for created and joined events
- Browse public user profiles and public user event listings
- Access protected frontend routes through authentication and access guards

The application is designed around reusable frontend workflows, centralized query synchronization, protected routing, and consistent role-aware user interactions across core platform features.

---

## 🔧 Tech Stack

The frontend is built using modern and efficient tools to ensure performance, scalability, maintainability, and long-term reliability.

### Core Technologies

- **React** – component-based UI library
- **Vite** – fast development server and build tool
- **React Router** – client-side routing and navigation
- **Axios** – HTTP client for API communication
- **Lucide React** – reusable icon library for accessible UI components

### State & Business Logic

- **Feature-oriented architecture** – domain-based frontend organization
- **Context API** – global authentication state management
- **Custom hooks** – reusable feature logic and shared frontend behaviors
- **Query synchronization** – reusable URL-driven filtering and pagination behavior
- **Session Storage / Local Storage** – authentication persistence and session handling
- **Shared utilities and configs** – centralized frontend helpers and configuration

### UI & User Experience

- **Responsive UI components** – reusable and consistent interface patterns
- **Role-aware conditional rendering** – contextual actions and permissions
- **Frontend access guards** – protected frontend flows aligned with backend permissions
- **Drag-and-drop file uploads** – avatar and event image uploads
- **FormData-based upload flows** – image upload and API integration
- **URL-synchronized filtering and pagination** – filters, pages, and active views reflected in the browser URL
- **Contextual loading, error, and empty states** – clear UI feedback for async operations and empty results
- **Shared upload preview architecture** – reusable upload previews for avatars and event images
- **Accessibility-focused reusable UI feedback patterns** – shared alert, loading, and validation behaviors
- **Responsive reusable form and upload UI layouts** – adaptive layouts for forms, uploads, and previews
- **Semantic UI structure and ARIA-aware reusable components** – accessible landmarks, lists, labels, and interactive elements

### Testing

- **Vitest** – unit and integration testing
- **React Testing Library** – user interaction and UI behavior testing
- **Reusable factories, mocks, and render helpers** – maintainable frontend testing architecture

---

## 📁 Frontend Structure

The frontend follows a modular, feature-oriented architecture designed to improve frontend consistency, maintainability, scalability, and testability.

The codebase separates API communication, frontend business logic, routing, UI layers, styling, and reusable testing utilities into dedicated frontend modules.

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

- **Context** stores global application state, currently focused on authentication and session restoration.

- **Components** focus on reusable UI rendering and are grouped by domain (`auth`, `events`, `eventMemberships`, `users`) or shared responsibility (`layout`, `ui`).

- **Pages** compose API calls, feature hooks, and reusable components into complete user-facing views.

- **Features** centralize domain-specific frontend business logic, validation, filtering, query synchronization, permission rules, normalization helpers, payload builders, and reusable listing behavior.

- **User features** are split between `authenticated/` and `public/` flows to isolate current-user dashboards from public profile and public event pages.

- **Global hooks** in `hooks/` provide reusable cross-feature behavior such as pagination state, click-outside handling, and file upload previews.

- **Feature hooks** remain colocated inside their respective feature folders when they depend on domain-specific business logic.

- **Routes** centralize public and protected route definitions, authentication redirects, and frontend access guards.

- **Styles** are separated into global, layout, page, and component styles to improve maintainability, responsive consistency, and reusable UI behavior.

- **Shared UI components and page layouts** follow consistent responsive patterns, semantic structure, and accessibility conventions.

- **Tests** mirror the frontend architecture with reusable factories, mocks, render helpers, and domain-based test organization.

This architecture separates UI rendering, frontend behavior, routing, API communication, styling, and testing concerns into clear and maintainable frontend layers.

The frontend also emphasizes semantic structure, reusable accessible UI patterns, and consistent accessibility-focused interaction behavior.

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
- Shared form state and validation handling across authentication flows

### 👤 User Profile

- View and update profile information
- Change passwords with validation
- Upload and preview avatars
- Drag-and-drop avatar upload support
- Delete account with ownership transfer safeguards
- Reusable profile form architecture
- Shared validation, upload handling, and preview behavior
- Automatic authenticated user refresh after updates
- Public user profile pages with created/joined event listings
- Public user event pagination and view synchronization
- Contextual validation and error feedback

### 📅 Event Management

- Browse all public events
- View events across ongoing, upcoming, all, and archived views
- Create, edit, and delete events
- Upload and preview event images
- URL-synchronized event filtering
- Shared listing architecture with authenticated event dashboards
- Reusable event form state and validation handling
- Filter events by active views (`ongoing`, `upcoming`, `all`, `archives`)

Frontend behavior includes:

- Validation aligned with backend business rules
- Role-aware UI actions and frontend access behavior based on event state and permissions
- Event status awareness (`upcoming`, `ongoing`, `ended`)
- Status badge display across event listings and event details
- Hiding restricted actions when events have already started
- Preventing past start dates during event creation
- Preserving and locking started event start dates during editing
- Ensuring end dates occur after start dates
- Validating uploaded image types and sizes
- Event image preservation when editing without image changes
- Event image replacement and removal support

### 👥 Event Memberships

- Join and leave events
- Transfer event ownership
- Promote participants
- Demote co-organizers
- Remove members
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

### 📤 Shared File Upload System

- Shared reusable upload preview component architecture
- Shared drag-and-drop upload behavior across forms
- Responsive upload preview layouts for avatars and event images
- Conditional upload and dropzone rendering behavior
- Shared validation feedback and upload accessibility behavior
- Reusable preview removal and replacement workflows

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

- synchronized URL query parameters and active views
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
- Persistent listing and filtering state across refresh and navigation
- Config-driven event views (`Ongoing`, `Upcoming`, `All`, `Archives` / `Created`, `Created History`, `Joined`, `Joined History`)
- Shared view configuration architecture
- Reusable query parameter synchronization helpers
- Clean URL generation that omits fallback views, first pages, and default sorting values

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
- Browse public user profiles
- View public event membership information
- Access public event pages
- Receive login prompts for protected actions

The UI dynamically adapts based on the user's permissions and authentication state.

### 📄 User Experience

- Contextual empty states based on filters and active views
- Loading states for asynchronous operations
- Responsive and consistent UI behavior across pages and features
- Semantic HTML structure, ARIA-aware UI patterns, and accessible form behavior
- Keyboard-friendly navigation and accessibility-focused interactive behaviors
- Decorative icon accessibility handling with aria-hidden support
- Consistent semantic landmark and list structure across reusable components
- Accessibility-focused loading, alert, badge, pagination, and form patterns
- Improved validation feedback semantics and accessibility behavior

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

- redirecting users back to protected pages after authentication
- preserving intended navigation targets during authentication flows
- preserving route state during protected access redirects
- preservation of protected route query parameters after authentication
- navigation state restoration between login and registration flows
- shared authentication redirect helpers

### 🔒 Frontend Access Guards

The frontend uses centralized event access checks to:

- prevent unauthorized users from accessing edit pages
- conditionally render edit and delete actions
- hide deletion actions for events that have already started
- lock started event start date fields during editing
- synchronize frontend permissions with backend authorization rules
- preserve consistent role-aware frontend behavior

Frontend event edit access is synchronized through:

```http
GET /events/:eventId/me
```

This endpoint allows the frontend to retrieve centralized membership and event access information, including:

- current membership role
- event status
- edit permissions
- delete permissions
- started-event restrictions

These frontend guards improve UX consistency, frontend reliability, and permission-aware UI behavior while keeping the backend as the source of truth for protected actions and authorization rules.

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
- reusable request and response normalization
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
- authenticated request handling
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
- paginated payload normalization
- reusable frontend payload formatting and normalization

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
- event filtering and query synchronization
- payload normalization
- role-based permissions
- frontend access and permission synchronization
- event view configuration
- empty state management
- pagination synchronization
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

- event filtering
- sorting and pagination
- query parameter synchronization
- reusable listing behavior
- event validation
- event payload normalization
- dynamic event status behavior
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
- event dashboard logic
- contextual empty states
- personalized event listing and dashboard behavior

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
- Payload normalization improves frontend consistency and reusable UI behavior
- Shared utilities reduce duplicated frontend logic across features
- Feature isolation improves testing maintainability and frontend scalability
- Reusable listing architecture improves consistency across event pages

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
- responsive layout utilities
- responsive page spacing and layout behavior
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

- Shared styles reduce duplicated UI and responsive behavior across pages
- Component styles are separated from page-specific presentation
- Layout and responsive concerns are centralized through reusable layout styles
- Styling organization improves long-term maintainability, UI consistency, and reusable frontend behavior
- Shared event listing pages reuse common styling architecture
- Shared component styles support accessibility-focused and semantic UI patterns

---

## 🧪 Testing

The frontend includes a comprehensive automated testing architecture built with **Vitest** and **React Testing Library**.

### ▶️ Run Tests

```bash
npm run test:run
```

### ▶️ Run Tests with Coverage

```bash
npx vitest run --coverage
```

### 📊 Testing Results

- ✅ 128 passing test files
- ✅ 1218 passing tests
- ✅ All tests passing

Coverage:
- 97.89% statement coverage
- 95.07% branch coverage
- 95.03% function coverage
- 98.12% line coverage

### 📦 Tested Areas

The frontend test suite covers:

- pages, routing, and protected access flows
- API modules, reusable helpers, and frontend business logic
- reusable hooks, query synchronization, filtering, pagination, and listing behavior
- event permissions, frontend access guards, and role-aware UI behavior
- reusable factories, mocks, render utilities, and testing helpers
- semantic structure, ARIA behavior, and accessibility-focused interaction flows
- event status synchronization, status-aware frontend behavior, and status badge rendering
- started-event editing restrictions and contextual datetime validation behavior
- event image preservation, replacement, removal, and upload preview behavior
- reusable upload preview architecture and responsive upload rendering
- authentication redirect restoration and protected route synchronization flows
- account deletion and ownership transfer workflows
- public user profile and public user event listing workflows
- clean URL synchronization across event listing pages
- decorative icon accessibility handling and reusable accessibility-focused UI patterns
- shared event membership interactions and permission-aware behaviors

### 🔁 Testing Strategy

- Tests simulate realistic frontend behavior using `React Testing Library`
- API calls are mocked to isolate frontend feature behavior
- Routing behavior is tested through the application router
- Authentication and protected access flows are validated
- Critical frontend business logic is tested in isolation
- Reusable factories, mocks, and helpers reduce duplicated test setup

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

An `.env.example` file can be used as a reference configuration.

---

## ▶️ Running the App

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The application will be available at:

`http://localhost:5173` (Default Vite development port)

---

## 🚀 Recent Improvements

### 🔧 Frontend Features & UX

- Added reusable file upload preview architecture shared across user and event forms
- Improved drag-and-drop upload UX, conditional preview rendering, and responsive upload behavior
- Added public user profile improvements and responsive profile layouts
- Improved authentication redirect restoration and protected route navigation flows
- Added clean URL synchronization across public, authenticated, and public user event listings
- Improved accessibility semantics, ARIA behavior, semantic landmarks, and decorative icon handling
- Refined shared UI components including alerts, badges, loading states, pagination, selects, and password fields
- Improved responsive UI consistency across reusable components, layouts, and pages

### 🔌 Frontend Architecture

- Extracted reusable FileUploadPreviewField component architecture
- Centralized shared upload behavior, validation feedback, and preview rendering logic
- Expanded reusable accessibility-focused UI component patterns
- Strengthened reusable event listing and query synchronization architecture
- Improved frontend CSS organization, reusable component styling, and responsive layout consistency
- Refined shared component and page styling architecture

### 🧪 Frontend Testing

- Reached 1218 passing tests across 128 test files
- Expanded accessibility, semantic structure, and ARIA behavior coverage
- Added upload preview architecture and drag-and-drop interaction coverage
- Added authentication redirect and navigation restoration coverage
- Added decorative icon accessibility assertions
- Expanded reusable component, page, hook, and feature regression coverage
- Added semantic landmark, accessible form, loading, alert, pagination, and interaction coverage

---

## 📌 Project Status

| Area | Status |
|------|--------|
| Frontend UI / Pages | ✅ Standardized, responsive, role-aware, and accessibility-focused |
| Reusable Components | ✅ Reusable, accessibility-aware, and consistently tested |
| Frontend Business Logic | ✅ Modular, validation-driven, role-aware, and fully tested |
| Routing & Access Control | ✅ Centralized protected routing and permission-aware frontend guards |
| API Communication Layer | ✅ Centralized Axios architecture with normalized API handling |
| File Upload System | ✅ Shared upload preview architecture with avatar and event image lifecycle handling |
| Query Synchronization | ✅ URL-synchronized filtering, pagination, sorting, and active view management |
| Testing | ✅ 1218 tests across 128 passing test files |
| Coverage | ✅ 97.89% statements / 95.07% branches / 95.03% functions / 98.12% lines |
| UX & Accessibility | ✅ Responsive UI polish, semantic structure, ARIA support, and improved navigation flows |

---

## 🔮 Future Improvements

### 🚀 Frontend Features & UX

- Notifications and reminder features
- Continued accessibility improvements and expanded keyboard interaction coverage
- Enhanced UI feedback (toasts, async feedback, contextual states)
- Expanded role-aware event management interactions
- Improved dashboard and event management workflows

### 🧪 Frontend Testing

Planned testing improvements include:

- End-to-end testing for complete user journeys
- Additional reusable UI component coverage
- Expanded frontend testing documentation
- Expanded integration and accessibility testing workflows
- Improved integration coverage for complex listing and query synchronization workflows

---
