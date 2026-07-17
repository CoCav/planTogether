/* ==========================================================================
   CORS Configuration

   Configures which frontend origins can access the API.

   Responsibilities
   - Read allowed origins from environment variables
   - Support multiple comma-separated origins
   - Allow non-browser requests without an origin
   - Enable credential-based requests

   Notes
   - CORS_ORIGIN accepts comma-separated origins.
   - Requests without origin are allowed for tools and tests like Postman or Supertest.
   - Local development defaults to the Vite dev server.
=========================================================================== */

/* =============================
   DEFAULT VALUES
============================= */

// Default frontend origin used during local development
const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

// Error returned when an origin is not allowed
const CORS_ORIGIN_NOT_ALLOWED_MESSAGE = "CORS origin not allowed";

/* =============================
   ALLOWED ORIGINS
============================= */

// Allowed frontend origins parsed from the environment
const allowedOrigins = (
    process.env.CORS_ORIGIN?.split(",") ?? [DEFAULT_CORS_ORIGIN]
).map((origin) => origin.trim());

/* =============================
   CORS OPTIONS
============================= */

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(CORS_ORIGIN_NOT_ALLOWED_MESSAGE));
    },

    credentials: true
};

module.exports = corsOptions;
