const User = require("../models/userModel");
const Event = require("../models/eventModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

/* ==================================================
   USER SERVICE

   Handles:
   - public user profile retrieval
   - public user event retrieval
   - public profile statistics

   Notes:
   - public profiles never expose id, email, password or dates
   - joined events exclude events created by the same user
   - EventUserRole includes events with alias "event"
================================================== */

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

module.exports = { getPublicUserProfileById, getPublicUserEventsById };
