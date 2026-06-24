
import { useCallback, useMemo, useState } from "react";

import ToastContext from "./ToastContext";

/* ==================================================
   TOAST PROVIDER

   Provides global toast state and actions

   Handles:
   - toast creation
   - toast removal
   - automatic dismissal
   - toast helper methods
================================================== */

const DEFAULT_DURATION = 5000;

export default function ToastProvider({ children }) {

    /* =============================
       TOAST STATE
    ============================= */

    const [toasts, setToasts] = useState([]);

    /* =============================
       TOAST ACTIONS
    ============================= */

    const removeToast = useCallback((toastId) => {
        setToasts((prev) =>
            prev.filter((toast) => toast.id !== toastId)
        );
    }, []);

    const addToast = useCallback(
        ({ message, type = "info", duration = DEFAULT_DURATION }) => {
            const id = crypto.randomUUID();

            setToasts((prev) => [
                ...prev,
                {
                    id,
                    message,
                    type,
                    duration
                }
            ]);

            // Automatically remove toast after its duration
            if (duration > 0) {
                window.setTimeout(() => {
                    removeToast(id);
                }, duration);
            }

            return id;
        },
        [removeToast]
    );

    /* =============================
       CONTEXT VALUE
    ============================= */

    // Exposes toast state and helper methods to consumers
    const value = useMemo(
        () => ({
            toasts,
            addToast,
            removeToast,

            info: (message, options = {}) =>
                addToast({
                    message,
                    type: "info",
                    ...options
                }),

            success: (message, options = {}) =>
                addToast({
                    message,
                    type: "success",
                    ...options
                }),

            warning: (message, options = {}) =>
                addToast({
                    message,
                    type: "warning",
                    ...options
                }),

            danger: (message, options = {}) =>
                addToast({
                    message,
                    type: "danger",
                    ...options
                })
        }),
        [toasts, addToast, removeToast]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
}
