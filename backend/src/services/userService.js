const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const sequelize = require("../config/database");

const User = require("../models/userModel");
const Event = require("../models/eventModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");

const { EVENT_ROLES } = require("../constants/eventRoles");

const { throwHttpError } = require("../utils/errors/httpError");

const { formatPublicUser } = require("../utils/formatting/userFormatter");

const {
    buildEventWhereConditions,
    buildEventCreatorInclude,
    countActiveParticipantsByEventIds
} = require("../utils/events/eventQueryBuilder");

const { getEventStatus } = require("../utils/events/eventStatus");
const { deleteUploadedFile } = require("../utils/files/uploadedFileStorage");

const { normalizeEmail } = require("../utils/normalize");
const { getPaginationOptions } = require("../utils/pagination");

/* ==================================================
   USER SERVICE

   Handles:
   - authenticated current user events retrieval with optimized participant counts
   - authenticated current user profile retrieval
   - authenticated current user profile update
   - authenticated current user password update
   - authenticated current user account deletion
   - public user profile retrieval
   - public user events retrieval
   - public profile statistics

   Notes:
   - current user event listings avoid per-event participant count queries
   - grouped participant count queries exclude soft-deleted memberships
   - critical profile update flow uses Sequelize transactions
   - public profiles never expose id, email, password or dates
   - joined events exclude events created by the same user
   - EventUserRole includes events with alias "event"
   - event roles are centralized through shared constants
   - uses shared HTTP error and normalization utilities
================================================== */

/* ==================================================
   AUTHENTICATED USER
================================================== */

// Get all paginated events of the current user by ID
const getCurrentUserEventsByID = async (userId, query = {}) => {
    const { view } = query;
    const now = new Date();

    const user = await User.findByPk(userId);

    if (!user) {
        throwHttpError(404, "User not found");
    }

    /* =========================
       View-based filters
    ========================= */

    const isHistoryView = view === "createdHistory" || view === "joinedHistory";

    const roleFilter = !view
        ? undefined
        : view === "created" || view === "createdHistory"
            ? EVENT_ROLES.ORGANIZER
            : {
                [Op.in]: [
                    EVENT_ROLES.PARTICIPANT,
                    EVENT_ROLES.CO_ORGANIZER
                ]
            };

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
            deletedAt: null,
            ...(roleFilter && { role: roleFilter })
        },
        include: [{
            model: Event,
            as: "event",
            where: eventFilter,
            include: [
                buildEventCreatorInclude(User, creator)
            ]
        }],
        limit,
        offset,
        order: [[{ model: Event, as: "event" }, orderField, orderDirection]],
        subQuery: false
    });

    const eventIds = rows.map((membership) => membership.toJSON().event.id);

    const participantCountByEventId = await countActiveParticipantsByEventIds(
        EventUserRole,
        sequelize,
        eventIds
    );


    /* =========================
       Data enrichment
    ========================= */

    const events = rows.map((membership) => {
        const data = membership.toJSON();

        const event = {
            ...data.event,
            participantCount: participantCountByEventId[data.event.id] || 0
        };

        return {
            ...data,
            event: {
                ...event,
                status: getEventStatus(event)
            }
        };
    });

    const totalEvents = Array.isArray(count) ? count.length : count;

    return {
        page,
        pageSize,
        totalEvents,
        totalPages: Math.ceil(totalEvents / pageSize),
        events
    };
};

// Get current user profile by ID
const getCurrentUserProfileByID = async (userId) => {
    const user = await User.findByPk(userId);

    if (!user) {
        throwHttpError(404, "User not found");
    }

    return user;
};


// Update current user profile by ID
const updateCurrentUserProfileByID = async (userId, updatedData) => {
    const transaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(userId, { transaction });

        if (!user) {
            throwHttpError(404, "User not found");
        }

        const oldAvatar = user.avatar;
        const { name, email, avatar } = updatedData;

        // Update only provided fields
        if (name) user.name = name;
        if (email) user.email = normalizeEmail(email);

        // Avatar can be updated, cleared, or left unchanged
        if (avatar !== undefined) {
            user.avatar = avatar || null;
        }

        await user.save({ transaction });

        await transaction.commit();

        // Delete previous avatar only after successful DB commit
        const shouldDeleteOldAvatar =
            avatar !== undefined &&
            avatar &&
            oldAvatar &&
            oldAvatar !== avatar;

        if (shouldDeleteOldAvatar) {
            await deleteUploadedFile(oldAvatar);
        }

        return user;

    } catch (err) {
        await transaction.rollback();

        // Convert Sequelize unique constraint into API-friendly error
        if (err.name === "SequelizeUniqueConstraintError") {
            throwHttpError(409, "Email already in use");
        }

        throw err;
    }
};

// Change current user password by ID
const changeCurrentUserPasswordByID = async (userId, currentPassword, newPassword) => {
    const user = await User.scope("withPassword").findByPk(userId);

    if (!user) {
        throwHttpError(404, "User not found");
    }

    // Verify current password before allowing update
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
        throwHttpError(401, "Current password is incorrect");
    }

    // Prevent reusing the same password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
        throwHttpError(400, "New password must be different from the current password");
    }

    // Save hashed new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
};

// Delete current user account by ID
const deleteCurrentUserByID = async (userId) => {
    const transaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(userId, { transaction });

        if (!user) {
            throwHttpError(404, "User not found");
        }

        // Prevent deleting an account that still owns active or upcoming events
        const activeOrganizerMembership = await EventUserRole.findOne({
            where: {
                userId,
                role: EVENT_ROLES.ORGANIZER,
                deletedAt: null
            },
            include: [{
                model: Event,
                as: "event",
                where: {
                    endDateTime: {
                        [Op.gte]: new Date()
                    }
                }
            }],
            transaction
        });

        if (activeOrganizerMembership) {
            throwHttpError(403, "You must transfer ownership of your active or upcoming events before deleting your account");
        }

        const oldAvatar = user.avatar;
        const deletionToken = Date.now();

        // Keep historical user identity visible while disabling account access
        user.deletedAt = new Date();
        user.email = `deleted_user_${user.id}_${deletionToken}@deleted.local`;
        user.password = await bcrypt.hash(
            `deleted_user_${user.id}_${deletionToken}`,
            10
        );
        user.avatar = null;

        await user.save({ transaction });

        await transaction.commit();

        // Delete avatar only after successful DB commit
        if (oldAvatar) {
            await deleteUploadedFile(oldAvatar);
        }

        return user;

    } catch (error) {
        await transaction.rollback();
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
        throwHttpError(404, "User not found");
    }

    const createdEventsCount = await Event.count({
        where: { creatorId: userId }
    });

    const joinedEventsCount = await EventUserRole.count({
        where: {
            userId,
            deletedAt: null
        }
    });

    return {
        user: formatPublicUser(user),
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
        throwHttpError(404, "User not found");
    }

    const createdEvents = await Event.findAll({
        where: { creatorId: userId },
        order: [["startDateTime", "ASC"]]
    });

    const joinedEventsRaw = await EventUserRole.findAll({
        where: {
            userId,
            deletedAt: null
        },
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

module.exports = {
    getCurrentUserEventsByID,
    getCurrentUserProfileByID,
    updateCurrentUserProfileByID,
    changeCurrentUserPasswordByID,
    deleteCurrentUserByID,
    getPublicUserProfileByID,
    getPublicUserEventsByID
};
