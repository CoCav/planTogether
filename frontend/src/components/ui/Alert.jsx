import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

/* ==================================================
   ALERT
   Displays contextual feedback and status messages

   Supports:
   - info, success and danger variants
   - automatic variant-based icons
   - optional icon override
   - accessible alert and status roles
================================================== */

/* =========================
   ALERT ICONS
========================= */

// Resolves default icons for each alert variant
const ALERT_ICONS = {
    info: CircleAlert,
    success: CircleCheck,
    danger: TriangleAlert
};

export default function Alert({
    children,
    type = "info",
    icon = null,
    className = "",
    role
}) {

    // Resolves icon from explicit prop or shared variant config
    const AlertIcon = icon || ALERT_ICONS[type] || null;

    /* =========================
       CSS CLASSES
    ========================= */

    const alertClasses = `alert alert-${type} ${className}`.trim();

    /* =========================
       ACCESSIBILITY
    ========================= */

    // Uses assertive alerts for danger messages and polite status updates otherwise
    const alertRole = role || (type === "danger" ? "alert" : "status");

    return (
        <div className={alertClasses} role={alertRole}>
            {AlertIcon && (
                <span className="alert-icon" aria-hidden="true">
                    <AlertIcon />
                </span>
            )}

            <div className="alert-content">
                {children}
            </div>
        </div>
    );
}
