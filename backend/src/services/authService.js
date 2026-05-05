const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const deleteUploadedFile = require("../utils/deleteUploadedFile");

/* ==================================================
   AUTH SERVICE

   Handles:
   - user registration
   - user login
   - authenticated profile retrieval
   - profile update
   - password update

   Notes:
   - passwords are hashed with bcrypt
   - JWT payload stores userId only
   - avatar file cleanup is handled after profile update
================================================== */

/* =============================
   REGISTER / LOGIN
============================= */

// Register a new user
const registerUser = async ({ name, email, password, avatar }) => {
    try {
        const normalizedEmail = String(email).toLowerCase().trim();

        // Prevent duplicate email registration
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });

        if (existingUser) {
            const error = new Error('Email already in use');
            error.statusCode = 409;
            throw error;
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
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { user, token };

    } catch (error) {
        console.error(`Error during registration: ${error.message}`);
        throw error;
    }
};


// Login an existing user
const loginUser = async ({ email, password }) => {
    try {
        const normalizedEmail = String(email).toLowerCase().trim();

        // Password is included only for login verification
        const user = await User.scope('withPassword').findOne({
            where: { email: normalizedEmail }
        });

        if (!user) {
            const error = new Error('Invalid email or invalid password');
            error.statusCode = 401;
            throw error;
        }

        // Compare provided password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const error = new Error('Invalid email or invalid password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { user, token };

    } catch (error) {
        console.error(`Error during login: ${error.message}`);
        throw error;
    }
};


/* =============================
   PROFILE
============================= */

// Get authenticated user profile
const getUserProfileByID = async (userId) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        return user;

    } catch (error) {
        console.error(`Error fetching user profile: ${error.message}`);
        throw error;
    }
};


// Update authenticated user profile
const updateUserProfileByID = async (userId, updatedData) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const oldAvatar = user.avatar;
        const { name, email, avatar } = updatedData;

        // Update only provided fields
        if (name) user.name = name;
        if (email) user.email = String(email).toLowerCase().trim();

        // Avatar can be updated, cleared, or left unchanged
        if (avatar !== undefined) {
            user.avatar = avatar || null;
        }

        try {
            await user.save();

            // Delete previous avatar only after successful DB update
            if (avatar !== undefined && avatar && oldAvatar && oldAvatar !== avatar) {
                await deleteUploadedFile(oldAvatar);
            }

        } catch (err) {
            // Convert Sequelize unique constraint into API-friendly error
            if (err.name === "SequelizeUniqueConstraintError") {
                const error = new Error("Email already in use");
                error.statusCode = 409;
                throw error;
            }

            throw err;
        }

        return user;

    } catch (error) {
        console.error(`Error updating user profile: ${error.message}`);
        throw error;
    }
};


/* =============================
   PASSWORD
============================= */

// Change authenticated user password
const changeUserPasswordByID = async (userId, currentPassword, newPassword) => {
    try {
        const user = await User.scope("withPassword").findByPk(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Verify current password before allowing update
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            const error = new Error("Current password is incorrect");
            error.statusCode = 401;
            throw error;
        }

        // Prevent reusing the same password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);

        if (isSamePassword) {
            const error = new Error("New password must be different from the current password");
            error.statusCode = 400;
            throw error;
        }

        // Save hashed new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

    } catch (error) {
        console.error(`Error changing user password: ${error.message}`);
        throw error;
    }
};

module.exports = { registerUser, loginUser, getUserProfileByID, updateUserProfileByID, changeUserPasswordByID };
