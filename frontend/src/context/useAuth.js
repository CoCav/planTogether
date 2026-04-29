import { useContext } from "react";
import { AuthContext } from "./authContext.jsx";

/* ==================================================
   USE AUTH HOOK
   Provides access to the authentication context

   Returns:
   - user data
   - auth loading state
   - auth actions (login, logout, refresh)
================================================== */

export function useAuth() {
    return useContext(AuthContext);
}