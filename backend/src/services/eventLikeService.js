const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const EventLike = require("../models/relations/eventLikeModel");

const { throwHttpError } = require("../utils/errors/httpError");
const { findEventByIdOrFail } = require("../utils/events/eventQueries");

const {
    findEventLike,
    getEventLikesCount
} = require("../utils/eventLikes/eventLikes");

/* ==========================================================================
   Event Like Service

   Handles event like business logic.

   Responsibilities
   - Check event existence
   - Create event likes
   - Prevent duplicate likes
   - Delete event likes
   - Count event likes
   - Check current user like state

   Notes
   - Users can like an event once.
   - Users can unlike their own like.
   - Unlike is idempotent.
=========================================================================== */

const EVENT_ALREADY_LIKED_ERROR = "You have already liked this event";

/* Helpers */

const countEventLikes = (eventId, options = {}) => {
    return getEventLikesCount(EventLike, eventId, options);
};

const getIsEventLikedByUser = async ({ eventId, userId }) => {
    if (!userId) {
        return false;
    }

    const like = await findEventLike(EventLike, {
        eventId,
        userId
    });

    return Boolean(like);
};

/* Like event */

const likeEvent = async ({ eventId, userId }) => {
    const transaction = await sequelize.transaction();

    try {
        await findEventByIdOrFail(Event, eventId, {
            transaction
        });

        const existingLike = await findEventLike(EventLike, {
            eventId,
            userId,
            transaction
        });

        if (existingLike) {
            throwHttpError(409, EVENT_ALREADY_LIKED_ERROR);
        }

        await EventLike.create(
            {
                eventId,
                userId
            },
            {
                transaction
            }
        );

        const likesCount = await countEventLikes(eventId, {
            transaction
        });

        await transaction.commit();

        return {
            eventId,
            userId,
            liked: true,
            likesCount
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/* Unlike event */

const unlikeEvent = async ({ eventId, userId }) => {
    const transaction = await sequelize.transaction();

    try {
        await findEventByIdOrFail(Event, eventId, {
            transaction
        });

        const existingLike = await findEventLike(EventLike, {
            eventId,
            userId,
            transaction
        });

        if (existingLike) {
            await existingLike.destroy({
                transaction
            });
        }

        const likesCount = await countEventLikes(eventId, {
            transaction
        });

        await transaction.commit();

        return {
            eventId,
            userId,
            liked: false,
            likesCount
        };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    likeEvent,
    unlikeEvent,
    getEventLikesCount: countEventLikes,
    getIsEventLikedByUser
};
