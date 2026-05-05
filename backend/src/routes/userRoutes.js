const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { authenticateToken } = require("../middlewares/authenticateToken");
const validateRequest = require("../middlewares/validateRequest");

const { userIdParamValidator } = require("../validators/userValidator");

/* ==================================================
   USER ROUTES

   Handles:
   - public user profile retrieval
   - public user events retrieval
   - authentication protection

   Notes:
   - user id is used as route param only
   - response hides sensitive public user fields
================================================== */

// Get public user profile
router.get("/:id", authenticateToken, userIdParamValidator, validateRequest, userController.getPublicUserProfile);

// Get public user events
router.get("/:id/events", authenticateToken, userIdParamValidator, validateRequest, userController.getPublicUserEvents);

module.exports = router;
