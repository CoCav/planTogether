# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, join, and manage events with role-based permissions.

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Build](https://img.shields.io/badge/Build-Vite-purple)
![HTTP](https://img.shields.io/badge/HTTP-Axios-green)
![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/Test-Vitest-6E9F18)
![RTL](https://img.shields.io/badge/Test-React%20Testing%20Library-E33332)
![Tests](https://img.shields.io/badge/tests-211%20tests-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React, Vite, and Axios**.

It provides a modern, responsive, and user-friendly interface that integrates with the PlanTogether backend API.

Users can:

- Browse and filter events  
- Authenticate securely (login, register, profile management)  
- Create, update, and manage events  
- Join and leave events  
- Interact with features based on their role  

The application focuses on **usability, role-based interactions, and reliability**, ensuring a smooth and consistent user experience across all core features.

---

## 🎯 Application Overview

The frontend provides a complete interface for interacting with the PlanTogether platform.

It allows users to:

- Authenticate securely using JWT  
- Browse, filter, and manage events  
- Join and leave events  
- Manage roles within events (`organizer`, `co_organizer`, `participant`)  
- Update their profile and password  
- Manage session behavior with a "Remember me" feature  
- Access a personal dashboard (events created and joined)  

The application is designed to deliver a smooth and intuitive user experience, with clear navigation and role-based interactions across all features.

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
- **Custom hooks** – reusable business logic (e.g., membership actions)  
- **Session / Local Storage** – token persistence and session handling  

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
├── components
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
│       ├── EventCard.jsx
│       ├── EventViewTabs.jsx
│       ├── FormField.jsx
│       ├── Input.jsx
│       ├── LoadingState.jsx
│       ├── MyEventsViewTabs.jsx
│       ├── PasswordRules.jsx
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
│       ├── eventFilters.js
│       ├── eventValidation.js
│       └── normalizeData.js
│
├── hooks
│   ├── useEventActions.jsx
│   └── useEventActionsWithConfirm.js
│
├── pages
│   ├── CreateEventPage.jsx
│   ├── EditEventPage.jsx
│   ├── EventDetailsPage.jsx
│   ├── MyEventsPage.jsx
│   ├── EventsPage.jsx
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── ProfilePage.jsx
│
├── routes
│   └── AppRouter.jsx
│
├── styles
│   ├── base.css
│   ├── components.css
│   ├── helpers.css
│   ├── layout.css
│   ├── pages.css
│   └── theme.css
│
├── tests
│   ├── api
│   │   └── axios.test.jsx
│   ├── components
│   │   ├── layout
│   │   │   ├── Navbar.test.jsx
│   │   │   └── Footer.test.jsx
│   │   │
│   │   └── ui
│   │       ├── Badge.test.jsx
│   │       ├── Button.test.jsx
│   │       ├── EventCard.test.jsx
│   │       ├── EventViewTabs.test.jsx
│   │       ├── MyEventsViewTabs.test.jsx
│   │       ├── PasswordRules.test.jsx
│   │       └── Select.test.jsx
│   │
│   ├── context
│   │   └── authProvider.test.jsx
│   │
│   ├── features
│   │   ├── auth
│   │   │   ├── authValidation.test.jsx
│   │   │   └── token.test.jsx
│   │   │
│   │   └── events
│   │       ├── eventFilters.test.jsx
│   │       ├── eventValidation.test.jsx
│   │       └── normalizeData.test.jsx
│   │
│   ├── hooks
│   │   ├── useEventActions.test.jsx
│   │   └── useEventActionsWithConfirm.test.jsx
│   │
│   ├── pages
│   │   ├── CreateEventPage.test.jsx
│   │   ├── EditEventPage.test.jsx
│   │   ├── EventDetailsPage.test.jsx
│   │   ├── MyEventsPage.test.jsx
│   │   ├── EventsPage.test.jsx
│   │   ├── HomePage.test.jsx
│   │   ├── LoginPage.test.jsx
│   │   ├── RegisterPage.test.jsx
│   │   └── ProfilePage.test.jsx
│   │
│   ├── routes
│   │   └── AppRouter.test.jsx
│   │
│   ├── utils
│   │   ├── extractApiData.test.jsx
│   │   └── format.test.jsx
│   │
│   └── setupTests.js
│
├── utils
│   ├── extractApiData.js
│   └── format.js
│
├── App.jsx
├── main.jsx
└── README.md
```

This structure improves reusability, simplifies testing and debugging, and makes the application easier to evolve as new features are added.

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
- Automatically refresh the UI after updates  
- Display clear and contextual error messages  

### 📅 Event Management

- View all events  
- Create events  
- Edit events  
- Delete events  

Additional features:

- Strong frontend validation aligned with backend rules  
- Date and time validation (no past start date, end date after start date)  
- Dynamic UI behavior based on event state and user role  

### 👥 My Events

- View created events  
- View joined events  
- Leave events directly from the interface  

### 🔍 Event Filtering

Users can filter events using:

- Keyword search (title and description)  
- Type  
- Theme  
- Location  
- Exact date  
- Date range  

UI behavior:

- Selecting an exact date disables the date range inputs  
- Multiple filters can be combined  
- Resetting filters reloads all events  

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

---

## 🧪 Testing

The frontend includes a **comprehensive automated test suite** built with **Vitest** and **React Testing Library**, covering pages, components, routing, hooks, utilities, and user interactions.

These tests ensure UI reliability, reduce regressions, and validate the most important frontend user flows.

### ▶️ Run Tests

```bash
npm run test:run
```

### 📊 Results

- 30 test suites
- 211 tests
- ✅ All passing

---

### 📦 Test Coverage

The frontend test suite covers multiple layers of the application:

#### 🧭 Pages & User Flows

- Home page
- Login and register flows
- Events listing and filtering
- Event details
- My Events dashboard
- Event creation and editing
- Profile and password update

#### 🧱 Components

- UI components
- Layout components
- Event cards
- Form inputs and select fields
- Loading, empty, and error states
- Role-based UI elements

#### 🛣️ Routing

- App routing
- Protected routes
- Redirect behavior after login
- Access control based on authentication state

#### 🧠 Logic & Utilities

- Authentication context
- Token persistence
- Event filtering helpers
- Event validation helpers
- API data extraction and formatting utilities
- Custom event action hooks

### 🔁 Test Strategy

- Tests simulate real user interactions with `React Testing Library`
- API calls are mocked to isolate frontend behavior
- Routing behavior is tested through the app router
- Authentication and protected access flows are validated
- Tests cover success, loading, empty, and error states

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

👉 A `.env.example` file can be used as a reference configuration.

---

## ▶️ Running the App

To install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application will be available at:

`http://localhost:5173`

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
- Centralize API configuration and error handling

This setup ensures seamless communication between the frontend and backend, while keeping the codebase clean and maintainable.

---

## 🚀 Recent Improvements

### 🔧 Features & UI

- Added **MyEventsPage** with a dashboard (created vs joined events)  
- Refactored **ProfilePage** to improve separation of concerns  
- Improved routing protection using **ProtectedRoute**  
- Enhanced redirect behavior after login  
- Improved error handling using backend responses  
- Added **PasswordRules** component for better validation feedback  
- Strengthened form validation aligned with backend rules  

### 🧪 Testing

- Added comprehensive frontend test coverage using **Vitest** and **React Testing Library**  
- Implemented tests for all main pages and routing system  
- Added global test setup for cleanup and mock handling  

---

## 📌 Project Status

| Area            | Status |
|-----------------|--------|
| UI / Pages      | ✅ Complete |
| Features        | ✅ Complete |
| Routing         | ✅ Complete |
| API Integration | ✅ Complete |
| Testing         | ✅ 211 tests (30 test suites) |
| UX Improvements | 🚧 Ongoing |

---

## 🔮 Future Improvements

### 🚀 Features & UX

- Add notifications and reminder features  
- Enhance mobile responsiveness across devices  
- Improve accessibility (labels, semantic structure, ARIA support)  

### 🧪 Testing

- Extend test coverage to lower-level reusable UI components  
- Add end-to-end (E2E) testing for complete user journeys  

---