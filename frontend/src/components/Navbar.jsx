import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import Button from "./ui/Button";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // User menu state : controls dropdown visibility
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Dropdown ref : Used to detect outside clicks
    const userMenuRef = useRef(null);

    /* =========================
        Close dropdown on outside click
    ========================= */
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (
            userMenuRef.current &&
            !userMenuRef.current.contains(event.target)
        ) {
            setIsUserMenuOpen(false);
        }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    /* =========================
        Logout handler
    ========================= */
    const handleLogout = async () => {
        setIsUserMenuOpen(false);
        await logout();
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                {/* Brand */}
                <Link to="/" className="navbar-brand">PlanTogether</Link>

                {/* Main navigation */}
                <nav className="navbar-links">
                    <Link to="/" className="navbar-link">Home</Link>
                    <Link to="/events" className="navbar-link">Events</Link>

                    {user && (<Link to="/events/create" className="navbar-link">Create Event</Link>)}
                </nav>

                {/* Right side */}
                <div className="navbar-actions">
                    {user ? (
                        <div className="navbar-user-menu" ref={userMenuRef}>
                            <button type="button" className="btn btn-outline navbar-user-trigger" onClick={() => setIsUserMenuOpen((prev) => !prev)} aria-expanded={isUserMenuOpen} aria-haspopup="menu" aria-label="Open user menu">
                                    <span>Welcome {user.name} !</span>
                                    <span className="navbar-caret">▾</span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="navbar-dropdown" role="menu">
                                    <Link to="/profile" className="navbar-dropdown-item" role="menuitem" onClick={() => setIsUserMenuOpen(false)}>My Profile</Link>
                                    <button type="button" className="navbar-dropdown-item navbar-dropdown-danger" role="menuitem" onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="navbar-auth-group">
                            <Link to="/login" className="navbar-link">Login</Link>

                            <Link to="/register">
                                <button type="button" className="btn btn-primary">Register</button>
                             </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}