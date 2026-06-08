const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// Load environment variables for app config and tests
require("dotenv").config();

const path = require("path");

const corsOptions = require("./config/cors");

const errorHandler = require("./middlewares/errors/errorHandler");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventMembershipRoutes = require("./routes/eventMembershipRoutes");
const userRoutes = require("./routes/userRoutes");

/* ==================================================
   EXPRESS APPLICATION SETUP

   Handles:
   - Express app initialization
   - security middlewares
   - global middlewares
   - static uploads access
   - API route registration
   - fallback 404 handling
   - global error handling

   Notes:
   - uploaded files are exposed through /uploads
   - CORS origins are configurable via environment variables
   - Helmet adds common HTTP security protections
================================================== */

const app = express();

/* =============================
   GLOBAL MIDDLEWARES
============================= */

// Add common security-related HTTP headers
// Disable cross-origin resource policy to allow frontend access to uploaded files
app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);

// Configure CORS for frontend access
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));


/* =============================
   STATIC FILES
============================= */

// Serve uploaded files publicly
// Example: /uploads/avatars/avatar-123.png
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


/* =============================
   HEALTH / ROOT ROUTES
============================= */

// Health check endpoint
app.get("/api/health", (req, res) => {
    return res.json({
        ok: true,
        success: true,
        name: "PlanTogether API"
    });
});

// Root API message
app.get("/", (req, res) => {
    res.send("PlanTogether is online !");
});


/* =============================
   API ROUTES
============================= */

// Authentication routes
app.use("/api/auth", authRoutes);

// Event membership routes
app.use("/api/events", eventMembershipRoutes);

// Event CRUD routes
app.use("/api/events", eventRoutes);

// Public user routes
app.use("/api/users", userRoutes);


/* =============================
   FALLBACK HANDLERS
============================= */

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
