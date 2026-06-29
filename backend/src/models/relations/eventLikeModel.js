const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

/* ==================================================
   EVENT LIKE MODEL

   Handles:
   - event like records
   - user likes on events
   - duplicate like prevention
   - like lookup indexes

   Notes:
   - links users and events together
   - one user can only like one event once
   - likes are created by authenticated users
   - like permissions are enforced by services/controllers
================================================== */

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
