const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const User = require("../models/userModel");

const EventUserRole = require("../models/associations/eventUserRoleModel");
const EventReview = require("../models/associations/eventReviewModel");
const EventLike = require("../models/associations/eventLikeModel");

const geocodingService = require("./geocodingService");

const { EVENT_ROLES } = require("../constants/eventRoles");
const { EVENT_STATUS } = require("../constants/eventStatus");
const { EVENT_MODES } = require("../constants/eventModes");
const { EVENT_SORT_FIELDS } = require("../constants/eventSortFields");

const { throwHttpError } = require("../utils/errors/httpError");

const { buildEventWhereConditions } = require("../utils/events/eventFilters");
const { buildEventCreatorInclude } = require("../utils/events/eventCreatorInclude");
const { findEventByIdOrFail } = require("../utils/events/eventQueries");

const { findActiveMembership } = require("../utils/eventMemberships/eventMembershipQueries");
const {
    buildActiveParticipantInclude,
    buildEventParticipantCountAttribute
} = require("../utils/eventMemberships/eventParticipants");

const {
    buildEventReviewInclude,
    buildEventReviewCountAttribute,
    buildEventAverageRatingAttribute
} = require("../utils/eventReviews/eventReviews");

const {
    buildEventLikeInclude,
    buildEventLikeCountAttribute,
    findLikedEventIdsByUser,
    findEventLike
} = require("../utils/eventLikes/eventLikes");

const {
    buildCreateEventPayload,
    buildUpdateEventPayload
} = require("../utils/events/eventPayloadBuilder");

const {
    assertEventNotPast,
    assertEventNotStarted,
    hasEventStarted,
    getEventStatus
} = require("../utils/events/eventStatus");

const { deleteUploadedFile } = require("../utils/files/uploadedFileStorage");

const { normalizeString } = require("../utils/stringNormalizer");
const {
    getPaginationOptions,
    getTotalCount,
    getTotalPages
} = require("../utils/pagination");


/* ==========================================================================
   Event Service

   Handles event business logic.

   Responsibilities
   - Create events
   - Retrieve event listings and details
   - Resolve current user event access
   - Update and delete events
   - Resolve event geocoding data
   - Manage event image cleanup
   - Enrich events with participant, review and like stats

   Notes
   - Critical write operations use Sequelize transactions.
   - Creator is automatically added as organizer.
   - Online events never persist geocoding data.
   - Event images are cleaned only after successful database commits.
=========================================================================== */

/* =============================
   EVENT ERRORS
============================= */

const EVENT_NOT_FOUND_ERROR = "Event not found";
const END_DATE_AFTER_START_ERROR = "End date must be after start date";
const LOCATION_REQUIRED_ERROR = "Location is required for in-person events";

/* =============================
   EVENT SORT CONFIGURATION
============================= */

const DEFAULT_EVENT_SORT_FIELD = "createdAt";
const DEFAULT_EVENT_SORT_ORDER = "DESC";

/* =============================
   EVENT HELPERS
============================= */

// Ensure the event end date occurs after its start date
const assertValidEventDateRange = (startDateTime, endDateTime) => {
    if (new Date(endDateTime) <= new Date(startDateTime)) {
        throwHttpError(400, END_DATE_AFTER_START_ERROR);
    }
};

// Resolve structured location data for an in-person event
const resolveEventLocationData = async (mode, location) => {
    // Online events never require geocoding data
    if (mode === EVENT_MODES.ONLINE || !normalizeString(location)) {
        return null;
    }

    return geocodingService.resolveEventLocation(location);
};

// Check whether the current user likes an event
const getIsLikedByCurrentUser = async (eventId, currentUserId) => {
    // Anonymous users cannot have an event like state
    if (!currentUserId) {
        return false;
    }

    const like = await findEventLike(EventLike, {
        eventId,
        userId: currentUserId
    });

    return Boolean(like);
};

/* =============================
   EVENT CREATION
============================= */

// Create an event and assign its creator as organizer
const createEvent = async (data, userId) => {
    const {
        startDateTime,
        endDateTime
    } = data;

    assertValidEventDateRange(startDateTime, endDateTime);

    const locationData = await resolveEventLocationData(data.mode, data.location);

    const eventData = buildCreateEventPayload(data, userId, locationData);

    const transaction = await sequelize.transaction();

    try {
        const event = await Event.create(eventData, {
            transaction
        });

        // The creator always becomes the initial organizer
        await EventUserRole.create({
            eventId: event.id,
            userId,
            role: EVENT_ROLES.ORGANIZER
        }, {
            transaction
        });

        await transaction.commit();

        return event;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

/* =============================
   EVENT RETRIEVAL
============================= */

// Retrieve paginated and enriched event listings
const getAllEvents = async (query = {}, currentUserId = null) => {
    const whereConditions = {};

    buildEventWhereConditions(whereConditions, query);

    const {
        page,
        pageSize,
        limit,
        offset,
        orderField,
        orderDirection
    } = getPaginationOptions(
        query,
        EVENT_SORT_FIELDS,
        DEFAULT_EVENT_SORT_FIELD,
        DEFAULT_EVENT_SORT_ORDER
    );

    const { count, rows } = await Event.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [[orderField, orderDirection]],

        attributes: {
            include: [
                buildEventParticipantCountAttribute(sequelize, "participants.id"),
                buildEventReviewCountAttribute(sequelize, "reviews.id"),
                buildEventAverageRatingAttribute(sequelize, "reviews.rating"),
                buildEventLikeCountAttribute(sequelize, "likes.id")
            ]
        },

        include: [
            buildEventCreatorInclude(User, query.creator),
            buildActiveParticipantInclude(User),
            buildEventReviewInclude(EventReview),
            buildEventLikeInclude(EventLike)
        ],

        group: ["Event.id", "creator.id"],
        subQuery: false
    });

    const totalEvents = getTotalCount(count);
    const eventIds = rows.map((event) => event.id);

    const likedEventIds = await findLikedEventIdsByUser(EventLike, eventIds, currentUserId);

    const events = rows.map((event) => ({
        ...event.toJSON(),
        status: getEventStatus(event),
        isLikedByCurrentUser: likedEventIds.has(event.id)
    }));

    return {
        page,
        pageSize,
        totalEvents,
        totalPages: getTotalPages(totalEvents, pageSize),
        events
    };
};

