const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const { resolveCurrentUser } = require("../middlewares/auth/resolveCurrentUser");
const { uploadAvatar } = require("../middlewares/files/uploadFiles");

const {
    userIdParamValidator,
    getCurrentUserEventsValidator,
    getPublicUserEventsValidator,
    updateCurrentUserProfileValidator,
    changeCurrentUserPasswordValidator
} = require("../validators/userValidator");

const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

/* ==================================================
   USER ROUTES

   Handles:
   - authenticated current user events retrieval
   - authenticated current user profile retrieval
   - authenticated current user profile update
   - authenticated current user password update
   - authenticated current user account deletion
   - public user profile retrieval
   - public user events retrieval with filters and pagination

   Notes:
   - /me routes use authenticated userId from JWT
   - /:id routes are public and use user ID route params
   - /:id/events validates public listing filters and pagination
   - /:id/events supports optional current user context for like state
   - public profile responses hide sensitive user fields
================================================== */

/* =============================
   AUTHENTICATED USER
============================= */

// Get all paginated events of the current user
router.get("/me/events",
    authenticateToken,
    getCurrentUserEventsValidator,
    handleValidationErrors,
    userController.getCurrentUserEvents
);

// Get current user profile
router.get("/me",
    authenticateToken,
    userController.getCurrentUserProfile
);

// Update current user profile
router.put("/me",
    uploadAvatar.single("avatar"),
    authenticateToken,
    updateCurrentUserProfileValidator,
    handleValidationErrors,
    userController.updateCurrentUserProfile
);

// Change current user's password
router.put("/me/password",
    authenticateToken,
    changeCurrentUserPasswordValidator,
    handleValidationErrors,
    userController.changeCurrentUserPassword
);

// Delete current user account
router.delete("/me",
    authenticateToken,
    userController.deleteCurrentUser
);

/* =============================
   PUBLIC USER
============================= */

// Get public user profile
router.get("/:id",
    userIdParamValidator,
    handleValidationErrors,
    userController.getPublicUserProfile
);

// Get paginated public events of a user
router.get("/:id/events",
    resolveCurrentUser,
    userIdParamValidator,
    getPublicUserEventsValidator,
    handleValidationErrors,
    userController.getPublicUserEvents
);

module.exports = router;
