const { Sequelize } = require("sequelize");

/* ==================================================
   DATABASE CONFIGURATION

   Handles:
   - Sequelize PostgreSQL connection
   - environment-specific database selection
   - optional SQL logging
   - optional SSL configuration

   Notes:
   - test environment uses DB_NAME_TEST
   - other environments use DB_NAME
   - SSL is enabled only when DB_SSL=true
================================================== */

// Use a dedicated database for automated tests
const databaseName = process.env.NODE_ENV === "test" ? process.env.DB_NAME_TEST : process.env.DB_NAME;

// Create Sequelize connection instance
const sequelize = new Sequelize(
    databaseName,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
        dialect: "postgres",

        // Enable SQL logs only when explicitly requested
        logging: process.env.DB_LOGGING === "true" ? console.log : false,

        // Enable SSL for production-like hosted databases
        ...(process.env.DB_SSL === "true"
            ? {
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    }
                }
            }
            : {})
    }
);

// Log target database outside production for debugging
if (process.env.NODE_ENV !== "production") {
    console.log(`📡 Connecting to ${(process.env.NODE_ENV || "development")} DB: ${databaseName}`);
}

module.exports = sequelize;
