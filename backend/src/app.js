const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// Load environment variables for application configuration.
require("dotenv").config();

const path = require("path");

const corsOptions = require("./config/cors");
const errorHandler = require("./middlewares/errors/errorHandler");

const authRoutes = require("./routes/authRoutes");
const locationRoutes = require("./routes/locationRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventMembershipRoutes = require("./routes/eventMembershipRoutes");
const userRoutes = require("./routes/userRoutes");
const eventReviewRoutes = require("./routes/eventReviewRoutes");
const eventLikeRoutes = require("./routes/eventLikeRoutes");

/* ==========================================================================
   Express Application

   Builds and configures the Express application.

   Responsibilities
   - Register global middlewares
   - Configure security
   - Parse incoming request bodies
   - Expose uploaded files
   - Register API routes
   - Handle unknown routes
   - Register the global error handler

   Notes
   - The HTTP server is started in server.js.
   - Database initialization is handled in server.js.
   - The global error handler must always be registered last.
=========================================================================== */

const app = express();

const helmetOptions = {
    // Allows uploaded avatars and event images to be displayed by the frontend.
    crossOriginResourcePolicy: false
};

/* Global middlewares */

app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Static files */

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* Health routes */

app.get("/api/health", (req, res) => {
    return res.json({
        ok: true,
        success: true,
        name: "PlanTogether API"
    });
});

app.get("/", (req, res) => {
    res.send("PlanTogether is online!");
});

/* API routes */

app.use("/api/auth", authRoutes);

app.use("/api/locations", locationRoutes);

app.use("/api/events", eventMembershipRoutes);
app.use("/api/events", eventReviewRoutes);
app.use("/api/events", eventLikeRoutes);
app.use("/api/events", eventRoutes);

app.use("/api/users", userRoutes);

/* Fallback handlers */

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

app.use(errorHandler);

module.exports = app;
