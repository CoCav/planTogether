const authService = require('../services/authService');

/* ==================================================
   AUTH CONTROLLER

   Handles:
   - user registration
   - user login
   - authenticated profile retrieval
   - authenticated profile update
   - password update
   - logout response

   Notes:
   - business logic is delegated to authService
   - uploaded avatar paths are formatted here
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
            message: 'Login successful',
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
   PROFILE
============================= */

// Get authenticated user profile
const getUserByID = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await authService.getUserProfileByID(userId);

        return res.status(200).json({
            message: 'User profile retrieved successfully',
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || null
            }
        });

    } catch (error) {
        return next(error);
    }
};


// Update authenticated user profile
const updateUserByID = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const updatedData = {
            ...req.body
        };

        // Uploaded avatar overrides body avatar data
        if (req.file) {
            updatedData.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        const user = await authService.updateUserProfileByID(userId, updatedData);

        return res.status(200).json({
            message: "User profile updated successfully",
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || null
            }
        });

    } catch (error) {
        return next(error);
    }
};


/* =============================
   PASSWORD / LOGOUT
============================= */

// Change authenticated user password
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        await authService.changeUserPasswordByID(
            userId,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        return next(error);
    }
};


// Logout authenticated user
const logout = async (req, res) => {
    return res.status(200).json({
        message: 'Logout successful'
    });
};

module.exports = { register, login, getUserByID, updateUserByID, changePassword, logout };
