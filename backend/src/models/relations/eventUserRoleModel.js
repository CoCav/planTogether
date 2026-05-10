const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const { EVENT_ROLES } = require("../../constants/eventRoles");

/* ==================================================
   EVENT USER ROLE MODEL

   Handles:
   - event membership records
   - user roles inside events
   - join timestamps
   - duplicate membership prevention
   - membership lookup indexes

   Notes:
   - links users and events together
   - one user can only have one membership per event
   - role values should stay aligned with EVENT_ROLES constants
   - indexes support common membership and role queries
================================================== */

const EventUserRole = sequelize.define("EventUserRole", {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    role: {
        type: DataTypes.ENUM(EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER, EVENT_ROLES.PARTICIPANT),
        allowNull: false,
        defaultValue: EVENT_ROLES.PARTICIPANT
    },

    joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "event_user_roles",

    // Optimize common membership queries:
    // - event participant retrieval
    // - user joined events lookup
    // - organizer/co-organizer filtering
    // - participant count queries
    indexes: [
        {
            unique: true,
            fields: ["eventId", "userId"]
        },
        { fields: ["eventId"] },
        { fields: ["userId"] },
        { fields: ["role"] },
        { fields: ["eventId", "role"] },
        { fields: ["userId", "role"] }
    ]
});

module.exports = EventUserRole;
