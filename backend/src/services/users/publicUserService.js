const { Op } = require("sequelize");

const sequelize = require("../../config/database");

const User = require("../../models/userModel");
const Event = require("../../models/eventModel");
const EventUserRole = require("../../models/relations/eventUserRoleModel");
const EventLike = require("../../models/relations/eventLikeModel");

const { EVENT_ROLES } = require("../../constants/eventRoles");
const { EVENT_SORT_FIELDS } = require("../../constants/eventSortFields");
const { PUBLIC_USER_PROFILE_ATTRIBUTES } = require("../../constants/userAttributes");

const { formatPublicUser } = require("../../utils/users/public/publicUserFormatter");
const { buildEventWhereConditions } = require("../../utils/events/eventFilters");
const { buildEventCreatorInclude } = require("../../utils/events/eventCreatorInclude");
const { getEventStatus } = require("../../utils/events/eventStatus");

const { countActiveParticipantsByEventIds } = require("../../utils/eventMemberships/eventParticipants");

const {
    findLikedEventIdsByUser,
    countEventLikesByEventIds
} = require("../../utils/eventLikes/eventLikes");

const {
    getPublicCreatedEvents,
    getPublicJoinedEvents
} = require("../../utils/users/public/publicUserEventQueries");

const {
    getPaginationOptions,
    getTotalCount,
    getTotalPages
} = require("../../utils/pagination");

const { findUserByIdOrFail } = require("../../utils/users/userQueries");

/* ==========================================================================
   Public User Service

   Handles public user business logic.

   Responsibilities
   - Retrieve public user profiles
   - Retrieve public user event listings
   - Build public user profile statistics
   - Enrich public event listings

   Notes
   - Public profiles never expose sensitive user fields.
   - Public event listings can include current user like state.
=========================================================================== */

const DEFAULT_PUBLIC_USER_EVENT_SORT_FIELD = "startDateTime";

const getPublicUserProfileById = async (userId) => {
    const user = await findUserByIdOrFail(User, userId, {
        attributes: PUBLIC_USER_PROFILE_ATTRIBUTES
    });

    const createdEventsCount = await Event.count({
        where: { creatorId: userId }
    });

    const joinedEventsCount = await EventUserRole.count({
        where: {
            userId,
            deletedAt: null,
            role: {
                [Op.ne]: EVENT_ROLES.ORGANIZER
            }
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

const getPublicUserEventsById = async (
    userId,
    query = {},
    currentUserId = null
) => {
    await findUserByIdOrFail(User, userId);

    const {
        view = "created",
        creator,
        ...eventQuery
    } = query;

    const eventFilter = {};
    buildEventWhereConditions(eventFilter, eventQuery);

    const paginationQuery = {
        ...query,
        sortBy: query.sortBy || DEFAULT_PUBLIC_USER_EVENT_SORT_FIELD,
        order: query.order || "asc"
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
        DEFAULT_PUBLIC_USER_EVENT_SORT_FIELD,
        "ASC"
    );

    const result = view === "joined"
        ? await getPublicJoinedEvents({
            Event,
            User,
            EventUserRole,
            EVENT_ROLES,
            Op,
            userId,
            eventFilter,
            creator,
            pagination: {
                limit,
                offset,
                orderField,
                orderDirection
            },
            buildEventCreatorInclude
        })
        : await getPublicCreatedEvents({
            Event,
            User,
            userId,
            eventFilter,
            creator,
            pagination: {
                limit,
                offset,
                orderField,
                orderDirection
            },
            buildEventCreatorInclude
        });

    const { count, rows } = result;
    const eventIds = rows.map((event) => event.id);

    const participantCountByEventId = await countActiveParticipantsByEventIds(
        EventUserRole,
        sequelize,
        eventIds
    );

    const likesCountByEventId = await countEventLikesByEventIds(
        EventLike,
        sequelize,
        eventIds
    );

    const likedEventIds = await findLikedEventIdsByUser(
        EventLike,
        eventIds,
        currentUserId
    );

    const events = rows.map((event) => {
        const data = event.toJSON();

        const eventWithStats = {
            ...data,
            participantCount: participantCountByEventId[data.id] || 0,
            likesCount: likesCountByEventId[data.id] || 0
        };

        return {
            ...eventWithStats,
            status: getEventStatus(eventWithStats),
            isLikedByCurrentUser: likedEventIds.has(data.id)
        };
    });

    const totalEvents = getTotalCount(count);

    return {
        view,
        page,
        pageSize,
        totalEvents,
        totalPages: getTotalPages(totalEvents, pageSize),
        events
    };
};

module.exports = {
    getPublicUserProfileById,
    getPublicUserEventsById
};
