const request = require('supertest');
const app = require('../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../src/models');

// Test suite for event membership routes
describe('Event Membership API', () => { 
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


    // Test to verify that an authenticated user can join an event
    it('should allow an authenticated user to join an event', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Event Creator',
            email: `creator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Joinable Event',
            description: 'An event to test joining',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register another user who will join the event
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Participant User',
            email: `participant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event
        const res = await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that joining is successful
        expect(res.statusCode).toBe(200);

        // Check that the response contains a success message or membership data
        expect(res.body).toBeDefined();
    });

    // Test to verify that an authenticated user can leave an event after joining it
    it('should allow an authenticated user to leave an event', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Leave Event Creator',
            email: `leavecreator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Event To Leave',
            description: 'An event to test leaving',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Leaving Participant',
            email: `leaveparticipant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event before leaving it
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Leave the event
        const res = await request(app)
        .delete(`/api/events/${eventId}/members/leave`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that leaving is successful
        expect(res.statusCode).toBe(200);

        // Check that the response exists
        expect(res.body).toBeDefined();
    });

    // Test to verify that an authenticated user can retrieve their joined events
    it('should get events for the authenticated user', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Creator',
            email: `creator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'User Events Test',
            description: 'Testing get my events',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Participant',
            email: `participant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Get events for the participant
        const res = await request(app)
        .get('/api/events/memberships/me')
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that at least one event is returned
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Test to verify that an authenticated user can get the members of an event
    it('should get members of an event', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Members Creator',
            email: `memberscreator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
    const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Members Event',
            description: 'Testing event members',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Members Participant',
            email: `membersparticipant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Get the event members
        const res = await request(app)
        .get(`/api/events/${eventId}/members`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that the request is successful
        expect(res.statusCode).toBe(200);

        // Check that the response contains a members array
        expect(res.body).toHaveProperty('members');
        expect(Array.isArray(res.body.members)).toBe(true);
        expect(res.body.members.length).toBeGreaterThan(0);
    });

    // Test to verify that an authenticated user can get organizers of an event
    it('should get organizers of an event', async () => {
        // Step 1: Register the event creator (organizer)
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Organizer User',
            email: `organizer${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event (creator should be organizer)
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Organizer Event',
            description: 'Testing organizers',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Get organizers
        const res = await request(app)
        .get(`/api/events/${eventId}/organizers`)
        .set('Authorization', `Bearer ${creatorToken}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that organizers are returned
        expect(res.body).toHaveProperty('organizers');
        expect(Array.isArray(res.body.organizers)).toBe(true);
        expect(res.body.organizers.length).toBeGreaterThan(0);
    });
});