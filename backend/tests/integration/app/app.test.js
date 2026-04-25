const request = require('supertest');
const app = require('../../../src/app');

/**
 * App Integration
 *
 * These tests validate global Express app behavior.
 *
 * What is tested:
 * - Health check endpoint
 * - Root endpoint
 * - Unknown route handling
 *
 * Integration scope:
 * → Express app + global routes + 404 handler
 *
 * Goal:
 * Ensure the API responds correctly at the application level.
*/

describe('App API', () => {

    /* =========================
       Health check
    ========================= */

    it('should return API health status', async () => {
        const res = await request(app).get('/api/health');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            ok: true,
            name: 'PlanTogether API'
        });
    });

    /* =========================
       Root route
    ========================= */

    it('should return root message', async () => {
        const res = await request(app).get('/');

        expect(res.statusCode).toBe(200);
        expect(res.text).toBe('PlanTogether is online !');
    });

    /* =========================
       Unknown route
    ========================= */

    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/api/unknown');

        expect(res.statusCode).toBe(404);
        expect(res.body).toEqual({
            message: 'Route not found'
        });
    });
});