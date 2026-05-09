const userService = require("../services/userService");

/* ==================================================
   USER CONTROLLER

   Handles:
   - authenticated user events retrieval
   - authenticated user profile retrieval
   - authenticated profile update
   - authenticated password update
   - public user profile retrieval
   - public user events retrieval
   - API response formatting

   Notes:
   - current user routes use req.user.userId
   - public routes use req.params.id
   - sensitive public user fields are filtered in userService
   - successful responses include success, message and top-level payload fields when needed
================================================== */

/* =============================
   AUTHENTICATED USER
============================= */

// Get authenticated user's events
const getCurrentUserEvents = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const result = await userService.getCurrentUserEventsByID(userId, req.query);

        return res.status(200).json({
            success: true,
            message: "Events retrieved successfully",
            ...result
        });

    } catch (error) {
        return next(error);
    }
};

// Get authenticated user profile
const getCurrentUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await userService.getCurrentUserProfileByID(userId);

        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
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
const updateCurrentUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const updatedData = {
            ...req.body
        };

        // Uploaded avatar overrides body avatar data
        if (req.file) {
            updatedData.avatar = `/uploads/avatars/${req.file.filename}`;
        }

        const user = await userService.updateCurrentUserProfileByID(userId, updatedData);

        return res.status(200).json({
            success: true,
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

// Change authenticated user password
const changeCurrentUserPassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        await userService.changeCurrentUserPasswordByID(
            userId,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        return next(error);
    }
};


/* =============================
   PUBLIC USER
============================= */

// Get public user profile
const getPublicUserProfile = async (req, res, next) => {
    try {
        const profile = await userService.getPublicUserProfileByID(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Public user profile retrieved successfully",
            ...profile
        });

    } catch (error) {
        return next(error);
    }
};

// Get public events created and joined by a user
const getPublicUserEvents = async (req, res, next) => {
    try {
        const events = await userService.getPublicUserEventsByID(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Public user events retrieved successfully",
            ...events
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    getCurrentUserEvents,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    changeCurrentUserPassword,
    getPublicUserProfile,
    getPublicUserEvents
};
