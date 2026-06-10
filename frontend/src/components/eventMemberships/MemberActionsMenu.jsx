import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { useClickOutside } from "../../hooks/useClickOutside";

import Button from "../ui/Button";

/* ==================================================
   MEMBER ACTIONS MENU
   Displays compact membership management actions

   Handles:
   - action menu toggle state
   - dynamic action rendering
   - menu close after action
   - outside click detection
   - accessible menu trigger state
   - decorative action icons
   - danger action styling

   Notes:
   - used inside event member rows
   - receives already-filtered member actions
   - keeps dense member lists readable on narrow layouts
================================================== */

export default function MemberActionsMenu({ actions = [] }) {

    /* =============================
       MENU STATE
    ============================= */

    const [isOpen, setIsOpen] = useState(false);

    const menuRef = useRef(null);

    /* =============================
       DISPLAY STATE
    ============================= */

    const visibleActions = actions.filter((action) => action.show);

    /* =============================
       MENU HANDLERS
    ============================= */

    const closeMenu = () => {
        setIsOpen(false);
    };

    const toggleMenu = () => {
        setIsOpen((current) => !current);
    };

    /* =============================
       ACTION HANDLERS
    ============================= */

    const handleActionClick = (action) => {
        action.onClick();
        closeMenu();
    };

    /* =============================
       OUTSIDE CLICK
    ============================= */

    useClickOutside(menuRef, closeMenu, isOpen);

    /* =============================
       VISIBILITY
    ============================= */

    if (visibleActions.length === 0) {
        return null;
    }

    return (
        <div className="member-actions-menu" ref={menuRef}>
            <Button
                type="button"
                variant="outline"
                className="member-actions-trigger"
                onClick={toggleMenu}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                Manage

                <span className="member-actions-caret" aria-hidden="true">
                    <ChevronDown />
                </span>
            </Button>

            {isOpen && (
                <div className="member-actions-dropdown" role="menu">
                    {visibleActions.map((action) => {
                        const ActionIcon = action.icon;

                        return (
                            <button
                                key={action.label}
                                type="button"
                                role="menuitem"
                                className={[
                                    "member-actions-dropdown-item",
                                    action.danger ? "member-actions-dropdown-item-danger" : "",
                                    action.separated ? "member-actions-dropdown-item-separated" : ""
                                ].filter(Boolean).join(" ")}
                                onClick={() => handleActionClick(action)}
                            >
                                {ActionIcon && <ActionIcon aria-hidden="true" />}
                                {action.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
