const sequelize = require("../config/database");

const User = require("./userModel");
const Event = require("./eventModel");
const EventUserRole = require("./relations/eventUserRoleModel");

/* ==================================================
   DATABASE INITIALIZATION

   Handles:
   - database connection
   - model synchronization by environment

   Notes:
   - development uses alter sync for safer schema updates
   - test environment resets database with force sync
   - production uses safe synchronization
================================================== */

// Initialize database connection and synchronize models
const initDB = async () => {
    try {
        console.log("👉 Attempting connection to the database...");
        await sequelize.authenticate();

        console.log("✅ Database connection has been established successfully!");

        console.log("👉 Synchronizing models...");

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

        console.log("✅ Database synchronized successfully!");

    } catch (error) {
        console.error("Error initializing the database:", error);
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

module.exports = { sequelize, initDB, User, Event, EventUserRole };
