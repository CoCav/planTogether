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

   Notes:
   - links users and events together
   - one user can only have one membership per event
   - role values should stay aligned with EVENT_ROLES constants
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

    // Prevent the same user from joining the same event twice
    indexes: [
        {
            unique: true,
            fields: ["eventId", "userId"]
        }
    ]
});

module.exports = EventUserRole;
