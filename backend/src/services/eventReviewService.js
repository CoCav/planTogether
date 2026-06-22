const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");
const EventReview = require("../models/relations/eventReviewModel");

const { throwHttpError } = require("../utils/errors/httpError");
const { isEventPast } = require("../utils/events/eventStatus");

const { getPaginationOptions, getTotalCount, getTotalPages } = require("../utils/pagination");

/* ==================================================
   EVENT REVIEW SERVICE
   Handles event review business logic

   Handles:
   - review creation
   - rating and comment persistence
   - completed event review restrictions
   - participant-only review permissions
   - duplicate review prevention
   - paginated event review retrieval
   - review update
   - review deletion

   Notes:
   - users can only review completed events they joined
   - one user can only leave one review per event
   - users can only update or delete their own reviews
   - deleted memberships cannot create reviews
   - review retrieval supports pagination through query params
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

// Finds a review or throws a 404 error
const findReviewOrFail = async (reviewId, options = {}) => {
    const review = await EventReview.findByPk(reviewId, options);

    if (!review) {
        throwHttpError(404, "Review not found");
    }

    return review;
};

// Ensures the review belongs to the current user
const assertReviewOwner = (review, userId) => {
    if (review.userId !== userId) {
        throwHttpError(403, "You can only manage your own review");
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

// Gets paginated reviews for one event
const getEventReviews = async (eventId, query = {}) => {
    await findEventOrFail(eventId);

    const {
        page,
        pageSize,
        limit,
        offset,
        orderField,
        orderDirection
    } = getPaginationOptions(
        query,
        ["createdAt", "rating"],
        "createdAt",
        "DESC"
    );

    const { count, rows } = await EventReview.findAndCountAll({
        where: {
            eventId
        },
        include: [{
            model: User,
            as: "user",
            attributes: ["id", "name", "avatar"]
        }],
        order: [[orderField, orderDirection]],
        limit,
        offset
    });

    const totalReviews = getTotalCount(count);

    return {
        page,
        pageSize,
        totalReviews,
        totalPages: getTotalPages(totalReviews, pageSize),
        reviews: rows
    };
};

/* =============================
   UPDATE REVIEW
============================= */

// Updates a review owned by the current user
const updateEventReviewByID = async ({ reviewId, userId, rating, comment }) => {
    const review = await findReviewOrFail(reviewId);

    assertReviewOwner(review, userId);

    await review.update({
        rating,
        comment: String(comment ?? "").trim()
    });

    return EventReview.findByPk(review.id, {
        include: [{
            model: User,
            as: "user",
            attributes: ["id", "name", "avatar"]
        }]
    });
};

/* =============================
   DELETE REVIEW
============================= */

// Deletes a review owned by the current user
const deleteEventReviewByID = async ({ reviewId, userId }) => {
    const review = await findReviewOrFail(reviewId);

    assertReviewOwner(review, userId);

    await review.destroy();
};

module.exports = {
    createEventReview,
    getEventReviews,
    updateEventReviewByID,
    deleteEventReviewByID
};
