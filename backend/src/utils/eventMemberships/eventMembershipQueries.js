/* ==========================================================================
   Event Membership Queries

   Provides reusable event membership database query helpers.

   Responsibilities
   - Find active event memberships
   - Find event memberships including soft-deleted rows

   Notes
   - The EventUserRole model is injected to keep helpers reusable.
   - Additional Sequelize options can be passed through the options parameter.
=========================================================================== */

const findActiveMembership = (
    EventUserRole,
    { eventId, userId, transaction } = {}
) => {
    return EventUserRole.findOne({
        where: {
            eventId,
            userId,
            deletedAt: null
        },
        transaction
    });
};

const findMembership = (
    EventUserRole,
    { eventId, userId, transaction } = {}
) => {
    return EventUserRole.findOne({
        where: {
            eventId,
            userId
        },
        transaction
    });
};

module.exports = {
    findActiveMembership,
    findMembership
};
