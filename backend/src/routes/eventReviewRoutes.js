const express = require("express");
const router = express.Router();

const eventReviewController = require("../controllers/eventReviewController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");

const {
    eventIdParamValidator,
    reviewIdParamValidator,
    createReviewValidator
} = require("../validators/eventReviewValidator");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   EVENT REVIEW ROUTES

   Handles:
   - creating reviews for completed events
   - retrieving event reviews
   - deleting current user's own reviews

   Notes:
   - review creation and deletion require authentication
   - review retrieval is public
   - review permissions are enforced in eventReviewService
   - validators run before controller logic
================================================== */

/* =============================
   EVENT REVIEWS
============================= */

// Get all reviews for an event
router.get("/:eventId/reviews",
    eventIdParamValidator,
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

// Delete current user's review
router.delete("/reviews/:reviewId",
    authenticateToken,
    reviewIdParamValidator,
    handleValidationErrors,
    eventReviewController.deleteEventReview
);

module.exports = router;
