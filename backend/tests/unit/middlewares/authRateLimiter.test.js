const express = require("express");
const request = require("supertest");

/* ==================================================
   AUTH RATE LIMITER MIDDLEWARE TESTS

   Tests:
   - rate limit enforcement
   - configurable rate limit thresholds
   - API-consistent 429 response

   Ensures:
   - repeated authentication attempts are blocked
   - environment-based configuration is respected
   - automated test suites can still skip rate limiting globally
================================================== */

describe("authRateLimiter middleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalRateLimitMax = process.env.AUTH_RATE_LIMIT_MAX;
    const originalRateLimitWindowMs = process.env.AUTH_RATE_LIMIT_WINDOW_MS;

    let app;
    let authRateLimiter;

    beforeAll(() => {
        process.env.NODE_ENV = "development";
        process.env.AUTH_RATE_LIMIT_MAX = "10";
        process.env.AUTH_RATE_LIMIT_WINDOW_MS = "900000";

        delete require.cache[
            require.resolve("../../../src/middlewares/authRateLimiter")
        ];

        authRateLimiter = require("../../../src/middlewares/authRateLimiter");
    });

    afterAll(() => {
        process.env.NODE_ENV = originalNodeEnv;
        process.env.AUTH_RATE_LIMIT_MAX = originalRateLimitMax;
        process.env.AUTH_RATE_LIMIT_WINDOW_MS = originalRateLimitWindowMs;
    });

    beforeEach(() => {
        app = express();

        app.use(express.json());

        app.post("/test-auth", authRateLimiter, (req, res) => {
            return res.status(200).json({
                success: true
            });
        });
    });

    it("should block requests after rate limit is exceeded", async () => {
        for (let i = 0; i < 10; i++) {
            const res = await request(app)
                .post("/test-auth")
                .send({
                    email: "test@test.com"
                });

            expect(res.statusCode).toBe(200);
        }

        const res = await request(app)
            .post("/test-auth")
            .send({
                email: "test@test.com"
            });

        expect(res.statusCode).toBe(429);

        expect(res.body).toMatchObject({
            success: false,
            message: "Too many authentication attempts. Please try again later."
        });
    });
});
