const express = require("express");
const router = express.Router();

const eventReviewController = require("../controllers/eventReviewController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

const {
    eventIdParamValidator,
    reviewIdParamValidator,
    getEventReviewsValidator,
    createReviewValidator,
    updateReviewValidator
} = require("../validators/eventReviewValidator");

/* ==========================================================================
   Event Review Routes

   Defines event review endpoints.

   Responsibilities
   - Retrieve event reviews
   - Create reviews
   - Update reviews
   - Delete reviews

   Notes
   - Review retrieval is public.
   - Creating, updating and deleting reviews require authentication.
   - Review permissions are enforced by the service layer.
=========================================================================== */

/* Event reviews */

router.get(
    "/:eventId/reviews",
    eventIdParamValidator,
    getEventReviewsValidator,
    handleValidationErrors,
    eventReviewController.getEventReviews
);

router.post(
    "/:eventId/reviews",
    authenticateToken,
    eventIdParamValidator,
    createReviewValidator,
    handleValidationErrors,
    eventReviewController.createEventReview
);

/* Review management */

router.put(
    "/reviews/:reviewId",
    authenticateToken,
    reviewIdParamValidator,
    updateReviewValidator,
    handleValidationErrors,
    eventReviewController.updateEventReview
);

router.delete(
    "/reviews/:reviewId",
    authenticateToken,
    reviewIdParamValidator,
    handleValidationErrors,
    eventReviewController.deleteEventReview
);

module.exports = router;
