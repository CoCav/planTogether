import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

import { getAvatar } from "../../utils/getUploadedFile";

import Button from "../ui/Button";

/* ==================================================
   NAVBAR
   Main application navigation bar

   Handles:
   - primary navigation links
   - user authentication state
   - user dropdown menu (profile, logout)
================================================== */

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Controls user dropdown visibility
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Reference used to detect outside clicks
    const userMenuRef = useRef(null);

    // Resolve the correct avatar source for the current user (fallback to null if not authenticated)
    const avatar = user ? getAvatar(user.avatar) : null;

    /* =========================
        Close dropdown on outside click
    ========================= */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => { document.removeEventListener("mousedown", handleClickOutside) };
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
                    <NavLink to="/events" end className={({ isActive }) => `navbar-link link-underline link-color-hover ${isActive ? "active" : ""}`.trim()}>Events</NavLink>

                    {user && (<NavLink to="/events/create" className={({ isActive }) => `navbar-link link-underline link-color-hover ${isActive ? "active" : ""}`.trim()}>Create event</NavLink>)}
                </nav>

                {/* Right side */}
                <div className="navbar-actions">
                    {user ? (
                        <div className="navbar-user-menu" ref={userMenuRef}>
                            <button
                                type="button"
                                className="btn btn-outline navbar-user-trigger"
                                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                aria-expanded={isUserMenuOpen}
                                aria-haspopup="menu"
                                aria-label={`Open ${user.name} menu`}
                            >
                                <img
                                    src={avatar}
                                    alt={`${user.name} avatar`}
                                    className="navbar-avatar"
                                />
                                {/* <span>{user.name}</span> */}
                                <span className="navbar-caret">▾</span>
                            </button>

                            {isUserMenuOpen && (
                                <div className="navbar-dropdown" role="menu">
                                    <Link to="/profile" role="menuitem" className="navbar-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>My Profile</Link>
                                    <Link to="/my-events" role="menuitem" className="navbar-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>My Events</Link>
                                    <button type="button" role="menuitem" className="navbar-dropdown-item navbar-dropdown-danger" onClick={handleLogout}>Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="navbar-auth-group">
                            <NavLink to="/login" className={({ isActive }) => `navbar-link link-underline link-color-hover ${isActive ? "active" : ""}`.trim()}>Login</NavLink>

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
