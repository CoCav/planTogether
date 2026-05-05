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
            await sequelize.sync({ alter: true }); // Safe schema update in dev
        } else if (process.env.NODE_ENV === 'test') {
            await sequelize.sync({ force: true }); // Reset DB for clean tests
        } else {
            await sequelize.sync(); // Production-safe sync (no destructive changes)
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
   - membership roles and joined dates
================================================== */

/* =============================
    Creator relationships
============================= */

// A user can create multiple events
User.hasMany(Event, { foreignKey: 'creatorId' });

// Each event has one creator (aliased as "creator")
Event.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });


/* =============================
    Participation relationships
============================= */

// A user can participate in many events via EventUserRole
User.belongsToMany(Event, {
    through: {
        model: EventUserRole,
        attributes: ['role', 'joinedAt']
    },
    foreignKey: 'userId',
    otherKey: 'eventId',
    as: 'events' // Alias used when including events from a user
});

// An event can have many participants (users)
Event.belongsToMany(User, {
    through: {
        model: EventUserRole,
        attributes: ['role', 'joinedAt']
    },
    foreignKey: 'eventId',
    otherKey: 'userId',
    as: 'participants' // Alias used when including users from an event
});


/* =============================
    Direct membership relationships
============================= */

// Each membership belongs to one user
EventUserRole.belongsTo(User, { foreignKey: 'userId' });

// Each membership belongs to one event (alias = "event")
EventUserRole.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

// A user has many membership roles
User.hasMany(EventUserRole, { foreignKey: 'userId' });

// An event has many membership roles
Event.hasMany(EventUserRole, { foreignKey: 'eventId' });

module.exports = { sequelize, initDB, User, Event, EventUserRole };
