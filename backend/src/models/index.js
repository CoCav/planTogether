const sequelize = require('../config/database');
const User = require('./userModel');
const Event = require('./eventModel');
const EventUserRole = require('./Link/eventUserRoleModel');

const initDB = async () => {
    try {
        console.log('👉 Attempting connection to the database..');
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully !');

        console.log('👉 Synchronizing models...');

        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
        } else if (process.env.NODE_ENV === 'test') {
            await sequelize.sync({ force: true });
        } else {
            await sequelize.sync();
        }

        console.log('✅ Database synchronized successfully !');

    } catch (error) {
        console.error('Error initializing the database:', error);
        throw error;
    }
};
// Relationships
// A user can create multiple events
// An event belongs to a user (the creator)
User.hasMany(Event, { foreignKey: 'creatorId' });
Event.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });

// Users can join many events, events can have many users
// EventUserRole is the join table storing role + joinedAt
User.belongsToMany(Event, 
    { through: {
            model : EventUserRole, 
            attributes : ['role', 'joinedAt']
    },
    foreignKey: 'userId',
    otherKey: 'eventId',
    as: 'events'

});

Event.belongsToMany(User,
    {through : { 
            model : EventUserRole, 
            attributes : ['role', 'joinedAt']
        },
    foreignKey: 'eventId',
    otherKey: 'userId',
    as: 'participants'
});

// EventUserRole acts as a join entity between Users and Events and stores role-related data
EventUserRole.belongsTo(User, { foreignKey: 'userId' });
EventUserRole.belongsTo(Event, { foreignKey: 'eventId' });


// One-to-many access to join rows (useful for querying memberships directly)
User.hasMany(EventUserRole, { foreignKey: 'userId' });
Event.hasMany(EventUserRole, { foreignKey: 'eventId' });

module.exports = { sequelize, initDB, User, Event, EventUserRole };