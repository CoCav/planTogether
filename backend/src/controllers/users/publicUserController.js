const userService = require("../../services/userService");

/* ==========================================================================
   Public User Controller

   Handles public user responses.

   Responsibilities
   - Retrieve public user profiles
   - Retrieve public user events
   - Return public user API responses

   Notes
   - Public routes use req.params.id.
   - Optional current user context is used for event like state.
   - Business logic is delegated to userService.
=========================================================================== */

/* =============================
   PUBLIC USER PROFILE
============================= */

// Retrieve a public user profile
const getPublicUserProfile = async (req, res, next) => {
    try {
        const profile = await userService.getPublicUserProfileById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Public user profile retrieved successfully",
            ...profile
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   PUBLIC USER EVENTS
============================= */

// Retrieve public event listings for a user
const getPublicUserEvents = async (req, res, next) => {
    try {
        const events = await userService.getPublicUserEventsById(
            req.params.id,
            req.query,
            req.user?.userId
        );

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
    getPublicUserProfile,
    getPublicUserEvents
};
