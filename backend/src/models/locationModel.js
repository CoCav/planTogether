const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/* ==================================================
   MODEL ASSOCIATIONS

   Handles:
   - event creators
   - event participants
   - event reviews
   - event likes
   - cached location search results
   - direct membership queries

   Notes:
   - EventUserRole stores role and joinedAt
   - EventUserRole → Event uses alias "event"
   - EventReview stores user comments on completed events
   - EventLike stores user likes on events
   - Location currently stores cached geocoding results without a direct event relation
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
