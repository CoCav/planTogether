const authService = require('../services/authService');

/* ==================================================
   USER CONTROLLER
================================================== */

// Register a new user
const register = async (req, res, next) => {
    try {
        // Get all datas from the new user
        const { name, email, password } = req.body;

        // Build avatar if a file was uploaded via multer
        // Otherwise, keep it null (frontend will handle default avatar)
        const avatar = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        // Create a new user
        const { user, token } = await authService.registerUser({
            name,
            email,
            password,
            avatar
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },

            token
        });

    } catch (error) {
        return next(error);
    }
};

// Log a existing user in
const login = async (req, res, next) => {
    try {

        // Get all datas from the user
        const { email, password } = req.body;

        // Logs an user
        const { user, token } = await authService.loginUser({ email, password });

        return res.status(200).json({
            message: 'Login successful',
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            token
        });

    } catch (error) {
        return next(error);
    }
};

// Get a user by ID - profile
const getUserByID = async (req, res, next) => {
    try {

        // Get user ID
        const userId = req.user.userId;

        // Get all datas from an user
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

// Update a user by ID - profile
const updateUserByID = async (req, res, next) => {
    try {
        // Get user ID & all new datas from the user
        const userId = req.user.userId;
        const updatedData = {
            ...req.body
        };

        // If a new avatar file is uploaded, override avatar
        if (req.file) {
            updatedData.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        // Update the user's new datas as datas
        const user = await authService.updateUserProfileByID(userId, updatedData);

        return res.status(200).json({
            message: "User profile updated successfully",
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        return next(error);
    }
};

// Change the current user's password
const changePassword = async (req, res, next) => {
    try {

        // Get user ID & all new datas from the user
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // Update user's new password
        await authService.changeUserPasswordByID(
            userId,
            currentPassword,
            newPassword
        );

        return res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        return next(error);
    }
};

// Logout user
const logout = async (req, res) => {
    return res.status(200).json({ message: 'Logout successful' });
};

module.exports = { register, login, getUserByID, updateUserByID, changePassword, logout };
