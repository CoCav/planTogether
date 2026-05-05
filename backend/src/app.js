const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require("path");

const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventMembershipRoutes = require('./routes/eventMembershipRoutes');
const userRoutes = require('./routes/userRoutes');

/* ==================================================
   EXPRESS APPLICATION SETUP

   Handles:
   - Express app initialization
   - global middlewares
   - static uploads access
   - API route registration
   - fallback 404 handling
   - global error handling

   Notes:
   - uploaded files are exposed through /uploads
   - CORS origins are configurable via environment variables
================================================== */

const app = express();

/* =============================
   STATIC FILES
============================= */

// Serve uploaded files publicly
// Example: /uploads/avatars/avatar-123.png
app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"))
);


/* =============================
   GLOBAL MIDDLEWARES
============================= */

// Configure CORS for frontend access
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',')
        ?? ['http://localhost:5173'],
    credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));


/* =============================
   HEALTH / ROOT ROUTES
============================= */

// Health check endpoint
app.get('/api/health', (req, res) => {
    return res.json({
        ok: true,
        name: 'PlanTogether API'
    });
});

// Root API message
app.get('/', (req, res) => {
    res.send('PlanTogether is online !');
});


/* =============================
   API ROUTES
============================= */

// Authentication routes
app.use('/api/auth', authRoutes);

// Event membership routes
app.use('/api/events', eventMembershipRoutes);

// Event CRUD routes
app.use('/api/events', eventRoutes);

// Public user routes
app.use('/api/users', userRoutes);


/* =============================
   FALLBACK HANDLERS
============================= */

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
