const app = require("./app");
const { initDB } = require("./models");

const logger = require("./config/logger");

/* ==================================================
   SERVER ENTRY POINT

   Handles:
   - environment initialization
   - database initialization
   - HTTP server startup
   - centralized startup logging

   Notes:
   - server starts only if database initialization succeeds
   - startup errors use centralized structured logging
================================================== */

const PORT = process.env.PORT || 3000;

// Start Express server
async function startServer() {
    try {
        // Initialize database connection and models
        await initDB();

        // Start HTTP server
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        logger.error({ error }, "❌ Failed to start server");

        // Exit process if startup fails
        process.exit(1);
    }
}

startServer();
