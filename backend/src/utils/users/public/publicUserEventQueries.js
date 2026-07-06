const { Op } = require("sequelize");

const { EVENT_ROLES } = require("../../../constants/eventRoles");

/* ==========================================================================
   Public User Event Queries

   Executes public event queries for user profiles.

   Responsibilities
   - Fetch public events created by a user
   - Fetch public events joined by a user
   - Support pagination-compatible results

   Notes
   - Created events are queried directly from Event.
   - Joined events are queried through EventUserRole.
   - Participant count enrichment stays in the user service.
=========================================================================== */

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

const getPublicJoinedEvents = async ({
    Event,
    User,
    EventUserRole,
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

    const { count, rows } = await EventUserRole.findAndCountAll({
        where: {
            userId,
            deletedAt: null,

            // Organizer memberships are already covered by created events.
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

    return {
        count,
        rows: rows.map((membership) => membership.event)
    };
};

module.exports = { getPublicCreatedEvents, getPublicJoinedEvents };
