const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

/* ==========================================================================
   Event Review Model

   Defines event review records.

   Responsibilities
   - Store user ratings
   - Store review comments
   - Prevent duplicate reviews
   - Define review indexes

   Notes
   - One review per user and event.
=========================================================================== */

/* =============================
   EVENT REVIEW MODEL
============================= */

// Define event review fields, constraints and indexes
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
