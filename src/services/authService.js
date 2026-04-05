// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Create a new user and generate a JWT token
const registerUser = async ({ name, email, password }) => {
    try {

        const normalizedEmail = String(email).toLowerCase().trim();

        // Check if user already exists in the database
        const existingUser = await User.findOne({ where: { email: normalizedEmail } });
        if (existingUser) {
            const error = new Error('Email already in use');
            error.statusCode = 409;
            throw error;
        }

        // Hash password with bcrypt & create the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        return { user, token };

    } catch (error) {
        console.error(`Error during registration: ${error.message}`);
        throw error;
    }
};

// Login an existing user and return a JWT token
const loginUser = async ({ email, password }) => {
    try {

        const normalizedEmail = String(email).toLowerCase().trim();

        // Check if user exists in the database and include the password
        const user = await User.scope('withPassword').findOne({ where: { email: normalizedEmail } });
        if (!user) {
            const error = new Error('Invalid email or invalid password');
            error.statusCode = 401;
            throw error;
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or invalid password');
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        return { user, token };

    } catch (error) {
        console.error(`Error during login: ${error.message}`);
        throw error;
    }
};

// Get the profile of a user by their ID
const getUserProfileByID = async (userId) => {
    try {

        const user = await User.findByPk(userId);

        // Check if user exists in the database
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

// Update the profile of a user by their ID
const updateUserProfileByID = async (userId, updatedData) => {
    try {
        const user = await User.findByPk(userId);

        // Check if user exists in the database
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        const { name, email, password } = updatedData;

        // Update user fields if provided
        if (name) user.name = name;
        if (email) user.email = String(email).toLowerCase().trim();
        if (password) user.password = await bcrypt.hash(password, 10);

        try {
            await user.save();
        } catch (err) {
            // Handle unique email conflict cleanly
            if (err.name === 'SequelizeUniqueConstraintError') {
                const error = new Error('Email already in use');
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

module.exports = { registerUser, loginUser, getUserProfileByID, updateUserProfileByID };
