const bcrypt = require("bcrypt");

const User = require("../models/userModel");

const { throwHttpError } = require("../utils/errors/httpError");

const { generateAuthToken } = require("../utils/auth/authToken");
const { normalizeEmail } = require("../utils/stringNormalizer");

/* ==================================================
   AUTH SERVICE

   Handles:
   - user registration
   - user login
   - JWT token generation

   Notes:
   - passwords are hashed with bcrypt
   - JWT payload stores userId only
   - user profile logic belongs to userService
   - authentication tokens are generated through shared auth utilities
   - uses shared HTTP error and normalization utilities
================================================== */

/* =============================
   REGISTER / LOGIN
============================= */

// Register a new user
const registerUser = async ({ name, email, password, avatar }) => {
    const normalizedEmail = normalizeEmail(email);

    // Prevent duplicate email registration
    const existingUser = await User.findOne({
        where: { email: normalizedEmail }
    });

    if (existingUser) {
        throwHttpError(409, "Email already in use");
    }

    // Hash password before saving user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        avatar: avatar || null
    });

    // Generate authentication token
    const token = generateAuthToken(user.id);

    return { user, token };
};

// Login an existing user
const loginUser = async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);

    // Password is included only for login verification
    const user = await User.scope("withPassword").findOne({
        where: { email: normalizedEmail }
    });

    if (!user) {
        throwHttpError(401, "Invalid email or invalid password");
    }

    // Prevent login for deleted accounts
    if (user.deletedAt) {
        throwHttpError(403, "Account has been deleted");
    }

    // Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throwHttpError(401, "Invalid email or invalid password");
    }

    const token = generateAuthToken(user.id);

    return { user, token };
};

module.exports = { registerUser, loginUser };
