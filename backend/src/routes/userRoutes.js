const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { authenticateToken } = require("../middlewares/authenticateToken");
const { uploadAvatar } = require("../middlewares/uploadFiles");

const { userIdParamValidator, getCurrentUserEventsValidator, updateCurrentUserProfileValidator, changeCurrentUserPasswordValidator } = require("../validators/userValidator");
const handleValidationErrors = require("../middlewares/handleValidationErrors");

/* ==================================================
   USER ROUTES

   Handles:
   - authenticated current user events retrieval
   - authenticated current user profile retrieval
   - authenticated current user profile update
   - authenticated current user password update
   - public user profile retrieval
   - public user events retrieval

   Notes:
   - /me routes use authenticated userId from JWT
   - /:id routes use public user ID route params
   - public profile responses hide sensitive user fields
================================================== */

/* =============================
   AUTHENTICATED USER
============================= */

// Get all paginated events of the current user
router.get("/me/events", authenticateToken, getCurrentUserEventsValidator, handleValidationErrors, userController.getCurrentUserEvents);

// Get current user profile
router.get("/me", authenticateToken, userController.getCurrentUserProfile);

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


/* =============================
   PUBLIC USER
============================= */

// Get public user profile
router.get("/:id", authenticateToken, userIdParamValidator, handleValidationErrors, userController.getPublicUserProfile);

// Get public user events
router.get("/:id/events", authenticateToken, userIdParamValidator, handleValidationErrors, userController.getPublicUserEvents);

module.exports = router;
