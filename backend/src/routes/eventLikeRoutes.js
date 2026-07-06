const express = require("express");
const router = express.Router();

const eventLikeController = require("../controllers/eventLikeController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

const { eventIdParamValidator } = require("../validators/eventLikeValidator");

/* ==========================================================================
   Event Like Routes

   Defines event like endpoints.

   Responsibilities
   - Like events
   - Unlike events

   Notes
   - Like and unlike actions require authentication.
   - Event ID params are validated before controller logic.
   - Event existence and duplicate likes are handled in eventLikeService.
=========================================================================== */

/* Event likes */

router.post(
    "/:eventId/likes",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventLikeController.likeEvent
);

router.delete(
    "/:eventId/likes",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventLikeController.unlikeEvent
);

module.exports = router;
