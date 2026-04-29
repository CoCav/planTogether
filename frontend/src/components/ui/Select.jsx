import { useState } from "react";

/* ==================================================
   SELECT
   Reusable styled select with custom dropdown icon

   Handles:
   - base select styling
   - error state
   - dropdown icon state
================================================== */

export default function Select({ className = "", error = false, children, ...props }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`select-wrapper ${error ? "error" : ""} ${className}`.trim()}>
            <select className={`select ${error ? "error" : ""}`.trim()} onFocus={() => setIsOpen(true)} onBlur={() => setIsOpen(false)} {...props}>
                {children}
            </select>

            <span className={`select-icon ${isOpen ? "is-open" : ""}`.trim()} aria-hidden="true">▾</span>
        </div>
    );
}