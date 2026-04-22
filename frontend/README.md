# PlanTogether - Frontend (React)

PlanTogether is a collaborative event management platform where users can create, join and manage events with role-based permissions.

![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/HTTP-Axios-green)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

This is the **frontend application** of PlanTogether, built with **React and Vite**.

It provides a modern interface to interact with the PlanTogether API, allowing users to manage events, roles, and their profile through a responsive and user-friendly UI.

---

# 🎯 Application Overview

The frontend allows users to:

- authenticate securely using JWT
- browse and manage events
- join and leave events
- manage roles within events (organizer / co-organizer / participant)
- update their profile and password
- manage session behavior with "Remember me"
- view personal event dashboard (created / joined events)

The application communicates with the backend API via **Axios**.

---

# 🔧 Tech Stack

- **React** – UI library
- **Vite** – fast development environment
- **React Router** – client-side routing
- **Axios** – API communication
- **Context API** – global state management (authentication)
- **Custom hooks** – reusable logic (membership actions)
- **Session / Local Storage** – token handling

---

# 🧩 Key Features

## 🔐 Authentication

- Login with JWT
- Logout
- Persistent session (optional "Remember me")
- Session-based authentication (token cleared on browser close)
- Protected routes
- Redirect to originally requested page after login

---

## 👤 User Profile

- View profile information
- Update name and email
- Change password with validation
- Real-time UI update using `refreshUser`
- Clear error messages from backend

---

## 📅 Event Management

- View all events
- Browse event details with advanced filtering (search in title and description, type, theme, location, date)
- Create events
- Update events *(organizer / co_organizer)*
- Delete events *(organizer only)*

Includes:

- Strong frontend validation aligned with backend
- Date/time validation (no past start, end after start)

---

## 👥 My Events (User Dashboard)

- View **created events (organizer)**
- View **joined events (participant / co-organizer)**
- Leave events directly from the UI

UI is split into clear sections using reusable components.

---

## 🔍 Event Filtering

The application provides an advanced filtering system for events.

Users can filter events using:

- keyword search (title and description)
- type
- theme
- location
- exact date
- date range (startDate / endDate)

### UX Behaviour

- If an exact date is selected, date range inputs are automatically disabled
- If no exact date is provided, users can filter using a date range
- Filters can be reset to reload all events
- Multiple filters can be combined for precise results

---

## 🎭 Role System

Each user can have a role in an event:

````
organizer
co_organizer
participant
````

### UI behavior dynamically adapts:

#### Organizer
- Edit event
- Promote participants
- Demote co_organizers
- Remove participants and co_organizers

#### Co-organizer
- Remove participants

#### Participant
- Join / leave events

---

## 🔘 Membership Actions

- Join / Leave buttons with dynamic state
- Promote / Demote actions
- Remove members
- Confirmation dialogs for critical actions
- Role-based UI restrictions

---

## 🔁 Data Normalization

Frontend utilities:

- normalize API responses
- simplify backend structures
- avoid complex logic in components

---

## 🧠 State Management

- Context API for authentication
- Local state via React hooks
- Custom hooks:
  - `useEventActions`
  - `useEventActionsWithConfirm`

---

## 🎨 UI / UX Enhancements

- Protected navigation (ProtectedRoute)
- Redirect to intended page after login
- Password visibility toggle
- Password rules component
- Clear error messages from backend
- Consistent error feedback across forms and actions
- Loading and empty states
- Footer component with navigation
- Responsive layout
- Clear separation between Profile and Events

---

# 🔐 Authentication Flow

1. User logs in → receives JWT
2. Token is stored in:
  - `sessionStorage` (default)
  - `localStorage` (if "Remember me" is enabled)
3. Axios attaches token to requests
4. Redirect after login to intended page
5. Logout clears tokens

---

## 🧠 Error Handling

The frontend relies on consistent backend responses:

- errors use a standardized `message` field
- field-specific errors are displayed in forms
- global errors are shown via alert components

This ensures clear and user-friendly feedback.

---

# 📁 Project Structure

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
│   │   └── token.jsx
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
│   ├── EventsDetailsPage.jsx
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
├── utils
│   ├── extractApiData.js
│   └── format.js
│
├── App.jsx
├── main.jsx
├── index.html
├── .env
├── .gitignore
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file:
```
VITE_API_URL=http://localhost:3000/api
```

---

# ▶️ Running the App

```
npm install
npm run dev
```

App runs on:

```
http://localhost:5173
```
---

# 🔗 API Integration

The frontend communicates with the backend API:

```
http://localhost:3000/api
```

Axios is configured to:

- JWT injection
- request configuration

---

# 🔐 Security

- JWT stored securely in browser
- Protected routes
- Role-based UI restrictions
- Error handling aligned with backend
- No sensitive data exposed

---

# 🚀 Recent Improvements

- Added MyEventsPage
- My Events dashboard (created vs joined events)
- Refactored ProfilePage (separation of concerns)
- Improved routing protection (ProtectedRoute)
- Improved redirect after login
- Improved error handling with backend messages
- Added PasswordRules component
- Improved password validation and feedback
- Improved form validation (aligned with backend)
- Added footer component with navigation and layout improvements
- Improved UI consistency and structure

---

# 📌 Project Status

| Component | Status |
|-----------|--------|
| Frontend UI | Functional |
| Authentication | Fully implemented |
| Event Management | Complete |
| Role System | Advanced (UI + backend aligned) |
| UX Improvements | Ongoing |
| API Integration | Stable |

---

# Future Improvements

- UI redesign (modern layout / CSS system)
- "My Events" dashboard
- User avatars
- Notifications system
- Better mobile responsiveness
- Deployment (Vercel / Netlify)
