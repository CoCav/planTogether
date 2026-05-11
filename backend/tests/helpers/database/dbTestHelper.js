/* ==================================================
   DATABASE TEST HELPERS

   Handles:
   - test database initialization
   - test database cleanup
   - test database connection closing

   Notes:
   - shared across integration tests
   - cleanup order respects model relations
   - keeps integration test lifecycle consistent
================================================== */

const {
    initDB: initializeDB,
    sequelize,
    User,
    Event,
    EventUserRole
} = require("../../../src/models");

// Initialize test database
const initDB = async () => {
    await initializeDB();
};

// Reset test database between tests
const resetDB = async () => {
    await EventUserRole.destroy({ where: {} });
    await Event.destroy({ where: {} });
    await User.destroy({ where: {} });
};

// Close test database connection
const closeDB = async () => {
    await sequelize.close();
};

module.exports = { initDB, resetDB, closeDB };
