const app = require("./app");
const { initDB } = require("./models");

const logger = require("./config/logger");

/* ==========================================================================
   Server Entry Point

   Starts the backend application.

   Startup sequence
   - Initialize the database connection
   - Register Sequelize models and associations
   - Start the HTTP server
   - Log startup information

   Notes
   - The server starts only if database initialization succeeds.
   - Startup failures are logged with the centralized logger.
   - A startup failure exits the process with code 1.
=========================================================================== */

const DEFAULT_PORT = 3000;
const PORT = process.env.PORT || DEFAULT_PORT;

async function startServer() {
    try {
        await initDB();

        app.listen(PORT, () => {
            logger.info(`Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error({ error }, "Failed to start server");

        process.exit(1);
    }
}

startServer();
