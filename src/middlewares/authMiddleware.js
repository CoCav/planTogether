const jwt = require('jsonwebtoken');

// Middleware that verifies JWT access tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Expect header format: Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization header missing or malformed',
        });
    }

    const token = authHeader.slice('Bearer '.length).trim();

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT signature and expiration
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
        if (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Attach decoded JWT payload (e.g. userId) to the request
        req.user = decodedToken;
        next();
    });
};

module.exports = { authenticateToken };