const jwt = require("jsonwebtoken");

/* ==========================================================================
   Resolve Current User Middleware

   Resolves the current user when a valid JWT is available.

   Responsibilities
   - Read the Authorization header
   - Extract an optional Bearer token
   - Verify the token when present
   - Attach decoded user data to req.user

   Notes
   - Missing or invalid tokens do not block the request.
   - Protected routes should continue using authenticateToken.
   - This middleware enriches public request context without enforcing auth.
=========================================================================== */

const BEARER_PREFIX = "Bearer ";

const resolveCurrentUser = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
        return next();
    }

    const token = authHeader
        .slice(BEARER_PREFIX.length)
        .trim();

    if (!token) {
        return next();
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // Make authenticated user data available when the token is valid.
        req.user = decodedToken;

    } catch {
        // Public routes should continue anonymously when the token is invalid.
        req.user = null;
    }

    return next();
};

module.exports = { resolveCurrentUser };
