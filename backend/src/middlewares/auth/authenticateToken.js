const jwt = require("jsonwebtoken");

const { createHttpError } = require("../../utils/errors/httpError");

/* ==================================================
   AUTHENTICATE TOKEN MIDDLEWARE

   Handles:
   - JWT extraction from Authorization header
   - token verification
   - authenticated user injection into req.user

   Notes:
   - expected header format is: Bearer <token>
   - decoded token should contain userId
   - authentication errors are forwarded to the global errorHandler
================================================== */

// Verify JWT access token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Require Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(createHttpError(401, "Authorization header missing or malformed"));
    }

    const token = authHeader
        .slice("Bearer ".length)
        .trim();

    // Reject empty Bearer token
    if (!token) {
        return next(createHttpError(401, "No token provided"));
    }

    // Verify token signature and expiration
    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, decodedToken) => {

            if (error) {
                return next(createHttpError(401, "Invalid or expired token"));
            }

            // Make authenticated user data available downstream
            req.user = decodedToken;

            return next();
        }
    );
};

module.exports = { authenticateToken };
