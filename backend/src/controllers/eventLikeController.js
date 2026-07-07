const eventLikeService = require("../services/eventLikeService");

/* ==========================================================================
   Event Like Controller

   Handles event like responses.

   Responsibilities
   - Like events
   - Unlike events
   - Return API responses

   Notes
   - Business logic is delegated to eventLikeService.
   - Authenticated user IDs are provided by authenticateToken.
=========================================================================== */

/* Like event */

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

/* Unlike event */

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
