/* ==================================================
   AUTH INTEGRATION - LOGOUT

   Tests:
   - authenticated logout
   - missing token rejection
   - invalid token rejection

   Ensures:
   - authentication middleware protects logout route
   - valid tokens can access the endpoint
   - invalid or missing tokens are rejected

   Notes:
   - logout is stateless because authentication uses JWT
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Logout API', () => {
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

    /* =============================
       LOGOUT
    ============================= */

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

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

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
