const sequelize = require('../config/database');
const User = require('./userModel');
const Event = require('./eventModel');
const EventUserRole = require('./relations/eventUserRoleModel');

/* ==================================================
   DATABASE MODELS INITIALIZATION

   Handles:
   - database connection
   - model synchronization (dev / test / prod)
   - model associations (User / Event / EventUserRole)

   Notes:
   - test environment uses force sync
   - development uses alter sync
   - production uses safe sync
================================================== */

/* ==================================================
   DATABASE INITIALIZATION
================================================== */

// Initialize database connection and sync models
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

/* ==================================================
   MODEL RELATIONSHIPS

   Defines relationships between:
   - Users
   - Events
   - Event memberships (EventUserRole)

   Handles:
   - event creation (creator)
   - event participation (participants)
   - membership roles (organizer / participant / co-organizer)
================================================== */

// =============================
// Creator relationship
// =============================

// A user can create multiple events
User.hasMany(Event, { foreignKey: 'creatorId' });

// An event belongs to a creator
Event.belongsTo(User, { foreignKey: 'creatorId', as: 'creator' });


// =============================
// Many-to-many participation
// =============================

// Users can join many events
User.belongsToMany(Event, {
    through: {
        model: EventUserRole,
        attributes: ['role', 'joinedAt']
    },
    foreignKey: 'userId',
    otherKey: 'eventId',
    as: 'events'
});

// Events can have many participants
Event.belongsToMany(User, {
    through: {
        model: EventUserRole,
        attributes: ['role', 'joinedAt']
    },
    foreignKey: 'eventId',
    otherKey: 'userId',
    as: 'participants'
});


// =============================
// Membership relationships
// =============================

// Membership belongs to a user
EventUserRole.belongsTo(User, { foreignKey: 'userId' });

/*
⚠ TEMPORARY FIX (important)

We define TWO associations to Event:

1. Default association (no alias)
   → required by existing services/tests using `membership.Event`

2. Aliased association ("event")
   → required by new userService (public profile/events)

TODO (after tests refactor):
👉 keep ONLY:
   EventUserRole.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

👉 and update all services/tests to use `.event` instead of `.Event`
*/

// Default alias (used by existing code/tests)
EventUserRole.belongsTo(Event, { foreignKey: 'eventId' });

// Explicit alias (used by new user features)
EventUserRole.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });


// =============================
// One-to-many access
// =============================

// User → memberships
User.hasMany(EventUserRole, { foreignKey: 'userId' });

// Event → memberships
Event.hasMany(EventUserRole, { foreignKey: 'eventId' });

module.exports = { sequelize, initDB, User, Event, EventUserRole };
