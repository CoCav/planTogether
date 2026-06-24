
import { useContext } from "react";

import ToastContext from "../context/toast/ToastContext";

/* ==================================================
   USE TOAST

   Custom hook used to access the toast context

   Returns:
   - toast state
   - toast actions
================================================== */

export default function useToast() {

    /* =============================
       CONTEXT ACCESS
    ============================= */

    const context = useContext(ToastContext);

    // Prevent usage outside ToastProvider
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider.");
    }

    return context;
}
