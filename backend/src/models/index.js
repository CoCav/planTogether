const sequelize = require("../config/database");
const logger = require("../config/logger");

const User = require("./userModel");
const Event = require("./eventModel");
const Location = require("./locationModel");

const EventUserRole = require("./associations/eventUserRoleModel");
const EventReview = require("./associations/eventReviewModel");
const EventLike = require("./associations/eventLikeModel");

/* ==========================================================================
   Database Initialization

   Initializes the Sequelize connection and model associations.

   Responsibilities
   - Authenticate the database connection
   - Synchronize models
   - Register model associations
   - Log initialization progress

   Notes
   - Development uses alter synchronization.
   - Tests recreate the schema.
   - Production uses safe synchronization.
=========================================================================== */

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

/* ==========================================================================
   Model Associations

   Registers relationships between database models.

   Responsibilities
   - Creator relationships
   - Membership relationships
   - Review relationships
   - Like relationships

   Notes
   - Associations are centralized here.
=========================================================================== */

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
   EVENT MEMBERSHIP RELATIONSHIPS
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
