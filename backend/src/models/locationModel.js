const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/* ==========================================================================
   Location Model

   Defines cached geocoding locations.

   Responsibilities
   - Store cached provider results
   - Store structured address fields
   - Store geographic coordinates
   - Define cache lookup indexes

   Notes
   - Used as a geocoding cache.
   - Does not represent an event location directly.
=========================================================================== */

/* =============================
   LOCATION CACHE MODEL
============================= */

// Define cached geocoding results and lookup indexes
const Location = sequelize.define("Location", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    query: {
        type: DataTypes.STRING,
        allowNull: false
    },

    label: {
        type: DataTypes.STRING,
        allowNull: false
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
        allowNull: false
    },

    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },

    provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "nominatim"
    }
}, {
    tableName: "locations",
    timestamps: true,

    indexes: [
        // Prevent duplicate provider results for the same resolved location
        {
            unique: true,
            fields: ["query", "provider", "latitude", "longitude"]
        },
        { fields: ["query"] },
        { fields: ["provider"] },
        { fields: ["city"] },
        { fields: ["region"] },
        { fields: ["country"] }
    ]
});

module.exports = Location;
