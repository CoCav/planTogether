const User = require("../models/userModel");

const { throwHttpError } = require("../utils/errors/httpError");
const { generateAuthToken } = require("../utils/auth/authToken");
const { normalizeEmail } = require("../utils/stringNormalizer");

const {
    hashPassword,
    comparePassword
} = require("../utils/auth/passwordHasher");

/* ==========================================================================
   Auth Service

   Handles authentication business logic.

   Responsibilities
   - Register users
   - Log users in
   - Hash passwords
   - Generate authentication tokens

   Notes
   - Passwords are hashed with bcrypt.
   - BCRYPT_SALT_ROUNDS can be configured in .env.
   - JWT payload generation is delegated to auth utilities.
   - User profile logic belongs to userService.
=========================================================================== */

const EMAIL_ALREADY_IN_USE_ERROR = "Email already in use";
const INVALID_CREDENTIALS_ERROR = "Invalid email or invalid password";
const ACCOUNT_DELETED_ERROR = "Account has been deleted";

/* Register / login */

const registerUser = async ({ name, email, password, avatar }) => {
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({
        where: { email: normalizedEmail }
    });

    if (existingUser) {
        throwHttpError(409, EMAIL_ALREADY_IN_USE_ERROR);
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        avatar: avatar || null
    });

    const token = generateAuthToken(user.id);

    return { user, token };
};

const loginUser = async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);

    const user = await User.scope("withPassword").findOne({
        where: { email: normalizedEmail }
    });

    if (!user) {
        throwHttpError(401, INVALID_CREDENTIALS_ERROR);
    }

    if (user.deletedAt) {
        throwHttpError(403, ACCOUNT_DELETED_ERROR);
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
        throwHttpError(401, INVALID_CREDENTIALS_ERROR);
    }

    const token = generateAuthToken(user.id);

    return { user, token };
};

module.exports = {
    registerUser,
    loginUser
};
