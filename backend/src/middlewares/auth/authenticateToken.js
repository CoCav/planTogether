const jwt = require("jsonwebtoken");

const { createHttpError } = require("../../utils/errors/httpError");

/* ==========================================================================
   Authenticate Token Middleware

   Verifies JWT access tokens and injects authenticated user data.

   Responsibilities
   - Read the Authorization header
   - Validate the Bearer token format
   - Verify the JWT access token
   - Attach decoded user data to req.user

   Notes
   - Expected header format is: Bearer <token>.
   - Decoded tokens should contain userId.
   - Authentication errors are forwarded to the global error handler.
=========================================================================== */

/* =============================
   AUTHENTICATION CONSTANTS
============================= */

const BEARER_PREFIX = "Bearer ";

const AUTH_HEADER_ERROR = "Authorization header missing or malformed";
const MISSING_TOKEN_ERROR = "No token provided";
const INVALID_TOKEN_ERROR = "Invalid or expired token";

/* =============================
   TOKEN AUTHENTICATION
============================= */

// Verify the access token and attach the decoded user to the request
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
        return next(createHttpError(401, AUTH_HEADER_ERROR));
    }

    const token = authHeader
        .slice(BEARER_PREFIX.length)
        .trim();

    if (!token) {
        return next(createHttpError(401, MISSING_TOKEN_ERROR));
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, decodedToken) => {
            if (error) {
                return next(createHttpError(401, INVALID_TOKEN_ERROR));
            }

            // Make authenticated user data available to downstream middlewares
            req.user = decodedToken;

            return next();
        }
    );
};

module.exports = { authenticateToken };
