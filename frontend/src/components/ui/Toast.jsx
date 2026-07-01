import { useEffect, useState } from "react";
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
    duration = 5000,
    onClose
}) {

    /* =========================
       ANIMATION STATE
    ========================= */

    // Triggers the exit animation before the toast is removed
    const [isLeaving, setIsLeaving] = useState(false);

    const ToastIcon = TOAST_ICONS[type] || CircleAlert;

    /* =========================
       CSS CLASSES
    ========================= */

    // Adds the exit animation class shortly before removal
    const toastClasses = isLeaving
        ? `toast toast-${type} toast-leaving`
        : `toast toast-${type}`;

    /* =========================
       ACCESSIBILITY
    ========================= */

    // Uses assertive alerts for danger messages and polite status updates otherwise
    const toastRole = type === "danger" ? "alert" : "status";

    /* =========================
       EXIT ANIMATION
    ========================= */

    // Starts the exit animation shortly before the toast is automatically removed
    useEffect(() => {
        if (duration <= 250) return undefined;

        const leaveTimer = window.setTimeout(() => {
            setIsLeaving(true);
        }, duration - 250);

        return () => {
            window.clearTimeout(leaveTimer);
        };
    }, [duration]);

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

            {duration > 0 && (
                <span
                    className="toast-progress"
                    style={{ animationDuration: `${duration}ms` }}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}
