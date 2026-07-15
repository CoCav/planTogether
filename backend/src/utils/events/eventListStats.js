const { countActiveParticipantsByEventIds } = require("../eventMemberships/eventParticipants");

const {
    countEventLikesByEventIds,
    findLikedEventIdsByUser
} = require("../eventLikes/eventLikes");

/* ==========================================================================
   Event List Stats

   Retrieves shared event list statistics.

   Responsibilities
   - Count active participants by event
   - Count likes by event
   - Find events liked by the current user
   - Run independent event stats queries in parallel

   Notes
   - Models and Sequelize are injected to keep the helper reusable.
   - Empty event lists are handled by the underlying domain helpers.
=========================================================================== */

const getEventListStats = async ({
    EventUserRole,
    EventLike,
    sequelize,
    eventIds,
    currentUserId
}) => {
    // Fetch independent statistics in parallel.
    const [
        participantCountByEventId,
        likesCountByEventId,
        likedEventIds
    ] = await Promise.all([
        countActiveParticipantsByEventIds(EventUserRole, sequelize, eventIds),
        countEventLikesByEventIds(EventLike, sequelize, eventIds),
        findLikedEventIdsByUser(EventLike, eventIds, currentUserId)
    ]);

    return {
        participantCountByEventId,
        likesCountByEventId,
        likedEventIds
    };
};

module.exports = {
    getEventListStats
};
