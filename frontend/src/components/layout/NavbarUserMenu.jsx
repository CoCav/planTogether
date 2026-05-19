import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useClickOutside } from "../../hooks/useClickOutside";

/* ==================================================
   NAVBAR USER MENU
   Displays authenticated user dropdown actions

   Handles:
   - user dropdown visibility
   - profile navigation
   - events navigation
   - logout action
   - outside click detection
================================================== */

export default function NavbarUserMenu({ user, avatar, onLogout }) {

    /* =========================
       DROPDOWN STATE
    ========================= */

    const [isOpen, setIsOpen] = useState(false);

    const menuRef = useRef(null);

    /* =========================
       HANDLERS
    ========================= */

    const closeMenu = () => {
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen((current) => !current);
    };

    const handleMenuLogout = async () => {
        closeMenu();
        await onLogout();
    };

    /* =========================
       OUTSIDE CLICK
    ========================= */

    useClickOutside(menuRef, closeMenu, isOpen);

    return (
        <div className="navbar-user-menu" ref={menuRef}>
            <button
                type="button"
                className="btn btn-outline navbar-user-trigger"
                onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-controls="navbar-user-dropdown"
                aria-label={`Open ${user.name} menu`}
            >
                <img
                    src={avatar}
                    alt={`${user.name} avatar`}
                    className="navbar-avatar"
                />

                <span className="navbar-caret" aria-hidden="true">
                    ▾
                </span>
            </button>

            {isOpen && (
                <div id="navbar-user-dropdown" className="navbar-dropdown" role="menu">
                    <Link
                        to="/profile"
                        role="menuitem"
                        className="navbar-dropdown-item"
                        onClick={closeMenu}
                    >
                        My Profile
                    </Link>

                    <Link
                        to="/my-events"
                        role="menuitem"
                        className="navbar-dropdown-item"
                        onClick={closeMenu}
                    >
                        My Events
                    </Link>

                    <button
                        type="button"
                        role="menuitem"
                        className="navbar-dropdown-item navbar-dropdown-danger"
                        onClick={handleMenuLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
