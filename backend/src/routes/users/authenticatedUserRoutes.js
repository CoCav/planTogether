const express = require("express");
const router = express.Router();

const userController = require("../../controllers/userController");

const { authenticateToken } = require("../../middlewares/auth/authenticateToken");
const { uploadAvatar } = require("../../middlewares/files/uploadFiles");
const handleValidationErrors = require("../../middlewares/errors/handleValidationErrors");

const {
    getCurrentUserEventsValidator,
    updateCurrentUserProfileValidator,
    changeCurrentUserPasswordValidator
} = require("../../validators/userValidator");

/* ==========================================================================
   Authenticated User Routes

   Defines current user endpoints.

   Responsibilities
   - Retrieve current user events
   - Retrieve current user profile
   - Update current user profile
   - Change current user password
   - Delete current user account

   Notes
   - All /me routes require authentication.
   - Current user identity comes from the JWT.
=========================================================================== */

router.get(
    "/me/events",
    authenticateToken,
    getCurrentUserEventsValidator,
    handleValidationErrors,
    userController.getCurrentUserEvents
);

router.get(
    "/me",
    authenticateToken,
    userController.getCurrentUserProfile
);

router.put(
    "/me",
    authenticateToken,
    uploadAvatar.single("avatar"),
    updateCurrentUserProfileValidator,
    handleValidationErrors,
    userController.updateCurrentUserProfile
);

router.put(
    "/me/password",
    authenticateToken,
    changeCurrentUserPasswordValidator,
    handleValidationErrors,
    userController.changeCurrentUserPassword
);

router.delete(
    "/me",
    authenticateToken,
    userController.deleteCurrentUser
);

module.exports = router;
