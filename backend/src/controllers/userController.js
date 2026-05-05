const userService = require("../services/userService");

/* ==================================================
   USER CONTROLLER

   Handles:
   - public user profile endpoints
   - formatting API responses
   - delegating logic to services
================================================== */

// Get public user profile (GET /api/users/:id)
const getPublicUserProfile = async (req, res, next) => {
    try {
        const profile = await userService.getPublicUserProfileById(req.params.id);

        return res.status(200).json(profile);
    } catch (error) {
        next(error);
    }
};

// Get public user events (GET /api/users/:id/events)
const getPublicUserEvents = async (req, res, next) => {
    try {
        const events = await userService.getPublicUserEventsById(req.params.id);

        return res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

module.exports = { getPublicUserProfile, getPublicUserEvents };
