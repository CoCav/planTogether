const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { authenticateToken } = require("../middlewares/authenticateToken");
const { uploadAvatar } = require("../middlewares/uploadFile");
const validateRequest = require("../middlewares/validateRequest");

const { updateCurrentUserProfileValidator, changeCurrentUserPasswordValidator, userIdParamValidator } = require("../validators/userValidator");

/* ==================================================
   USER ROUTES

   Handles:
   - authenticated user profile retrieval
   - authenticated profile update
   - authenticated password update
   - public user profile retrieval
   - public user events retrieval

   Notes:
   - /me routes use authenticated userId from JWT
   - /:id routes use public user id route param
   - public profile response hides sensitive user fields
================================================== */

/* =============================
   AUTHENTICATED USER
============================= */

// Get authenticated user profile
router.get("/me", authenticateToken, userController.getCurrentUserProfile);

// Update authenticated user profile
router.put("/me", uploadAvatar.single("avatar"), authenticateToken, updateCurrentUserProfileValidator, validateRequest, userController.updateCurrentUserProfile);

// Change authenticated user's password
router.put("/me/password", authenticateToken, changeCurrentUserPasswordValidator, validateRequest, userController.changeCurrentUserPassword);


/* =============================
   PUBLIC USER
============================= */

// Get public user profile
router.get("/:id", authenticateToken, userIdParamValidator, validateRequest, userController.getPublicUserProfile);

// Get public user events
router.get("/:id/events", authenticateToken, userIdParamValidator, validateRequest, userController.getPublicUserEvents);

module.exports = router;
