const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authenticateToken');
const validateRequest = require('../middlewares/validateRequest');
const { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator } = require('../validators/authValidator');

// ROUTE POST - Register user
router.post('/register', registerValidator, validateRequest, authController.register);

// ROUTE POST - Login user
router.post('/login', loginValidator, validateRequest, authController.login);

// ROUTE GET - Get current user profile
router.get('/profile', authenticateToken, authController.getUserByID);

// ROUTE PUT - Update current user profile
router.put('/profile', authenticateToken, updateProfileValidator, validateRequest, authController.updateUserByID);

// ROUTE PUT - Change current user's password
router.put('/password', authenticateToken, changePasswordValidator, validateRequest, authController.changePassword);

// ROUTE POST - Logout user (client should delete token)
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;