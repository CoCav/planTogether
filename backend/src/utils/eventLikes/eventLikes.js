const { Op } = require("sequelize");

/* ==========================================================================
   Event Like Utilities

   Builds event like includes and like stats helpers.

   Responsibilities
   - Build event like includes
   - Build event like count attributes
   - Find one event like
   - Count likes for one event
   - Count likes for multiple events
   - Find events liked by the current user

   Notes
   - Like count attributes use COUNT DISTINCT to avoid duplicate counts.
   - Grouped like count queries avoid N+1 queries.
=========================================================================== */

/* =============================
   LIKE CONSTANTS
============================= */

const LIKES_COUNT_ALIAS = "likesCount";

/* =============================
   LIKE QUERY BUILDERS
============================= */

// Build a Sequelize include for event likes
const buildEventLikeInclude = (EventLike) => ({
    model: EventLike,
    as: "likes",
    attributes: [],
    required: false
});

// Build a distinct event like count attribute
const buildEventLikeCountAttribute = (sequelize, likeIdPath) => ([
    sequelize.fn(
        "COUNT",
        sequelize.fn("DISTINCT", sequelize.col(likeIdPath))
    ),
    LIKES_COUNT_ALIAS
]);

/* =============================
   SINGLE EVENT LIKES
============================= */

// Find a user's like for an event
const findEventLike = (EventLike, { eventId, userId, transaction } = {}) => {
    return EventLike.findOne({
        where: {
            eventId,
            userId
        },
        transaction
    });
};

// Count likes for one event
const getEventLikesCount = (EventLike, eventId, options = {}) => {
    return EventLike.count({
        where: {
            eventId
        },
        ...options
    });
};

/* =============================
   EVENT LIST LIKE STATS
============================= */

// Find event IDs liked by the current user
const findLikedEventIdsByUser = async (EventLike, eventIds, currentUserId) => {
    if (!currentUserId || !eventIds.length) {
        return new Set();
    }

    const likes = await EventLike.findAll({
        attributes: ["eventId"],
        where: {
            userId: currentUserId,
            eventId: {
                [Op.in]: eventIds
            }
        },
        raw: true
    });

    return new Set(
        likes.map((like) => Number(like.eventId))
    );
};

// Count likes grouped by event ID
const countEventLikesByEventIds = async (EventLike, sequelize, eventIds) => {
    if (!eventIds.length) {
        return {};
    }

    const likeCounts = await EventLike.findAll({
        attributes: [
            "eventId",
            [
                sequelize.fn("COUNT", sequelize.col("eventId")),
                LIKES_COUNT_ALIAS
            ]
        ],
        where: {
            eventId: {
                [Op.in]: eventIds
            }
        },
        group: ["eventId"],
        raw: true
    });

    return likeCounts.reduce((acc, item) => {
        acc[item.eventId] = Number(item[LIKES_COUNT_ALIAS]);
        return acc;
    }, {});
};

module.exports = {
    buildEventLikeInclude,
    buildEventLikeCountAttribute,
    findEventLike,
    getEventLikesCount,
    findLikedEventIdsByUser,
    countEventLikesByEventIds
};
