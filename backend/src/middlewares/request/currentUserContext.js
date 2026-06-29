const jwt = require("jsonwebtoken");

/* ==================================================
   CURRENT USER CONTEXT MIDDLEWARE

   Handles:
   - current user resolution for incoming requests
   - optional JWT extraction from Authorization header
   - authenticated user injection into req.user

   Notes:
   - missing or invalid tokens do not block the request
   - protected routes should continue using authenticateToken
   - enriches request context without enforcing authentication
================================================== */

// Attach current authenticated user when available
const currentUserContext = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Continue anonymously when no Bearer token is provided
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader
        .slice("Bearer ".length)
        .trim();

    // Continue anonymously when Bearer token is empty
    if (!token) {
        return next();
    }

    try {
        const currentUser = jwt.verify(token, process.env.JWT_SECRET);

        // Make authenticated user data available when token is valid
        req.user = currentUser;

    } catch {
        // Ignore invalid tokens on public routes
        req.user = null;
    }

    return next();
};

module.exports = { currentUserContext };
