const jwt = require("jsonwebtoken");

/* ==========================================================================
   Auth Token Utilities

   Builds authentication tokens for authenticated users.

   Responsibilities
   - Generate JWT access tokens
   - Keep the authenticated user payload consistent
   - Centralize token expiration

   Notes
   - JWT payload stores userId only.
   - JWT_SECRET is read from environment variables.
=========================================================================== */

const AUTH_TOKEN_EXPIRES_IN = "24h";

// Generate a signed JWT containing the authenticated user ID.
const generateAuthToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: AUTH_TOKEN_EXPIRES_IN }
    );
};

module.exports = { generateAuthToken };
