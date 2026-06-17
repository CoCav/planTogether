const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");
const EventReview = require("../models/relations/eventReviewModel");

const { throwHttpError } = require("../utils/errors/httpError");
const { isEventPast } = require("../utils/events/eventStatus");

/* ==================================================
   EVENT REVIEW SERVICE
   Handles event review business logic

   Handles:
   - review creation
   - rating and comment persistence
   - completed event review restrictions
   - participant-only review permissions
   - duplicate review prevention
   - event review retrieval
   - review deletion

   Notes:
   - users can only review completed events they joined
   - one user can only leave one review per event
   - deleted memberships cannot create reviews
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

// Ensures the event is completed before allowing reviews
const assertEventIsCompleted = (event) => {
    if (!isEventPast(event)) {
        throwHttpError(403, "Only completed events can be reviewed");
    }
};

// Ensures the user actively joined the event
const assertUserCanReviewEvent = async ({ eventId, userId, transaction }) => {
    const membership = await EventUserRole.findOne({
        where: {
            eventId,
            userId,
            deletedAt: null
        },
        transaction
    });

    if (!membership) {
        throwHttpError(403, "Only event participants can leave a review");
    }
};

// Ensures one review per user per event
const assertUserHasNotReviewedEvent = async ({ eventId, userId, transaction }) => {
    const existingReview = await EventReview.findOne({
        where: {
            eventId,
            userId
        },
        transaction
    });

    if (existingReview) {
        throwHttpError(409, "You have already reviewed this event");
    }
};

/* =============================
   CREATE REVIEW
============================= */

// Creates a review for a completed event
const createEventReview = async ({ eventId, userId, rating, comment }) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await findEventOrFail(eventId, { transaction });

        assertEventIsCompleted(event);

        await assertUserCanReviewEvent({
            eventId,
            userId,
            transaction
        });

        await assertUserHasNotReviewedEvent({
            eventId,
            userId,
            transaction
        });

        const review = await EventReview.create({
            eventId,
            userId,
            rating,
            comment: String(comment ?? "").trim()
        }, {
            transaction
        });

        await transaction.commit();

        return EventReview.findByPk(review.id, {
            include: [{
                model: User,
                as: "user",
                attributes: ["id", "name", "avatar"]
            }]
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/* =============================
   GET REVIEWS
============================= */

// Gets all reviews for one event
const getEventReviews = async (eventId) => {
    await findEventOrFail(eventId);

    return EventReview.findAll({
        where: {
            eventId
        },
        include: [{
            model: User,
            as: "user",
            attributes: ["id", "name", "avatar"]
        }],
        order: [["createdAt", "DESC"]]
    });
};

/* =============================
   DELETE REVIEW
============================= */

// Deletes a review owned by the current user
const deleteEventReview = async ({ reviewId, userId }) => {
    const review = await EventReview.findByPk(reviewId);

    if (!review) {
        throwHttpError(404, "Review not found");
    }

    if (review.userId !== userId) {
        throwHttpError(403, "You can only delete your own review");
    }

    await review.destroy();
};

module.exports = {
    createEventReview,
    getEventReviews,
    deleteEventReview
};
