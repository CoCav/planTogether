const eventLikeService = require("../services/eventLikeService");

/* ==================================================
   EVENT LIKE CONTROLLER

   Handles:
   - liking events
   - unliking events
   - API response formatting

   Notes:
   - business logic is delegated to eventLikeService
   - current user routes use req.user.userId
   - like permissions are enforced through authentication and service checks
   - successful responses include current liked state and likes count
================================================== */

/* =============================
   LIKE EVENT
============================= */

// Like an event
const likeEvent = async (req, res, next) => {
    try {
        const result = await eventLikeService.likeEvent({
            eventId: req.params.eventId,
            userId: req.user.userId
        });

        return res.status(201).json({
            success: true,
            message: "Event liked successfully",
            ...result
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   UNLIKE EVENT
============================= */

// Unlike an event
const unlikeEvent = async (req, res, next) => {
    try {
        const result = await eventLikeService.unlikeEvent({
            eventId: req.params.eventId,
            userId: req.user.userId
        });

        return res.status(200).json({
            success: true,
            message: "Event unliked successfully",
            ...result
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    likeEvent,
    unlikeEvent
};
