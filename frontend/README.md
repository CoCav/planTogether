# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, join, and manage events with role-based permissions.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Tests](https://img.shields.io/badge/tests-425%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-91.39%25%20statements%20%7C%2087.96%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React, Vite, and Axios**.

It provides a modern, responsive, and user-friendly interface that integrates with the PlanTogether backend API.

Users can:

- Browse, search, and filter events
- Authenticate securely (login, register, profile management)
- Create, update, and manage events
- Join and leave events
- Interact with features based on their role

The application focuses on **usability, role-based interactions, and reliability**, ensuring a smooth and consistent user experience across all core features.

It also includes advanced frontend features such as:

- image upload with preview and drag-and-drop support
- URL-synchronized filters, pagination, and views
- creator-based search and advanced filtering
- contextual empty states and improved loading UX

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
- Access a personal dashboard (events created and joined)

The application is designed to deliver a smooth and intuitive user experience, with clear navigation and role-based interactions across all features.

It also includes advanced UI features such as URL-synchronized filters, contextual empty states, and responsive form interactions.

It communicates with the backend API using **Axios**, ensuring reliable data fetching and consistent behavior throughout the application.

---

## 🔧 Tech Stack

The frontend is built using modern and efficient tools to ensure performance, scalability, and maintainability.

### Core Technologies

- **React** – component-based UI library
- **Vite** – fast development server and build tool
- **React Router** – client-side routing and navigation
- **Axios** – HTTP client for API communication

### State & Logic

- **Context API** – global state management (authentication)
- **Custom hooks** – reusable business logic (e.g., filtering, pagination, membership actions)
- **Session / Local Storage** – token persistence and session handling

### UI & User Experience

- **Drag and drop interactions** – for file uploads (avatars and event images)
- **FormData handling** – for image uploads and API integration
- **Responsive UI components** – reusable and consistent design patterns

### Testing

- **Vitest** – unit and component testing
- **React Testing Library** – testing user interactions and UI behavior

### Additional Testing Utilities

- **@testing-library/jest-dom**
- **@testing-library/user-event**
- **jsdom**

---

## 📁 Frontend Structure

The frontend follows a modular, feature-oriented architecture designed to ensure scalability, maintainability, and ease of navigation.

It separates responsibilities across API communication, UI components, business logic, and routing, providing a clear and organized codebase.

