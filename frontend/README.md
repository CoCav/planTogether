# PlanTogether - Frontend (React)

![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/HTTP-Axios-green)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

This is the **frontend application** of PlanTogether, built with **React and Vite**.

It provides a user interface to interact with the PlanTogether API, allowing users to manage events, roles, and their profile through a modern and responsive UI.

---

# 🎯 Application Overview

The frontend allows users to:

- authenticate securely using JWT
- browse and manage events
- join and leave events
- manage roles within events (organizer / co-organizer / participant)
- update their profile and password
- manage session behavior with "Remember me"

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

---

## 👤 User Profile

- View profile information
- Update name and email
- Change password (secure flow with current password verification)
- Real-time UI update using `refreshUser`

---

## 📅 Event Management

- View all events
- Browse event details with advanced filtering (search in title and description, type, theme, location date)
- Create events
- Update events *(organizer / co_organizer)*
- Delete events *(organizer only)*

---

## 👥 Event Participation

- Join events
- Leave events *(except organizer)*
- Role-based UI behavior

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

### UX Behavior

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
- Join / leave events only

---

## 🔘 Membership Actions

- Join / Leave buttons with dynamic state
- Promote / Demote actions
- Remove member functionality
- UI restrictions based on permissions
- Prevent invalid actions (organizer leaving, etc.)

---

## 🔁 Data Normalization

Custom utilities ensure consistent frontend data:

- normalize API responses
- simplify backend structures
- avoid complex logic in components

---

## 🧠 State Management

- Global auth state using Context API
- Local component state with React hooks
- Reusable logic with custom hooks:
  - `useEventActions`
  - `useEventActionsWithConfirm`


---

## 🎨 UX Improvements

- Back navigation component
- Password visibility toggle (show / hide)
- Confirmation dialogs for critical actions
- Smart filtering UX (exact date vs date range handlings)
- Dynamic feedback messages (success / error)
- Conditional rendering based on roles and auth state

---

# 🔐 Authentication Flow

1. User logs in → receives JWT
2. Token is stored in:
   - `sessionStorage` (default)
   - `localStorage` (if "Remember me" is enabled)
3. Axios interceptor attaches token to every request
4. Protected routes validate authentication state
5. Logout clears all stored tokens

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
│   ├── BackButton.jsx
│   └── Navbar.jsx
│
├── context
│   ├── authContext.jsx
    ├── authProvider.jsx
│   └── useAuth.js
│
├── hooks
│   ├── useEventActions.jsx
│   └── useEventActionsWithConfirm.js
│
├── pages
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── createEventPage.jsx
│   ├── EventsPage.jsx
│   ├── EventsDetailsPage.jsx
│   └── EditEventPage.jsx
│
├── routes
│   └── AppRouter.jsx
│
├── utils
│   ├── normalize.js
│   └── token.js
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

Install dependencies:

```
npm install
```

Start development server:

```
npm run dev
```

App runs on:

Install dependencies:

```
http://localhost:5173
```
---

# 🔗 API Integration

The frontend communicates with the backend API:

```
http://localhost:3000/api
```

All requests are handled via Axios with an interceptor that:

- automatically attaches JWT token
- centralizes request configuration

---

# 🔐 Security

- JWT stored in browser storage
- Session-based token by default
- Optional persistent login ("Remember me")
- Protected routes
- Role-based UI restrictions

---

# 🚀 Recent Improvements

- Added event editing functionality
- Implemented role-based actions (promote, demote, remove)
- Refactored API layer (eventApi / eventMembershipApi separation)
- Introduced reusable hooks for membership logic
- Improved role-based UI consistency
- Added confirmation handling for destructive actions
- Improved authentication flow and token handling
- Added advanced event filtering system (search, type, theme, location, date)
- Implemented exact date and date range filtering with UX logic
- Aligned frontend filtering with backend query parameters

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
