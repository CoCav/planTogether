# PlanTogether

Fullstack web application for managing collaborative events.

---

## 🚀 Tech Stack

### Backend

* Node.js
* Express
* PostgreSQL
* Sequelize (ORM)
* JWT (authentication)
* bcrypt (password hashing)
* express-validator
* Jest + Supertest (testing)

### Frontend

* React (Vite)
* React Router
* Axios

---

## 📁 Project Structure

```
planTogether/
├── backend/   # REST API
├── frontend/  # React application
```

---

## ⚙️ Installation & Setup

### 1. Backend

```
cd backend
npm install
npm run dev
```

The backend will run on:

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

The frontend will run on:

```
http://localhost:5173
```

---

## 🔐 Features

* User authentication with JWT
* Create, update and delete events
* Join and leave events
* Role management:

  * organizer
  * co_organizer
  * participant
* Permission system:

  * organizers manage everything
  * co-organizers can edit
  * participants have limited access

---

## 🧪 Backend Tests

```
cd backend
npm test
```

✔ 28 tests passing
✔ Covers auth, events, memberships, permissions, and edge cases

---

## 📌 Project Status

| Part     | Status         |
| -------- | -------------- |
| Backend  | ✅ Completed    |
| Tests    | ✅ Completed    |
| Security | ✅ Solid        |
| Frontend | 🚧 In progress |

---

## 🎯 Next Steps

* Build React frontend
* Connect API to UI
* Implement event UI & membership interactions

---

## 🧠 What I Learned

* Designing a REST API
* Managing database relationships (many-to-many)
* Implementing roles & permissions
* Securing an API with JWT
* Writing backend tests with Jest & Supertest
* Handling business logic edge cases
