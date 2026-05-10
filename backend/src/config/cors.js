/* ==================================================
   CORS CONFIGURATION

   Handles:
   - allowed frontend origins
   - credentials support
   - non-browser requests without origin

   Notes:
   - CORS_ORIGIN accepts comma-separated origins
   - requests without origin are allowed for tools/tests like Postman or Supertest
   - defaults to Vite dev server in local development
================================================== */

const allowedOrigins = (
    process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5173"]
).map((origin) => origin.trim());

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("CORS origin not allowed"));
    },

    credentials: true
};

module.exports = corsOptions;
