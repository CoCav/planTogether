# PlanTogether - Collaborative Event Management API

![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

This is the **backend application** of PlanTogether, built with **Node.js, Express and PostgreSQL**. 

PlanTogether is a RESTful API that enables users to create, manage, and participate.

Users can create, join and organize events through a **role-based system** (`organizer`, `co_organizer`, `participant`).  
The API includes **secure authentication, advanced permissions and a modular architecture** designed for maintainable backend development.

# API Overview

PlanTogether provides a **RESTful API** that allows users to create and manage collaborative events with **role-based permissions**.

The API handles:

- secure authentication with JWT
- event creation and management
- membership roles within events
- advanced event filtering and pagination

---

# 🔧 Tech Stack

- **Node.js / Express** – REST API development
- **PostgreSQL / Sequelize** – relational database & ORM
- **JWT Authentication** – secure authentication and session handling
- **Express Validator** – input validation
- **Jest & Supertest** - API testing
- **Middleware architecture** – authentication, validation, permissions
- **MVC pattern** – modular and maintainable backend structure

---

# 🧩 Key Features

## User Management 

- User registration
- Login with JWT authentication (stateless, token-based )
- Profile retrieval
- Profile update
- Change password (secure flow with current password verification)
- Logout endpoint
- Email normalization and password hashing with **bcrypt**
- Centralized error handling middleware

---

## Event Management 

- Create events
- Retrieve all events
- Retrieve a specific event
- Update events *(organizer or co_organizer)*
- Delete events *(organizer only)*
- Filter by type, theme and other criteria

Each event automatically assigns the creator as **organizer**.

---

## Event Membership & Roles

Users can interact with events through a **membership system**.

### Membership

- Join an event
- Leave an event
- View events the user participates in

### Roles

Each membership has a role stored in the `EventUserRole` model.

Available roles:
````
organizer
co_organizer
participant
````

### Permissions

| Role | Permissions |
|-----|-------------|
| Organizer | Full control of event |
| Co_organizer | Manage participants and update event |
| Participant | Join and leave events |

Role permissions are enforced via middleware.

---

## Members Management

Organizers and co_organizers can:

- View all members of an event
- View organizers / co_organizers
- Change a user's role
- Remove a member from an event

---

## Event Search & Filtering

The API supports advanced filtering:

- Filter by `date`
- Filter by `creator`
- Filter by `type`
- Filter by `theme`
- Filter by `location`
- Keyword search in `title` and `description`

Additional features:

- Sorting (`date`, `title`, `creatorId`)
- Pagination

---

# 🧪 Testing

The API includes a complete test suite using Jest and Supertest.

Coverage: 
- Authentication flows (register, login, profile, update, password change, logout)
- Event CRUD operations
- Membership logic
- Role-based permissions
- Route protection (401 / 403)

Edge Cases:

- Prevent duplicate event join
- Prevent leaving an event without membership

Run tests:

```
npm test
```

---

# 🔐 Security

The API implements several security mechanisms:

- JWT authentication middleware (Bearer Token)
- Input validation using **express-validator**
- Role-based permission checks (organizer / co_organizer / participant)
- Protected routes
- Password update requires current password verification
- Sensitive fields (password) excluded by default using Sequelize scopes
- SQL injection protection through Sequelize queries
- Centralized error handler

---

# 📁 Project Structure

```
project-root
│
├── src
│   ├── config
│   │   └── database.js
│   │
│   ├── controllers
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── eventMembershipController.js
│   │
│   ├── middlewares
│   │   ├── authMiddleware.js
│   │   ├── requireEventRole.js
│   │   ├── validateRequest.js
│   │   └── errorHandler.js
│   │
│   ├── models
│   │   ├── userModel.js
│   │   ├── eventModel.js
│   │   ├── index.js
│   │   └── Link
│   │       └── eventUserRoleModel.js
│   │
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   └── eventMembershipRoutes.js
│   │
│   ├── services
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   └── eventMembershipService.js
│   │
│   ├── validators
│   │   ├── authValidator.js
│   │   ├── eventValidator.js
│   │   └── eventRoleValidator.js
│   │
│   ├── app.js
│   └── server.js
│
├── tests
│   └── auth.test.js
│   └── event.test.js
│   └── eventMembership.test.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

# Installation

Clone the repository:

```
git clone https://github.com/CoCav/planTogether.git
cd plantogether
```

Install dependencies:

```
npm install
```

---

# Environment Variables

Create a `.env` file in the project root:

```
PORT=3000

JWT_SECRET=your_secret_key

DB_NAME=plantogether_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

# Running the API

Start the server:

```
npm start
```

or with nodemon:

```
npm run dev
```

Server will run on:

```
http://localhost:3000
```

Health check endpoints:
```
GET /api/health
```

---

# Main API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile
PUT /api/auth/password
POST /api/auth/logout
```

---

## Events

```
GET /api/events
GET /api/events/:eventId
GET /api/events/filtered
POST /api/events
PUT /api/events/:eventId
DELETE /api/events/:eventId
```

---

## Event Membership

```
POST /api/events/:eventId/members/join
DELETE /api/events/:eventId/members/leave
GET /api/events/:eventId/members
GET /api/events/:eventId/organizers
GET /api/users/me/events
PUT /api/events/:eventId/members/:userId/role
DELETE /api/events/:eventId/members/:userId
```

# 🚀 Recent Improvements

- Added secure password update flow with current password verification
- Improved authentication system with session-based token handling
- Implemented dual storage strategy (sessionStorage / localStorage)
- Added "Remember me" functionality
- Improved frontend UX for password inputs (show/hide toggle)
- Refactored authentication logic for better maintainability

# 📌 Project Status

| Component | Status |
|-----------|--------|
| Backend API | Fully functional |
| Architecture | Modular |
| Authentication | Fully Implemented (login, logout, profile, password update) |
| Authorization | Role-based |
| Testing | Completed (28 tests) |
| Frontend | Planned |

# Future Improvements

- Frontend integration
- Event invitation system
- Email notifications
- Public / private events
- Deployment