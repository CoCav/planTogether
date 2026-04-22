# PlanTogether - Fullstack Event Management Platform

PlanTogether is a collaborative event management platform where users can create, join and manage events with role-based permissions.

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/HTTP-Axios-green)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

PlanTogether is a **full-stack web application** designed to manage collaborative events.

It allows users to **create, organize, and participate in events** through a **role-based system** (`organizer`, `co_organizer`, `participant`) with secure authentication.

The application is built with a **Node.js / Express backend** and a **React frontend**, providing a complete fullstack workflow from API design to user interaction.

---

## 🎯 Application Overview

PlanTogether enables users to:

- securely register and authenticate using JWT
- create, organize and manage events
- browse events with advanced filtering (search in title and description, type, theme, location, date)
- join and leave events
- collaborate with other users through role-based permissions
- update their profile and password
- manage their session with flexible authentication ("Remember me")
- access a personal event dashboard with created and joined events

The system enforces permissions on both:

- the **backend** (middleware & authorization rules)
- the **frontend** (dynamic UI rendering and protected routes)

This ensures a consistent and secure user experience.

---

## 🧱 Architecture

- **Backend** → RESTful API (Node.js, Express, PostgreSQL)
- **Frontend** → React application (Vite, Axios, Context API)
- **Authentication** → JWT (sessionStorage / localStorage)
- **Authorization** → Role-based system with middleware layers
- **Database** → relational model with event memberships

---

## 🚀 Tech Stack

### Backend

- Node.js
- Express
- PostgreSQL
- Sequelize (ORM)
- JWT (authentication)
- bcrypt (password hashing)
- express-validator
- Jest + Supertest (testing)

### Frontend

- React (Vite)
- React Router
- Axios
- Context API (authentication state)
- Custom hooks

---

## 📁 Project Structure

```
planTogether/
├── backend/      # REST API
├── frontend/     # React application
└── README.md
```

--- 

## ⚙️ Installation & Setup

### 1. Backend

```
cd backend
npm install
npm run dev
```

Runs on:

```
http://localhost:3000
```

---

### 2. Frontend

```
cd frontend
npm install
npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## 🔐 Core Features

### Authentication

- User registration and login (JWT)
- Profile management (name, email)
- Secure password update (requires current password)
- Logout functionality
- Session-based authentication (token cleared on browser close)
- Optional "Remember me" (persistent login)
- Redirect to the originally requested page after login

---

### Event Management

- Create events
- View all events
- View event details
- Update events *(organizer / co-organizer)*
- Delete events *(organizer only)*
- Strong validation on both frontend and backend
- Date/time consistency rules (end must be after start)

---

### Event Participation

- Join events
- Leave events *(except organizer)*
- Prevent duplicate participation

---

### 🔍 Event Filtering

The application provides an advanced filtering system for events.

Users can filter events using:

- keyword search (title and description)
- type
- theme
- location
- exact date
- date range (startDate / endDate)

### Behavior

- If an exact date is selected, date range filters are disabled
- If no exact date is provided, users can filter using a date range
- Multiple filters can be combined for precise results
- Filters can be reset to reload all events
- Sorting is supported on the events page

---

### Role-Based System

Each user has a role within an event:

````
organizer
co_organizer
participant
````

### Role hierarchy

````
organizer > co_organizer > participant
````

Permissions:

- **Organizer**
  - Full control over events
  - Promote / demote users
  - Remove members

- **Co-organizer**
  - Manage participants
  - Remove participants

- **Participant**
  - Join / leave events

---

### 🧠 Authorization Architecture

The application uses a layered authorization system:

- **Authentication middleware**
  - verifies JWT tokens

- **Role validation**
  - ensures user belongs to event

- **Business rule enforcement**
  - role change restrictions
  - member removal rules

This separation improves:
- security
- maintainability
- scalability

---

### Frontend Features

- Protected routes
- Dynamic UI based on roles
- Advanced filtering UI with dynamic behavior (exact date vs date range)
- Join / Leave / Promote / Demote / Remove actions
- Event editing interface
- Password visibility toggle
- Password rules component
- Real-time profile updates
- Data normalization utilities
- Reusable custom hooks
- Footer component with navigation
- My Events page split into created and joined sections
- Clear separation between Profile and Events pages
- Loading, empty and feedback states
- Consistent error handling across forms and actions

---

## 🧠 Error Handling

The frontend relies on consistent backend responses:

- errors use a standardized message field
- field-specific errors are displayed in forms
- global errors are shown through alert components

This improves clarity and keeps frontend/backend behavior aligned.

---

## 🧪 Backend Tests

```
cd backend
npm test
```

✔ 28 tests passing successfully
✔ Covers authentication, events, memberships, permissions and edge cases

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation (express-validator)
- Sensitive data protection (Sequelize scopes)
- Protected API routes
- Centralized error handling with consistent API responses

---

## 🚀 Recent Improvements

- Added My Events dashboard (created vs joined events)
- Refactored Profile page to separate account settings from event activity
- Improved protected routing and redirect-after-login flow
- Added footer and layout improvements
- Enhanced validation on both frontend and backend
- Standardized backend error responses using message
- Added event creator information in API responses for frontend usage
- Improved API data normalization
- Added advanced event filtering system (search, type, theme, location, date)
- Implemented exact date and date range filtering with dynamic UI behavior
- Improved frontend/backend consistency for filtering queries

---

## 📌 Project Status

| Part       | Status          |
|------------|----------------|
| Backend    | ✅ Completed    |
| Frontend   | ✅ Functional   |
| Security   | ✅ Solid        |
| UX         | 🚧 Ongoing improvements    |
| Testing    | ✅ Backend only |

---

## 🎯 Future Improvements

- UI redesign (cards, spacing, design system)
- Notifications system
- User avatars
- Event invitations
- Better mobile optimization
- Deployment (Vercel / Railway / Render)

---

## 🧠 What I Learned

- Structuring a fullstack application
- Designing and structuring a RESTful API
- Managing relational data (many-to-many relationships)
- Implementing role-based authorization
- Securing applications with JWT
- Managing authentication state in React
- Building reusable frontend logic with hooks
- Writing backend tests with Jest & Supertest
- Handling real-world business logic and edge cases