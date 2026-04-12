import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
    const { user, logout } = useAuth();
    
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };


    return (
        <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
            {/* Logo */}
            <Link to="/" style={{ marginRight: "20px" }}>
                <strong>PlanTogether</strong>
            </Link>

            {/* Navigation */}
            <Link to="/" style={{ marginRight: "10px" }}>Home</Link>
            <Link to="/events" style={{ marginRight: "10px" }}>Events</Link>

            {/* Auth */}
            {user ? (
                <>
                <Link to="/events/create" style={{ marginRight: "10px" }}>
                    Create Event
                </Link>

                <span style={{ marginRight: "10px" }}>
                    Hello, {user.name}
                </span>

                <button onClick={handleLogout}>Logout</button>
            </>
            ) : (
            <>
                <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
                <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
            </>
            )}
        </nav>
    );
}