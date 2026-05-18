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
================================================== */

export default function Navbar() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    // Resolve avatar with fallback support
    const avatar = getAvatar(user?.avatar);

    // Redirect user after logout
    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="container navbar-inner">

                {/* Brand */}
                <Link to="/" className="navbar-brand">PlanTogether</Link>

                {/* Main navigation */}
                <nav className="navbar-links" aria-label="Main navigation">
                    <NavLink
                        to="/events"
                        end
                        className={({ isActive }) =>
                            `navbar-link link-underline link-color-hover ${isActive ? "active" : ""}`.trim()
                        }
                    >
                        Events
                    </NavLink>

                    {user && (
                        <NavLink
                            to="/events/create"
                            className={({ isActive }) =>
                                `navbar-link link-underline link-color-hover ${isActive ? "active" : ""}`.trim()
                            }
                        >
                            Create event
                        </NavLink>
                    )}
                </nav>

                {/* Authentication actions */}
                <div className="navbar-actions">
                    {user ? (
                        <NavbarUserMenu
                            user={user}
                            avatar={avatar}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <div className="navbar-auth-group">
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `navbar-link link-underline link-color-hover ${isActive ? "active" : ""}`.trim()
                                }
                            >
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
