/* ==================================================
   EVENTS INTEGRATION - FILTER EVENTS

   Tests:
   - type, theme and search filters
   - exact date and date range filters
   - combined filters
   - status filtering
   - pagination
   - sorting behavior

   Ensures:
   - filtering logic returns correct events
   - pagination and sorting work correctly
   - status and date helpers behave consistently
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Event Filter API', () => {

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
        const res = await request(app).post('/api/auth/register').send({
            name,
            email,
            password: 'Password123'
        });

        return res.body.token;
    };

    // Generate a valid event payload
    const getValidEventPayload = (overrides = {}) => ({
        title: 'Test Event',
        description: 'Test description',
        startDateTime: '2026-12-31T10:00:00.000Z',
        endDateTime: '2026-12-31T12:00:00.000Z',
        mode: 'in_person',
        location: 'Montreal',
        type: 'Meetup',
        theme: 'Technology',
        ...overrides
    });

    // Create an event with optional overrides
    const createEvent = async (token, overrides = {}) => {
        return request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));
    };

    /* =============================
       BASIC FILTERS
    ============================= */

    it('should filter events by type', async () => {
        const token = await registerAndGetToken('User', `type${Date.now()}@test.com`);

        await createEvent(token, { type: 'Meetup' });
        await createEvent(token, { type: 'Conference' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ type: 'Meetup' });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every(e => e.type === 'Meetup')).toBe(true);
    });

    it('should filter events by theme', async () => {
        const token = await registerAndGetToken('User', `theme${Date.now()}@test.com`);

        await createEvent(token, { theme: 'Technology' });
        await createEvent(token, { theme: 'Business' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ theme: 'Technology' });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.every(e => e.theme === 'Technology')).toBe(true);
    });

    it('should filter events by search term', async () => {
        const token = await registerAndGetToken('User', `search${Date.now()}@test.com`);

        await createEvent(token, { title: 'JavaScript Meetup' });
        await createEvent(token, { title: 'Cooking Workshop' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ search: 'JavaScript' });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.some(e => e.title.includes('JavaScript'))).toBe(true);
    });

    /* =============================
       DATE FILTERS
    ============================= */

    it('should filter events by exact date', async () => {
        const token = await registerAndGetToken('User', `date${Date.now()}@test.com`);

        await createEvent(token, {
            startDateTime: '2026-12-31T10:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ date: '2026-12-31' });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it('should filter events by date range', async () => {
        const token = await registerAndGetToken('User', `range${Date.now()}@test.com`);

        await createEvent(token, {
            startDateTime: '2026-12-20T10:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                startDate: '2026-12-01',
                endDate: '2026-12-31'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    /* =============================
       COMBINED FILTERS
    ============================= */

    it('should filter events with combined params', async () => {
        const token = await registerAndGetToken('User', `combo${Date.now()}@test.com`);

        await createEvent(token, {
            type: 'Meetup',
            theme: 'Technology',
            location: 'Montreal'
        });

        await createEvent(token, {
            type: 'Meetup',
            theme: 'Business',
            location: 'Quebec'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                type: 'Meetup',
                theme: 'Technology',
                location: 'Montreal'
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.events.every(e =>
            e.type === 'Meetup' &&
            e.theme === 'Technology' &&
            e.location === 'Montreal'
        )).toBe(true);
    });

    it('should return empty array when no match', async () => {
        const res = await request(app)
            .get('/api/events/filtered')
            .query({ type: 'DoesNotExist' });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBe(0);
    });

    /* =============================
       STATUS FILTERS
    ============================= */

    it('should filter upcoming events', async () => {
        const token = await registerAndGetToken('User', `upcoming${Date.now()}@test.com`);

        await createEvent(token, {
            startDateTime: '2026-12-31T10:00:00.000Z'
        });

        await createEvent(token, {
            startDateTime: '2020-01-01T10:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ status: 'upcoming' });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.every(e => e.status === 'upcoming')).toBe(true);
    });

    it('should filter past events', async () => {
        const token = await registerAndGetToken('User', `past${Date.now()}@test.com`);

        await createEvent(token, {
            startDateTime: '2020-01-01T10:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ status: 'past' });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.every(e => e.status === 'past')).toBe(true);
    });

    /* =============================
       PAGINATION
    ============================= */

    it('should paginate filtered events', async () => {
        const token = await registerAndGetToken('User', `pagination${Date.now()}@test.com`);

        await createEvent(token);
        await createEvent(token);
        await createEvent(token);

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ page: 1, pageSize: 2 });

        expect(res.statusCode).toBe(200);
        expect(res.body.events.length).toBe(2);
    });

    /* =============================
       SORTING
    ============================= */

    it('should sort events by title ascending', async () => {
        const token = await registerAndGetToken('User', `sort${Date.now()}@test.com`);

        await createEvent(token, { title: 'Zulu' });
        await createEvent(token, { title: 'Alpha' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ sortBy: 'title', order: 'asc' });

        expect(res.statusCode).toBe(200);
        expect(res.body.events[0].title).toBe('Alpha');
    });

    it('should fallback to default sorting on invalid field', async () => {
        const res = await request(app)
            .get('/api/events/filtered')
            .query({ sortBy: 'invalid' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('events');
    });
});
