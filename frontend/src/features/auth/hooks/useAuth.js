import { useContext } from "react";

import { AuthContext } from "../../../context/auth/AuthContext";

/* ==================================================
   USE AUTH HOOK
   Provides access to the authentication context

   Returns:
   - authenticated user
   - auth loading state
   - auth actions
================================================== */

export function useAuth() {
    return useContext(AuthContext);
}
