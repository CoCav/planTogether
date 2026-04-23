# PlanTogether - Backend API (Node.js)

PlanTogether is a collaborative event management platform where users can create, join, and manage events with role-based permissions.

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Tests](https://img.shields.io/badge/tests-97%20passing-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **backend application** of PlanTogether, built with **Node.js, Express, and PostgreSQL**.

It provides a **secure, scalable, and well-structured RESTful API** that handles authentication, event management, and role-based access control.

The backend is responsible for enforcing business logic, validating data, and ensuring secure communication between the client and the database. 

Users can create, join, and organize events with different permission levels (`organizer`, `co_organizer`, `participant`).

The API includes **secure authentication, advanced authorization logic, and a modular architecture** designed for maintainability and scalability.

---

## 🎯 API Overview

PlanTogether provides a **secure and scalable RESTful API** that allows users to create and manage collaborative events with **role-based permissions**.

The API enables:

- authenticate users securely using JWT
- create, update, and manage events
- manage membership roles within events
- filter and paginate events efficiently

The API also enforces strict validation rules and authorization logic to ensure data integrity and secure access control across all endpoints.

---

## 🔧 Tech Stack

The backend is built using robust and scalable technologies to ensure performance, security, and maintainability:

- **Node.js / Express** – REST API development and routing
- **PostgreSQL / Sequelize** – relational database and ORM
- **JWT Authentication** – secure stateless authentication and token management
- **Express Validator** – request validation and input sanitization
- **Jest & Supertest** – unit and integration testing for API endpoints
- **Middleware architecture** – authentication, validation, and permission handling
- **MVC pattern** – modular and maintainable backend structure

---

## 📁 Backend Structure

The backend follows a modular **MVC architecture** with a clear separation of concerns between controllers, services, models, and middlewares.

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
│   │   └── relations
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
│   ├── auth
│   │   ├── auth.test.js
│   │   └── profile.test.js
│   │
│   ├── events
│   │   ├── event.test.js
│   │   ├── event.filter.test.js
│   │   ├── event.permissions.test.js
│   │   └── event.validation.test.js
│   │
│   └── memberships
│       ├── eventMembership.test.js
│       ├── eventMembership.permissions.test.js
│       └── eventMembership.validation.test.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The `relations` folder contains linking models used to represent many-to-many relationships (e.g., users participating in events with specific roles).

This structure ensures a clear separation of responsibilities, improves scalability, and makes the codebase easier to maintain, test, and extend as the application evolves.

---

## ✨ Features

The API provides a complete set of endpoints to manage users, events, and memberships, with fine-grained access control.

### 👤 User Management

- User registration
- Login with JWT authentication (stateless, token-based)
- Profile retrieval
- Profile update
- Change password (secure flow with current password verification)
- Logout endpoint
- Email normalization and password hashing with **bcrypt**
- Centralized error handling middleware with consistent responses

---

### 📅 Event Management 

- Create events
- Retrieve events
- Retrieve a single event
- Update events *(organizer or co_organizer)*
- Delete events *(organizer only)*

Additional capabilities:

- Event creator information included in API responses
- Strong validation (required fields + date consistency)

Each event automatically assigns the creator as **organizer**.

---

### 👥 Membership & Roles

Users interact with events through a membership system that links users to events with specific roles.

#### Membership

- Join an event
- Leave an event
- View events the user participates in

#### Roles

Each membership has a role stored in the `EventUserRole` model.

````md id="fix-codeblock"
organizer
co_organizer
participant
guest
````

---

### 🔐 Permissions & Role Hierarchy

The API enforces a strict role hierarchy:
````
organizer > co_organizer > participant > guest
````

The `guest` role represents unauthenticated or read-only users.

#### Organizer capabilities

- Full control over the event (edit and/or delete event)
- Promote participants to co_organizers
- Demote co_organizers
- Remove participants and co_organizers

#### Co-organizer capabilities

- Edit an event
- Remove participants from an event

#### Participant capabilities

- Join an event
- Leave an event

#### Guest capabilities

- Access public event data (read-only)

---

### 🚫 Protected Actions

The API prevents invalid or unsafe operations:

- Cannot change the role of the organizer
- Cannot promote a user to organizer
- Cannot remove the organizer
- Co_organizers cannot manage other co_organizers

---

### 🧠 Authorization System

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

### 👥 Members Management

Organizers and co_organizers can:

- View all members of an event
- View organizers / co_organizers
- Change a user's role *(organizer only)*
- Remove a member *(with role restrictions)*

---

### 🔍 Event Search & Filtering

The API supports advanced filtering using query parameters:

- `search` → keyword search in title and description
- `type` → filter by event type
- `theme` → filter by event theme
- `location` → filter by event location
- `startDate` → filter events starting from a specific date
- `endDate` → filter events up to a specific date
- `date` → filter events for an exact day (overrides range)

Additional features:

- Sorting (`date`, `title`, `creatorId`)
- Pagination (`page`, `pageSize`)

#### Examples

Filter events using keyword and date range:

```
GET /api/events/filtered?search=party&type=music&startDate=2026-04-01&endDate=2026-04-30
```

Filter events for an exact date:

```
GET /api/events/filtered?date=2026-04-16
```

---

## 🧪 Testing

The API includes a **comprehensive automated test suite** built with **Jest** and **Supertest**, ensuring reliability across core business logic and endpoints.

Run all tests:

```bash
npm test
```

### Results
- ✅ 9 test suites passing
- ✅ 97 tests passing

### Coverage

#### Core features
Très bonne section 👏 — elle est déjà claire, technique et crédible.
On est sur une base équivalente au frontend, ce qui est parfait 💥

👉 Je vais faire un polish structuré + alignement avec le frontend, pour un rendu vraiment propre.

🔍 Ce qui est déjà excellent
✔ outils mentionnés (Jest + Supertest)
✔ coverage détaillée (très bon point 💥)
✔ validation + edge cases (très pro)
✔ résultats visibles

👉 rien de fond à corriger

🔧 Améliorations utiles
1. Ajouter une phrase d’impact (important)

👉 comme frontend → renforcer la crédibilité

2. Structurer la section

👉 actuellement tu as :

Coverage includes
Validation scenarios

👉 on peut rendre ça plus lisible avec des sous-titres

3. Harmoniser wording

👉 ex :

“Coverage includes”
“Validation scenarios covered”

👉 → unifier

4. Améliorer la partie résultats

👉 frontend = Results
👉 ici = Current result

👉 on aligne

🚀 VERSION AMÉLIORÉE
## 🧪 Testing

The API includes a **comprehensive automated test suite** built with **Jest** and **Supertest**, ensuring reliability across core business logic and endpoints.

Run all tests:


npm test


---

### Results

- ✅ 9 test suites passing
- ✅ 97 tests passing

---

### Coverage

#### Core features

- authentication flows (register, login, logout, profile, password update)
- profile protection and update validation
- event CRUD operations
- event filtering, sorting, and pagination
- event validation rules
- event membership flows (join, leave, my events, members, organizers)
- role-based permissions (organizer, co_organizer, participant)

---

#### Validation & edge cases

- invalid request bodies
- invalid route parameters
- duplicate joins
- invalid role updates
- invalid date ordering
- invalid mode / location combinations

👉 This test suite ensures API stability, validates business rules, and prevents regressions across critical backend operations.

---

## 🔐 Security

The API implements multiple security layers to protect data and enforce access control:

- JWT authentication middleware (Bearer Token)
- Input validation using **express-validator**
- Role-based access control (organizer / co_organizer / participant / guest)
- Protected routes with authentication checks
- Password updates require current password verification
- Sensitive fields (e.g., password) excluded via Sequelize scopes
- SQL injection protection through Sequelize ORM queries
- Centralized error handler with consistent API responses

👉 These mechanisms ensure secure data handling and prevent unauthorized access across the API.

---

## 📦 API Response Format

All API responses follow a consistent structure.

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```md id="fix-json"
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/CoCav/planTogether.git
cd plantogether
npm install
```

---

## ⚙️ Environment Variables

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

## ▶️ Running the API

Start the server:

```bash
npm start
```

or with nodemon:

```bash
npm run dev
```

The API will run on:

```
http://localhost:3000
```

Health check endpoint:

```
GET /api/health
```

---

## 🔗 API Endpoints

The API exposes the following main endpoints:

### 🔐 Authentication

```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
PUT /api/auth/profile
PUT /api/auth/password
POST /api/auth/logout
```

---

### 📅 Events

```
GET /api/events
GET /api/events/:eventId
GET /api/events/filtered
POST /api/events
PUT /api/events/:eventId
DELETE /api/events/:eventId
```

---

### 👥 Event Membership

```
GET /api/events/my-events
POST /api/events/:eventId/members/join
DELETE /api/events/:eventId/members/leave
GET /api/events/:eventId/members
GET /api/events/:eventId/organizers
PUT /api/events/:eventId/members/:userId/role
DELETE /api/events/:eventId/members/:userId
```

---

## 🚀 Recent Improvements

### API & Features
- Improved centralized error handling with standardized responses
- Enhanced event validation and consistency
- Improved event filtering (search, date, sorting, pagination)
- Added event creator information in API responses

### Testing
- Refactored test architecture for better structure
- Expanded test coverage across authentication, events, and memberships
- Improved API reliability through automated testing

---

## 📌 Project Status

| Area             | Status |
|------------------|--------|
| Backend API      | ✅ Functional |
| Architecture     | ✅ Modular & scalable |
| Authentication   | ✅ Complete (login, logout, profile, password update) |
| Authorization    | ✅ Advanced role-based system |
| Testing          | ✅ 97 tests (9 test suites) |
| Frontend         | 🔗 Connected & functional |

---

## 🔮 Future Improvements

- Add event invitation system (invite users via email or link)
- Implement email notifications (event updates, invitations, reminders)
- Support public and private events with access control
- Deploy the API (Docker + cloud provider)
- Add environment-based configuration for production