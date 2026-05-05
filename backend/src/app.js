const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventMembershipRoutes = require('./routes/eventMembershipRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const path = require("path");

// Serve uploaded files (avatars, event images, etc.)
// Makes files accessible via /uploads/... URL
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware to parse JSON bodies
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
    return res.json({ ok: true, name: 'PlanTogether API' });
});

// Simple root route
app.get('/', (req, res) => {
    res.send('PlanTogether is online !');
});

// Routes (API)
app.use('/api/auth', authRoutes);
app.use('/api/events', eventMembershipRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);


app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Manage errors
app.use(errorHandler);

module.exports = app;
