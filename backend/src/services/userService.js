const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const Event = require("../models/eventModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");
const deleteUploadedFile = require("../utils/deleteUploadedFile");

/* ==================================================
   USER SERVICE

   Handles:
   - authenticated user profile retrieval
   - authenticated profile update
   - authenticated password update
   - public user profile retrieval
   - public user event retrieval
   - public profile statistics

   Notes:
   - public profiles never expose id, email, password or dates
   - joined events exclude events created by the same user
   - EventUserRole includes events with alias "event"
================================================== */

/* =============================
   AUTHENTICATED PROFILE
============================= */

// Get authenticated user profile
const getCurrentUserProfileById = async (userId) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            const error = new Error("User not found");
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
const updateCurrentUserProfileById = async (userId, updatedData) => {
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
const changeCurrentUserPasswordById = async (userId, currentPassword, newPassword) => {
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


/* =============================
   PUBLIC PROFILE
============================= */

// Get public user profile by ID
const getPublicUserProfileById = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ["name", "avatar"]
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const createdEventsCount = await Event.count({
        where: { creatorId: userId }
    });

    const joinedEventsCount = await EventUserRole.count({
        where: { userId }
    });

    return {
        user,
        stats: {
            createdEventsCount,
            joinedEventsCount
        }
    };
};


/* =============================
   PUBLIC USER EVENTS
============================= */

// Get public events created and joined by a user
const getPublicUserEventsById = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const createdEvents = await Event.findAll({
        where: { creatorId: userId },
        order: [["startDateTime", "ASC"]]
    });

    const joinedEventsRaw = await EventUserRole.findAll({
        where: { userId },
        include: [
            {
                model: Event,
                as: "event"
            }
        ]
    });

    // Remove events created by the same user to avoid duplicates
    const joinedEvents = joinedEventsRaw
        .map((membership) => membership.event)
        .filter((event) => event.creatorId !== userId);

    return {
        createdEvents,
        joinedEvents
    };
};

module.exports = { getCurrentUserProfileById, updateCurrentUserProfileById, changeCurrentUserPasswordById, getPublicUserProfileById, getPublicUserEventsById };
