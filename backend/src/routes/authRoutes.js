const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const { authenticateToken } = require("../middlewares/auth/authenticateToken");
const { uploadAvatar } = require("../middlewares/files/uploadFiles");
const authRateLimiter = require("../middlewares/rateLimiters/authRateLimiter");
const handleValidationErrors = require("../middlewares/errors/handleValidationErrors");

const { registerValidator, loginValidator } = require("../validators/authValidator");

/* ==========================================================================
   Auth Routes

   Defines authentication endpoints.

   Responsibilities
   - Register users
   - Log users in
   - Log users out

   Notes
   - Avatar upload runs before registration validation.
   - Auth rate limiting protects register and login endpoints.
   - Logout is protected because it requires a valid token.
   - Profile and password routes belong to userRoutes.
=========================================================================== */

/* =============================
   USER REGISTRATION
============================= */

router.post(
    "/register",
    authRateLimiter,
    uploadAvatar.single("avatar"),
    registerValidator,
    handleValidationErrors,
    authController.register
);

/* =============================
   USER LOGIN
============================= */

router.post(
    "/login",
    authRateLimiter,
    loginValidator,
    handleValidationErrors,
    authController.login
);

/* =============================
   USER LOGOUT
============================= */

router.post(
    "/logout",
    authenticateToken,
    authController.logout
);

module.exports = router;
