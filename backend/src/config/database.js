const { Sequelize } = require("sequelize");

const logger = require("./logger");

/* ==========================================================================
   Database Configuration

   Creates the Sequelize PostgreSQL connection.

   Responsibilities
   - Select the correct database for the current environment
   - Configure the PostgreSQL connection
   - Configure optional SSL support
   - Disable SQL logging by default

   Notes
   - Test environment uses DB_NAME_TEST.
   - Other environments use DB_NAME.
   - SSL is enabled only when DB_SSL=true.
=========================================================================== */

const TEST_ENV = "test";
const PRODUCTION_ENV = "production";
const POSTGRES_DIALECT = "postgres";
const DEFAULT_DB_PORT = 5432;

const isTest = process.env.NODE_ENV === TEST_ENV;
const isProduction = process.env.NODE_ENV === PRODUCTION_ENV;
const isSslEnabled = process.env.DB_SSL === "true";

const databaseName = isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME;

const sequelize = new Sequelize(
    databaseName,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : DEFAULT_DB_PORT,
        dialect: POSTGRES_DIALECT,
        logging: false,

        ...(isSslEnabled
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

if (!isProduction) {
    logger.info(`Connecting to development database: ${databaseName}`);
}

module.exports = sequelize;
