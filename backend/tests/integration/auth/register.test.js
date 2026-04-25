const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Auth Integration - Register
 *
 * These tests validate the full user registration flow via HTTP.
 *
 * What is tested:
 * - Incoming request validation (express-validator)
 * - Controller handling
 * - Service logic (user creation, hashing, token generation)
 * - Database interaction (user persistence, unique email constraint)
 *
 * These are integration tests:
 * → No mocking is used
 * → The real Express app is executed
 * → The test database is used
 *
 * Goal:
 * Ensure the entire registration pipeline works correctly end-to-end.
*/



describe('Register API', () => {

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
       User registration
    ========================= */

    it('should register a new user', async () => {
        const email = `test${Date.now()}@test.com`;

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email,
                password: 'Password123'
            });

        expect(res.statusCode).toBe(201);

        expect(res.body).toHaveProperty('message', 'User registered successfully');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');

        expect(res.body.user).toMatchObject({
            name: 'Test User',
            email
        });

        expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject registration with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: '', email: '', password: '' });

        expect(res.statusCode).toBe(400);
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
    });

    it('should reject duplicate email', async () => {
        const email = `duplicate${Date.now()}@test.com`;

        await request(app).post('/api/auth/register').send({
            name: 'First User',
            email,
            password: 'Password123'
        });

        const res = await request(app).post('/api/auth/register').send({
            name: 'Second User',
            email,
            password: 'Password123'
        });

        expect(res.statusCode).toBe(409);
    });
});