```
src
│
├── api
│   ├── axios.js
│   ├── authApi.js
│   ├── eventApi.js
│   └── eventMembershipApi.js
│
├── assets
│   ├── avatar_user_per_default.png
│   └── event_image_per_default.jpg
│
├── components
│   ├── auth
│   │   ├── AuthFormFields.jsx
│   │   ├── AuthPasswordField.jsx
│   │   ├── ChangePasswordForm.jsx
│   │   └── PasswordRequirements.jsx
│   │
│   ├── events
│   │   ├── EventCard.jsx
│   │   ├── EventForm.jsx
│   │   ├── EventMemberList.jsx
│   │   ├── EventsFiltersCard.jsx
│   │   └── EventsViewTabs.jsx
│   │
│   ├── layout
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   │
│   │
│   ├── layout
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   │
│   └── ui
│       ├── Alert.jsx
│       ├── Badge.jsx
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── EmptyState.jsx
│       ├── FormField.jsx
│       ├── Input.jsx
│       ├── LoadingState.jsx
│       ├── PageLoader.jsx
│       ├── Pagination.jsx
│       ├── Select.jsx
│       └── TextArea.jsx
│
├── context
│   ├── authContext.jsx
│   ├── authProvider.jsx
│   └── useAuth.js
│
├── features
│   ├── auth
│   │   ├── authValidation.js
│   │   └── token.js
│   │
│   └── events
│       ├── eventEmptyState.js
│       ├── eventFilters.js
│       ├── eventQueryParams.js
│       ├── eventValidation.js
│       ├── eventViewConfig.js
│       └── normalizeData.js
│
├── hooks
│   ├── events
│   │   ├── useEventActions.js
│   │   ├── useEventActionsWithConfirm.js
│   │   ├── useEventFilters.js
│   │   ├── useEventManagementWithActions.js
│   │   └── useEventPermissions.js
│   │
│   └── pagination
│       └── usePagination.js
│
├── pages
│   ├── CreateEventPage.jsx
│   ├── EditEventPage.jsx
│   ├── EventDetailsPage.jsx
│   ├── EventsPage.jsx
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── MyEventsPage.jsx
│   ├── ProfilePage.jsx
│   └── RegisterPage.jsx
│
├── routes
│   └── AppRouter.jsx
│
├── styles
│   ├── base.css
│   ├── components.css
│   ├── helpers.css
│   ├── layout.css
│   ├── navigation.css
│   ├── pages.css
│   └── theme.css
│
├── tests
│   ├── api
│   │   └── axios.test.js
│   ├── components
│   │   ├── auth
│   │   │   ├── AuthFormFields.test.jsx
│   │   │   ├── AuthPasswordField.test.jsx
│   │   │   ├── ChangePasswordForm.test.jsx
│   │   │   └── PasswordRequirements.test.jsx
│   │   │
│   │   ├── events
│   │   │   ├── EventCard.test.jsx
│   │   │   ├── EventForm.test.jsx
│   │   │   ├── EventMemberList.test.jsx
│   │   │   ├── EventsFiltersCard.test.jsx
│   │   │   └── EventsViewTabs.test.jsx
│   │   │
│   │   ├── layout
│   │   │   ├── Navbar.test.jsx
│   │   │   └── Footer.test.jsx
│   │   │
│   │   └── ui
│   │       ├── Alert.test.jsx
│   │       ├── Badge.test.jsx
│   │       ├── Button.test.jsx
│   │       ├── Card.test.jsx
│   │       ├── EmptyState.test.jsx
│   │       ├── FormField.test.jsx
│   │       ├── Input.test.jsx
│   │       ├── LoadingState.test.jsx
│   │       ├── PageLoader.test.jsx
│   │       ├── Pagination.test.jsx
│   │       ├── Select.test.jsx
│   │       └── TextArea.test.jsx
│   │
│   ├── context
│   │   └── authProvider.test.jsx
│   │
│   ├── features
│   │   ├── auth
│   │   │   ├── authValidation.test.js
│   │   │   └── token.test.js
│   │   │
│   │   └── events
│   │       ├── emptyState.test.js
│   │       ├── eventFilters.test.js
│   │       ├── eventQueryParams.test.js
│   │       ├── eventValidation.test.js
│   │       ├── eventViewConfig.test.js
│   │       └── normalizeData.test.js
│   │
│   ├── hooks
│   │   ├── events
│   │   │   ├── useEventsActions.test.js
│   │   │   ├── useEventsActionsWithConfirm.test.js
│   │   │   ├── useEventFilters.test.js
│   │   │   ├── useEventManagementActions.test.js
│   │   │   └── useEventPermissions.test.js
│   │   │
│   │   └── pagination
│   │       └── usePagination.test.js
│   │
│   ├── pages
│   │   ├── CreateEventPage.test.jsx
│   │   ├── EditEventPage.test.jsx
│   │   ├── EventDetailsPage.test.jsx
│   │   ├── EventsPage.test.jsx
│   │   ├── HomePage.test.jsx
│   │   ├── LoginPage.test.jsx
│   │   ├── MyEventsPage.test.jsx
│   │   ├── ProfilePage.test.jsx
│   │   └── RegisterPage.test.jsx
│   │
│   ├── routes
│   │   └── AppRouter.test.jsx
│   │
│   ├── utils
│   │   ├── extractApiData.test.js
│   │   ├── fetchAllPaginated.test.js
│   │   ├── format.test.js
│   │   └── getUploadedFile.test.js
│   │
│   └── setupTests.js
│
├── utils
│   ├── extractApiData.js
│   ├── fetchAllPaginated.js
│   ├── format.js
│   └── getUploadedFile.js
│
├── App.jsx
├── main.jsx
└── README.md
```

The structure separates concerns between UI, business logic, and data fetching, making the application easier to maintain and extend.

- **Components** are reusable and focused on UI
- **Pages** handle routing and high-level logic
- **Hooks** encapsulate reusable stateful logic
- **Features** centralize domain-specific logic (e.g., event filtering and query params)
- **Services** manage API communication
- **Utils** provide shared helpers (e.g., image handling)

This architecture ensures scalability, reusability, and a clean separation of responsibilities across the frontend.

---

## ✨ Features

### 🔐 Authentication

- Login and register
- Authenticate using JWT
- Access protected routes
- Redirect to the originally requested page after login
- Persist sessions with a "Remember me" feature

### 👤 User Profile

- View profile information
- Update name and email
- Change password with validation
- Upload and update user avatar
- Preview avatar before upload
- Automatically refresh the UI after updates
- Display clear and contextual error messages

### 📅 Event Management

- View all events
- Create events
- Edit events
- Delete events
- Upload and update event images
- Preview images before upload

Additional features:

- Strong frontend validation aligned with backend rules
- Date and time validation (no past start date, end date after start date)
- Dynamic UI behavior based on event state and user role

### 👥 My Events

- View created events
- View joined events
- Leave events directly from the interface
- Filter events based on active view (created, joined, history)

### 🔍 Event Filtering

Users can filter events using:

- Keyword search (title and description)
- Creator search
- Type
- Theme
- Location
- Exact date
- Date range

UI behavior:

- Selecting an exact date disables the date range inputs
- Multiple filters can be combined
- Resetting filters reloads all events
- Filters, pagination, and active view are synchronized with the URL


### 🧭 Navigation & State Management

- URL-synchronized filters, pagination, and views
- Persistent state across page refresh and navigation
- Config-driven event tabs (All, Upcoming, Archives, etc.)

