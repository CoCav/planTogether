const authService = require("../services/authService");

const { formatAuthenticatedUser } = require("../utils/users/authenticated/authenticatedUserFormatter");

/* ==========================================================================
   Auth Controller

   Handles authentication responses.

   Responsibilities
   - Register users
   - Log users in
   - Return logout responses
   - Format authenticated user payloads

   Notes
   - Business logic is delegated to authService.
   - Uploaded avatar paths are prepared here.
   - User profile logic belongs to userController.
=========================================================================== */

/* Registration */

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const avatar = req.file
            ? `/uploads/avatars/${req.file.filename}`
            : null;

        const { user, token } = await authService.registerUser({
            name,
            email,
            password,
            avatar
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: formatAuthenticatedUser(user),
            token
        });

    } catch (error) {
        return next(error);
    }
};

/* Login */

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await authService.loginUser({
            email,
            password
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: formatAuthenticatedUser(user),
            token
        });

    } catch (error) {
        return next(error);
    }
};

/* Logout */

const logout = (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logout successful"
    });
};

module.exports = {
    register,
    login,
    logout
};
