# PlanTogether - Backend API (Node.js)

PlanTogether is a collaborative event management platform where users can create, join, and manage events with role-based permissions.

PlanTogether helps users organize and collaborate on events efficiently through a role-based system.

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-yellow)

![API](https://img.shields.io/badge/API-REST-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)

![Jest](https://img.shields.io/badge/Test-Jest-red)
![Supertest](https://img.shields.io/badge/Test-Supertest-6E9F18)
![Tests](https://img.shields.io/badge/tests-372%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98.18%25%20statements%20%7C%2094.13%25%20branches-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

This is the **backend API** of PlanTogether, built with **Node.js, Express, PostgreSQL, and Sequelize**.

It provides a secure and well-structured **RESTful API** responsible for authentication, event management, membership handling, and role-based access control.

The backend enforces business rules, validates incoming data, and manages permissions while ensuring consistent communication between the client and the database.

Users can create, join, leave, update, and manage events depending on their role:

- `organizer`
- `co_organizer`
- `participant`

The API is built with a modular architecture to ensure scalability, maintainability, and testability.

It also includes advanced features such as:

- file upload support for user avatars and event images
- centralized and reusable event filtering system (search, creator, categories, dates, status)
- consistent filtering across public and user-specific event listings
- robust validation and error handling for uploads and API requests

---

## 🎯 API Overview

PlanTogether provides a **RESTful API** designed to support collaborative event management with **role-based access control**, and to be consumed by a frontend application or external clients.

The API allows clients to:

- Authenticate users securely using JWT
- Create, update, and manage events
- Join and leave events
- Manage membership roles within events
- Retrieve user-related data (e.g., `/my-events`)
- Upload and manage user avatars and event images
- Filter, sort, and paginate events efficiently (including creator-based filtering)

The API enforces strict validation rules and authorization logic to ensure **data integrity**, **consistent behavior**, and **secure access control** across all endpoints.

It also relies on a centralized filtering system to provide consistent results across public and user-specific event listings.

---

## 🔧 Tech Stack

The backend is built using robust and scalable technologies to ensure performance, security, and maintainability.

### Core Technologies

- **Node.js** – JavaScript runtime environment
- **Express** – web framework for building REST APIs
- **PostgreSQL** – relational database system
- **Sequelize** – ORM for database modeling and queries

### Authentication & Security

- **JSON Web Tokens (JWT)** – secure stateless authentication
- **bcrypt** – password hashing
- **Express Validator** – request validation and input sanitization

### File Handling

- **Multer** – file upload handling for avatars and event images
- **Custom file utilities** – upload management and cleanup logic

### Architecture & Patterns

- **Middleware architecture** – authentication, validation, authorization, and file upload layers
- **MVC pattern** – modular and maintainable application structure
- **Service layer** – business logic abstraction

### Testing

- **Jest** – unit testing framework
- **Supertest** – integration testing for API endpoints

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
│   │   ├── uploadFile.js
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
│   ├── utils
│   │   ├── deleteUploadedFile.js
│   │   ├── eventQueryFilters.js
│   │   ├── eventTime.js
│   │   └── pagination.js
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
│   ├── controllers
│   │   ├── authController.test.js
│   │   ├── eventController.test.js
│   │   └── eventMembershipController.test.js
│   │
│   ├── integration
│   │   ├── app
│   │   │   └── app.test.js
│   │   │
│   │   ├── auth
│   │   │   ├── login.test.js
│   │   │   ├── logout.test.js
│   │   │   ├── password.test.js
│   │   │   ├── profile.test.js
│   │   │   └── register.test.js
│   │   │
│   │   ├── events
│   │   │   ├── create.test.js
│   │   │   ├── delete.test.js
│   │   │   ├── eventPermissions.test.js
│   │   │   ├── eventRequestValidation.test.js
│   │   │   ├── filter.test.js
│   │   │   ├── getEvents.test.js
│   │   │   └── update.test.js
│   │   │
│   │   └── eventMembership
│   │       ├── membersAndOrganizers.test.js
│   │       ├── eventMembershipPermissions.test.js
│   │       ├── eventMembershipRequestValidation.test.js
│   │       ├── myEvents.test.js
│   │       └── participation.test.js
│   │
│   ├── middlewares
│   │   ├── authenticateToken.test.js
│   │   ├── authorizeEvent.test.js
│   │   ├── errorHandler.test.js
│   │   ├── requireEventRole.test.js
│   │   ├── uploadFile.test.js
│   │   └── validateRequest.test.js
│   │
│   ├── services
│   │   ├── auth
│   │   │   ├── loginUser.test.js
│   │   │   ├── password.test.js
│   │   │   ├── profile.test.js
│   │   │   └── registerUser.test.js
│   │   │
│   │   ├── events
│   │   │   ├── createEvent.test.js
│   │   │   ├── deleteEventById.test.js
│   │   │   ├── getAllEvents.test.js
│   │   │   ├── getEventById.test.js
│   │   │   ├── getFilteredEvents.test.js
│   │   │   └── updateEventById.test.js
│   │   │
│   │   └── eventMembership
│   │       ├── joinEvent.test.js
│   │       ├── leaveEvent.test.js
│   │       ├── listMembers.test.js
│   │       ├── listMyEvents.test.js
│   │       ├── listOrganizers.test.js
│   │       ├── removeMember.test.js
│   │       └── updateMemberRole.test.js
│   │
│   ├── utils
│   │   ├── deleteUploadedFile.test.js
│   │   ├── eventQueryFilters.test.js
│   │   ├── eventTime.test.js
│   │   └── pagination.test.js
│   │
│   └── validators
│       ├── authValidator.test.js
│       ├── eventRoleValidator.test.js
│       └── eventValidator.test.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

The `relations` folder contains linking models used to represent many-to-many relationships (e.g., users participating in events with specific roles).

The `utils` layer centralizes reusable logic such as event filtering, pagination, date handling, and file management, ensuring consistency across services.

The `middlewares` layer includes reusable components for authentication, authorization, validation, file uploads, and centralized error handling.

The test suite mirrors the application structure to ensure full coverage and maintainability.

This structure ensures a clear separation of concerns, improves scalability, and makes the codebase easier to maintain, test, and extend over time.

---

## ✨ Features

The API provides a complete set of endpoints to manage users, events, and memberships, with fine-grained access control.

### 👤 User Management

- User registration
- Login with JWT authentication (stateless, token-based)
- Profile retrieval
- Profile update
- Avatar upload and replacement (multipart/form-data)
- Automatic old avatar cleanup when replaced
- Change password (secure flow with current password verification)
- Logout endpoint
- Email normalization and password hashing using **bcrypt**
- Centralized error handling middleware with consistent responses

---

### 📅 Event Management

- Create events
- Retrieve all events
- Retrieve a single event
- Update events *(organizer or co_organizer)*
- Delete events *(organizer only)*
- Event image upload and replacement (multipart/form-data)
- Automatic old event image cleanup when replaced

Additional capabilities:

- Event creator information included in API responses
- Event image paths included in API responses
- Strong validation (required fields and date consistency)
- Upload validation for supported image types and file sizes

Each event automatically assigns the creator as **organizer**.

---

### 👥 Event Membership & Roles

Users interact with events through a membership system that associates users with events and assigns specific roles.

#### Membership

- Join an event
- Leave an event
- View events the user is participating in

#### Roles

Each membership has a role stored in the `EventUserRole` model.

- `organizer`
- `co_organizer`
- `participant`
- `guest`

---

### 🔐 Permissions & Role Hierarchy

The API enforces a strict role hierarchy:

`organizer > co_organizer > participant > guest`

The `guest` role represents unauthenticated or read-only users.

#### Organizer capabilities

- Full control over the event (edit and delete)
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
  - Authorization logic (e.g., `authorizeRoleChange`, `authorizeMemberRemoval`) enforces role changes and member management rules

This ensures a clear separation between:

- authentication
- access control
- business logic

This system ensures consistent and reusable access control across all event-related operations.

---

### 👥 Members & Roles Management

Organizers and co_organizers can:

- View all members of an event
- View organizers and co_organizers
- Change a user's role *(organizer only)*
- Remove a member *(with role restrictions)*

---

### 🔍 Event Search & Filtering

The API supports advanced filtering using query parameters.

Filtering is powered by a centralized and reusable system, ensuring consistent results across public and user-specific event listings:

- `search` → keyword search in title and description
- `creator` → filter by creator name
- `type` → filter by event type
- `theme` → filter by event theme
- `location` → filter by event location
- `startDate` → filter events starting from a specific date
- `endDate` → filter events up to a specific date
- `date` → filter events for an exact day (overrides range)
- `status` → filter upcoming or past events

Additional features:

- Sorting (`date`, `title`, `creatorId`)
- Pagination (`page`, `pageSize`)
- Creator filtering across public and user-specific event listings

#### Examples

Filter events using keyword and date range:

```
GET /api/events/filtered?search=party&type=music&startDate=2026-04-01&endDate=2026-04-30
```

Filter events for an exact date:

```
GET /api/events/filtered?date=2026-04-16
```

Filter events by creator:

```
GET /api/events/filtered?creator=Luffy
```

Filter user-specific events by view and creator:

```
GET /api/events/my-events?view=joined&creator=Luffy&page=2
```

---

## 🧪 Testing

The API includes a **comprehensive automated test suite** built with **Jest** and **Supertest**, covering both API behavior and internal application logic.

These tests ensure the reliability, security, and long-term maintainability of the application.

### ▶️ Run Tests

```bash
npm test
```

### ▶️ Run Tests with coverage

```bash
npm run test:coverage
```

### 📊 Results

- 51 test suites
- 372 tests
- ✅ All passing

**Coverage:**
- 98.18% statements coverage
- 94.13% branch coverage
- 100% functions coverage
- 98.28% lines coverage
- ✅ High coverage across core features such as business logic, filtering, and upload flows

---

### 📦 Test Coverage

The project includes two main types of tests:

#### 🔗 Integration Tests (API)

These tests validate the full request lifecycle:

```
Request → Middleware → Controller → Service → Database → Response
```

They simulate real HTTP requests using **Supertest** and cover all major API features.

📌 Covered areas:

- **Authentication**
  - Register, login, logout
  - Profile and password management
  - Avatar upload and replacement

- **Events**
  - CRUD operations
  - Event image upload and replacement
  - Filtering and pagination
  - Creator-based filtering
  - Role-based permissions
  - Request validation

- **Event Membership**
  - Join and leave events
  - `/my-events` endpoint
  - Members and organizers listing
  - Role management and access control
  - Edge cases and validation

- **Application**
  - Health check endpoint (`/api/health`)
  - Root endpoint
  - 404 handling

---

#### 🧩 Internal Module Tests

These tests validate the internal logic of the application independently from HTTP requests.

📌 Covered modules:

- **Controllers**
  - Request handling and response formatting
  - Error propagation

- **Services**
  - Business logic
  - Data processing and rule enforcement

- **Middlewares**
  - Authentication (`authenticateToken`)
  - Authorization (`requireEventRole`, `authorizeEvent`)
  - Request validation (`validateRequest`)
  - File upload handling (`uploadFile`)
  - Error handling (`errorHandler`)

- **Validators**
  - Input validation using `express-validator`
  - Edge cases and invalid payloads

- **Utils**
  - Shared helper functions
  - Uploaded file cleanup
  - Event query filtering logic (status, date, search, creator, pagination, centralized filtering system)

---

### 🔁 Test Strategy

- Integration tests run against the real Express application
- No mocking is used for API flows
- A dedicated test database ensures isolation
- Each test is independent and cleans up its data
- Internal modules are tested in isolation for robustness and maintainability
- High coverage ensures strong reliability across critical features such as filtering, uploads, and permission handling

---

## 🔐 Security

The API implements multiple security layers to protect sensitive data and enforce strict access control across all endpoints.

### 🔑 Authentication

- JWT-based authentication using Bearer tokens
- Protected routes require a valid authentication token
- Password updates require current password verification

### 🛡️ Authorization

- Role-based access control (`organizer`, `co_organizer`, `participant`, `guest`)
- Middleware-based permission checks (`requireEventRole`, `authorizeEvent`)
- Fine-grained access control for event and membership actions

### 🧾 Input Validation

- Request validation using **express-validator**
- Sanitization of incoming data to prevent malformed or malicious input
- File validation for uploads (type, size, and format constraints)

### 🔒 Data Protection

- Password hashing using **bcrypt**
- Sensitive fields (e.g., passwords) excluded via Sequelize scopes

### ⚙️ Additional Security Measures

- SQL injection protection via Sequelize ORM parameterized queries
- Centralized error handling with consistent and safe API responses
- Secure file upload handling with controlled storage and validation

These mechanisms ensure secure data handling and prevent unauthorized access throughout the API.

---

## 📦 API Response Format

All API responses follow a consistent structure to ensure predictable and easy-to-handle responses.

### ✅ Success

```json
{
  "success": true,
  "data": {}
}
```

- `data` → response payload (object or array)

### ❌ Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

- `message` → short description of the error
- `errors` → optional validation details

---

## ⚙️ Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether
npm install
```

---

## ⚙️ Environment Variables

The application relies on environment variables to configure its runtime behavior.

Create a `.env` file in the project root and define the following variables:

```env
PORT=3000

JWT_SECRET=your_secret_key

DB_NAME=plantogether_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

UPLOAD_DIR=uploads

DB_LOGGING=false
DB_SSL=false

NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 🔍 Notes
- `JWT_SECRET` → used to sign and verify authentication tokens
- `NODE_ENV` → defines the environment (development, production, test)
- `DB_LOGGING` → enable Sequelize query logging (`true` or `false`)
- `DB_SSL` → enable SSL for production environments (e.g. cloud databases)
- `CORS_ORIGIN` → allowed frontend origin
- `UPLOAD_DIR` → base directory where uploaded files (avatars and event images) are stored

👉 A `.env.example` file is provided as a reference configuration.

---

## ▶️ Running the API

To start the server, run:

```bash
npm start
```

For development with automatic reload:

```bash
npm run dev
```

The API will be available at:

`http://localhost:3000` (default)

Health check endpoint:

`GET http://localhost:3000/api/health`

---

## 🔗 API Endpoints

The API exposes the following main endpoints grouped by feature.

All endpoints return standardized JSON responses as described in the API Response Format section.

Path parameters use the `:paramName` syntax (e.g., `:eventId`).

> ⚠️ Some endpoints (such as avatar and event image upload) require `multipart/form-data` requests.

### 🔐 Authentication

Endpoints related to user authentication and account management.

```http
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile   (supports avatar upload via multipart/form-data)
PUT    /api/auth/password
POST   /api/auth/logout
```

---

### 📅 Events

Endpoints for managing events.

```http
GET    /api/events
GET    /api/events/:eventId
GET    /api/events/filtered
POST   /api/events         (supports image upload via multipart/form-data)
PUT    /api/events/:eventId   (supports image upload via multipart/form-data)
DELETE /api/events/:eventId
```

---

### 👥 Event Membership

Endpoints for managing event participation and roles.

```http
GET    /api/events/my-events
POST   /api/events/:eventId/members/join
DELETE /api/events/:eventId/members/leave
GET    /api/events/:eventId/members
GET    /api/events/:eventId/organizers
PUT    /api/events/:eventId/members/:userId/role
DELETE /api/events/:eventId/members/:userId
```

---

## 🚀 Recent Improvements

### 🔧 API & Features

- Centralized event filtering logic across public and user-specific event listings
- Added creator filtering through reusable Sequelize include helpers
- Added user avatar and event image upload support
- Introduced a reusable Multer-based upload middleware
- Implemented automatic cleanup of old uploaded files on replacement
- Strengthened upload validation and error handling (file size, type, and format)

### 🧪 Testing

- Refactored test architecture for improved clarity and maintainability
- Expanded test coverage across authentication, events, and memberships
- Added integration tests to validate full API workflows
- Achieved high coverage across core features including filtering, uploads, and permissions
- Improved overall API reliability through automated testing

---

## 📌 Project Status

| Area             | Status |
|------------------|--------|
| Backend API      | ✅ Fully functional |
| Architecture     | ✅ Modular & scalable |
| Authentication   | ✅ Complete (login, logout, profile, password update) |
| Authorization    | ✅ Advanced role-based system |
| File Uploads     | ✅ Avatars & event images supported |
| Testing          | ✅ 372 tests (51 test suites) |
| Frontend         | 🔗 Connected & functional |

---

## 🔮 Future Improvements

### 🚀 Features

- Add an event invitation system (invite users via email or shareable link)
- Implement email notifications (event updates, invitations, reminders)
- Support public and private events with fine-grained access control

### ⚙️ Infrastructure & Deployment

- Containerize the API using Docker
- Deploy to a cloud provider (e.g., AWS, Render, or Fly.io)
- Improve environment-based configuration for production

---
