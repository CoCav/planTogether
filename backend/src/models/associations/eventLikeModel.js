const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

/* ==========================================================================
   Event Like Model

   Defines event like records.

   Responsibilities
   - Store event likes
   - Prevent duplicate likes
   - Define like indexes

   Notes
   - One like per user and event.
=========================================================================== */

const EventLike = sequelize.define("EventLike", {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "event_likes",
    timestamps: true,

    indexes: [
        // Prevent duplicate likes per user and event
        {
            unique: true,
            fields: ["eventId", "userId"]
        },
        { fields: ["eventId"] },
        { fields: ["userId"] },
        { fields: ["createdAt"] }
    ]
});

module.exports = EventLike;
