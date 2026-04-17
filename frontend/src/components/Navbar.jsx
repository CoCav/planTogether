import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import Button from "./ui/Button";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };


    return (
        <header className="navbar">
            <div className="container navbar-inner">

                {/* Brand */}
                <Link to="/" className="navbar-brand">PlanTogether</Link>

                {/* Navigation */}
                <nav className="navbar-links">
                    <Link to="/" className="navbar-link">Home</Link>
                    <Link to="/events" className="navbar-link">Events</Link>

                    {user && (
                        <div className="navbar-links-group">
                            <Link to="/events/create" className="navbar-link">Create Event</Link>
                            <Link to="/profile" className="navbar-link">Profile</Link>
                        </div>
                    )}
                </nav>

                {/* Right side */}
                <div className="navbar-actions">
                    {user ? (
                        <div className="navbar-user-group">
                            <span className="navbar-user">Hello, {user.name}</span>
                            <Button type="button" variant="outline" onClick={handleLogout}>Logout</Button>
                        </div>
                    ) : (
                        <div className="navbar-auth-group">
                            <Link to="/login" className="navbar-link">Login</Link>
                            <Link to="/register">
                                <Button type="button">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}