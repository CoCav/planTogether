const { Op } = require("sequelize");

const sequelize = require("../../config/database");

const User = require("../../models/userModel");
const Event = require("../../models/eventModel");
const EventUserRole = require("../../models/associations/eventUserRoleModel");
const EventLike = require("../../models/associations/eventLikeModel");

const { EVENT_ROLES } = require("../../constants/eventRoles");
const { EVENT_SORT_FIELDS } = require("../../constants/eventSortFields");

const { throwHttpError } = require("../../utils/errors/httpError");
const { normalizeEmail } = require("../../utils/stringNormalizer");
const { deleteUploadedFile } = require("../../utils/files/uploadedFileStorage");
const { getEventStatus } = require("../../utils/events/eventStatus");
const { buildEventWhereConditions } = require("../../utils/events/eventFilters");
const { buildEventCreatorInclude } = require("../../utils/events/eventCreatorInclude");
const { getEventListStats } = require("../../utils/events/eventListStats");

const {
    getPaginationOptions,
    getTotalCount,
    getTotalPages
} = require("../../utils/pagination");

const {
    hashPassword,
    comparePassword
} = require("../../utils/auth/passwordHasher");

const { findUserByIdOrFail } = require("../../utils/users/userQueries");

/* ==========================================================================
   Authenticated User Service

   Handles authenticated user business logic.

   Responsibilities
   - Retrieve current user events
   - Retrieve current user profile
   - Update current user profile
   - Change current user password
   - Delete current user account

   Notes
   - Current user services use authenticated user IDs.
   - Critical profile and deletion flows use transactions.
=========================================================================== */

const EMAIL_ALREADY_IN_USE_ERROR = "Email already in use";
const CURRENT_PASSWORD_INCORRECT_ERROR = "Current password is incorrect";
const NEW_PASSWORD_MUST_BE_DIFFERENT_ERROR = "New password must be different from the current password";
const ACTIVE_EVENTS_OWNERSHIP_ERROR = "You must transfer ownership of your active or upcoming events before deleting your account";

const DEFAULT_USER_EVENT_SORT_FIELD = "startDateTime";

const getCurrentUserEventsById = async (userId, query = {}) => {
    const { view } = query;
    const now = new Date();

    await findUserByIdOrFail(User, userId);

    const isHistoryView = view === "createdHistory" || view === "joinedHistory";

    // Created views contain organizer memberships.
    // Joined views contain participant and co-organizer memberships.
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

    // History views only contain completed events.
    const eventDateFilter = !view ? {} : isHistoryView
        ? {
            endDateTime: {
                [Op.lt]: now
            }
        }
        : {
            endDateTime: {
                [Op.gte]: now
            }
        };

    const { creator, ...eventQuery } = query;

    const eventFilter = {
        ...eventDateFilter
    };

    buildEventWhereConditions(eventFilter, eventQuery, {
        // The current user view already controls its date range.
        includeStatus: false
    });

    const paginationQuery = {
        ...query,
        sortBy: query.sortBy || DEFAULT_USER_EVENT_SORT_FIELD,
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
        EVENT_SORT_FIELDS,
        DEFAULT_USER_EVENT_SORT_FIELD,
        isHistoryView ? "DESC" : "ASC"
    );

    const { count, rows } =
        await EventUserRole.findAndCountAll({
            where: {
                userId,
                deletedAt: null,
                ...(roleFilter && {
                    role: roleFilter
                })
            },
            include: [{
                model: Event,
                as: "event",
                where: eventFilter,
                include: [
                    buildEventCreatorInclude(
                        User,
                        creator
                    )
                ]
            }],
            limit,
            offset,
            order: [[
                {
                    model: Event,
                    as: "event"
                },
                orderField,
                orderDirection
            ]],
            subQuery: false
        });

    const eventIds = rows.map(
        (membership) => membership.toJSON().event.id
    );

    // Retrieve shared event statistics in one step.
    const {
        participantCountByEventId,
        likesCountByEventId,
        likedEventIds
    } = await getEventListStats({
        EventUserRole,
        EventLike,
        sequelize,
        eventIds,
        currentUserId: userId
    });

    const events = rows.map((membership) => {
        const data = membership.toJSON();

        const event = {
            ...data.event,
            participantCount: participantCountByEventId[data.event.id] || 0,
            likesCount: likesCountByEventId[data.event.id] || 0
        };

        return {
            ...data,
            event: {
                ...event,
                status: getEventStatus(event),
                isLikedByCurrentUser: likedEventIds.has(event.id)
            }
        };
    });

    const totalEvents = getTotalCount(count);

    return {
        page,
        pageSize,
        totalEvents,
        totalPages: getTotalPages(totalEvents, pageSize),
        events
    };
};

