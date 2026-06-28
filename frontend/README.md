# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform that enables users to create, discover, join, and manage events through a modern, role-aware interface.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)
![Architecture](https://img.shields.io/badge/Architecture-Feature%20Oriented-blueviolet)
![Accessibility](https://img.shields.io/badge/Accessibility-Semantic%20HTML%20%26%20ARIA-009688)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Test Files](https://img.shields.io/badge/test%20files-153%20passing-brightgreen)
![Tests](https://img.shields.io/badge/tests-1619%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-97.26%25%20statements%20%7C%2093.37%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React, Vite, Axios, and React Router**.

It delivers a responsive, accessibility-first experience for discovering, organizing, and participating in collaborative events.

Key architectural principles include:

- feature-oriented architecture
- unified API communication and error handling
- protected routing and authentication flows
- role-aware access guards and permission-driven UI
- custom hooks, context providers, and modular UI components
- query synchronization and shared pagination utilities
- interactive maps and geolocation-aware experiences
- global toast notifications for transient user feedback
- Semantic HTML, ARIA relationships, and keyboard accessibility
- comprehensive automated testing with Vitest and React Testing Library

The architecture prioritizes scalability, modular design, accessible interactions, and long-term maintainability.

---

## 📚 Table of Contents

- [🎯 Application Overview](#-application-overview)
- [🔧 Tech Stack](#-tech-stack)
- [📁 Frontend Structure](#-frontend-structure)
- [✨ Features](#-features)
- [🛡️ Routing & Access Control](#️-routing--access-control)
- [🔌 Frontend API Layer](#-frontend-api-layer)
- [🧠 Frontend Logic Layer](#-frontend-logic-layer)
- [🎨 Styling Architecture](#-styling-architecture)
- [🧪 Testing](#-testing)
- [⚡ Getting Started](#-getting-started)
- [🚀 Recent Improvements](#-recent-improvements)
- [📌 Project Status](#-project-status)
- [🗺️ Roadmap](#️-roadmap)

---

## 🎯 Application Overview

PlanTogether provides a complete interface for discovering, organizing, and participating in collaborative events.

Users can:

- authenticate securely using JWT
- browse, search, filter, and manage events across ongoing, upcoming, all, and archived views
- create, edit, and delete events
- join and leave events with role-aware permissions
- manage **organizers**, **co-organizers**, and **participants**
- create, edit, and manage event reviews and ratings
- view review summaries, average ratings, and review counts
- manage profile information, passwords, and avatars
- upload, preview, replace, and remove avatars and event images
- receive contextual toast notifications for transient actions
- persist authenticated sessions with a **Remember me** option
- access personalized dashboards for created and joined events
- browse public profiles and public event listings
- use location autocomplete and interactive event maps
- navigate protected routes through authentication and permission-aware access guards

The application combines modular architecture, shared business logic, responsive interfaces, and accessibility-first design to deliver a consistent and scalable user experience.

---

## 🔧 Tech Stack

The application is built with modern technologies and architectural patterns designed for performance, scalability, accessibility, and long-term maintainability.

### Core Technologies

- **React** – component-based UI library
- **Vite** – fast development server and build tool
- **React Router** – client-side routing and navigation
- **Axios** – HTTP client for API communication
- **Lucide React** – lightweight, accessible icon library

### State & Business Logic

- **Feature-oriented architecture** – domain-driven application organization
- **Context API** – global authentication and notification state management
- **Custom hooks** – encapsulated business and UI logic
- **Query synchronization** – URL-driven filtering, sorting, and pagination
- **Normalization utilities** – consistent API response and pagination handling
- **Session Storage / Local Storage** – authentication persistence and session management
- **Utilities and configuration** – common helpers, constants, and application settings

### UI & User Experience

- **Modular UI components** – consistent and composable interface patterns
- **Role-aware rendering** – contextual interfaces driven by user permissions
- **Protected access guards** – authentication-aware navigation and authorization checks
- **Global toast notifications** – transient user feedback across the application
- **Responsive layouts and forms** – adaptive experiences across screen sizes
- **Drag-and-drop uploads** – avatar and event image management
- **FormData-based upload workflows** – image upload and lifecycle handling
- **Interactive maps** – React Leaflet and OpenStreetMap integration
- **Location autocomplete** – geolocation-assisted event creation
- **URL-synchronized filtering and pagination** – browser-friendly navigation state
- **Loading, empty, and error states** – consistent asynchronous feedback
- **Accessibility-first design** – Semantic HTML, ARIA relationships, and keyboard navigation

### Testing

- **Vitest** – unit and integration testing
- **React Testing Library** – user-centric component testing
- **Factories, mocks, render helpers, and testing utilities** – structured, scalable testing infrastructure

---

## 📁 Frontend Structure

The project follows a modular, feature-oriented architecture that promotes scalability, maintainability, consistency, and testability.

The codebase is organized into dedicated layers for API communication, domain logic, routing, UI composition, styling, and testing.

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
│   │   ├── auth/
│   │   └── toast/
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
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env
├── index.html
└── README.md
```

### 🧩 Architecture Notes

- **API modules** encapsulate HTTP communication, authenticated requests, uploads, payload normalization, pagination, and API error handling.

- **Context** manages shared application state, including authentication, session restoration, and global toast notifications.

- **Components** are organized by business domain (`auth`, `events`, `eventMemberships`, `eventReviews`, `users`) or shared responsibility (`forms`, `layout`, `ui`).

- **Pages** compose feature hooks, UI components, and API interactions into complete user-facing screens.

- **Features** encapsulate domain logic, validation, filtering, query synchronization, permission rules, payload builders, normalization utilities, and feature-specific workflows.

- **User features** are divided into `authenticated/` and `public/` modules to separate private account management from publicly accessible experiences.

- **Global hooks** provide cross-feature capabilities such as pagination, click-outside detection, upload previews, and toast notifications.

- **Feature hooks** remain colocated with their domain whenever they are tightly coupled to business logic.

- **Routes** define public and protected navigation, authentication redirects, and access control.

- **Styles** are separated into global, layout, page, and component stylesheets for a consistent and responsive design system.

- **Tests** mirror the application architecture through feature-based organization, factories, mocks, render helpers, and testing utilities.

This layered architecture separates presentation, domain logic, routing, API communication, styling, and testing into clearly defined responsibilities, making the codebase easier to navigate, extend, and maintain.

---

## ✨ Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Protected routes and access guards
- Session restoration after refresh
- Persistent sessions with a **Remember me** option
- Automatic redirection to originally requested protected routes
- Shared authentication forms, validation, and state management

### 👤 User Profiles

- View and update profile information
- Change passwords with live validation
- Upload, preview, replace, and remove avatars
- Drag-and-drop avatar uploads
- Delete accounts with ownership-transfer safeguards
- Public user profiles with event history and statistics
- Automatic profile synchronization after account updates

### 📅 Event Management

- Browse public events across ongoing, upcoming, all, and archived views
- Create, edit, and delete events
- Upload, preview, replace, and remove event images
- Interactive maps and location autocomplete
- Shared event forms and validation
- URL-synchronized filtering, sorting, and pagination

Additional capabilities include:

- role-aware and permission-aware actions
- event lifecycle awareness (`upcoming`, `ongoing`, `ended`)
- started-event editing restrictions
- responsive event details and member management
- image preservation, replacement, and validation

### ⭐ Event Reviews & Ratings

- Create, edit, and delete reviews
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
- Member avatars linked to public profiles

### 📂 My Events Dashboard

- View created and joined events
- Separate active and historical views
- Leave joined events directly from the dashboard
- Shared filtering, sorting, and pagination

### 📤 Upload System

- Drag-and-drop uploads
- Shared preview architecture for avatars and event images
- Centralized upload validation and preview management
- Accessible, responsive upload components

### 🔍 Filtering & Navigation

Events can be filtered by:

- keyword
- creator
- type, theme, mode, and location
- exact date or date range
- sorting and pagination

Filtering also supports:

- URL synchronization
- persistent navigation state
- view-aware filter management
- mutually exclusive exact-date and date-range filters
- clean URL generation

### 🎭 Role System

Authenticated users can have one of the following event roles:

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
- Create, edit, and delete reviews for completed events they attended

### 🌐 Public Experience

Unauthenticated visitors can:

- browse public event listings
- browse public user profiles
- view membership information
- access interactive event maps
- read event reviews and ratings
- receive contextual login prompts for protected actions

### ♿ User Experience

- Responsive layouts
- Loading, empty, and error states
- Global toast notifications
- Accessible forms, navigation, and interactive components
- Semantic HTML and ARIA relationships
- Keyboard-friendly interactions

---

## 🛡️ Routing & Access Control

Routing, authentication, protected navigation, and permission-aware interactions are coordinated through dedicated routing components and access guards.

### 🔐 Protected Routing

Protected routes are defined in:

```txt
AppRouter.jsx
ProtectedRoute.jsx
```

Authenticated-only pages include:

- event creation
- event editing
- profile management
- personalized event dashboards

Unauthenticated users attempting to access protected pages are automatically redirected to the login page while preserving their intended destination.

### 🔄 Authentication Persistence

Authentication state is managed by:

```txt
AuthContext.jsx
AuthProvider.jsx
```

The application supports:

- JWT token persistence
- session restoration after refresh
- **Remember me** authentication
- automatic user restoration during application startup
- auth-ready loading guards that prevent protected data from loading before authentication is fully initialized

### ↩️ Redirect Restoration

Authentication flows preserve navigation by:

- redirecting users back to protected pages after login
- preserving route state and query parameters
- maintaining navigation state between login and registration
- using shared authentication redirect helpers

### 🔒 Permission-aware Access

Permission checks are used to:

- prevent unauthorized access to edit pages
- conditionally render edit and delete actions
- restrict destructive actions once an event has started
- lock the start date and time of ongoing events
- keep frontend permissions synchronized with backend authorization

Permission and membership information is retrieved through:

```http
GET /api/events/:eventId/me
```

This endpoint provides:

- current membership role
- event status
- edit permissions
- delete permissions
- started-event restrictions

These access guards improve the user experience while keeping the backend as the single source of truth for authorization.

---

## 🔌 Frontend API Layer

The application uses a unified API layer built on top of **Axios** to handle communication with the backend.

The API base URL is configured through environment variables:

```env
VITE_API_URL=http://localhost:3000/api
```

### 📦 API Responsibilities

The API layer is responsible for:

- authenticated requests
- JWT token injection
- multipart uploads with `FormData`
- request and response normalization
- consistent API error handling
- pagination and payload normalization
- payload extraction utilities
- permission and access requests

### ⚙️ Core API Utilities

#### `apiClient.js`

Shared Axios configuration used throughout the application.

Provides:

- base API URL configuration
- authorization header injection
- authenticated request handling
- common Axios configuration

#### `apiError.js`

Utilities for normalizing API errors.

Provides:

- Axios error normalization
- validation error extraction
- fallback error handling
- consistent user-friendly error messages

#### `apiResponse.js`

Utilities for processing API responses.

Provides:

- response unwrapping
- payload extraction
- paginated payload normalization
- pagination metadata extraction
- response helper functions

### 📌 API Architecture Notes

- JWT tokens are automatically injected into authenticated requests.
- Upload requests support `FormData` for image preservation, replacement, and removal.
- Responses are normalized before being consumed by feature hooks and UI components.
- API errors follow a consistent normalization strategy across the application.
- Paginated resources rely on shared payload extraction and pagination utilities.
- Permission-aware interfaces are synchronized with backend authorization through dedicated access endpoints.
- Feature modules consume the API layer instead of interacting directly with Axios.

---

## 🧠 Frontend Logic Layer

The application's business logic is organized into feature-oriented modules that clearly separate presentation, domain logic, state management, and feature-specific responsibilities.

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

The feature layer encapsulates responsibilities such as:

- validation
- filtering, sorting, pagination, and query synchronization
- payload builders and response normalization
- role-based permissions
- access synchronization
- event view configuration
- review statistics and workflows
- membership interactions
- loading, feedback, and empty-state management

### 🔐 Authentication Logic

The authentication layer manages:

- login and registration
- token persistence
- protected routing and access guards
- authentication state
- redirect restoration
- session recovery
- auth-ready loading

### 📅 Event Logic

The event layer provides:

- filtering, sorting, and pagination
- URL query synchronization
- validation
- payload builders and response normalization
- event lifecycle awareness
- started-event editing restrictions
- date and time validation
- image lifecycle management

### ⭐ Event Review Logic

The review layer includes:

- review creation, editing, and deletion
- rating validation
- paginated review retrieval
- review normalization
- ownership rules
- review statistics and average ratings
- inline editing

### 👥 Membership Logic

The membership layer coordinates:

- joining and leaving events
- role-aware permissions
- organizer and co-organizer workflows
- ownership transfer
- protected membership actions
- membership role synchronization
- confirmation flows for destructive actions

### 👤 User Logic

The user layer is responsible for:

- authenticated account management
- public profile experiences
- user data normalization
- personalized event dashboards
- contextual empty states

### 🔁 Shared Utilities

Common utilities include:

- custom hooks
- formatting utilities
- uploaded file helpers
- pagination utilities
- payload builders
- normalization helpers
- shared constants and configuration
- query synchronization helpers

### 📌 Architecture Notes

- Business logic is separated from presentation whenever possible.
- Domain-specific logic remains colocated with its corresponding feature.
- Shared utilities reduce duplication across features.
- Payload builders and normalization helpers ensure consistent data processing.
- Common pagination and API error handling improve consistency across the application.
- Feature isolation keeps the codebase easier to scale, test, and maintain.

---

## 🎨 Styling Architecture

The styling architecture is organized into dedicated layers that separate global styles, layouts, UI components, responsive behavior, and page-specific presentation.

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

#### `reset.css`

Provides a consistent foundation by handling:

- browser style normalization
- default element rendering
- spacing and typography resets

#### `theme.css`

Defines the application's design system, including:

- color palette
- typography
- spacing
- CSS custom properties
- shared design tokens

#### `layout.css`

Defines the application's layout system, including:

- page structure
- responsive containers
- spacing utilities
- layout primitives

#### `styles/components/`

Contains component-level styles for:

- buttons
- forms
- cards
- navigation
- uploads
- toast notifications
- feedback and status components
- interactive interface elements

#### `styles/pages/`

Contains page-specific styles for views such as:

- event pages
- authentication pages
- dashboard pages
- profile pages

### 📌 Styling Notes

- Global styles provide a consistent visual foundation across the application.
- Component styles remain independent from page-specific presentation.
- Design tokens ensure a cohesive visual language throughout the interface.
- Shared styling foundations are applied across events, dashboards, profiles, reviews, uploads, and feedback components.
- This layered approach promotes consistency, accessibility, maintainability, and scalability.

---

## 🧪 Testing

The application includes a comprehensive automated test suite built with **Vitest** and **React Testing Library**.

Testing emphasizes business logic, routing, accessibility, feature behavior, and long-term maintainability.

### ▶️ Run Tests

```bash
npm run test:run
```

### ▶️ Run Tests with Coverage

```bash
npm run test:coverage
```

### 📊 Test Results

- ✅ **153** passing test files
- ✅ **1619** passing tests
- ✅ **100%** passing rate

**Coverage**

- **97.26%** statement coverage
- **93.37%** branch coverage
- **96.03%** function coverage
- **97.92%** line coverage

The suite delivers extensive automated coverage across authentication, routing, pagination, uploads, accessibility, reviews, permission-aware interactions, and shared UI components.

### 📦 Coverage Highlights

Tests cover:

- routing, protected navigation, and authentication flows
- filtering, sorting, pagination, and query synchronization
- API modules, payload builders, normalization utilities, and error handling
- event reviews, ratings, review statistics, and paginated review flows
- permission-aware interfaces and access guards
- uploads, image lifecycle management, and drag-and-drop interactions
- accessibility, Semantic HTML, ARIA relationships, and keyboard navigation
- toast notifications and transient user feedback
- public profiles, dashboards, and event management
- components, hooks, contexts, factories, mocks, and testing utilities

### 🔁 Testing Approach

- React Testing Library simulates realistic user interactions whenever possible.
- API modules are mocked to isolate business logic.
- Routing, authentication, permissions, and business rules are validated independently from presentation where appropriate.
- Factories, mocks, render helpers, and testing utilities minimize duplicated setup.
- Accessibility, semantic structure, and ARIA relationships are verified across the interface.
- Dynamic accessibility patterns (such as `useId()`-generated relationships) are validated without relying on hardcoded identifiers.

For a detailed overview of the testing architecture, utilities, factories, mocks, and testing workflows, see [`docs/testing.md`](./docs/testing.md).

---

## ⚡ Getting Started

### Environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

Environment notes:

- `VITE_API_URL` defines the backend API base URL.
- The value must match your backend server.
- It is used by the application's Axios client for every API request.
- Different values can be used for development, staging, and production.

An `.env.example` file is included as a reference configuration.

### Installation

Install the project dependencies:

```bash
npm install
```

### Run the Application

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

**Development**

```txt
http://localhost:5173
```

**Production Preview**

```txt
http://localhost:4173
```

---

## 🚀 Recent Improvements

### 🧩 Architecture & Infrastructure

- Introduced a global toast notification system for transient user feedback
- Unified API error handling through shared normalization utilities
- Consolidated payload builders and pagination normalization across features
- Improved authentication initialization with auth-ready loading guards

### ♿ Accessibility & User Experience

- Improved accessibility across components and application pages
- Replaced static ARIA relationships with dynamic `useId()` patterns where appropriate
- Refined semantic HTML, navigation, forms, and interactive elements
- Improved responsive layouts and interface consistency

### 📅 Event Experience

- Improved membership role synchronization after participation changes
- Refined permission-aware event interactions and loading behavior
- Enhanced event forms, location workflows, and responsive layouts

### 🧪 Testing

- Expanded coverage for accessibility, routing, and permission-aware interactions
- Added validation for dynamic accessibility relationships
- Added coverage for toast notifications, auth-ready loading, pagination normalization, and API error handling
- Increased the test suite to **153 passing test files**, **1619 passing tests**, and over **97% statement coverage**

---

## 📌 Project Status

| Area                            | Status                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Frontend UI & Pages             | ✅ Responsive, accessibility-first, role-aware, and geolocation-enabled                                  |
| Event Management                | ✅ Event creation, editing, filtering, interactive maps, and lifecycle-aware workflows                   |
| Event Reviews & Ratings         | ✅ Review creation, editing, ratings, pagination, summaries, and statistics                              |
| Membership & Permissions        | ✅ Role-aware interactions, ownership transfer, and synchronized permission handling                     |
| UI Components                   | ✅ Modular, accessible, responsive, and thoroughly tested                                                |
| Business Logic                  | ✅ Feature-oriented, validation-driven, and consistently normalized                                      |
| Routing & Access Control        | ✅ Protected routing, redirect restoration, auth-ready loading, and permission-aware access guards       |
| API Layer                       | ✅ Unified Axios architecture with normalized requests, responses, pagination, and error handling        |
| Location & Maps                 | ✅ Location autocomplete, geolocation workflows, and interactive maps                                    |
| File Uploads                    | ✅ Drag-and-drop uploads, shared previews, and image lifecycle management                                |
| Query Synchronization           | ✅ URL-driven filtering, sorting, pagination, and active view management                                 |
| User Experience & Accessibility | ✅ Responsive interface, Semantic HTML, ARIA relationships, toast notifications, and keyboard navigation |
| Testing                         | ✅ **153 passing test files** · **1619 passing tests**                                                   |
| Coverage                        | ✅ **97.26%** statements · **93.37%** branches · **96.03%** functions · **97.92%** lines                 |

---

## 🗺️ Roadmap

### 🚀 Features & User Experience

- Event likes and lightweight social interactions
- Event discussions and comment threads
- Event invitations and shareable links
- Email notifications, reminders, and event updates
- Smarter event discovery and recommendation features
- Continued improvements to dashboards, profiles, and event management

### 🏗️ Architecture

- Continue moving domain logic into dedicated feature modules
- Further consolidate UI components and styling architecture
- Expand common utilities as new features are introduced
- Continue improving project documentation

### 🗺️ Location & Maps

- Marker clustering and map performance optimizations
- Additional geolocation filters and map-based discovery
- Enhanced location search and autocomplete

### ♿ Accessibility

- Continue improving keyboard navigation
- Expand accessibility testing and semantic coverage
- Refine responsive behavior across additional devices

### 🧪 Testing

Future improvements include:

- End-to-end testing for complete user journeys
- Expanded accessibility and integration testing
- Additional coverage for advanced filtering and event workflows
- Expanded map and geolocation testing
- Continued regression coverage for future features

---
