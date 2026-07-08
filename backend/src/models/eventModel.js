const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const { EVENT_MODES } = require("../constants/eventModes");

/* ==========================================================================
   Event Model

   Defines the event database model.

   Responsibilities
   - Store event metadata
   - Store scheduling information
   - Store participant limits
   - Store physical location data
   - Store structured address fields
   - Define event indexes

   Notes
   - Associations are defined in models/index.js.
   - Online events should keep location fields null.
   - Null maxParticipants means unlimited capacity.
=========================================================================== */

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
        type: DataTypes.ENUM(EVENT_MODES.ONLINE, EVENT_MODES.IN_PERSON),
        allowNull: false,
        defaultValue: EVENT_MODES.IN_PERSON
    },

    location: {
        type: DataTypes.STRING,
        allowNull: true
    },

    locationLabel: {
        type: DataTypes.STRING,
        allowNull: true
    },

    streetAddress: {
        type: DataTypes.STRING,
        allowNull: true
    },

    city: {
        type: DataTypes.STRING,
        allowNull: true
    },

    region: {
        type: DataTypes.STRING,
        allowNull: true
    },

    postalCode: {
        type: DataTypes.STRING,
        allowNull: true
    },

    country: {
        type: DataTypes.STRING,
        allowNull: true
    },

    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },

    longitude: {
        type: DataTypes.DOUBLE,
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
    // - future map/geolocation filtering
    indexes: [
        { fields: ["creatorId"] },
        { fields: ["startDateTime"] },
        { fields: ["endDateTime"] },
        { fields: ["mode"] },
        { fields: ["type"] },
        { fields: ["theme"] },
        { fields: ["location"] },
        { fields: ["locationLabel"] },
        { fields: ["city"] },
        { fields: ["region"] },
        { fields: ["country"] },
        { fields: ["latitude", "longitude"] }
    ]
});

module.exports = Event;
