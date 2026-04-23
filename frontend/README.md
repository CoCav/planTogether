# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, join, and manage events with role-based permissions.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/HTTP-Axios-green)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)

![Vitest](https://img.shields.io/badge/🧪-Vitest-6E9F18)
![Testing Library](https://img.shields.io/badge/🧪-RTL-E33332)
![Tests](https://img.shields.io/badge/Tests-61%20passing-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **frontend application** of PlanTogether, built with **React and Vite**.

It provides a modern and responsive interface to interact with the PlanTogether API.

The application focuses on **usability, role-based interactions, and reliability**, with a comprehensive frontend test suite ensuring stability across core user flows.

---

## 🎯 Application Overview

The frontend allows users to:

- authenticate securely using JWT
- browse and manage events
- join and leave events
- manage roles within events (organizer / co-organizer / participant)
- update their profile and password
- manage session behavior with "Remember me"
- view a personal event dashboard (created / joined events)

The application is designed to provide a smooth and intuitive user experience, with clear navigation and role-based interactions across all features.

It communicates with the backend API using **Axios**, ensuring reliable data fetching and consistent behavior across the application.

---

## 🔧 Tech Stack / Tools

The frontend is built using modern and efficient tools for performance, scalability, and maintainability:

- **React** – component-based UI library
- **Vite** – fast development and build tool
- **React Router** – client-side routing and navigation
- **Axios** – HTTP client for API communication
- **Context API** – global state management (authentication)
- **Custom hooks** – reusable business logic (e.g., membership actions)
- **Session / Local Storage** – token persistence and session handling
- **Testing (Vitest + React Testing Library)** – ensures reliability across UI and user flows

**Additional testing utilities:**
- **@testing-library/jest-dom**
- **@testing-library/user-event**
- **jsdom**

---

## 📁 Frontend Structure

The frontend follows a modular and feature-oriented architecture, designed to keep the codebase scalable, maintainable, and easy to navigate.

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
│   ├── ui
│   │   ├── Alert.jsx
│   │   ├── Badge.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── EmptyState.jsx
│   │   ├── EventCard.jsx
│   │   ├── FormField.jsx
│   │   ├── Input.jsx
│   │   ├── LoadingState.jsx
│   │   ├── PasswordRules.jsx
│   │   ├── Select.jsx
│   │   └── TextArea.jsx
│   │ 
│   └── layout
│       ├── NavBar.jsx
│       └── Footer.jsx
│
├── features
│   ├── auth
│   │   ├── authValidation.js
│   │   └── token.js
│   │
│   └── events
│       ├── eventFilter.js
│       ├── eventValidation.js
│       └── normalizeData.js
│
├── context
│   ├── authContext.jsx
│   ├── authProvider.jsx
│   └── useAuth.js
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
│   └── setupTests.js
│
├── utils
│   ├── extractApiData.js
│   └── format.js
│
├── App.jsx
├── main.jsx
├── index.html
└── README.md
```

This structure promotes a clear separation of concerns, improves reusability, and ensures scalability and maintainability.  
It also makes the codebase easier to test, debug, and evolve as new features are added.

---

## ✨ Features

### 🔐 Authentication

- Login and register
- Authenticate using JWT
- Access protected routes
- Redirect to the originally requested page after login
- Persist sessions with "Remember me"

---

### 👤 User Profile

- View profile information
- Update name and email
- Change password with validation
- Automatically refresh UI after updates
- Display clear and contextual error messages

---

### 📅 Event Management

- View all events
- Create events
- Edit events
- Delete events

Includes:

- strong frontend validation aligned with backend rules
- date and time validation (no past start date, end after start)
- dynamic UI behavior based on event mode and user role

---

### 👥 My Events

- View created events
- View joined events
- Leave events directly from the interface

---

### 🔍 Event Filtering

Users can filter events using:

- keyword search (title and description)
- type
- theme
- location
- exact date
- date range

UX behavior:

- selecting an exact date disables the date range inputs
- multiple filters can be combined
- reset filters reloads all events

---

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

The frontend includes a **comprehensive automated test suite** built with **Vitest** and **React Testing Library**, ensuring reliability across core user flows.

Run all tests:

```bash
npm run test:run
```

### Results
- ✅ 10 test files
- ✅ 61 tests passing

---

### Coverage

#### Pages

- HomePage
- LoginPage
- RegisterPage
- EventsPage
- EventDetailsPage
- MyEventsPage
- CreateEventPage
- EditEventPage
- ProfilePage

#### Routing

- AppRouter / ProtectedRoute

--- 

#### Tested behaviors

- routing and protected access
- form validation and user input handling
- authentication flows (login / register)
- API interactions (mocked)
- loading, empty, and error states
- event creation and editing flows
- role-based UI behavior
- profile and password update

👉 This test suite improves application stability, reduces regressions, and validates the most critical user interactions across the interface.

---

## ⚙️ Environment Variables

The application requires a backend API URL to function properly.

Create a `.env` file at the root of the frontend project:
```
VITE_API_URL=http://localhost:3000/api
```

---

## ▶️ Running the App

Install dependencies and start the development server:
```
npm install
npm run dev
```

The application will run on:
```
http://localhost:5173
```

---

## 🔗 API Integration

The frontend communicates with the backend API using Axios.

Default API base URL:
```
http://localhost:3000/api
```

Axios is configured to:

- automatically attach the JWT token to requests
- handle authenticated requests
- centralize API configuration and error handling

This ensures consistent communication between the frontend and backend across the application.

---

## 📌 Project Status

| Area            | Status |
|-----------------|--------|
| UI / Pages      | ✅ Functional |
| Features        | ✅ Complete |
| Routing         | ✅ Complete |
| API Integration | ✅ Complete |
| Testing         | ✅ 61 tests (10 test files) |
| UX Improvements | 🚧 Ongoing |

---

## 🚀 Recent Improvements

- Added **MyEventsPage** with a dashboard (created vs joined events)
- Refactored **ProfilePage** to improve separation of concerns
- Improved routing protection using **ProtectedRoute**
- Improved redirect behavior after login
- Enhanced error handling with backend messages
- Added **PasswordRules** component for better validation feedback
- Improved form validation aligned with backend rules
- Added comprehensive frontend test coverage with Vitest and React Testing Library
- Implemented tests for all main pages and routing system
- Added global test setup for cleanup and mock handling

---

## 🔮 Future Improvements

- Extend test coverage to lower-level reusable UI components
- Add end-to-end testing (E2E) for complete user journeys
- Improve accessibility (labels, semantic structure, ARIA support)
- Enhance mobile responsiveness across devices
- Add notifications and reminder features