import { createContext } from "react";

/* ==================================================
   TOAST CONTEXT

   Stores global toast state and toast actions.

   Provided by:
   - ToastProvider
================================================== */

const ToastContext = createContext(null);

export default ToastContext;
