const request = require('supertest');
const app = require('../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../src/models');

// Test suite for all authentication-related endpoints
describe('Auth API', () => {

    // Initialize the test database before running all the tests
    beforeAll(async () => {
        await initDB();
    });

    // Clean database after each test
    afterEach(async () => {
        await EventUserRole.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    // Close the database connection after all tests are finished
    afterAll(async () => {
        await sequelize.close();
    });



    // ---------------- TESTS ----------------
 

    // Test to ensure that unknown routes return a 404 status
    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/api/unknown');

        expect(res.statusCode).toBe(404);
    });

    // Test to verify that a new user can successfully register
    it('should register a new user', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Test User',
            email: `test${Date.now()}@test.com`,
            password: 'Password123'
        });

        // Check that the response status is 201 (Created)
        expect(res.statusCode).toBe(201);

        // Check that a JWT token is returned in the response
        expect(res.body).toHaveProperty('token');
    });

    // Test to verify that an existing user can log in successfully
    it('should login an existing user', async () => {

        // Step 1: Register a new user
        const userData = {
            name: 'Login Test User',
            email: `login${Date.now()}@test.com`,
            password: 'Password123'
        };

        await request(app)
            .post('/api/auth/register')
            .send(userData);

        // Step 2: Attempt login with the same credentials
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        // Check that login is successful
        expect(res.statusCode).toBe(200);

        // Check that a JWT token is returned
        expect(res.body).toHaveProperty('token');
    });

    // Test to verify that an authenticated user can access a protected route
    it('should get the profile of an authenticated user', async () => {
        // Step 1: Register a new user and get the JWT token
         const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Protected Route User',
            email: `profile${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        // Step 2: Access the protected profile route with the JWT token
        const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

        // Check that access is granted
        expect(res.statusCode).toBe(200);

        // Check that the response contains user data
        expect(res.body).toHaveProperty('user');
    });

    // Test to verify that a protected route rejects requests without a token
    it('should reject access to profile without token', async () => {
        const res = await request(app).get('/api/auth/profile');

         // Check that access is denied
        expect(res.statusCode).toBe(401);
    });

});