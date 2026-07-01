import useToast from "../../hooks/useToast";

import Toast from "./Toast";

/* ==================================================
   TOAST CONTAINER

   Displays global toast notifications

   Handles:
   - empty toast state
   - toast list rendering
   - toast dismissal forwarding
   - global notification region
================================================== */

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    /* =========================
       EMPTY STATE
    ========================= */

    if (toasts.length === 0) {
        return null;
    }

    /* =========================
       RENDER
    ========================= */

    return (
        <div className="toast-container" role="region" aria-label="Notifications">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
