/* ==================================================
   AUTH REDIRECTS
   Builds redirect paths for authentication flows

   Handles:
   - protected route redirect restoration
   - login redirect path resolution
   - registration redirect path resolution
   - stale pagination cleanup after registration
================================================== */

/* =============================
   LOGIN REDIRECT
============================= */

// Restores protected route path and query params after login
export const getLoginRedirectPath = (fromLocation, fallbackPath = "/events") => {
    if (!fromLocation) {
        return fallbackPath;
    }

    return `${fromLocation.pathname}${fromLocation.search || ""}`;
};

/* =============================
   REGISTER REDIRECT
============================= */

// Restores protected route path after registration while removing stale pagination
export const getRegisterRedirectPath = (fromLocation, fallbackPath = "/events") => {
    if (!fromLocation) {
        return fallbackPath;
    }

    const searchParams = new URLSearchParams(fromLocation.search || "");

    searchParams.delete("page");

    const search = searchParams.toString();

    return `${fromLocation.pathname}${search ? `?${search}` : ""}`;
};
