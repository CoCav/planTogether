
/* ==================================================
   PUBLIC USER EVENT QUERY BUILDER

   Handles:
   - public created event queries
   - public joined event queries
   - pagination-compatible event retrieval

   Notes:
   - created view queries Event directly
   - joined view queries EventUserRole then extracts events
   - participant count enrichment stays in userService
================================================== */

/* =============================
   CREATED EVENTS
============================= */

// Fetch paginated public events created by a user
const getPublicCreatedEvents = async ({
    Event,
    User,
    userId,
    eventFilter,
    creator,
    pagination,
    buildEventCreatorInclude
}) => {
    const {
        limit,
        offset,
        orderField,
        orderDirection
    } = pagination;

    // Query events created by the user with applied filters and pagination
    return Event.findAndCountAll({
        where: {
            creatorId: userId,
            ...eventFilter
        },
        include: [
            buildEventCreatorInclude(User, creator)
        ],
        limit,
        offset,
        order: [[orderField, orderDirection]],
        subQuery: false
    });
};

/* =============================
   JOINED EVENTS
============================= */

// Fetch paginated public events joined by a user
const getPublicJoinedEvents = async ({
    Event,
    User,
    EventUserRole,
    EVENT_ROLES,
    Op,
    userId,
    eventFilter,
    creator,
    pagination,
    buildEventCreatorInclude
}) => {
    const {
        limit,
        offset,
        orderField,
        orderDirection
    } = pagination;

    // Query joined events through membership, applying filters and pagination
    const { count, rows } = await EventUserRole.findAndCountAll({
        where: {
            userId,
            deletedAt: null,
            role: {
                [Op.ne]: EVENT_ROLES.ORGANIZER
            }
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

    // Extract events from membership rows and return with count for pagination
    return {
        count,
        rows: rows.map((membership) => membership.event)
    };
};

module.exports = { getPublicCreatedEvents, getPublicJoinedEvents };
