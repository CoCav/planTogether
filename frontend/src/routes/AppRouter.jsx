import { Routes, Route, Navigate, useLocation  } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ProfilePage from "../pages/ProfilePage.jsx";
import MyEventsPage from "../pages/MyEventsPage.jsx";
import EventsPage from "../pages/EventsPage";
import CreateEventPage from "../pages/CreateEventPage.jsx";
import EventDetailsPage from "../pages/EventDetailsPage";
import EditEventPage from "../pages/EditEventPage.jsx";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <p>Loading...</p>;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/profile"
                element={
                    <ProtectedRoute>
                     <ProfilePage />
                    </ProtectedRoute>
                }
            />

            <Route path="/my-events"
                element={
                    <ProtectedRoute>
                    <MyEventsPage/>
                    </ProtectedRoute>
                }
            />

            <Route path="/events" element={<EventsPage />}/>

            <Route path="/events/create"
                element={
                    <ProtectedRoute>
                     <CreateEventPage />
                    </ProtectedRoute>
                }
            />
                
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route path="/events/:eventId/edit" element={<EditEventPage />} />
        </Routes>
    );
}