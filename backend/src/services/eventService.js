const sequelize = require("../config/database");

const Event = require("../models/eventModel");
const User = require("../models/userModel");
const EventUserRole = require("../models/relations/eventUserRoleModel");
const EventReview = require("../models/relations/eventReviewModel");

const locationService = require("./locationService");

const { EVENT_ROLES } = require("../constants/eventRoles");
const { EVENT_STATUS } = require("../constants/eventStatus");
const { EVENT_MODES } = require("../constants/eventModes");

const { throwHttpError } = require("../utils/errors/httpError");

const {
    buildEventWhereConditions,
    buildEventCreatorInclude,
    buildParticipantCountAttribute,
    buildActiveParticipantInclude,
    buildEventReviewInclude,
    buildReviewCountAttribute,
    buildAverageRatingAttribute
} = require("../utils/events/eventQueryBuilder");

const { buildEventCreateData, buildEventUpdateData } = require("../utils/events/eventDataBuilder");

const {
    assertEventNotPast,
    assertEventNotStarted,
    hasEventStarted,
    getEventStatus
} = require("../utils/events/eventStatus");

const { deleteUploadedFile } = require("../utils/files/uploadedFileStorage");
const { getPaginationOptions, getTotalCount, getTotalPages } = require("../utils/pagination");

/* ==================================================
   EVENT SERVICE

   Handles:
   - event creation
   - optimized event listing with optional filters and pagination
   - single event retrieval and access resolution
   - current authenticated user event access
   - event update and deletion
   - event geolocation resolution and persistence
   - event image replacement and removal
   - participant count, review stats and status enrichment

   Notes:
   - critical write operations use Sequelize transactions
   - creator is automatically added as organizer
   - event listings count active participants with COUNT DISTINCT
   - event listings expose review count and average rating
   - participant count queries ignore soft-deleted memberships
   - review stats are built from event review ratings
   - getAllEvents supports filters through query params
   - physical event locations are resolved through locationService
   - online events never persist geolocation data
   - past events cannot be updated
   - started events cannot be deleted
   - event images are preserved when omitted from updates
   - event images can be replaced or removed explicitly
   - event images are cleaned only after successful DB commits
   - event roles are centralized through shared constants
   - uses shared HTTP error utilities
================================================== */

/* =============================
   EVENT LOCATION
============================= */

// Resolves persisted location coordinates for physical events
const resolveEventLocationData = async (mode, location) => {
    if (mode === EVENT_MODES.ONLINE || !String(location ?? "").trim()) {
        return null;
    }

    return locationService.resolveEventLocation(location);
};

/* =============================
   CREATE EVENT
============================= */

