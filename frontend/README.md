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
- browse and view events
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
- View event details
- Create events
- Delete events *(organizer only)*

---

## 👥 Event Participation

- Join events
- Leave events *(except organizer)*
- Role-based UI behavior

---

## 🎭 Role System

Each user can have a role in an event:

````
organizer
co_organizer
participant
````

UI behavior adapts based on role:
- organizer → full control
- co-organizer → partial control
- participant → limited actions

---

## 🔘 Membership Actions

- Join / Leave buttons with dynamic state
- Prevent organizer from leaving event
- Disable invalid actions in UI

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
- Reusable logic with custom hooks (e.g. `useEventMembershipActions`)

---

## 🎨 UX Improvements

- Back navigation component
- Password visibility toggle (show / hide)
- Dynamic feedback messages (success / error)
- Conditional rendering based on auth and roles

---

# 🔐 Authentication Flow

1. User logs in → receives JWT
2. Token is stored in:
   - `sessionStorage` (default)
   - `localStorage` (if "Remember me" is enabled)
3. Axios attaches token to every request
4. Protected routes verify authentication state
5. Logout clears all stored tokens

---

# 📁 Project Structure

```
src
│
├── api
│   ├── axios.js
│   ├── authApi.js
│   └── eventApi.js
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
│   └── useEventMembershipActions.js
│
├── pages
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── createEventPage.jsx
│   ├── EventsPage.jsx
│   └── EventDetailsPage.jsx
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
- handles authentication headers

---

# 🔐 Security

- JWT stored in browser storage
- Session-based token by default
- Optional persistent login ("Remember me")
- Protected routes
- Role-based UI restrictions

---

# 🚀 Recent Improvements

- Added "Remember me" authentication option
- Switched to session-based token storage
- Implemented password change functionality
- Added password visibility toggle
- Improved event participation UX
- Refactored API data normalization
- Introduced reusable hooks and components

---

# 📌 Project Status

| Component | Status |
|-----------|--------|
| Frontend UI | Functional |
| Authentication | Fully implemented |
| Event Management | Complete |
| Role System | Integrated |
| UX Improvements | Ongoing |
| API Integration | Stable |

---

# Future Improvements

- UI redesign (modern layout)
- "My Events" dashboard
- User avatars
- Notifications system
- Better mobile responsiveness
- Deployment (Vercel / Netlify)
