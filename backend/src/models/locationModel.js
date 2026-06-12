const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/* ==================================================
   LOCATION MODEL

   Handles:
   - cached location search results
   - provider result persistence
   - geocoding request deduplication
   - reusable coordinates for events and future location features

   Notes:
   - query stores the normalized user search text
   - provider allows future Mapbox/Google/Nominatim support
   - latitude and longitude are stored as decimal coordinates
================================================== */

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
        {
            unique: true,
            fields: ["query", "provider", "latitude", "longitude"]
        },
        { fields: ["query"] },
        { fields: ["provider"] }
    ]
});

module.exports = Location;
