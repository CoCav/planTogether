const sequelize = require('../config/database');
const User = require('./userModel');
const Event = require('./eventModel');
const EventUserRole = require('./relations/eventUserRoleModel');

/* ==================================================
   DATABASE INITIALIZATION

   Handles:
   - database connection
   - model synchronization by environment
================================================== */

// Initialize database connection and synchronize models
const initDB = async () => {
    try {
        console.log('👉 Attempting connection to the database..');
        await sequelize.authenticate(); // Test DB connection
        console.log('✅ Database connection has been established successfully !');

        console.log('👉 Synchronizing models...');

        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true }); // Safely update schema in dev
        } else if (process.env.NODE_ENV === 'test') {
            await sequelize.sync({ force: true }); // Reset DB for clean tests
        } else {
            await sequelize.sync(); // Production-safe sync
        }

        console.log('✅ Database synchronized successfully !');

    } catch (error) {
        console.error('Error initializing the database:', error);
        throw error;
    }
};

/* ==================================================
   MODEL ASSOCIATIONS

   Handles:
   - event creators
   - event participants
   - direct membership queries

   Notes:
   - EventUserRole stores role and joinedAt
   - EventUserRole → Event uses alias "event"
================================================== */

/* =============================
   Creator relationships
============================= */

// A user can create multiple events
User.hasMany(Event, { foreignKey: 'creatorId' });

// Each event has one creator
Event.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });


/* =============================
   Participation relationships
============================= */

// A user can participate in many events through EventUserRole
User.belongsToMany(Event, {
    through: {
        model: EventUserRole,
        attributes: ['role', 'joinedAt']
    },
    foreignKey: 'userId',
    otherKey: 'eventId',
    as: 'events'
});

// An event can have many participants through EventUserRole
Event.belongsToMany(User, {
    through: {
        model: EventUserRole,
        attributes: ['role', 'joinedAt']
    },
    foreignKey: 'eventId',
    otherKey: 'userId',
    as: 'participants'
});


/* =============================
   Direct membership relationships
============================= */

// Each membership belongs to one user
EventUserRole.belongsTo(User, { foreignKey: 'userId' });

// Each membership belongs to one event
EventUserRole.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// A user can belong to multiple events (via memberships)
User.hasMany(EventUserRole, { foreignKey: 'userId' });

// An event can have multiple participants (via memberships
Event.hasMany(EventUserRole, { foreignKey: 'eventId' });

module.exports = { sequelize, initDB, User, Event, EventUserRole };
