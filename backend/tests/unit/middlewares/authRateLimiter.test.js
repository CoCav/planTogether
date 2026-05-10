const express = require("express");
const request = require("supertest");

const authRateLimiter = require("../../../src/middlewares/authRateLimiter");

/* ==================================================
   AUTH RATE LIMITER MIDDLEWARE TESTS

   Tests:
   - rate limit enforcement
   - API-consistent 429 response

   Ensures:
   - repeated authentication attempts are blocked
   - automated test suites can still skip rate limiting globally
================================================== */

describe("authRateLimiter middleware", () => {
    const originalNodeEnv = process.env.NODE_ENV;

    let app;

    beforeAll(() => {
        process.env.NODE_ENV = "development";
    });

    afterAll(() => {
        process.env.NODE_ENV = originalNodeEnv;
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
