# PlanTogether - Backend API (Node.js)

PlanTogether is a collaborative event management platform where users can create, join and manage events with role-based permissions.

![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

This is the **backend application** of PlanTogether, built with **Node.js, Express and PostgreSQL**.

It provides a secure and scalable RESTful API that handles authentication, event management, and role-based access control.

Users can create, join and organize events with different permission levels (`organizer`, `co_organizer`, `participant`).

The API includes **secure authentication, advanced authorization logic and a modular architecture** designed for maintainability and scalability.

---

# API Overview

PlanTogether provides a **RESTful API** that allows users to create and manage collaborative events with **role-based permissions**.

The API enables:

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
- Login with JWT authentication (stateless, token-based)
- Profile retrieval
- Profile update
- Change password (secure flow with current password verification)
- Logout endpoint
- Email normalization and password hashing with **bcrypt**
- Centralized error handling middleware with consistent responses

---

## Event Management 

- Create events
- Retrieve all events
- Retrieve a specific event
- Update events *(organizer or co_organizer)*
- Delete events *(organizer only)*
- Advanced filtering (type, theme, location, date)

Additional features:

- Event creator information included in responses (for frontend usage)
- Strong validation (required fields + date consistency)

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

## 🔐 Role Hierarchy & Permissions

The API enforces a strict role hierarchy:
````
organizer > co_organizer > participant
````

### Organizer capabilities

- Full control over the event
- Promote participants to co_organizers
- Demote co_organizers
- Remove participants and co_organizers

### Co-organizer capabilities

- Remove participants from an event

### Participant capabilities

- Join events
- Leave events

---

## 🚫 Protected Actions

The API prevents invalid or unsafe operations:

- Cannot change the role of the organizer
- Cannot promote a user to organizer
- Cannot remove the organizer
- Co_organizers cannot manage other co_organizers

---

## 🧠 Authorization System

The backend uses a layered middleware system:

- **Authentication**
  - `authenticateToken` verifies JWT tokens

- **Role validation**
  - `requireEventRole` checks the user's role in an event

- **Business rules**
  - `authorizeRoleChange` enforces role change logic
  - `authorizeMemberRemoval` enforces member removal rules

This ensures a clear separation between:
- authentication
- access control
- business logic

---

## Members Management

Organizers and co_organizers can:

- View all members of an event
- View organizers / co_organizers
- Change a user's role *(organizer only)*
- Remove a member from an event *(with role restrictions)*

---

## Event Search & Filtering

The API supports advanced filtering using query parameters:

- `search` → keyword search in title and description
- `type` → filter by event type
- `theme` → filter by event theme
- `location` → filter by event location
- `startDate` → filter events starting from a specific date
- `endDate` → filter events up to a specific date
- `date` → filter events for an exact day (overrides startDate/endDate if provided)

Additional features:

- Sorting (`date`, `title`, `creatorId`)
- Pagination (`page`, `pageSize`)

### Examples

Filter events using keyword and date range:

```
GET /api/events/filtered?search=party&type=music&startDate=2026-04-01&endDate=2026-04-30
```

Filter events for an exact date:

```
GET /api/events/filtered?date=2026-04-16
```

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
- Sensitive fields (password) excluded via Sequelize scopes
- SQL injection protection through Sequelize queries
- Centralized error handler with consistent API responses

---

## API Response Format

All API responses follow a consistent structure:

### Success
```json
{
  "success": true,
  "data": { }
}
```

### Error
```
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```


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
│   │   ├── authenticateToken.js
│   │   ├── requireEventRole.js
│   │   ├── authorizeEvent.js
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

```
git clone https://github.com/CoCav/planTogether.git
cd plantogether
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
GET /api/events/my-events
POST /api/events/:eventId/members/join
DELETE /api/events/:eventId/members/leave
GET /api/events/:eventId/members
GET /api/events/:eventId/organizers
PUT /api/events/:eventId/members/:userId/role
DELETE /api/events/:eventId/members/:userId
```

# 🚀 Recent Improvements

- Improved centralized error handling:
  - standardized response format using `message`
  - better frontend compatibility for error display

- Enhanced event validation:
  - required fields enforced (title, description, type, theme)
  - strict date validation (end must be after start)
  - improved consistency between create and update validators

- Added event creator information in responses:
  - includes creator name for frontend usage
  - improves UI display (e.g. "joined events" section)

- Improved backend/frontend consistency:
  - aligned validation rules between frontend and backend
  - clearer and more predictable API responses

- Refactored and stabilized authentication flows:
  - better error handling for password updates
  - improved response clarity for authentication errors


# 📌 Project Status

| Component | Status |
|-----------|--------|
| Backend API | Fully functional |
| Architecture | Modular & scalable |
| Authentication | Fully Implemented (login, logout, profile, password update) |
| Authorization | Advanced role-based system |
| Testing | Completed (28 tests) |
| Frontend | In progress |

# Future Improvements

- Frontend integration
- Event invitation system
- Email notifications
- Public / private events
- Deployment