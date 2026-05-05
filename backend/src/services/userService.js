const User = require("../models/userModel");
const Event = require("../models/eventModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

/* ==================================================
   USER PUBLIC PROFILE SERVICE

   Handles:
   - fetching public user profile
   - separating created and joined events
   - preventing duplicates
================================================== */

// Get public user profile by ID
const getPublicUserProfileById = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ["name", "avatar"]
    });

    // Check if user exists
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Count events created by user
    const createdEventsCount = await Event.count({
        where: { creatorId: userId }
    });

    // Count events joined by user
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

// Get public events of a user (created + joined)
const getPublicUserEventsById = async (userId) => {

    // Check if user exists (important)
    const user = await User.findByPk(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Events created by user
    const createdEvents = await Event.findAll({
        where: { creatorId: userId },
        order: [["startDateTime", "ASC"]]
    });

    // Events joined by user (via join table)
    const joinedEventsRaw = await EventUserRole.findAll({
        where: { userId },
        include: [
            {
                model: Event,
                as: "event"
            }
        ]
    });

    // Extract events and remove those created by user
    const joinedEvents = joinedEventsRaw
        .map(entry => entry.event)
        .filter(event => event.creatorId !== userId);

    return {
        createdEvents,
        joinedEvents
    };
};

module.exports = { getPublicUserProfileById, getPublicUserEventsById };
