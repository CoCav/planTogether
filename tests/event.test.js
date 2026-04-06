const request = require('supertest');
const app = require('../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../src/models');

// Test suite for all event-related endpoints
describe('Event API', () => {
    // Initialize the test database before running the test suite
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


    // Test to verify that an authenticated user can create an event
    it('should create an event for an authenticated user', async () => {
        // Step 1: Register a user and get a JWT token
        const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Event Creator',
            email: `event${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        // Step 2: Create an event with the authenticated user
        const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Test Event',
            description: 'This is a test event',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        // Check that the event is successfully created
        expect(res.statusCode).toBe(201);

        // Check that the response contains the created event
        expect(res.body).toHaveProperty('event');
    });


    // Test to verify that event creation is rejected without authentication
    it('should reject event creation without token', async () => {
        const res = await request(app)
        .post('/api/events')
        .send({
            title: 'Unauthorized Event',
            description: 'This event should not be created',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        // Check that access is denied
        expect(res.statusCode).toBe(401);
    });
});