const eventReviewService = require("../services/eventReviewService");

/* ==================================================
   EVENT REVIEW CONTROLLER

   Handles:
   - creating event reviews
   - retrieving event reviews
   - deleting authenticated user's own reviews
   - API response formatting

   Notes:
   - business logic is delegated to eventReviewService
   - current user routes use req.user.userId
   - review permissions are enforced in the service layer
   - successful responses include success, message and top-level payload fields when needed
================================================== */

/* =============================
   CREATE REVIEW
============================= */

// Create a review for an event
const createEventReview = async (req, res, next) => {
    try {
        const review = await eventReviewService.createEventReview({
            eventId: req.params.eventId,
            userId: req.user.userId,
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
   GET REVIEWS
============================= */

// Get all reviews for an event
const getEventReviews = async (req, res, next) => {
    try {
        const reviews = await eventReviewService.getEventReviews(
            req.params.eventId
        );

        return res.status(200).json({
            success: true,
            message: "Event reviews retrieved successfully",
            reviews
        });

    } catch (error) {
        return next(error);
    }
};

/* =============================
   DELETE REVIEW
============================= */

// Delete current user's review
const deleteEventReview = async (req, res, next) => {
    try {
        await eventReviewService.deleteEventReview({
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
    deleteEventReview
};
