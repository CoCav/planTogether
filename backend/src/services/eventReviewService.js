const sequelize = require("../config/database");
const { fn, col } = require("sequelize");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/associations/eventUserRoleModel");
const EventReview = require("../models/associations/eventReviewModel");

const { PUBLIC_USER_ATTRIBUTES } = require("../constants/userAttributes");

const { throwHttpError } = require("../utils/errors/httpError");
const { isEventPast } = require("../utils/events/eventStatus");
const { findEventByIdOrFail } = require("../utils/events/eventQueries");

const { findReviewByIdOrFail } = require("../utils/eventReviews/eventReviewsQueries");

const {
    getPaginationOptions,
    getTotalCount,
    getTotalPages
} = require("../utils/pagination");

/* ==========================================================================
   Event Review Service

   Handles event review business logic.

   Responsibilities
   - Create event reviews
   - Restrict reviews to completed events
   - Restrict reviews to event participants
   - Prevent duplicate reviews
   - Retrieve paginated event reviews
   - Calculate average ratings
   - Update and delete owned reviews

   Notes
   - Users can only review completed events they joined.
   - One user can only leave one review per event.
   - Users can only update or delete their own reviews.
=========================================================================== */

const EVENT_NOT_COMPLETED_ERROR = "Only completed events can be reviewed";
const USER_CANNOT_REVIEW_ERROR = "Only event participants can leave a review";
const REVIEW_ALREADY_EXISTS_ERROR = "You have already reviewed this event";
const REVIEW_OWNER_ERROR = "You can only manage your own review";

const REVIEW_SORT_FIELDS = ["createdAt", "rating"];
const DEFAULT_REVIEW_SORT_FIELD = "createdAt";
const DEFAULT_REVIEW_SORT_ORDER = "DESC";

/* Helpers */

const normalizeReviewComment = (comment) => {
    return String(comment ?? "").trim();
};

const assertEventIsCompleted = (event) => {
    if (!isEventPast(event)) {
        throwHttpError(403, EVENT_NOT_COMPLETED_ERROR);
    }
};

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
        throwHttpError(403, USER_CANNOT_REVIEW_ERROR);
    }
};

const assertUserHasNotReviewedEvent = async ({ eventId, userId, transaction }) => {
    const existingReview = await EventReview.findOne({
        where: {
            eventId,
            userId
        },
        transaction
    });

    if (existingReview) {
        throwHttpError(409, REVIEW_ALREADY_EXISTS_ERROR);
    }
};

const assertReviewOwner = (review, userId) => {
    if (review.userId !== userId) {
        throwHttpError(403, REVIEW_OWNER_ERROR);
    }
};

const buildReviewUserInclude = () => ({
    model: User,
    as: "user",
    attributes: PUBLIC_USER_ATTRIBUTES
});

const findReviewWithUserById = (reviewId) => {
    return EventReview.findByPk(reviewId, {
        include: [buildReviewUserInclude()]
    });
};

const getEventAverageRating = async (eventId) => {
    const result = await EventReview.findOne({
        where: {
            eventId
        },
        attributes: [
            [fn("AVG", col("rating")), "averageRating"]
        ],
        raw: true
    });

    const averageRating = result?.averageRating;

    return averageRating === null || averageRating === undefined
        ? null
        : Number(Number(averageRating).toFixed(1));
};

/* Create review */

const createEventReview = async ({ eventId, userId, rating, comment }) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await findEventByIdOrFail(Event, eventId, {
            transaction
        });

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
            comment: normalizeReviewComment(comment)
        }, {
            transaction
        });

        await transaction.commit();

        return findReviewWithUserById(review.id);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/* Get reviews */

const getEventReviews = async (eventId, query = {}) => {
    await findEventByIdOrFail(Event, eventId);

    const {
        page,
        pageSize,
        limit,
        offset,
        orderField,
        orderDirection
    } = getPaginationOptions(
        query,
        REVIEW_SORT_FIELDS,
        DEFAULT_REVIEW_SORT_FIELD,
        DEFAULT_REVIEW_SORT_ORDER
    );

    const { count, rows } = await EventReview.findAndCountAll({
        where: {
            eventId
        },
        include: [buildReviewUserInclude()],
        order: [[orderField, orderDirection]],
        limit,
        offset
    });

    const totalReviews = getTotalCount(count);
    const averageRating = await getEventAverageRating(eventId);

    return {
        page,
        pageSize,
        totalReviews,
        totalPages: getTotalPages(totalReviews, pageSize),
        averageRating,
        reviews: rows
    };
};

/* Update review */

const updateEventReviewById = async ({ reviewId, userId, rating, comment }) => {
    const review = await findReviewByIdOrFail(
        EventReview,
        reviewId
    );

    assertReviewOwner(review, userId);

    await review.update({
        rating,
        comment: normalizeReviewComment(comment)
    });

    return findReviewWithUserById(review.id);
};

/* Delete review */

const deleteEventReviewById = async ({ reviewId, userId }) => {
    const review = await findReviewByIdOrFail(
        EventReview,
        reviewId
    );

    assertReviewOwner(review, userId);

    await review.destroy();
};

module.exports = {
    createEventReview,
    getEventReviews,
    updateEventReviewById,
    deleteEventReviewById
};
