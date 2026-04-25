const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Auth Integration - Logout
 *
 * These tests validate the logout endpoint behavior.
 *
 * What is tested:
 * - JWT authentication middleware
 * - Access control (token required)
 * - Proper response for valid and invalid tokens
 *
 * Note:
 * Logout is stateless (JWT-based), so no DB change occurs.
 *
 * Goal:
 * Ensure protected routes correctly enforce authentication.
*/

describe('Logout API', () => {

    /* =========================
       Test database lifecycle
    ========================= */

    beforeAll(async () => {
        await initDB();
    });

    afterEach(async () => {
        await EventUserRole.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    /* =========================
       User logout
    ========================= */

    it('should logout authenticated user', async () => {
        const registerRes = await request(app).post('/api/auth/register').send({
            name: 'Logout User',
            email: `logout${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Logout successful');
    });

    it('should reject without token', async () => {
        const res = await request(app).post('/api/auth/logout');

        expect(res.statusCode).toBe(401);
    });

    it('should reject invalid token', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', 'Bearer invalid-token');

        expect(res.statusCode).toBe(401);
    });
});