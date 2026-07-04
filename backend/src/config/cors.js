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

const DEFAULT_CORS_ORIGIN = "http://localhost:5173";
const CORS_ORIGIN_NOT_ALLOWED_MESSAGE = "CORS origin not allowed";

const allowedOrigins = (
    process.env.CORS_ORIGIN?.split(",") ?? [DEFAULT_CORS_ORIGIN]
).map((origin) => origin.trim());

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
