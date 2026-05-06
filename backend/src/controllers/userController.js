const userService = require("../services/userService");

/* ==================================================
   USER CONTROLLER

   Handles:
   - authenticated user profile retrieval
   - authenticated profile update
   - authenticated password update
   - public user profile retrieval
   - public user events retrieval
   - API response formatting

   Notes:
   - private profile routes use req.user.userId
   - public routes use req.params.id
   - sensitive public user fields are filtered in userService
================================================== */

/* =============================
   AUTHENTICATED PROFILE
============================= */

// Get authenticated user profile
const getCurrentUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        const user = await userService.getCurrentUserProfileById(userId);

        return res.status(200).json({
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

        const user = await userService.updateCurrentUserProfileById(userId, updatedData);

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
   PASSWORD
============================= */

// Change authenticated user password
const changeCurrentUserPassword = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        await userService.changeCurrentUserPasswordById(
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


/* =============================
   PUBLIC PROFILE
============================= */

// Get public user profile
const getPublicUserProfile = async (req, res, next) => {
    try {
        const profile = await userService.getPublicUserProfileById(req.params.id);

        return res.status(200).json(profile);

    } catch (error) {
        return next(error);
    }
};


/* =============================
   PUBLIC USER EVENTS
============================= */

// Get public events created and joined by a user
const getPublicUserEvents = async (req, res, next) => {
    try {
        const events = await userService.getPublicUserEventsById(req.params.id);

        return res.status(200).json(events);

    } catch (error) {
        return next(error);
    }
};

module.exports = { getCurrentUserProfile, updateCurrentUserProfile, changeCurrentUserPassword, getPublicUserProfile, getPublicUserEvents };
