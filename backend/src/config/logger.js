const pino = require("pino");

/* ==========================================================================
   Logger Configuration

   Configures centralized application logging.

   Responsibilities
   - Create the shared application logger
   - Use readable logs outside production
   - Use structured logs in production
   - Support environment-based log level overrides

   Notes
   - pino-pretty is used outside production.
   - LOG_LEVEL can override the default log level.
=========================================================================== */

/* =============================
   DEFAULT VALUES
============================= */

// Production environment identifier
const PRODUCTION_ENV = "production";

// Default application log level
const DEFAULT_LOG_LEVEL = "info";

/* =============================
   LOGGER CONFIGURATION
============================= */

// Determines whether pretty logs should be disabled
const isProduction = process.env.NODE_ENV === PRODUCTION_ENV;

const logger = pino({
    level: process.env.LOG_LEVEL || DEFAULT_LOG_LEVEL,

    ...(isProduction ? {} : {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname"
            }
        }
    })
});

module.exports = logger;
