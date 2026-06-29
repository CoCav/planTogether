const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const EventLike = require("../models/relations/eventLikeModel");

const { throwHttpError } = require("../utils/errors/httpError");

/* ==================================================
   EVENT LIKE SERVICE
   Handles event like business logic

   Handles:
   - event existence checks
   - like creation
   - duplicate like prevention
   - like deletion
   - event like count
   - current user like lookup

   Notes:
   - users can like an event once
   - users can unlike their own like
   - likes are created by authenticated users
   - unlike is idempotent
   - event access remains handled by routes/controllers
================================================== */

/* =============================
   HELPERS
============================= */

// Finds an event or throws a 404 error
const findEventOrFail = async (eventId, options = {}) => {
    const event = await Event.findByPk(eventId, options);

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    return event;
};

// Finds whether a user already liked an event
const findEventLike = async ({ eventId, userId, transaction } = {}) => {
    return EventLike.findOne({
        where: {
            eventId,
            userId
        },
        transaction
    });
};

// Counts likes for one event
const getEventLikesCount = async (eventId, options = {}) => {
    return EventLike.count({
        where: {
            eventId
        },
        ...options
    });
};

// Checks if the current user liked one event
const getIsEventLikedByUser = async ({ eventId, userId }) => {
    if (!userId) {
        return false;
    }

    const like = await findEventLike({ eventId, userId });

    return Boolean(like);
};

/* =============================
   LIKE EVENT
============================= */

// Likes an event for the current user
const likeEvent = async ({ eventId, userId }) => {
    const transaction = await sequelize.transaction();

    try {
        await findEventOrFail(eventId, { transaction });

        const existingLike = await findEventLike({
            eventId,
            userId,
            transaction
        });

        // Prevent duplicate likes
        if (existingLike) {
            throwHttpError(409, "You have already liked this event");
        }

        // Create the user's like
        await EventLike.create({
            eventId,
            userId
        }, {
            transaction
        });

        // Return the updated likes count
        const likesCount = await getEventLikesCount(eventId, { transaction });

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

/* =============================
   UNLIKE EVENT
============================= */

// Removes the current user's like from an event
const unlikeEvent = async ({ eventId, userId }) => {
    const transaction = await sequelize.transaction();

    try {
        await findEventOrFail(eventId, { transaction });

        const existingLike = await findEventLike({
            eventId,
            userId,
            transaction
        });

        // Remove the user's existing like
        if (existingLike) {
            await existingLike.destroy({ transaction });
        }

        // Return the updated likes count
        const likesCount = await getEventLikesCount(eventId, { transaction });

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
    getEventLikesCount,
    getIsEventLikedByUser
};
