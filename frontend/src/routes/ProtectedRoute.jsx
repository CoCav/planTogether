import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import PageLoader from "../components/ui/PageLoader";

/* ==================================================
   PROTECTED ROUTE
   Protects authenticated-only routes

   Handles:
   - auth context fallback
   - auth loading state
   - unauthenticated redirects
   - redirect state preservation
================================================== */

export default function ProtectedRoute({ children }) {
    const auth = useAuth();

    const location = useLocation();

    if (!auth || auth.loading) {
        return (
            <PageLoader
                title="Loading session..."
                description="Checking your authentication status."
            />
        );
    }

    if (!auth.user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
}