### 🎭 Role System

Each user can have a role in an event:

```txt
organizer
co_organizer
participant
guest
```

#### Organizer

- Edit event
- Delete event
- Promote participants
- Demote co_organizers
- Remove participants and co_organizers

#### Co-organizer

- Edit event
- Remove participants

#### Participant

- Join event
- Leave event

#### Guest

- Browse public event information
- Login prompt for interactive actions

The UI dynamically adapts based on the user's role and permissions.

### 📄 User Experience

- Contextual empty states depending on filters and views
- Loading states for async operations
- Responsive layout and reusable UI components
- Consistent design across pages and components

---

## 🧪 Testing

The frontend includes a **comprehensive automated test suite** built with **Vitest** and **React Testing Library**, covering pages, components, routing, hooks, utilities, and user interactions.

These tests ensure UI reliability, reduce regressions, and validate the most important frontend user flows, including filtering, uploads, and role-based interactions.

### ▶️ Run Tests

```bash
npm run test:run
```

### ▶️ Run Tests with coverage

```bash
npx vitest run --coverage
```

### 📊 Results

- 53 test suites
- 425 tests
- ✅ All passing

**Coverage:**
- 91.39% statements coverage
- 87.96% branch coverage
- 83.33% functions coverage
- 93.94% lines coverage
- ✅ High coverage across core features such as filtering, uploads, and UI interactions

---

### 📦 Test Coverage

The frontend test suite covers multiple layers of the application:

#### 🧭 Pages & User Flows

- Home page
- Login and register flows
- Events listing, filtering, and pagination
- Event details
- My Events dashboard (created and joined events)
- Event creation and editing
- Profile and password update
- Avatar and event image upload flows

#### 🧱 Components

- UI components
- Layout components
- Event cards (with image handling and fallback)
- Form inputs and select fields
- Loading, empty, and error states
- Role-based UI elements
- Upload components (preview, remove actions, drag & drop behavior)

#### 🛣️ Routing

- App routing
- Protected routes
- Redirect behavior after login
- Access control based on authentication state
- URL-synchronized filters, pagination, and active views

#### 🧠 Logic & Utilities

- Authentication context
- Token persistence
- Event filtering helpers (including creator-based filtering)
- Event validation helpers
- API data extraction and formatting utilities
- Image handling utilities (`getUploadedFile`)
- Custom hooks (event filtering, pagination, membership actions)
- Paginated data fetching utility (`fetchAllPaginated`)

---

### 🔁 Test Strategy

- Tests simulate real user interactions with `React Testing Library`
- API calls are mocked to isolate frontend behavior
- Routing behavior is tested through the app router
- Authentication and protected access flows are validated
- Tests cover success, loading, empty, and error states
- Critical logic (filtering, pagination, uploads) is tested in isolation

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
- Used by Axios for all API requests

👉 A `.env.example` file can be used as a reference configuration.

---

## ▶️ Running the App

To install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application will be available at:

`http://localhost:5173` (default Vite port)

---

## 🔗 API Integration

The frontend communicates with the backend API using **Axios**, ensuring consistent and reliable data fetching across the application.

The API base URL is configured via environment variables:

```env
VITE_API_URL=http://localhost:3000/api
```

Axios is configured to:

- Automatically attach the JWT token to authenticated requests
- Handle API requests and responses consistently
- Support `FormData` requests for file uploads (avatars and event images)
- Centralize API configuration and error handling

This setup ensures seamless communication between the frontend and backend, while keeping the codebase clean, scalable, and maintainable.

---

## 🚀 Recent Improvements

### 🔧 Features & UI

- Added avatar and event image upload UI with preview and drag-and-drop support
- Introduced URL-synchronized filters, pagination, and active views
- Added creator-based search and advanced event filtering
- Improved contextual empty states and loading experience
- Implemented config-driven event tabs for better scalability

### 🧪 Testing

- Added comprehensive frontend test coverage using **Vitest** and **React Testing Library**
- Expanded tests to cover filtering logic, uploads, and user interactions
- Improved test structure for better maintainability
- Added global test setup for cleanup and mock handling

---

## 📌 Project Status

| Area              | Status |
|-------------------|--------|
| UI / Pages        | ✅ Complete |
| Features          | ✅ Complete |
| Routing           | ✅ Complete |
| API Integration   | ✅ Complete |
| File Uploads      | ✅ Avatars & event images supported |
| Testing           | ✅ 425 tests (53 test files) |
| UX Improvements   | 🚧 Ongoing |

---

## 🔮 Future Improvements

### 🚀 Features & UX

- Add notifications and reminder features
- Enhance mobile responsiveness across devices
- Improve accessibility (labels, semantic structure, ARIA support)
- Add advanced UI feedback (toasts, real-time updates)

### 🧪 Testing

- Extend test coverage to lower-level reusable UI components
- Add end-to-end (E2E) testing for complete user journeys

---
