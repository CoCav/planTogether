const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/* ==================================================
   EVENT MODEL

   Handles:
   - event data structure
   - creator reference
   - event schedule
   - participant limits
   - event image path
   - query indexes for filtering and sorting

   Notes:
   - creator relationship is defined in models/index.js
   - null maxParticipants means unlimited participants
   - null registrationDeadline means users can join until event starts
================================================== */

const Event = sequelize.define("Event", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    type: {
        type: DataTypes.STRING,
        allowNull: false
    },

    theme: {
        type: DataTypes.STRING,
        allowNull: false
    },

    mode: {
        type: DataTypes.ENUM("online", "in_person"),
        allowNull: false,
        defaultValue: "in_person"
    },

    location: {
        type: DataTypes.STRING,
        allowNull: true
    },

    startDateTime: {
        type: DataTypes.DATE,
        allowNull: false
    },

    endDateTime: {
        type: DataTypes.DATE,
        allowNull: false
    },

    maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    registrationDeadline: {
        type: DataTypes.DATE,
        allowNull: true
    },

    image: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: "events",
    timestamps: true,

    // Optimize common event queries:
    // - creator profile pages
    // - upcoming/past event filtering
    // - event listing pagination/sorting
    // - mode/type/theme filtering
    indexes: [
        { fields: ["creatorId"] },
        { fields: ["startDateTime"] },
        { fields: ["endDateTime"] },
        { fields: ["mode"] },
        { fields: ["type"] },
        { fields: ["theme"] }
    ]
});

module.exports = Event;
