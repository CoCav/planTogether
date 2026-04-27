const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// This table allows event creation by user
const Event = sequelize.define('Event', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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

    // Null means unlimited participants
    maxParticipants: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    // Null means users can join until the event starts
    registrationDeadline: {
        type: DataTypes.DATE,
        allowNull: true
    }

}, {

    tableName: "events",
    timestamps: true
});


module.exports = Event;