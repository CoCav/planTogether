const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// This table allows event creation by user
const Event = sequelize.define('Event', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
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

    mode: {
        type: DataTypes.ENUM("online", "in_person"),
        allowNull: false,
        defaultValue: "in_person"
    },

    location: {
        type: DataTypes.STRING,
        allowNull: true
    },

    creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    type: {
        type: DataTypes.STRING,
        allowNull: true
    },

    theme: {
        type: DataTypes.STRING,
        allowNull: true
    }

}, {

    tableName: "events",
    timestamps: true
});


module.exports = Event;