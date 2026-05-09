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
   - successful responses include success, message and top-level payload fields when needed
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
            success: true,
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
            success: true,
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
const logout = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};

module.exports = { register, login, logout };
