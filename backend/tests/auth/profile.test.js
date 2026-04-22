const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   PROFILE TESTS
   Covers:
   - profile retrieval
   - profile update
   - protected route access
================================================== */

describe('Profile API', () => {
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
       Profile retrieval
    ========================= */

    it('should get the profile of an authenticated user', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Profile User',
                email: `profile${Date.now()}@test.com`,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('user');
    });

    it('should reject access to profile without token', async () => {
        const res = await request(app).get('/api/auth/profile');
        expect(res.statusCode).toBe(401);
    });

    it('should reject profile access with invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer invalid-token');

        expect(res.statusCode).toBe(401);
    });

    /* =========================
       Profile update
    ========================= */

    it('should update the profile of an authenticated user', async () => {
        const originalEmail = `profileupdate${Date.now()}@test.com`;
        const updatedEmail = `updatedprofile${Date.now()}@test.com`;

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Profile User',
                email: originalEmail,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Name',
                email: updatedEmail
            });

        expect(res.statusCode).toBe(200);

        const profileRes = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(profileRes.statusCode).toBe(200);
        expect(profileRes.body.user.name).toBe('Updated Name');
        expect(profileRes.body.user.email).toBe(updatedEmail);
    });

    it('should reject profile update without token', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .send({
                name: 'Updated Name',
                email: `updated${Date.now()}@test.com`
            });

        expect(res.statusCode).toBe(401);
    });

    it('should reject profile update with invalid token', async () => {
        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', 'Bearer invalid-token')
            .send({
                name: 'Updated Name',
                email: `updated${Date.now()}@test.com`
            });

        expect(res.statusCode).toBe(401);
    });

    it('should reject profile update with invalid email', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Profile Validation User',
                email: `profileval${Date.now()}@test.com`,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Name',
                email: 'invalid-email'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject profile update with empty fields', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Empty Field User',
                email: `empty${Date.now()}@test.com`,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                email: ''
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject profile update with duplicate email', async () => {
        const firstEmail = `first${Date.now()}@test.com`;
        const secondEmail = `second${Date.now()}@test.com`;

        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'First User',
                email: firstEmail,
                password: 'Password123'
            });

        const secondRegisterRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Second User',
                email: secondEmail,
                password: 'Password123'
            });

        const token = secondRegisterRes.body.token;

        const res = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Name',
                email: firstEmail
            });

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('message');
    });
});