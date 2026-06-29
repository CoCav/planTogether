const express = require("express");
const router = express.Router();

const eventLikeController = require("../controllers/eventLikeController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");

const { eventIdParamValidator } = require("../validators/eventLikeValidator");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   EVENT LIKE ROUTES

   Handles:
   - liking events
   - unliking events

   Notes:
   - like and unlike actions require authentication
   - one user can like one event once
   - event existence and duplicate likes are handled in eventLikeService
   - validators run before controller logic
================================================== */

/* =============================
   EVENT LIKES
============================= */

// Like an event
router.post("/:eventId/likes",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventLikeController.likeEvent
);

// Unlike an event
router.delete("/:eventId/likes",
    authenticateToken,
    eventIdParamValidator,
    handleValidationErrors,
    eventLikeController.unlikeEvent
);

module.exports = router;
