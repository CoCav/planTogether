import { useId, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { useAuth } from "../../features/auth/hooks/useAuth";

import { getAvatar } from "../../utils/uploadedFiles";

import NavbarUserMenu from "./NavbarUserMenu";

/* ==================================================
   NAVBAR
   Main application navigation bar

   Handles:
   - application branding
   - primary navigation links
   - guest authentication navigation
   - authenticated user navigation
   - authenticated user menu integration
   - mobile navigation menu state
   - accessible mobile navigation toggle
   - logout redirect flow
   - decorative mobile menu icon
================================================== */

export default function Navbar() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    /* =========================
       MENU STATE
    ========================= */

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    /* =========================
       ACCESSIBILITY
    ========================= */

    const mobileMenuId = useId();

    /* =========================
       DISPLAY DATA
    ========================= */

    const avatar = getAvatar(user?.avatar);

    /* =========================
       NAVIGATION STYLES
    ========================= */

    const navLinkClassName = ({ isActive }) =>
        `navbar-link link-animated-underline link-hover-primary ${isActive ? "active" : ""}`.trim();

    /* =========================
       MENU HANDLERS
    ========================= */

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((current) => !current);
    };

    /* =========================
       AUTH HANDLERS
    ========================= */

    const handleUserLogout = async () => {
        closeMobileMenu();

        await logout();

        navigate("/");
    };

    return (
        <header className="navbar">
            <div className="container navbar-inner">

                {/* =========================
                    BRAND
                ========================= */}

                <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
                    PlanTogether
                </Link>

                {/* =========================
                    MOBILE MENU BUTTON
                ========================= */}

                <button
                    type="button"
                    className="btn btn-outline navbar-mobile-toggle"
                    onClick={toggleMobileMenu}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls={mobileMenuId}
                    aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    {isMobileMenuOpen ? (
                        <X aria-hidden="true" />
                    ) : (
                        <Menu aria-hidden="true" />
                    )}
                </button>

                {/* =========================
                    NAVIGATION CONTENT
                ========================= */}

                <div id={mobileMenuId} className={`navbar-menu ${isMobileMenuOpen ? "is-open" : ""}`}>
                    <nav className="navbar-links" aria-label="Main navigation">
                        <NavLink
                            to="/events"
                            end
                            className={navLinkClassName}
                            onClick={closeMobileMenu}
                        >
                            Events
                        </NavLink>

                        {user && (
                            <NavLink
                                to="/events/create"
                                className={navLinkClassName}
                                onClick={closeMobileMenu}
                            >
                                Create event
                            </NavLink>
                        )}
                    </nav>

                    <div className="navbar-mobile-divider" aria-hidden="true" />

                    <div className="navbar-actions">
                        {user ? (
                            <>
                                <div className="navbar-user-desktop">
                                    <NavbarUserMenu
                                        user={user}
                                        avatar={avatar}
                                        onLogout={handleUserLogout}
                                    />
                                </div>

                                <div className="navbar-mobile-account-links">
                                    <NavLink to="/my-events" className={navLinkClassName} onClick={closeMobileMenu}>
                                        My Events
                                    </NavLink>

                                    <NavLink to="/profile" className={navLinkClassName} onClick={closeMobileMenu}>
                                        Profile
                                    </NavLink>

                                    <button
                                        type="button"
                                        className="navbar-link navbar-logout-link link-animated-underline"
                                        onClick={handleUserLogout}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="navbar-auth-group">
                                <NavLink
                                    to="/login"
                                    className={navLinkClassName}
                                    onClick={closeMobileMenu}
                                >
                                    Login
                                </NavLink>

                                <NavLink
                                    to="/register"
                                    className={navLinkClassName}
                                    onClick={closeMobileMenu}
                                >
                                    Register
                                </NavLink>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </header>
    );
}
