const eventReviewService = require("../services/eventReviewService");

/* ==========================================================================
   Event Review Controller

   Handles event review responses.

   Responsibilities
   - Create event reviews
   - Retrieve paginated event reviews
   - Update authenticated user's own reviews
   - Delete authenticated user's own reviews
   - Return API responses

   Notes
   - Business logic is delegated to eventReviewService.
   - Authenticated user IDs are provided by authenticateToken.
   - Review permissions are enforced in the service layer.
=========================================================================== */

/* =============================
   REVIEW CREATION
============================= */

// Create a review for an event
const createEventReview = async (req, res, next) => {
    try {
        const review = await eventReviewService.createEventReview({
            eventId: req.params.eventId,
            userId: req.user.userId,
            rating: req.body.rating,
            comment: req.body.comment
        });

        return res.status(201).json({
            success: true,
            message: "Event review created successfully",
            review
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   REVIEW RETRIEVAL
============================= */

// Retrieve paginated reviews for an event
const getEventReviews = async (req, res, next) => {
    try {
        const reviews = await eventReviewService.getEventReviews(
            req.params.eventId,
            req.query
        );

        return res.status(200).json({
            success: true,
            message: "Event reviews retrieved successfully",
            ...reviews
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   REVIEW UPDATE
============================= */

// Update the authenticated user's review
const updateEventReview = async (req, res, next) => {
    try {
        const review = await eventReviewService.updateEventReviewById({
            reviewId: req.params.reviewId,
            userId: req.user.userId,
            rating: req.body.rating,
            comment: req.body.comment
        });

        return res.status(200).json({
            success: true,
            message: "Event review updated successfully",
            review
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   REVIEW DELETION
============================= */

// Delete the authenticated user's review
const deleteEventReview = async (req, res, next) => {
    try {
        await eventReviewService.deleteEventReviewById({
            reviewId: req.params.reviewId,
            userId: req.user.userId
        });

        return res.status(200).json({
            success: true,
            message: "Event review deleted successfully"
        });

    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createEventReview,
    getEventReviews,
    updateEventReview,
    deleteEventReview
};
