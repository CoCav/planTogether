const express = require("express");
const router = express.Router();

const eventReviewController = require("../controllers/eventReviewController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");

const {
    eventIdParamValidator,
    reviewIdParamValidator,
    getEventReviewsValidator,
    createReviewValidator,
    updateReviewValidator
} = require("../validators/eventReviewValidator");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   EVENT REVIEW ROUTES

   Handles:
   - creating reviews for completed events
   - retrieving paginated event reviews
   - updating current user's own reviews
   - deleting current user's own reviews

   Notes:
   - review creation, update and deletion require authentication
   - review retrieval is public and supports pagination query params
   - review permissions are enforced in eventReviewService
   - validators run before controller logic
================================================== */

/* =============================
   EVENT REVIEWS
============================= */

// Get paginated reviews for an event
router.get("/:eventId/reviews",
    eventIdParamValidator,
    getEventReviewsValidator,
    handleValidationErrors,
    eventReviewController.getEventReviews
);

// Create a review for an event
router.post("/:eventId/reviews",
    authenticateToken,
    eventIdParamValidator,
    createReviewValidator,
    handleValidationErrors,
    eventReviewController.createEventReview
);

/* =============================
   REVIEW MANAGEMENT
============================= */

// Update current user's review
router.put("/reviews/:reviewId",
    authenticateToken,
    reviewIdParamValidator,
    updateReviewValidator,
    handleValidationErrors,
    eventReviewController.updateEventReview
);

// Delete current user's review
router.delete("/reviews/:reviewId",
    authenticateToken,
    reviewIdParamValidator,
    handleValidationErrors,
    eventReviewController.deleteEventReview
);

module.exports = router;
