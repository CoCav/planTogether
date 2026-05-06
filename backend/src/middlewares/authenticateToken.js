const jwt = require('jsonwebtoken');

/* ==================================================
   AUTHENTICATE TOKEN MIDDLEWARE

   Handles:
   - JWT extraction from Authorization header
   - token verification
   - authenticated user injection into req.user

   Notes:
   - expected header format is: Bearer <token>
   - decoded token should contain userId
================================================== */

// Verify JWT access token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Require Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization header missing or malformed'
        });
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
        return res.status(401).json({
            message: 'No token provided'
        });
    }

    // Verify token signature and expiration
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
        if (error) {
            return res.status(401).json({
                message: 'Invalid or expired token'
            });
        }

        // Make authenticated user data available to controllers
        req.user = decodedToken;
        next();
    });
};

module.exports = { authenticateToken };
