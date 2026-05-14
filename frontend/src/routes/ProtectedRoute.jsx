import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import PageLoader from "../components/ui/PageLoader";

/* ==================================================
   PROTECTED ROUTE
   Protects authenticated-only routes

   Handles:
   - auth loading state
   - unauthenticated redirects
   - redirect state preservation
================================================== */

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    const location = useLocation();

    if (loading) {
        return (
            <PageLoader>
                Loading...
            </PageLoader>
        );
    }

    if (!user) {
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
