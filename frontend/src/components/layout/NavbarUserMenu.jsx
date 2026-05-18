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
    // Controls dropdown visibility
    const [isOpen, setIsOpen] = useState(false);

    // Reference used for outside click detection
    const menuRef = useRef(null);

    // Close dropdown menu
    const closeMenu = () => {
        setIsOpen(false);
    };

    // Toggle dropdown visibility
    const toggleMenu = () => {
        setIsOpen((current) => !current);
    };

    // Handle user logout flow
    const handleLogout = async () => {
        closeMenu();
        await onLogout();
    };

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
                <div id="navbar-user-dropdown" className="navbar-dropdown" role="menu" >
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
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
