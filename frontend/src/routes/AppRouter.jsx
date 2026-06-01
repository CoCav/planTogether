import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import HomePage from "../pages/HomePage";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import EventsPage from "../pages/EventsPage";
import EventDetailsPage from "../pages/EventDetailsPage";

import MyProfilePage from "../pages/users/authenticated/MyProfilePage";
import MyEventsPage from "../pages/users/authenticated/MyEventsPage";

import PublicUserPage from "../pages/users/public/PublicUserPage";

import CreateEventPage from "../pages/CreateEventPage";
import EditEventPage from "../pages/EditEventPage";

/* ==================================================
   APP ROUTER
   Defines application routes

   Handles:
   - public routes
   - protected routes
================================================== */

export default function AppRouter() {
    return (
        <Routes>

            {/* =============================
                PUBLIC ROUTES
            ============================== */}

            <Route
                path="/"
                element={<HomePage />}
            />

            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />

            <Route
                path="/events"
                element={<EventsPage />}
            />

            <Route
                path="/events/:eventId"
                element={<EventDetailsPage />}
            />

            <Route
                path="/users/:userId"
                element={<PublicUserPage />}
            />

            {/* =============================
                PROTECTED ROUTES
            ============================== */}

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <MyProfilePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/my-events"
                element={
                    <ProtectedRoute>
                        <MyEventsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/events/create"
                element={
                    <ProtectedRoute>
                        <CreateEventPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/events/:eventId/edit"
                element={
                    <ProtectedRoute>
                        <EditEventPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
