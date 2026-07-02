const sequelize = require("../config/database");
const logger = require("../config/logger");

const User = require("./userModel");
const Event = require("./eventModel");
const Location = require("./locationModel");

const EventUserRole = require("./relations/eventUserRoleModel");
const EventReview = require("./relations/eventReviewModel");
const EventLike = require("./relations/eventLikeModel");

/* ==================================================
   DATABASE INITIALIZATION

   Handles:
   - database connection
   - model synchronization by environment
   - centralized database initialization logging

   Notes:
   - development uses alter sync for safer schema updates
   - test environment resets database with force sync
   - production uses safe synchronization
   - initialization logs use centralized structured logging
================================================== */

// Initialize database connection and synchronize models
const initDB = async () => {
    try {
        logger.info("Connecting to database...");
        await sequelize.authenticate();

        logger.info("Database connection established.");

        logger.info("Synchronizing database models...");

        if (process.env.NODE_ENV === "development") {
            // Safely update schema during development
            await sequelize.sync({ alter: true });

        } else if (process.env.NODE_ENV === "test") {
            // Reset database for isolated test runs
            await sequelize.sync({ force: true });

        } else {
            // Production-safe synchronization
            await sequelize.sync();
        }

        logger.info("Database synchronized.");

    } catch (error) {
        logger.error({ error }, "Error initializing the database");
        throw error;
    }
};

/* ==================================================
   MODEL ASSOCIATIONS

   Handles:
   - event creators
   - event participants
   - event reviews
   - event likes
   - direct membership queries

   Notes:
   - EventUserRole stores role and joinedAt
   - EventUserRole → Event uses alias "event"
   - EventReview stores user comments on completed events
   - EventLike stores user likes on events
================================================== */

/* =============================
   CREATOR RELATIONSHIPS
============================= */

// A user can create multiple events
User.hasMany(Event, { foreignKey: "creatorId" });

// Each event has one creator
Event.belongsTo(User, { foreignKey: "creatorId", as: "creator" });


/* =============================
   PARTICIPATION RELATIONSHIPS
============================= */

// A user can participate in many events through EventUserRole
User.belongsToMany(Event, {
    through: {
        model: EventUserRole,
        attributes: ["role", "joinedAt"]
    },
    foreignKey: "userId",
    otherKey: "eventId",
    as: "events"
});

// An event can have many participants through EventUserRole
Event.belongsToMany(User, {
    through: {
        model: EventUserRole,
        attributes: ["role", "joinedAt"]
    },
    foreignKey: "eventId",
    otherKey: "userId",
    as: "participants"
});


/* =============================
   REVIEW RELATIONSHIPS
============================= */

// A user can leave multiple event reviews
User.hasMany(EventReview, { foreignKey: "userId", as: "reviews" });

// Each review belongs to one user
EventReview.belongsTo(User, { foreignKey: "userId", as: "user" });

// An event can have multiple reviews
Event.hasMany(EventReview, { foreignKey: "eventId", as: "reviews" });

// Each review belongs to one event
EventReview.belongsTo(Event, { foreignKey: "eventId", as: "event" });


/* =============================
   LIKE RELATIONSHIPS
============================= */

// A user can like multiple events
User.hasMany(EventLike, { foreignKey: "userId", as: "likes" });

// Each like belongs to one user
EventLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// An event can have multiple likes
Event.hasMany(EventLike, { foreignKey: "eventId", as: "likes" });

// Each like belongs to one event
EventLike.belongsTo(Event, { foreignKey: "eventId", as: "event" });


/* =============================
   DIRECT MEMBERSHIP RELATIONSHIPS
============================= */

// Each membership belongs to one user
EventUserRole.belongsTo(User, { foreignKey: "userId" });

// Each membership belongs to one event
EventUserRole.belongsTo(Event, { foreignKey: "eventId", as: "event" });

// A user can belong to multiple events via memberships
User.hasMany(EventUserRole, { foreignKey: "userId" });

// An event can have multiple memberships
Event.hasMany(EventUserRole, { foreignKey: "eventId" });

module.exports = {
    sequelize,
    initDB,
    User,
    Event,
    Location,
    EventUserRole,
    EventReview,
    EventLike
};
