/* ==================================================
   EVENTS INTEGRATION - GET EVENTS

   Tests:
   - retrieve all events
   - retrieve a single event
   - nonexistent event handling
   - event status computation
   - pagination behavior
   - event status in listings

   Ensures:
   - events are correctly retrieved from the API
   - pagination metadata is returned properly
   - status helpers correctly classify events
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Get Events API', () => {

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
    const registerAndGetToken = async (name, email) => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return res.body.token;
    };

    // Generate a valid event payload
    const getValidEventPayload = (overrides = {}) => ({
        title: 'Test Event',
        description: 'This is a test event',
        startDateTime: '2026-12-31T10:00:00.000Z',
        endDateTime: '2026-12-31T12:00:00.000Z',
        mode: 'in_person',
        location: 'Montreal',
        type: 'Meetup',
        theme: 'Technology',
        ...overrides
    });

    // Create a test event
    const createEvent = async (token, overrides = {}) => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));

        return res.body.event;
    };

    /* =============================
       GET ALL EVENTS
    ============================= */

    it('should retrieve all events', async () => {
        const token = await registerAndGetToken(
            'Event User',
            `events${Date.now()}@test.com`
        );

        await createEvent(token);

        const res = await request(app).get('/api/events');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it('should paginate events', async () => {
        const token = await registerAndGetToken(
            'Pagination User',
            `pagination${Date.now()}@test.com`
        );

        await createEvent(token, { title: 'Event 1' });
        await createEvent(token, { title: 'Event 2' });
        await createEvent(token, { title: 'Event 3' });

        const res = await request(app)
            .get('/api/events')
            .query({
                page: 1,
                pageSize: 2
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBe(2);
        expect(res.body.totalEvents).toBe(3);
    });

    /* =============================
       GET SINGLE EVENT
    ============================= */

    it('should retrieve a single event by ID', async () => {
        const token = await registerAndGetToken(
            'Single Event User',
            `single${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty('message', 'Event retrieved successfully');
        expect(res.body).toHaveProperty('event');

        expect(res.body.event).toMatchObject({
            id: event.id,
            title: 'Test Event'
        });
    });

    it('should return 404 for nonexistent event', async () => {
        const res = await request(app).get('/api/events/999999');

        expect(res.statusCode).toBe(404);
    });

    /* =============================
       EVENT STATUS
    ============================= */

    it('should include upcoming status for future events', async () => {
        const token = await registerAndGetToken(
            'Upcoming User',
            `upcoming${Date.now()}@test.com`
        );

        const event = await createEvent(token, {
            title: 'Upcoming Event',
            startDateTime: '2030-01-01T10:00:00.000Z',
            endDateTime: '2030-01-01T12:00:00.000Z'
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.status).toBe('upcoming');
    });

    it('should include past status for past events', async () => {
        const token = await registerAndGetToken(
            'Past User',
            `past${Date.now()}@test.com`
        );

        const event = await createEvent(token, {
            title: 'Past Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const res = await request(app).get(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event.status).toBe('past');
    });

    it('should include status in event listing', async () => {
        const token = await registerAndGetToken(
            'Listing User',
            `listing${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Future Event',
            startDateTime: '2030-01-01T10:00:00.000Z',
            endDateTime: '2030-01-01T12:00:00.000Z'
        });

        const res = await request(app).get('/api/events');

        expect(res.statusCode).toBe(200);

        expect(res.body.events.some(event => event.status)).toBe(true);
    });
});
