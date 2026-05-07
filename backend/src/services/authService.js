const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

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
================================================== */

/* =============================
   REGISTER / LOGIN
============================= */

// Register a new user
const registerUser = async ({ name, email, password, avatar }) => {
    try {
        const normalizedEmail = String(email).toLowerCase().trim();

        // Prevent duplicate email registration
        const existingUser = await User.findOne({
            where: { email: normalizedEmail }
        });

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

module.exports = { registerUser, loginUser };
