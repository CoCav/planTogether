# PlanTogether - Fullstack Event Management Platform

![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/Framework-Express-lightgrey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Sequelize](https://img.shields.io/badge/ORM-Sequelize-orange)

![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Build-Vite-purple)
![Axios](https://img.shields.io/badge/API-Axios-green)

![Auth](https://img.shields.io/badge/Auth-JWT-yellow)

![Backend Tests](https://img.shields.io/badge/backend-318%20tests-brightgreen)
![Frontend Tests](https://img.shields.io/badge/frontend-211%20tests-brightgreen)

![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

PlanTogether is a **fullstack event management platform** that enables users to create, join, and manage events with **role-based permissions**.

The project is composed of:

- a **Node.js / Express backend API** handling business logic, authentication, and data management  
- a **React frontend application** providing a responsive and interactive user interface  

Together, they provide a complete end-to-end experience, from secure API operations to dynamic user interactions.

The application focuses on **clean architecture, scalability, and comprehensive automated testing**, ensuring reliability, consistency, and maintainability across both backend and frontend layers.

---

## 🎯 Key Highlights

- 🧪 **500+ automated tests across backend and frontend** (Jest + Supertest + Vitest + React Testing Library)  
- 🔐 **Secure authentication and role-based access control (RBAC)**  
- 🧱 **Clean fullstack architecture** (MVC backend + modular React frontend)  
- 🔍 **Advanced event filtering** (search, date range, sorting, pagination)  
- ⚛️ **Modern React frontend** with protected routes and dynamic UI  
- 🛡️ **Robust validation and error handling** across API and UI  

---

## 🚀 Application Overview

PlanTogether provides a complete fullstack event management experience, combining a secure backend API with a modern and interactive frontend.

Users can:

- Create, update, and manage events  
- Join and leave events  
- Browse and filter events using advanced search options  
- Interact with events through a role-based system (`organizer`, `co_organizer`, `participant`)  
- Manage their profile and authentication securely  

The platform ensures a smooth and intuitive user experience, with dynamic UI behavior driven by user roles and permissions, and reliable data handling powered by the backend API.

---

## ⚙️ Getting Started

Follow these steps to run the fullstack application locally.

### 1. Clone the repository

```bash
git clone https://github.com/CoCav/planTogether.git
cd planTogether
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
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

Start the backend server:

```bash
npm start
```

### 3. Setup the frontend

```bash
# from the project root
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the development server:

```bash
npm run dev
```

### 4. Access the application

- Frontend → http://localhost:5173  
- Backend API → http://localhost:3000/api  

---

## 📚 API Documentation

The backend API is fully documented in the backend README:

👉 [`/backend/README.md`](./backend/README.md)

It includes:

- Available endpoints  
- Request and response formats  
- Authentication and authorization  
- Error handling  

---

## 📖 Documentation

Additional project documentation:

- Backend → [`/backend/README.md`](./backend/README.md)  
- Frontend → [`/frontend/README.md`](./frontend/README.md)  

---

## 🛠️ Tech Stack

The project uses a modern fullstack architecture combining a robust backend, a dynamic frontend, and comprehensive testing tools.

### 🔧 Backend

- Node.js  
- Express  
- PostgreSQL  
- Sequelize ORM  
- JWT (authentication)  
- bcrypt (password hashing)  
- express-validator (input validation)  

### ⚛️ Frontend

- React (Vite, component-based UI)  
- React Router  
- Axios (API communication)  
- Context API  
- Custom hooks  

### 🧪 Testing

#### Backend
- Jest  
- Supertest  

#### Frontend
- Vitest  
- React Testing Library  
- @testing-library/jest-dom  
- @testing-library/user-event  
- jsdom  

---

## 📁 Fullstack Structure

The project is organized into two main applications: a backend API and a frontend client, each following a modular and scalable architecture.

This separation allows clear responsibility boundaries between data management, business logic, and user interface.

```
planTogether/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── config/
│   │
│   ├── tests/
│   │   ├── controllers/
│   │   ├── integration/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   │
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── events/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── tests/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── context/
│   │   │   ├── features/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── routes/
│   │   │   └── utils/
│   │   └── utils/
│   │
│   ├── public/
│   └── README.md
│
└── README.md
```

This structure ensures a clear separation of concerns between backend and frontend layers, improving maintainability, scalability, and testability.

Testing strategies are also separated: backend tests are organized at the project root level, while frontend tests are structured within the `src` directory alongside the application code.

---

## ✨ Features

### 🔐 Authentication

- User registration and login (JWT-based authentication)  
- Secure password hashing with bcrypt  
- Profile management (name, email)  
- Password update with current password verification  
- Session handling with optional "Remember me" functionality  
- Redirect to the originally requested page after login  

### 📅 Event Management

- Create, update, delete, and view events  
- Automatic organizer assignment upon event creation  
- Strong validation across frontend and backend  
- Date consistency rules (end date must be after start date)  

### 👥 Event Participation

- Join and leave events (except for the organizer)  
- Prevent duplicate participation  
- Retrieve event members and organizers  

### 🔍 Event Search & Filtering

- Keyword search (title and description)  
- Filtering by type, theme, mode, and location  
- Exact date and date range filtering  
- Combined filters with sorting and pagination  

### 🎭 Roles & Permissions

The application enforces a strict role hierarchy:

```txt
organizer > co_organizer > participant > guest
```

Each role defines specific permissions:

- **Organizer**: full control over the event and its members
- **Co-organizer**: manage participants
- **Participant**: join and leave events
- **Guest**: read-only access to public event information

Access control is enforced through:

- Role-based access control (RBAC) across backend and frontend
- Strict role validation and permission checks

---

## 🧱 Architecture

PlanTogether follows a clean fullstack architecture with a clear separation between backend and frontend responsibilities.

### 🔧 Backend

The backend is built using a **layered architecture**:

- Routes → define API endpoints  
- Controllers → handle requests and responses  
- Services → business logic (events, memberships, roles)  
- Models → database structure and relations (Sequelize)  
- Validators → input validation  
- Middlewares → authentication, authorization, and error handling  

This design supports:

- Scalable business logic  
- Secure access control (RBAC)  
- Advanced filtering and validation  
- High testability  

### ⚛️ Frontend

The frontend uses a **component-based architecture**:

- Pages → main application views  
- Components → reusable UI elements  
- API layer → centralized Axios calls  
- Context → global authentication state  
- Hooks → reusable logic  
- Features → domain-specific logic and validation  

This structure enables:

- Dynamic and responsive UI  
- Role-based rendering  
- Scalable and maintainable code organization  

Together, this architecture ensures a clear separation of concerns and allows both backend and frontend to evolve independently while maintaining a consistent and reliable data flow.

---

## 🧪 Testing

PlanTogether includes a **comprehensive automated test suite** covering both backend and frontend layers.

These tests ensure reliability, reduce regressions, and validate core application behavior across the entire stack.

### ▶️ Run Tests

#### Backend

```bash
npm test
```

#### Frontend

```bash
npm run test:run
```

---

### 📊 Results

- Backend: 318 tests (49 test suites)  
- Frontend: 211 tests (30 test suites)  
- ✅ 500+ tests in total — all passing  

---

### 📦 Test Coverage

#### 🔧 Backend

- Authentication and profile management  
- Event CRUD operations  
- Filtering, sorting, and pagination  
- Event memberships (join, leave, roles)  
- Permissions and role hierarchy (RBAC)  
- Validation and edge cases  
- API error handling and consistency  

#### ⚛️ Frontend

- Pages and user flows (auth, events, profile)  
- UI components and layout elements  
- Routing and protected routes  
- Role-based UI behavior  
- Form validation and user input handling  
- API interactions (mocked)  
- Loading, empty, and error states  

### 🔁 Test Strategy

- Backend tests simulate real API flows using **Jest** and **Supertest**  
- Frontend tests simulate user interactions using **React Testing Library** and **Vitest**  
- API calls are mocked on the frontend to isolate UI behavior  
- Tests cover success cases, edge cases, and error handling  
- Each test is independent and ensures consistent application behavior  

These tests provide strong confidence in both backend and frontend reliability.

---

## 🔐 Security

The application implements multiple security mechanisms to protect data and enforce access control across the system.

### 🔑 Authentication

- JWT-based authentication with secure token handling  
- Protected API routes via authentication middleware  

### 🛡️ Authorization

- Role-based access control (RBAC) across backend and frontend  
- Fine-grained permission checks for events and memberships  

### 🧾 Input Validation

- Request validation on both backend and frontend  
- Protection against malformed or invalid data  

### 🔒 Data Protection

- Password hashing using bcrypt  
- Sensitive data protection via Sequelize scopes  

### ⚙️ Additional Security Measures

- Centralized error handling with consistent API responses  

These mechanisms ensure secure data handling and prevent unauthorized access across both backend and frontend layers.

---

## 🚀 Recent Improvements

### ⚛️ Frontend

- Added My Events dashboard (created vs joined events)  
- Refactored Profile page for improved separation of concerns  
- Improved protected routing and redirect behavior  
- Enhanced UI consistency (layout, footer, and reusable components)  

### 🔧 Backend

- Standardized API error responses for better frontend integration  
- Included event creator information in API responses  
- Improved event filtering system (search, exact date, date range)  

### 🧪 Testing

- Refactored backend test structure (authentication, events, memberships)  
- Expanded backend test coverage (318 tests)  
- Added comprehensive frontend test suite (pages, routing, components)  
- Improved test database setup and reliability  

---

## 📌 Project Status

| Area      | Status |
|-----------|--------|
| Backend   | ✅ Complete |
| Frontend  | ✅ Complete |
| Security  | ✅ Robust |
| Testing   | ✅ 500+ tests (79 test suites) |
| UX        | 🚧 Ongoing improvements |

---

## 🔮 Future Improvements

### 🚀 Features

- Add event registration deadlines  
- Implement an event invitation system  
- Add notifications (event updates, invitations)  
- Support user avatars and enhanced profile customization  

### 📅 Event Management

- Improve handling of past events (archiving and UI state)  

### ⚛️ Frontend / UX

- Improve mobile responsiveness and overall UI optimization  

### ⚙️ Infrastructure

- Deploy the application (Vercel, Railway, or Render)  

---

## 🧠 What I Learned

Through this project, I strengthened my fullstack development skills and gained hands-on experience building a production-oriented application.

### 🔧 Backend

- Designing a layered and scalable REST API architecture  
- Implementing secure authentication using JWT  
- Building role-based access control (RBAC)  
- Managing relational data with Sequelize and PostgreSQL  
- Handling complex business logic (roles, permissions, event workflows)  

### ⚛️ Frontend

- Structuring a modular React application  
- Managing global state with the Context API  
- Creating reusable logic with custom hooks  
- Building dynamic, role-based UI behavior  

### 🧪 Testing & Quality

- Writing backend tests using Jest and Supertest  
- Building frontend tests with Vitest and React Testing Library  
- Ensuring reliability through automated testing and edge case handling  

### 🧱 Architecture & Practices

- Applying separation of concerns across backend and frontend  
- Designing maintainable and scalable codebases  
- Aligning frontend and backend validation logic  

---