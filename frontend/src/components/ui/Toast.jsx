import { CircleAlert, CircleCheck, OctagonAlert, TriangleAlert, X } from "lucide-react";

/* ==================================================
   TOAST

   Displays a temporary feedback message

   Supports:
   - info, success, warning and danger variants
   - automatic variant-based icons
   - manual dismissal
   - accessible status and alert roles
================================================== */

/* =========================
   TOAST ICONS
========================= */

// Resolves default icons for each toast variant
const TOAST_ICONS = {
    info: CircleAlert,
    success: CircleCheck,
    warning: TriangleAlert,
    danger: OctagonAlert
};

export default function Toast({
    message,
    type = "info",
    onClose
}) {

    const ToastIcon = TOAST_ICONS[type] || CircleAlert;

    /* =========================
       CSS CLASSES
    ========================= */

    const toastClasses = `toast toast-${type}`;

    /* =========================
       ACCESSIBILITY
    ========================= */

    // Uses assertive alerts for danger messages and polite status updates otherwise
    const toastRole = type === "danger" ? "alert" : "status";

    return (
        <div className={toastClasses} role={toastRole}>
            <span className="toast-icon" aria-hidden="true">
                <ToastIcon />
            </span>

            <p className="toast-message">
                {message}
            </p>

            <button
                type="button"
                className="toast-close-button"
                onClick={onClose}
                aria-label="Close notification"
            >
                <X aria-hidden="true" />
            </button>
        </div>
    );
}
