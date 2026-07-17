const sequelize = require("../config/database");
const { fn, col } = require("sequelize");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/associations/eventUserRoleModel");
const EventReview = require("../models/associations/eventReviewModel");

const { throwHttpError } = require("../utils/errors/httpError");
const { normalizeString } = require("../utils/stringNormalizer");

const { isEventPast } = require("../utils/events/eventStatus");
const { findEventByIdOrFail } = require("../utils/events/eventQueries");

const { findActiveMembership } = require("../utils/eventMemberships/eventMembershipQueries");

const { findReviewByIdOrFail } = require("../utils/eventReviews/eventReviewsQueries");

const { buildPublicUserInclude } = require("../utils/users/userInclude");

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

/* =============================
   REVIEW ERRORS
============================= */

const EVENT_NOT_COMPLETED_ERROR = "Only completed events can be reviewed";

const USER_CANNOT_REVIEW_ERROR = "Only event participants can leave a review";
const REVIEW_ALREADY_EXISTS_ERROR = "You have already reviewed this event";
const REVIEW_OWNER_ERROR = "You can only manage your own review";

/* =============================
   REVIEW SORT CONFIGURATION
============================= */

const REVIEW_SORT_FIELDS = [
    "createdAt",
    "rating"
];

const DEFAULT_REVIEW_SORT_FIELD = "createdAt";
const DEFAULT_REVIEW_SORT_ORDER = "DESC";

/* =============================
   REVIEW HELPERS
============================= */

// Ensure the event has been completed
const assertEventIsCompleted = (event) => {
    if (!isEventPast(event)) {
        throwHttpError(403, EVENT_NOT_COMPLETED_ERROR);
    }
};

// Ensure the user actively participated in the event
const assertUserCanReviewEvent = async ({ eventId, userId, transaction }) => {
    const membership = await findActiveMembership(EventUserRole, {
        eventId,
        userId,
        transaction
    });

    if (!membership) {
        throwHttpError(403, USER_CANNOT_REVIEW_ERROR);
    }
};

// Ensure the user has not already reviewed the event
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

// Ensure the authenticated user owns the review
const assertReviewOwner = (review, userId) => {
    if (review.userId !== userId) {
        throwHttpError(403, REVIEW_OWNER_ERROR);
    }
};

// Reload a review with its public author data
const findReviewWithUserById = (reviewId, options = {}) => {
    return EventReview.findByPk(reviewId, {
        ...options,
        include: [
            buildPublicUserInclude(User)
        ]
    });
};

// Calculate the average event rating to one decimal place
const getEventAverageRating = async (eventId) => {
    const result = await EventReview.findOne({
        where: {
            eventId
        },
        attributes: [
            [
                fn("AVG", col("rating")),
                "averageRating"
            ]
        ],
        raw: true
    });

    const averageRating = result?.averageRating;

    if (averageRating === null || averageRating === undefined) {
        return null;
    }

    // Keep API ratings consistent to one decimal
    return Number(
        Number(averageRating).toFixed(1)
    );
};

/* =============================
   REVIEW CREATION
============================= */

// Create a review for a completed event
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
            comment: normalizeString(comment)
        }, {
            transaction
        });

        // Reload inside the same transaction before committing
        const reviewWithUser = await findReviewWithUserById(review.id, {
            transaction
        });

        await transaction.commit();

        return reviewWithUser;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/* =============================
   REVIEW RETRIEVAL
============================= */

// Retrieve paginated reviews and average rating for an event
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
        include: [
            buildPublicUserInclude(User)
        ],
        order: [
            [orderField, orderDirection]
        ],
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

/* =============================
   REVIEW UPDATE
============================= */

// Update a review owned by the authenticated user
const updateEventReviewById = async ({ reviewId, userId, rating, comment }) => {
    const review = await findReviewByIdOrFail(EventReview, reviewId);

    assertReviewOwner(review, userId);

    await review.update({
        rating,
        comment: normalizeString(comment)
    });

    return findReviewWithUserById(review.id);
};

/* =============================
   REVIEW DELETION
============================= */

// Delete a review owned by the authenticated user
const deleteEventReviewById = async ({ reviewId, userId }) => {
    const review = await findReviewByIdOrFail(EventReview, reviewId);

    assertReviewOwner(review, userId);

    await review.destroy();
};

module.exports = {
    createEventReview,
    getEventReviews,
    updateEventReviewById,
    deleteEventReviewById
};
