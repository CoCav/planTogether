/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - MY EVENTS

   Tests:
   - authenticated user's events retrieval
   - authentication requirement
   - event status enrichment
   - participant count enrichment
   - pagination by view
   - history view filtering

   Ensures:
   - authenticated users can retrieve their related events
   - response includes event metadata
   - view filters and pagination work correctly
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('My Events API', () => {

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
       HELPERS
    ============================= */

    // Register a test user and return auth token
    const registerUser = async (name, email) => {
        const res = await request(app).post('/api/auth/register').send({
            name,
            email,
            password: 'Password123'
        });

        return res.body.token;
    };

    // Create a test event
    const createEvent = async (token, overrides = {}) => {
        return request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Event',
                description: 'Test',
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z',
                mode: 'in_person',
                location: 'Montreal',
                type: 'Meetup',
                theme: 'Tech',
                ...overrides
            });
    };

    /* =============================
       CURRENT USER EVENTS
    ============================= */

    it('should get events for the authenticated user', async () => {
        const creatorToken = await registerUser('Creator', `creator${Date.now()}@test.com`);

        const eventRes = await createEvent(creatorToken, {
            title: 'User Events Test'
        });

        const eventId = eventRes.body.event.id;

        const participantToken = await registerUser(
            'Participant',
            `participant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participantToken}`);

        const res = await request(app)
            .get('/api/events/my-events')
            .set('Authorization', `Bearer ${participantToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it('should reject getting current user events without token', async () => {
        const res = await request(app).get('/api/events/my-events');

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       EVENT METADATA
    ============================= */

    it('should include event status in current user events', async () => {
        const creatorToken = await registerUser(
            'Status Creator',
            `statuscreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creatorToken, {
            title: 'Past Status Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .get('/api/events/my-events')
            .set('Authorization', `Bearer ${creatorToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);

        const eventMembership = res.body.events.find((item) => item.event.id === eventId);

        expect(eventMembership).toBeDefined();
        expect(eventMembership.event).toHaveProperty('status', 'past');
    });

    it('should include participant count and status in user events', async () => {
        const creatorToken = await registerUser(
            'Count Creator',
            `countcreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creatorToken, {
            title: 'Count Event'
        });

        const eventId = eventRes.body.event.id;

        const participantToken = await registerUser(
            'Count Participant',
            `countparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participantToken}`);

        const res = await request(app)
            .get('/api/events/my-events')
            .set('Authorization', `Bearer ${creatorToken}`);

        expect(res.statusCode).toBe(200);

        const eventMembership = res.body.events.find((item) => item.event.id === eventId);

        expect(eventMembership).toBeDefined();
        expect(eventMembership.event).toHaveProperty('participantCount');
        expect(eventMembership.event.participantCount).toBeGreaterThanOrEqual(1);
        expect(eventMembership.event).toHaveProperty('status');
    });

    /* =============================
       PAGINATION / VIEWS
    ============================= */

    it('should paginate current user events by view', async () => {
        const creatorToken = await registerUser(
            'Paginated Creator',
            `paginatedcreator${Date.now()}@test.com`
        );

        await createEvent(creatorToken, { title: 'Created Event A' });
        await createEvent(creatorToken, { title: 'Created Event B' });
        await createEvent(creatorToken, { title: 'Created Event C' });

        const res = await request(app)
            .get('/api/events/my-events')
            .query({
                view: 'created',
                page: 1,
                pageSize: 2
            })
            .set('Authorization', `Bearer ${creatorToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(2);
        expect(res.body.totalEvents).toBe(3);
        expect(res.body.totalPages).toBe(2);
    });

    it('should filter current user events by history view', async () => {
        const creatorToken = await registerUser(
            'History Creator',
            `historycreator${Date.now()}@test.com`
        );

        await createEvent(creatorToken, {
            title: 'Active Created Event',
            startDateTime: '2026-12-31T10:00:00.000Z',
            endDateTime: '2026-12-31T12:00:00.000Z'
        });

        await createEvent(creatorToken, {
            title: 'Past Created Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/my-events')
            .query({ view: 'createdHistory' })
            .set('Authorization', `Bearer ${creatorToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(1);
        expect(res.body.events[0].event.title).toBe('Past Created Event');
        expect(res.body.events[0].event.status).toBe('past');
    });
});
