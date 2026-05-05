const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

const { authenticateToken } = require('../middlewares/authenticateToken');
const { uploadAvatar } = require("../middlewares/uploadFile");
const validateRequest = require('../middlewares/validateRequest');

const { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator } = require('../validators/authValidator');

/* ==================================================
   AUTH ROUTES

   Handles:
   - user registration
   - user login
   - authenticated profile retrieval
   - authenticated profile update
   - password update
   - logout endpoint

   Notes:
   - avatar upload is handled before validation
   - protected routes require authenticateToken
================================================== */

// Register user
router.post('/register', uploadAvatar.single("avatar"), registerValidator, validateRequest, authController.register);

// Login user
router.post('/login', loginValidator, validateRequest, authController.login);

// Get authenticated user profile
router.get('/profile', authenticateToken, authController.getUserByID);

// Update authenticated user profile
router.put('/profile', uploadAvatar.single("avatar"), authenticateToken, updateProfileValidator, validateRequest, authController.updateUserByID);

// Change authenticated user's password
router.put('/password', authenticateToken, changePasswordValidator, validateRequest, authController.changePassword);

// Logout user
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
