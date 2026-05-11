const app = require("./app");
const { initDB } = require("./models");

/* ==================================================
   SERVER ENTRY POINT

   Handles:
   - environment initialization
   - database initialization
   - HTTP server startup

   Notes:
   - server starts only if database initialization succeeds
================================================== */

const PORT = process.env.PORT || 3000;

// Start Express server
async function startServer() {
    try {
        // Initialize database connection and models
        await initDB();

        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Failed to start server:", error);

        // Exit process if startup fails
        process.exit(1);
    }
}

startServer();
