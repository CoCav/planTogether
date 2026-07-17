const express = require("express");
const router = express.Router();

const userController = require("../../controllers/userController");

const { resolveCurrentUser } = require("../../middlewares/auth/resolveCurrentUser");
const handleValidationErrors = require("../../middlewares/errors/handleValidationErrors");

const {
    publicUserIdParamValidator,
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

/* =============================
   PUBLIC USER PROFILE
============================= */

router.get(
    "/:id",
    publicUserIdParamValidator,
    handleValidationErrors,
    userController.getPublicUserProfile
);

/* =============================
   PUBLIC USER EVENTS
============================= */

router.get(
    "/:id/events",
    resolveCurrentUser,
    publicUserIdParamValidator,
    getPublicUserEventsValidator,
    handleValidationErrors,
    userController.getPublicUserEvents
);

module.exports = router;
