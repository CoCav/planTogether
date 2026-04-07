const request = require('supertest');
const app = require('../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../src/models');

// Test suite for event routes
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

    // ----------- NORMAL CASES ----------

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

    // Test to verify that an authenticated user can retrieve all events
    it('should get all events for an authenticated user', async () => {
        // Step 1: Register a user
        const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Events Reader',
            email: `eventsreader${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        // Step 2: Create an event
        await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'All Events Test',
            description: 'Testing get all events',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        // Step 3: Get all events
        const res = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${token}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that the response exists
        expect(res.body).toBeDefined();
    });

    // Test to verify that an authenticated user can retrieve one event by ID
    it('should get one event by ID for an authenticated user', async () => {
        // Step 1: Register a user
        const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Single Event Reader',
            email: `singleevent${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Single Event Test',
            description: 'Testing get one event',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Get the event by id
        const res = await request(app)
        .get(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that the response contains the requested event
        expect(res.body).toBeDefined();
    });

    // Test to verify that an organizer can update an event
    it('should allow an organizer to update an event', async () => {
        // Step 1: Register a user
        const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Event Updater',
            email: `eventupdater${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Original Event Title',
            description: 'Original description',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Update the event
        const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Updated Event Title',
            description: 'Updated description',
            date: '2026-12-31',
            location: 'Quebec City',
            type: 'Conference',
            theme: 'Business'
        });

        // Check that update is successful
        expect(res.statusCode).toBe(200);

        // Check that the response exists
        expect(res.body).toBeDefined();
    });

    // Test to verify that an organizer can delete an event
    it('should allow an organizer to delete an event', async () => {
        // Step 1: Register a user
        const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Event Deleter',
            email: `eventdeleter${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Event To Delete',
            description: 'Testing delete event',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Delete the event
        const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${token}`);

        // Check that deletion is successful
        expect(res.statusCode).toBe(200);
    });

    // Test to verify that an authenticated user can filter events by type
    it('should filter events by type for an authenticated user', async () => {
        // Step 1: Register a user
        const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Filter User',
            email: `filteruser${Date.now()}@test.com`,
            password: 'Password123'
        });

        const token = registerRes.body.token;

        // Step 2: Create a first event with type Meetup
        await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Meetup Event',
            description: 'This event should match the filter',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        // Step 3: Create a second event with another type
        await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Conference Event',
            description: 'This event should not match the filter',
            date: '2026-12-31',
            location: 'Quebec City',
            type: 'Conference',
            theme: 'Business'
        });

        // Step 4: Filter events by type
        const res = await request(app)
        .get('/api/events/filtered')
        .query({ type: 'Meetup' })
        .set('Authorization', `Bearer ${token}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that the response exists
        expect(res.body).toBeDefined();
    });


    // ----------- PERMISSIONS ----------

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

    // Test to verify that a participant cannot update an event
    it('should reject event update when requested by a participant', async () => {
        const organizerEmail = `updateorganizer${Date.now()}@test.com`;
        const participantEmail = `updateparticipant${Date.now()}@test.com`;

        // Step 1: Register organizer
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Update Organizer',
            email: organizerEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Protected Event',
            description: 'Testing forbidden update',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Update Participant',
            email: participantEmail,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Participant joins event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Participant tries to update event
        const res = await request(app)
        .put(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
            title: 'Hacked Title',
            description: 'Should not work',
            date: '2026-12-31',
            location: 'Fake City',
            type: 'Hack',
            theme: 'Hack'
        });

        // Check that access is denied
        expect(res.statusCode).toBe(403);
    });

    // Test to verify that a participant cannot delete an event
    it('should reject event deletion when requested by a participant', async () => {
        const organizerEmail = `deleteorganizer${Date.now()}@test.com`;
        const participantEmail = `deleteparticipant${Date.now()}@test.com`;

        // Step 1: Register organizer
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Delete Organizer',
            email: organizerEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Protected Delete Event',
            description: 'Testing forbidden delete',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Delete Participant',
            email: participantEmail,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Participant joins event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Participant tries to delete event
        const res = await request(app)
        .delete(`/api/events/${eventId}`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that access is denied
        expect(res.statusCode).toBe(403);
    });
});