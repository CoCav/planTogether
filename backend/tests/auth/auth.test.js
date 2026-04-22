const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   AUTH TESTS
   Covers:
   - unknown routes
   - registration
   - login
   - logout
   - password update
================================================== */

describe('Auth API', () => {
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
       General routes
    ========================= */

    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.statusCode).toBe(404);
    });

    /* =========================
       Register
    ========================= */

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: `test${Date.now()}@test.com`,
                password: 'Password123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
    });

    it('should reject registration with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: '',
                email: '',
                password: ''
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with invalid email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Invalid Email User',
                email: 'not-an-email',
                password: 'Password123'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with weak password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Weak Password User',
                email: `weak${Date.now()}@test.com`,
                password: 'abc'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with duplicate email', async () => {
        const email = `duplicate${Date.now()}@test.com`;

        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'First User',
                email,
                password: 'Password123'
            });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Second User',
                email,
                password: 'Password123'
            });

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('message');
    });

    /* =========================
       Login
    ========================= */

    it('should login an existing user', async () => {
        const userData = {
            name: 'Login Test User',
            email: `login${Date.now()}@test.com`,
            password: 'Password123'
        };

        await request(app)
            .post('/api/auth/register')
            .send(userData);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should reject login with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: '',
                password: ''
            });

        expect(res.statusCode).toBe(400);
    });

    it('should reject login with invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'not-an-email',
                password: 'Password123'
            });

        expect(res.statusCode).toBe(400);
    });

    it('should reject login with wrong password', async () => {
        const userData = {
            name: 'Wrong Password User',
            email: `wrongpass${Date.now()}@test.com`,
            password: 'Password123'
        };

        await request(app)
            .post('/api/auth/register')
            .send(userData);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: 'WrongPassword123'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject login with unknown email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: `unknown${Date.now()}@test.com`,
                password: 'Password123'
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message');
    });

    /* =========================
       Logout
    ========================= */

    it('should logout an authenticated user', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Logout User',
                email: `logout${Date.now()}@test.com`,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject logout without token', async () => {
        const res = await request(app)
            .post('/api/auth/logout');

        expect(res.statusCode).toBe(401);
    });

    it('should reject logout with invalid token', async () => {
        const res = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', 'Bearer invalid-token');

        expect(res.statusCode).toBe(401);
    });

    /* =========================
       Password update
    ========================= */

    it('should change password with correct current password', async () => {
        const email = `changepass${Date.now()}@test.com`;

        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Password Change User',
                email,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const changeRes = await request(app)
            .put('/api/auth/password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: 'Password123',
                newPassword: 'NewPassword123'
            });

        expect(changeRes.statusCode).toBe(200);

        const oldLogin = await request(app)
            .post('/api/auth/login')
            .send({ email, password: 'Password123' });

        expect(oldLogin.statusCode).toBe(401);

        const newLogin = await request(app)
            .post('/api/auth/login')
            .send({ email, password: 'NewPassword123' });

        expect(newLogin.statusCode).toBe(200);
    });

    it('should reject password change without token', async () => {
        const res = await request(app)
            .put('/api/auth/password')
            .send({
                currentPassword: 'Password123',
                newPassword: 'NewPassword123'
            });

        expect(res.statusCode).toBe(401);
    });

    it('should reject password change with invalid token', async () => {
        const res = await request(app)
            .put('/api/auth/password')
            .set('Authorization', 'Bearer invalid-token')
            .send({
                currentPassword: 'Password123',
                newPassword: 'NewPassword123'
            });

        expect(res.statusCode).toBe(401);
    });

    it('should reject password change with wrong current password', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Wrong Current Password User',
                email: `wrongcurrent${Date.now()}@test.com`,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .put('/api/auth/password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: 'WrongPassword123',
                newPassword: 'NewPassword123'
            });

        expect(res.statusCode).toBe(401);
    });

    it('should reject password change when new password is the same', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Same Password User',
                email: `samepass${Date.now()}@test.com`,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .put('/api/auth/password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: 'Password123',
                newPassword: 'Password123'
            });

        expect(res.statusCode).toBe(400);
    });

    it('should reject password change with weak new password', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Weak New Password User',
                email: `weaknew${Date.now()}@test.com`,
                password: 'Password123'
            });

        const token = registerRes.body.token;

        const res = await request(app)
            .put('/api/auth/password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                currentPassword: 'Password123',
                newPassword: 'abc'
            });

        expect(res.statusCode).toBe(400);
    });
});