// Create a new event
const createEvent = async (data, userId) => {
    const transaction = await sequelize.transaction();

    try {
        const { startDateTime, endDateTime } = data;

        // Ensure event dates are coherent before persistence
        if (new Date(endDateTime) < new Date(startDateTime)) {
            throwHttpError(400, "End date must be after start date");
        }

        const locationData = await resolveEventLocationData(data.mode, data.location);

        const eventData = buildEventCreateData(data, userId, locationData);

        const event = await Event.create(eventData, { transaction });

        // Creator automatically becomes organizer
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
   GET EVENTS
============================= */

// Get all events with optional filters and pagination
const getAllEvents = async (query = {}) => {
    const whereConditions = {};

    // Apply filters to Sequelize where conditions
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
        ["startDateTime", "title", "creatorId", "createdAt"],
        "createdAt",
        "DESC"
    );

    const { count, rows } = await Event.findAndCountAll({
        where: whereConditions,
        limit,
        offset,
        order: [[orderField, orderDirection]],
        attributes: {
            include: [
                buildParticipantCountAttribute(sequelize, "participants.id"),
                buildReviewCountAttribute(sequelize, "reviews.id"),
                buildAverageRatingAttribute(sequelize, "reviews.rating")
            ]
        },
        include: [
            buildEventCreatorInclude(User, query.creator),
            buildActiveParticipantInclude(User),
            buildEventReviewInclude(EventReview)
        ],
        group: ["Event.id", "creator.id"],
        subQuery: false
    });

    const totalEvents = getTotalCount(count);

    return {
        page,
        pageSize,
        totalEvents,
        totalPages: getTotalPages(totalEvents, pageSize),

        events: rows.map((event) => ({
            ...event.toJSON(),
            status: getEventStatus(event)
        }))
    };
};

// Get current authenticated user's access permissions for one event
const getCurrentUserEventAccess = async (eventId, userId) => {
    const event = await Event.findByPk(eventId);

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    // Look for the user's active membership on this event
    const membership = await EventUserRole.findOne({
        where: {
            eventId,
            userId,
            deletedAt: null
        }
    });

    const role = membership?.role || null;

    // Access rules depend on event lifecycle state
    const status = getEventStatus(event);
    const isPast = status === EVENT_STATUS.PAST;
    const isStarted = hasEventStarted(event);

    // Organizers and co-organizers can edit events until they end
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

// Get a single event by ID
const getEventByID = async (id) => {
    const event = await Event.findOne({
        where: { id },
        attributes: {
            include: [
                buildParticipantCountAttribute(sequelize, "participants.id"),
                buildReviewCountAttribute(sequelize, "reviews.id"),
                buildAverageRatingAttribute(sequelize, "reviews.rating")
            ]
        },
        include: [
            buildEventCreatorInclude(User),
            buildActiveParticipantInclude(User),
            buildEventReviewInclude(EventReview)
        ],
        group: ["Event.id", "creator.id"]
    });

    if (!event) {
        throwHttpError(404, "Event not found");
    }

    return {
        ...event.toJSON(),
        status: getEventStatus(event)
    };
};


/* =============================
   UPDATE / DELETE EVENT
============================= */

// Update an existing event
const updateEventByID = async (id, data) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await Event.findByPk(id, { transaction });

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        // Past events cannot be updated
        assertEventNotPast(event);

        const oldImage = event.image;
        const { startDateTime, endDateTime, image } = data;

        const hasBothDates = startDateTime && endDateTime;

        if (hasBothDates && new Date(endDateTime) < new Date(startDateTime)) {
            throwHttpError(400, "End date must be after start date");
        }

        // Resolve the next persisted mode after partial updates
        const nextMode = data.mode ?? event.mode;

        // Resolve the next persisted location after partial updates
        const nextLocation = data.location !== undefined
            ? data.location
            : event.location;


        // Physical events must always keep a valid location
        if (nextMode === EVENT_MODES.IN_PERSON && data.location !== undefined && !String(nextLocation ?? "").trim()) {
            throwHttpError(400, "Location is required for in-person events");
        }

        // Re-geocode only when the physical location changes
        const shouldRefreshLocationData =
            nextMode === EVENT_MODES.IN_PERSON &&
            data.location !== undefined;

        const locationData = shouldRefreshLocationData
            ? await resolveEventLocationData(nextMode, nextLocation)
            : null;

        const updatedData = buildEventUpdateData(event, data, locationData);

        await event.update(updatedData, { transaction });

        await transaction.commit();


        // Delete old image only after successful DB commit
        const shouldDeleteOldImage =
            image !== undefined &&
            oldImage &&
            oldImage !== image;

        if (shouldDeleteOldImage) {
            await deleteUploadedFile(oldImage);
        }

        return event;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


// Delete an event
const deleteEventByID = async (id) => {
    const transaction = await sequelize.transaction();

    try {
        const event = await Event.findByPk(id, { transaction });

        if (!event) {
            throwHttpError(404, "Event not found");
        }

        // Events cannot be deleted after they have started
        assertEventNotStarted(event);

        const oldImage = event.image;

        await EventUserRole.destroy({
            where: { eventId: id },
            transaction
        });

        await event.destroy({ transaction });

        await transaction.commit();

        // Delete event image only after successful DB commit
        if (oldImage) {
            await deleteUploadedFile(oldImage);
        }

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getCurrentUserEventAccess,
    getEventByID,
    updateEventByID,
    deleteEventByID
};
