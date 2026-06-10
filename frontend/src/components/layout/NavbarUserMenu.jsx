import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import { useClickOutside } from "../../hooks/useClickOutside";

import UserAvatar from "../users/UserAvatar";

/* ==================================================
   NAVBAR USER MENU
   Displays authenticated user dropdown actions

   Handles:
   - user avatar menu trigger
   - user dropdown visibility
   - accessible menu trigger state
   - profile navigation
   - events navigation
   - logout action
   - logout visual separation
   - outside click detection
   - decorative dropdown icon
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
                aria-label={`${isOpen ? "Close" : "Open"} ${user.name} menu`}
            >
                <UserAvatar
                    src={avatar}
                    name={user.name}
                    className="navbar-avatar"
                />

                <span className="navbar-caret" aria-hidden="true">
                    <ChevronDown />
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
                        className="navbar-dropdown-item navbar-dropdown-danger navbar-dropdown-separated"
                        onClick={handleMenuLogout}
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
