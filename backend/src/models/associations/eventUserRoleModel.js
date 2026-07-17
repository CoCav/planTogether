const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const { EVENT_ROLES, VALID_EVENT_ROLES } = require("../../constants/eventRoles");

/* ==========================================================================
   Event User Role Model

   Defines event membership records.

   Responsibilities
   - Store user memberships
   - Store participant roles
   - Track join dates
   - Support soft-deleted memberships
   - Define membership indexes

   Notes
   - One membership per user and event.
   - deletedAt marks inactive memberships.
=========================================================================== */

/* =============================
   EVENT MEMBERSHIP MODEL
============================= */

// Define event membership fields, roles and indexes
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
        type: DataTypes.ENUM(...VALID_EVENT_ROLES),
        allowNull: false,
        defaultValue: EVENT_ROLES.PARTICIPANT
    },

    joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
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
