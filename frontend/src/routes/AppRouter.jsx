import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import EventsPage from "../pages/EventsPage";
import { useAuth } from "../context/useAuth.js";

function ProtectedRoute({ children }) {

    const { user, loading } = useAuth();
    
    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export default function AppRouter() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/events"
                    element={
                    <ProtectedRoute>
                        <EventsPage />
                    </ProtectedRoute>
                }/>
            </Routes>
        </BrowserRouter>
    );
}