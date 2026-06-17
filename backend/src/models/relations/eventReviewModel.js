const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

/* ==================================================
   EVENT REVIEW MODEL

   Handles:
   - event review records
   - user ratings and comments on completed events
   - duplicate review prevention
   - review lookup indexes

   Notes:
   - links users and events together
   - one user can only leave one review per event
   - reviews are created by authenticated users
   - review permissions are enforced by services/controllers
================================================== */

const EventReview = sequelize.define("EventReview", {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },

    comment: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: "event_reviews",
    timestamps: true,

    indexes: [
        // Prevent duplicate reviews per user and event
        {
            unique: true,
            fields: ["eventId", "userId"]
        },
        { fields: ["eventId"] },
        { fields: ["userId"] },
        { fields: ["createdAt"] }
    ]
});

module.exports = EventReview;
