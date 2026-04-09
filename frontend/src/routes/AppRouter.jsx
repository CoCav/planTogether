import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import EventsPage from "../pages/EventsPage";
import CreateEventPage from "../pages/createEventPage.jsx";
import { useAuth } from "../context/useAuth.js";

function ProtectedRoute({ children }) {

    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/events" element={<EventsPage />}/>

            <Route path="/events/create"
                    element={
                    <ProtectedRoute>
                     <CreateEventPage />
                    </ProtectedRoute>
                }/>
        </Routes>
    );
}