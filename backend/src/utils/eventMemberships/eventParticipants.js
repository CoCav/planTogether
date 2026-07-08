const { Op } = require("sequelize");

const { EVENT_ROLES } = require("../../constants/eventRoles");

/* ==========================================================================
   Event Participant Utilities

   Builds participant includes and participant count helpers.

   Responsibilities
   - Build active participant includes
   - Build participant count attributes
   - Count active participants for one event
   - Count active participants for multiple events

   Notes
   - Active participant counts exclude soft-deleted memberships.
   - Participant count attributes use COUNT DISTINCT to avoid duplicate counts.
=========================================================================== */

const PARTICIPANT_COUNT_ALIAS = "participantCount";

const buildActiveParticipantInclude = (User) => ({
    model: User,
    as: "participants",
    attributes: [],
    through: {
        attributes: [],
        where: {
            role: EVENT_ROLES.PARTICIPANT,
            deletedAt: null
        }
    },
    required: false
});

const buildEventParticipantCountAttribute = (sequelize, participantIdPath) => ([
    sequelize.fn(
        "COUNT",
        sequelize.fn(
            "DISTINCT",
            sequelize.col(participantIdPath)
        )
    ),
    PARTICIPANT_COUNT_ALIAS
]);

const countActiveParticipants = async (
    EventUserRole,
    { eventId, transaction } = {}
) => {
    return EventUserRole.count({
        where: {
            eventId,
            role: EVENT_ROLES.PARTICIPANT,
            deletedAt: null
        },
        transaction
    });
};

const countActiveParticipantsByEventIds = async (
    EventUserRole,
    sequelize,
    eventIds
) => {
    if (!eventIds.length) {
        return {};
    }

    const participantCounts = await EventUserRole.findAll({
        attributes: [
            "eventId",
            [
                sequelize.fn("COUNT", sequelize.col("eventId")),
                PARTICIPANT_COUNT_ALIAS
            ]
        ],
        where: {
            eventId: {
                [Op.in]: eventIds
            },
            role: EVENT_ROLES.PARTICIPANT,
            deletedAt: null
        },
        group: ["eventId"],
        raw: true
    });

    return participantCounts.reduce((acc, item) => {
        acc[item.eventId] = Number(item[PARTICIPANT_COUNT_ALIAS]);
        return acc;
    }, {});
};

module.exports = {
    buildActiveParticipantInclude,
    buildEventParticipantCountAttribute,
    countActiveParticipants,
    countActiveParticipantsByEventIds
};
