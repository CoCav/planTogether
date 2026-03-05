const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

// Link Events and Users together
// This table allows to manage an user's participation in events
const EventUserRole = sequelize.define('EventUserRole', {

    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    
    role: {
        type: DataTypes.ENUM('organizer', 'co_organizer', 'participant'),
        allowNull: false,
        defaultValue: 'participant'
    },

    joinedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

}, {

    tableName: "event_user_roles",
    indexes : [
        {
            unique: true,
            fields: ['eventId', 'userId']
        }
    ]
});

module.exports = EventUserRole;