const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const { authenticateToken } = require("../middlewares/authenticateToken");
const { uploadAvatar } = require("../middlewares/uploadFiles");
const handleValidationErrors = require("../middlewares/handleValidationErrors");

const { registerValidator, loginValidator } = require("../validators/authValidator");

/* ==================================================
   AUTH ROUTES

   Handles:
   - user registration
   - user login
   - logout endpoint

   Notes:
   - avatar upload is handled before registration validation
   - logout is protected because it requires a valid token
   - profile and password routes belong to userRoutes
================================================== */

// Register user
router.post('/register', uploadAvatar.single("avatar"), registerValidator, handleValidationErrors, authController.register);

// Login user
router.post('/login', loginValidator, handleValidationErrors, authController.login);

// Logout user
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
