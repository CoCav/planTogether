import useToast from "../../hooks/useToast";

import Toast from "./Toast";

/* ==================================================
   TOAST CONTAINER

   Displays global toast notifications

   Handles:
   - toast list rendering
   - toast dismissal
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
        <div className="toast-container" aria-label="Notifications">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}
