const {
    initDB: initializeDatabase,
    sequelize,
    User,
    Event,
    Location,
    EventUserRole,
    EventReview,
    EventLike
} = require("../../../src/models");

/* ==========================================================================
   Database Test Helper

   Builds reusable database lifecycle helpers.

   Responsibilities
   - Initialize the test database
   - Reset database data
   - Close the database connection

   Notes
   - Shared across integration tests.
   - Cleanup order respects model relationships.
=========================================================================== */

const initializeTestDatabase = async () => {
    await initializeDatabase();
};

const resetTestDatabase = async () => {
    await EventLike.destroy({ where: {} });
    await EventReview.destroy({ where: {} });
    await EventUserRole.destroy({ where: {} });

    await Event.destroy({ where: {} });
    await Location.destroy({ where: {} });
    await User.destroy({ where: {} });
};

const closeTestDatabase = async () => {
    await sequelize.close();
};

module.exports = {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
};
