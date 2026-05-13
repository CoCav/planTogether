const pino = require("pino");

/* ==================================================
   LOGGER CONFIGURATION

   Handles:
   - centralized application logging
   - environment-based log formatting
   - readable development logs
   - structured production logs

   Notes:
   - uses pino-pretty outside production
   - LOG_LEVEL can override the default log level
================================================== */

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",

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
