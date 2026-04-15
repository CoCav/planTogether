# PlanTogether

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

The system enforces permissions on both:

- the **backend** (middleware & authorization rules)
- the **frontend** (dynamic UI rendering)

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
- Join / Leave / Promote / Demote / Remove actions
- Event editing interface
- Password visibility toggle
- Back navigation component
- Real-time profile updates
- Data normalization utilities
- Reusable custom hooks

---

## 🧪 Backend Tests

```
cd backend
npm test
```

✔ 28 tests passing
✔ Covers authentication, events, memberships, permissions and edge cases

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation (express-validator)
- Sensitive data protection (Sequelize scopes)
- Protected API routes

---

## 🚀 Recent Improvements

- Added event editing functionality
- Implemented role management (promote / demote / remove)
- Refactored middleware architecture (auth vs authorization)
- Introduced dedicated authorization layers
- Improved frontend UX (confirmations, dynamic UI)
- Enhanced token handling (session vs persistent storage)
- Improved API data normalization

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
- Implementing role-based authorization
- Securing applications with JWT
- Managing authentication state in React
- Building reusable frontend logic with hooks
- Writing backend tests with Jest & Supertest
- Handling real-world business logic and edge cases