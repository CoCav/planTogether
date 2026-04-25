const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Auth Integration - Login
 *
 * These tests validate the authentication process via HTTP.
 *
 * What is tested:
 * - Input validation (email format, required fields)
 * - Credential verification (email + password)
 * - Token generation
 * - Error handling for invalid credentials
 *
 * Integration scope:
 * → Validators + Controller + Service + Database
 *
 * Goal:
 * Ensure users can authenticate correctly and invalid logins are rejected.
*/

describe('Login API', () => {

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
       User login
    ========================= */

    it('should login an existing user', async () => {
        const user = {
            name: 'Login User',
            email: `login${Date.now()}@test.com`,
            password: 'Password123'
        };

        await request(app).post('/api/auth/register').send(user);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: user.password
            });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty('message', 'Login successful');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');

        expect(res.body.user).toMatchObject({
            name: user.name,
            email: user.email
        });

        expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: '', password: '' });

        expect(res.statusCode).toBe(400);
    });

    it('should reject invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bad-email', password: 'Password123' });

        expect(res.statusCode).toBe(400);
    });

    it('should reject wrong password', async () => {
        const user = {
            name: 'Wrong Password User',
            email: `wrong${Date.now()}@test.com`,
            password: 'Password123'
        };

        await request(app).post('/api/auth/register').send(user);

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: user.email,
                password: 'WrongPassword'
            });

        expect(res.statusCode).toBe(401);
    });

    it('should reject unknown email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: `unknown${Date.now()}@test.com`,
                password: 'Password123'
            });

        expect(res.statusCode).toBe(401);
    });
});