const getCurrentUserProfileById = async (userId) => {
    return findUserByIdOrFail(User, userId);
};

const updateCurrentUserProfileById = async (userId, updatedData) => {
    const transaction = await sequelize.transaction();

    let updatedUser;
    let oldAvatarToDelete = null;

    try {
        const user = await findUserByIdOrFail(User, userId, {
            transaction
        });

        const oldAvatar = user.avatar;
        const { name, email, avatar } = updatedData;

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = normalizeEmail(email);
        }

        // Preserve the current avatar when the field is omitted.
        if (avatar !== undefined) {
            user.avatar = avatar || null;
        }

        await user.save({
            transaction
        });

        const shouldDeleteOldAvatar =
            avatar !== undefined &&
            oldAvatar &&
            oldAvatar !== user.avatar;

        if (shouldDeleteOldAvatar) {
            oldAvatarToDelete = oldAvatar;
        }

        await transaction.commit();

        updatedUser = user;

    } catch (error) {
        await transaction.rollback();

        if (error.name === "SequelizeUniqueConstraintError") {
            throwHttpError(409, EMAIL_ALREADY_IN_USE_ERROR);
        }

        throw error;
    }

    // Clean uploaded files only after the database commit.
    if (oldAvatarToDelete) {
        await deleteUploadedFile(oldAvatarToDelete);
    }

    return updatedUser;
};

const changeCurrentUserPasswordById = async (userId, currentPassword, newPassword) => {

    const user = await findUserByIdOrFail(User.scope("withPassword"), userId);

    const isPasswordValid = await comparePassword(
        currentPassword,
        user.password
    );

    if (!isPasswordValid) {
        throwHttpError(401, CURRENT_PASSWORD_INCORRECT_ERROR);
    }

    const isSamePassword = await comparePassword(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        throwHttpError(400, NEW_PASSWORD_MUST_BE_DIFFERENT_ERROR);
    }

    user.password = await hashPassword(newPassword);

    await user.save();
};

const deleteCurrentUserById = async (userId) => {
    const transaction = await sequelize.transaction();

    let deletedUser;
    let oldAvatarToDelete = null;

    try {
        const user = await findUserByIdOrFail(User, userId, {
            transaction
        }
        );

        // Active and upcoming events must keep an organizer.
        const activeOrganizerMembership =
            await EventUserRole.findOne({
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
            throwHttpError(403, ACTIVE_EVENTS_OWNERSHIP_ERROR);
        }

        const deletionDate = new Date();
        const deletionToken = deletionDate.getTime();

        oldAvatarToDelete = user.avatar;

        // Keep the display name for historical event data.
        user.deletedAt = deletionDate;

        // Replace unique account credentials with anonymous values.
        user.email = `deleted_user_${user.id}_${deletionToken}@deleted.local`;
        user.password = await hashPassword(`deleted_user_${user.id}_${deletionToken}`);
        user.avatar = null;

        await user.save({
            transaction
        });

        await transaction.commit();

        deletedUser = user;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }

    // Account deletion is already committed before file cleanup.
    if (oldAvatarToDelete) {
        await deleteUploadedFile(oldAvatarToDelete);
    }

    return deletedUser;
};

module.exports = {
    getCurrentUserEventsById,
    getCurrentUserProfileById,
    updateCurrentUserProfileById,
    changeCurrentUserPasswordById,
    deleteCurrentUserById
};
