const { Op } = require("sequelize");

/* ==========================================================================
   Event Like Utilities

   Builds event like includes and like stats helpers.

   Responsibilities
   - Build event like includes
   - Build event like count attributes
   - Count likes for multiple events
   - Find events liked by the current user

   Notes
   - Like count attributes use COUNT DISTINCT to avoid duplicate counts.
   - Grouped like count queries avoid N+1 queries.
=========================================================================== */

const LIKES_COUNT_ALIAS = "likesCount";

const buildEventLikeInclude = (EventLike) => ({
    model: EventLike,
    as: "likes",
    attributes: [],
    required: false
});

const buildEventLikeCountAttribute = (sequelize, likeIdPath) => ([
    sequelize.fn(
        "COUNT",
        sequelize.fn(
            "DISTINCT",
            sequelize.col(likeIdPath)
        )
    ),
    LIKES_COUNT_ALIAS
]);

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
    findLikedEventIdsByUser,
    countEventLikesByEventIds
};
