const userService = require("../services/userService");

/* ==================================================
   USER CONTROLLER

   Handles:
   - public user profile retrieval
   - public user events retrieval
   - API response formatting

   Notes:
   - routes are protected by authentication middleware
   - sensitive user fields are filtered in userService
================================================== */

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

module.exports = { getPublicUserProfile, getPublicUserEvents };
