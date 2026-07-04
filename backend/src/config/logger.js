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

const PRODUCTION_ENV = "production";
const DEFAULT_LOG_LEVEL = "info";

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
