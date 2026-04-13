# PlanTogether

PlanTogether is a **full-stack web application** designed to manage collaborative events.

It allows users to **create, organize, and participate in events** through a **role-based system** (`organizer`, `co_organizer`, `participant`) with secure authentication.

The application is built with a **Node.js / Express backend** and a **React frontend**, providing a complete workflow from API design to user interaction.

---

## 🎯 Application Overview

PlanTogether enables users to:

- securely register and authenticate using JWT
- create and manage events
- join and leave events
- collaborate with other users through role-based permissions
- update their profile and password
- manage their session with flexible authentication ("Remember me")

The system enforces permissions both:
- on the **backend** (middleware & role checks)
- and on the **frontend** (dynamic UI behavior)

This ensures a consistent and secure user experience across the application.

---

## 🧱 Architecture

- **Backend** → RESTful API (Node.js, Express, PostgreSQL)
- **Frontend** → React application (Vite, Axios, Context API)
- **Authentication** → JWT-based with session or persistent storage
- **Database** → relational model with role-based event memberships

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
├── backend/ # REST API
├── frontend/ # React application
```

--- 

## ⚙️ Installation & Setup

### 1. Backend

```
cd backend
npm install
npm run dev
```

The backend runs on:

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

The frontend runs on:

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

---

### Event Management

- Create events
- View all events
- View event details
- Update events *(organizer / co-organizer)*
- Delete events *(organizer only)*

---

### Event Participation

- Join events
- Leave events *(except organizer)*
- Prevent duplicate participation

---

### Role-Based System

Each user has a role within an event:

````
organizer
co_organizer
participant
````

Permissions:

- **Organizer** → full control
- **Co-organizer** → manage participants & edit events
- **Participant** → limited actions

---

### Frontend Features

- Protected routes
- Dynamic UI based on authentication and roles
- Join / Leave buttons with state management
- Password visibility toggle (show / hide)
- Back navigation component
- Real-time profile updates
- Data normalization for clean API handling

---

## 🧪 Backend Tests

```
cd backend
npm test
```

✔ 28 tests passing  
✔ Covers authentication, events, memberships, permissions, and edge cases

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation (express-validator)
- Sensitive fields excluded using Sequelize scopes
- Protected API routes

---

## 🚀 Recent Improvements

- Added secure password update flow
- Implemented session-based token storage
- Added "Remember me" authentication option
- Improved frontend UX (password toggle, navigation)
- Refactored authentication logic
- Enhanced data normalization in frontend

---

## 📌 Project Status

| Part       | Status          |
|------------|----------------|
| Backend    | ✅ Completed    |
| Frontend   | ✅ Functional   |
| Security   | ✅ Solid        |
| UX         | 🚧 Improving    |
| Testing    | ✅ Backend only |

---

## 🎯 Future Improvements

- "My Events" dashboard
- UI redesign (cards, responsive layout)
- Notifications system
- User avatars
- Event invitations
- Deployment (Vercel / Railway / Render)

---

## 🧠 What I Learned

- Designing and structuring a RESTful API
- Managing relational data (many-to-many relationships)
- Implementing role-based permissions
- Securing applications with JWT
- Handling authentication state in React
- Building reusable frontend logic with hooks
- Writing backend tests with Jest & Supertest
- Managing real-world edge cases in business logic