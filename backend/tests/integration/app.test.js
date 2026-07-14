const request = require("supertest");

const app = require("../../src/app");

/* ==========================================================================
   App Integration Tests

   Tests global application routes.

   Responsibilities
   - Test the health check endpoint
   - Test the root endpoint
   - Test unknown route handling

   Notes
   - The Express application is tested without starting the HTTP server.
=========================================================================== */

describe("App API", () => {

    /* =============================
       HEALTH CHECK
    ============================= */

    describe("Health check", () => {
        it("returns the API health status", async () => {
            const response = await request(app).get("/api/health");

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                ok: true,
                success: true,
                name: "PlanTogether API"
            });
        });
    });

    /* =============================
       ROOT ROUTE
    ============================= */

    describe("Root route", () => {
        it("returns the application status message", async () => {
            const response = await request(app).get("/");

            expect(response.statusCode).toBe(200);
            expect(response.text).toBe("PlanTogether is online!");
        });
    });

    /* =============================
       UNKNOWN ROUTES
    ============================= */

    describe("Unknown routes", () => {
        it("returns 404 for unknown routes", async () => {
            const response = await request(app).get("/api/unknown");

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({
                success: false,
                message: "Route not found"
            });
        });
    });
});