// Retrieve the authenticated user's event permissions
const getCurrentUserEventAccess = async (eventId, userId) => {
    const event = await findEventByIdOrFail(Event, eventId);

    const membership = await findActiveMembership(EventUserRole, {
        eventId,
        userId
    });

    const role = membership?.role || null;
    const status = getEventStatus(event);

    const isPast = status === EVENT_STATUS.PAST;

    const isStarted = hasEventStarted(event);

    // Organizers and co-organizers can edit upcoming events
    const canEdit = !isPast && (
        role === EVENT_ROLES.ORGANIZER ||
        role === EVENT_ROLES.CO_ORGANIZER
    );

    // Only organizers can delete events that have not started
    const canDelete =
        role === EVENT_ROLES.ORGANIZER &&
        !isPast &&
        !isStarted;

    return {
        role,
        status,
        canEdit,
        canDelete
    };
};

// Retrieve one enriched event by ID
const getEventById = async (id, currentUserId = null) => {
    const event = await Event.findOne({
        where: {
            id
        },

        attributes: {
            include: [
                buildEventParticipantCountAttribute(sequelize, "participants.id"),
                buildEventReviewCountAttribute(sequelize, "reviews.id"),
                buildEventAverageRatingAttribute(sequelize, "reviews.rating"),
                buildEventLikeCountAttribute(sequelize, "likes.id")
            ]
        },

        include: [
            buildEventCreatorInclude(User),
            buildActiveParticipantInclude(User),
            buildEventReviewInclude(EventReview),
            buildEventLikeInclude(EventLike)
        ],

        group: ["Event.id", "creator.id"]
    });

    if (!event) {
        throwHttpError(404, EVENT_NOT_FOUND_ERROR);
    }

    return {
        ...event.toJSON(),
        status: getEventStatus(event),
        isLikedByCurrentUser: await getIsLikedByCurrentUser(
            event.id,
            currentUserId
        )
    };
};

/* =============================
   EVENT UPDATE
============================= */

// Update an event and clean replaced images after commit
const updateEventById = async (id, data) => {
    const transaction = await sequelize.transaction();

    let updatedEvent;
    let oldImageToDelete = null;

    try {
        const event = await findEventByIdOrFail(Event, id, {
            transaction
        });

        assertEventNotPast(event);

        const nextStartDateTime = data.startDateTime ?? event.startDateTime;
        const nextEndDateTime = data.endDateTime ?? event.endDateTime;

        // Validate partial date updates against existing values
        assertValidEventDateRange(nextStartDateTime, nextEndDateTime);

        const nextMode = data.mode ?? event.mode;

        const nextLocation = data.location !== undefined
            ? data.location
            : event.location;

        if (
            nextMode === EVENT_MODES.IN_PERSON &&
            data.location !== undefined &&
            !normalizeString(nextLocation)
        ) {
            throwHttpError(400, LOCATION_REQUIRED_ERROR);
        }

        const shouldRefreshLocationData =
            nextMode === EVENT_MODES.IN_PERSON &&
            data.location !== undefined;

        const locationData = shouldRefreshLocationData
            ? await resolveEventLocationData(nextMode, nextLocation)
            : null;

        const updatedData = buildUpdateEventPayload(event, data, locationData);

        const oldImage = event.image;

        await event.update(updatedData, {
            transaction
        });

        const shouldDeleteOldImage =
            data.image !== undefined &&
            oldImage &&
            oldImage !== data.image;

        if (shouldDeleteOldImage) {
            oldImageToDelete = oldImage;
        }

        await transaction.commit();

        updatedEvent = event;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }

    // File cleanup runs only after the database commit succeeds
    if (oldImageToDelete) {
        await deleteUploadedFile(oldImageToDelete);
    }

    return updatedEvent;
};

/* =============================
   EVENT DELETION
============================= */

// Delete an event and its explicit memberships
const deleteEventById = async (id) => {
    const transaction = await sequelize.transaction();

    let oldImageToDelete = null;

    try {
        const event = await findEventByIdOrFail(Event, id, {
            transaction
        });

        assertEventNotStarted(event);

        oldImageToDelete = event.image;

        // Remove explicit memberships before deleting the event
        await EventUserRole.destroy({
            where: {
                eventId: id
            },
            transaction
        });

        await event.destroy({
            transaction
        });

        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        throw error;
    }

    // File cleanup must never trigger a rollback after the commit
    if (oldImageToDelete) {
        await deleteUploadedFile(oldImageToDelete);
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getCurrentUserEventAccess,
    getEventById,
    updateEventById,
    deleteEventById
};
