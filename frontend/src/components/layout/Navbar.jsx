import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/useAuth";

import { getAvatar } from "../../utils/uploadedFiles";

import NavbarUserMenu from "./NavbarUserMenu";

/* ==================================================
   NAVBAR
   Main application navigation bar

   Handles:
   - application branding
   - primary navigation links
   - authentication navigation
   - authenticated user menu
   - accessible main navigation
   - accessible authenticated navigation
================================================== */

export default function Navbar() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    /* =========================
       DISPLAY DATA
    ========================= */

    const avatar = getAvatar(user?.avatar);

    /* =========================
       NAVIGATION STYLES
    ========================= */

    const navLinkClassName = ({ isActive }) =>
        `navbar-link link-underline link-color-hover ${isActive ? "active" : ""}`.trim();

    /* =========================
       HANDLERS
    ========================= */

    const handleUserLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="container navbar-inner">

                {/* =========================
                    BRAND
                ========================= */}

                <Link to="/" className="navbar-brand">PlanTogether</Link>

                {/* =========================
                    MAIN NAVIGATION
                ========================= */}

                <nav className="navbar-links" aria-label="Main navigation">
                    <NavLink to="/events" end className={navLinkClassName}>
                        Events
                    </NavLink>

                    {user && (
                        <NavLink to="/events/create" className={navLinkClassName}>
                            Create event
                        </NavLink>
                    )}
                </nav>

                {/* =========================
                    AUTHENTICATION ACTIONS
                ========================= */}

                <div className="navbar-actions">
                    {user ? (
                        <NavbarUserMenu
                            user={user}
                            avatar={avatar}
                            onLogout={handleUserLogout}
                        />
                    ) : (
                        <div className="navbar-auth-group">
                            <NavLink to="/login" className={navLinkClassName}>
                                Login
                            </NavLink>

                            <Link to="/register" className="btn btn-primary">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
