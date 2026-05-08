/* ==================================================
   APP INTEGRATION TESTS

   Tests:
   - health check endpoint
   - root endpoint
   - unknown route handling

   Ensures:
   - global app routes respond correctly
   - 404 fallback handler works as expected
   - Express app can be tested without starting server
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

describe("App API", () => {

    /* =============================
       HEALTH CHECK
    ============================= */

    it('should return API health status', async () => {
        const res = await request(app).get("/api/health");

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            ok: true,
            name: "PlanTogether API"
        });
    });


    /* =============================
       ROOT ROUTE
    ============================= */

    it('should return root message', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toBe(200);
        expect(res.text).toBe("PlanTogether is online !");
    });


    /* =============================
       UNKNOWN ROUTE
    ============================= */

    it('should return 404 for unknown route', async () => {
        const res = await request(app).get("/api/unknown");

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({ message: "Route not found" });
    });
});
