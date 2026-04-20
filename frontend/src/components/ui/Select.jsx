import { useState } from "react";

/* ==================================================
   SELECT COMPONENT
   Reusable styled select field with custom dropdown icon
================================================== */
export default function Select({ className = "", children, ...props }) {
    /* =========================
       Open state
       Controls icon rotation while the select is focused
    ========================= */
    const [isOpen, setIsOpen] = useState(false);

    /* =========================
       Render select wrapper
       Displays a native select with a custom visual icon
    ========================= */
    return (
        <div className={`select-wrapper ${className}`.trim()}>
            <select className="select" onFocus={() => setIsOpen(true)} onBlur={() => setIsOpen(false)} {...props}>{children}</select>
            <span className={`select-icon ${isOpen ? "is-open" : ""}`.trim()} aria-hidden="true">▾</span>
        </div>
    );
}