const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const Event = require("../models/eventModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

const { deleteUploadedFile } = require("../utils/uploadedFileStorage");
const { buildEventWhereConditions, buildEventCreatorInclude } = require("../utils/events/eventQueryBuilder");
const { getEventStatus } = require("../utils/events/eventStatus");
const { getPaginationOptions } = require("../utils/pagination");

/* ==================================================
   USER SERVICE

   Handles:
   - authenticated current user events retrieval
   - authenticated current user profile retrieval
   - authenticated current user profile update
   - authenticated current user password update
   - public user profile retrieval
   - public user events retrieval
   - public profile statistics

   Notes:
   - public profiles never expose id, email, password or dates
   - joined events exclude events created by the same user
   - EventUserRole includes events with alias "event"
================================================== */

/* ==================================================
   AUTHENTICATED USER
================================================== */

// Get all paginated events of the current user by ID
const getCurrentUserEventsByID = async (userId, query = {}) => {
    try {
        const { view } = query;
        const now = new Date();

        const user = await User.findByPk(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        /* =========================
           View-based filters
        ========================= */

        const isHistoryView = view === "createdHistory" || view === "joinedHistory";

        const roleFilter = !view
            ? undefined
            : view === "created" || view === "createdHistory"
                ? "organizer"
                : { [Op.in]: ["participant", "co_organizer"] };

        const eventDateFilter = !view
            ? {}
            : isHistoryView
                ? { endDateTime: { [Op.lt]: now } }
                : { endDateTime: { [Op.gte]: now } };


        /* =========================
           Event filters
        ========================= */

        const { creator, ...eventQuery } = query;

        const eventFilter = { ...eventDateFilter };
        buildEventWhereConditions(eventFilter, eventQuery, { includeStatus: false });


        /* =========================
           Pagination
        ========================= */

        const paginationQuery = {
            ...query,
            sortBy: query.sortBy || "startDateTime",
            order: query.order || (isHistoryView ? "desc" : "asc")
        };

        const {
            page,
            pageSize,
            limit,
            offset,
            orderField,
            orderDirection
        } = getPaginationOptions(
            paginationQuery,
            ["startDateTime", "title", "createdAt"],
            "startDateTime",
            isHistoryView ? "DESC" : "ASC"
        );


        /* =========================
           Query database
        ========================= */

        const { count, rows } = await EventUserRole.findAndCountAll({
            where: {
                userId,
                ...(roleFilter && { role: roleFilter })
            },
            include: [{
                model: Event,
                as: "event",
                where: eventFilter,
                attributes: [
                    "id",
                    "title",
                    "description",
                    "type",
                    "theme",
                    "mode",
                    "location",
                    "startDateTime",
                    "endDateTime",
                    "maxParticipants",
                    "registrationDeadline",
                    "creatorId"
                ],
                include: [
                    buildEventCreatorInclude(User, creator)
                ]
            }],
            limit,
            offset,
            order: [[{ model: Event, as: "event" }, orderField, orderDirection]]
        });


        /* =========================
           Data enrichment
        ========================= */

        const events = await Promise.all(
            rows.map(async (membership) => {
                const data = membership.toJSON();

                const participantCount = await EventUserRole.count({
                    where: {
                        eventId: data.event.id,
                        role: "participant"
                    }
                });

                return {
                    ...data,
                    event: {
                        ...data.event,
                        participantCount,
                        status: getEventStatus(data.event)
                    }
                };
            })
        );

        return {
            page,
            pageSize,
            totalEvents: count,
            totalPages: Math.ceil(count / pageSize),
            events
        };

    } catch (error) {
        console.error("Error in getCurrentUserEvents service:", error);
        throw error;
    }
};

// Get current user profile by ID
const getCurrentUserProfileByID = async (userId) => {
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


// Update current user profile by ID
const updateCurrentUserProfileByID = async (userId, updatedData) => {
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

// Change current user password by ID
const changeCurrentUserPasswordByID = async (userId, currentPassword, newPassword) => {
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
   PUBLIC USER
============================= */

// Get public user profile by ID
const getPublicUserProfileByID = async (userId) => {
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

// Get public events created and joined by a user
const getPublicUserEventsByID = async (userId) => {
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

module.exports = { getCurrentUserEventsByID, getCurrentUserProfileByID, updateCurrentUserProfileByID, changeCurrentUserPasswordByID, getPublicUserProfileByID, getPublicUserEventsByID };
