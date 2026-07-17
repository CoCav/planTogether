const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// Load environment variables for application configuration
require("dotenv").config();

const path = require("path");

const corsOptions = require("./config/cors");
const errorHandler = require("./middlewares/errors/errorHandler");

const authRoutes = require("./routes/authRoutes");

const eventLikeRoutes = require("./routes/eventLikeRoutes");
const eventMembershipRoutes = require("./routes/eventMembershipRoutes");
const eventReviewRoutes = require("./routes/eventReviewRoutes");
const eventRoutes = require("./routes/eventRoutes");

const geocodingRoutes = require("./routes/geocodingRoutes");

const userRoutes = require("./routes/userRoutes");

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

/* =============================
   APPLICATION INSTANCE
============================= */

// Create the Express application
const app = express();

/* =============================
   SECURITY CONFIGURATION
============================= */

const helmetOptions = {
    // Allow uploaded avatars and event images to be displayed by the frontend
    crossOriginResourcePolicy: false
};

/* =============================
   GLOBAL MIDDLEWARES
============================= */

app.use(helmet(helmetOptions));
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

/* =============================
   STATIC FILES
============================= */

app.use("/uploads", express.static(
    path.join(__dirname, "../uploads")
));

/* =============================
   SYSTEM ROUTES
============================= */

app.get("/api/health", (req, res) => {
    return res.json({
        ok: true,
        success: true,
        name: "PlanTogether API"
    });
});

app.get("/", (req, res) => {
    return res.send("PlanTogether is online!");
});

/* =============================
   API ROUTES
============================= */

app.use("/api/auth", authRoutes);

app.use("/api/events", eventMembershipRoutes);
app.use("/api/events", eventReviewRoutes);
app.use("/api/events", eventLikeRoutes);
app.use("/api/events", eventRoutes);

app.use("/api/locations", geocodingRoutes);

app.use("/api/users", userRoutes);

/* =============================
   FALLBACK HANDLERS
============================= */

// Return a consistent response for unknown routes
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Register the global error handler last
app.use(errorHandler);

module.exports = app;
