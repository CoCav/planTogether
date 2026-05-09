const authService = require("../services/authService");

/* ==================================================
   AUTH CONTROLLER

   Handles:
   - user registration
   - user login
   - logout response

   Notes:
   - business logic is delegated to authService
   - uploaded avatar paths are formatted here
   - user profile logic belongs to userController
================================================== */

/* =============================
   REGISTER / LOGIN
============================= */

// Register a new user
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Build avatar path only when a file was uploaded
        const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        const { user, token } = await authService.registerUser({
            name,
            email,
            password,
            avatar
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || null
            },
            token
        });

    } catch (error) {
        return next(error);
    }
};


// Login an existing user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await authService.loginUser({ email, password });

        return res.status(200).json({
            message: "Login successful",
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || null
            },
            token
        });

    } catch (error) {
        return next(error);
    }
};


/* =============================
   LOGOUT
============================= */

// Logout authenticated user
const logout = async (req, res) => {
    return res.status(200).json({
        message: "Logout successful"
    });
};

module.exports = { register, login, logout };
