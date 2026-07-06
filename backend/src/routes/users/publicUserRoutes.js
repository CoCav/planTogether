const express = require("express");
const router = express.Router();

const userController = require("../../controllers/userController");

const { resolveCurrentUser } = require("../../middlewares/auth/resolveCurrentUser");
const handleValidationErrors = require("../../middlewares/errors/handleValidationErrors");

const {
    userIdParamValidator,
    getPublicUserEventsValidator
} = require("../../validators/userValidator");

/* ==========================================================================
   Public User Routes

   Defines public user endpoints.

   Responsibilities
   - Retrieve public user profiles
   - Retrieve public user events

   Notes
   - Public profile responses hide sensitive user fields.
   - Public user events support optional current user context for like state.
=========================================================================== */

router.get(
    "/:id",
    userIdParamValidator,
    handleValidationErrors,
    userController.getPublicUserProfile
);

router.get(
    "/:id/events",
    resolveCurrentUser,
    userIdParamValidator,
    getPublicUserEventsValidator,
    handleValidationErrors,
    userController.getPublicUserEvents
);

module.exports = router;
