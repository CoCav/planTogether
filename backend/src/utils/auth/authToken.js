const jwt = require("jsonwebtoken");

/* ==================================================
   AUTH TOKEN UTILITIES

   Handles:
   - JWT access token generation
   - authenticated user payload formatting

   Notes:
   - JWT payload stores userId only
   - token expiration is centralized here
================================================== */

// Generate authentication token from user ID
const generateAuthToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );
};

module.exports = { generateAuthToken };
