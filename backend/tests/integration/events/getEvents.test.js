const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Events Integration - Get Events
 *
 * These tests validate event retrieval via HTTP.
 *
 * What is tested:
 * - Retrieve all events
 * - Retrieve a single event by ID
 * - Handling of nonexistent events
 * - Event status computation (upcoming / past)
 * - Pagination behavior
 *
 * Integration scope:
 * → Routes + Controller + Service + Database
 *
 * Goal:
 * Ensure events can be fetched correctly and business logic
 * (like status and pagination) is properly applied.
*/

describe('Get Events API', () => {

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
       Helpers
    ========================= */

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

    const getValidEventPayload = (overrides = {}) => ({
        title: 'Test Event',
        description: 'Test description',
        startDateTime: '2026-12-31T10:00:00.000Z',
        endDateTime: '2026-12-31T12:00:00.000Z',
        mode: 'in_person',
        location: 'Montreal',
        type: 'Meetup',
        theme: 'Tech',
        ...overrides
    });

    /* =========================
       Get all events
    ========================= */

    it('should get all events', async () => {
        const token = await registerAndGetToken(
            'Events Reader',
            `events${Date.now()}@test.com`
        );

        await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const res = await request(app).get('/api/events');

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty('events');
        expect(Array.isArray(res.body.events)).toBe(true);
    });

    /* =========================
       Get one event
    ========================= */

    it('should get one event by ID', async () => {
        const token = await registerAndGetToken(
            'Single Event Reader',
            `single${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('event');
    });

    it('should reject getting one event with nonexistent id', async () => {
        const res = await request(app).get('/api/events/999999');

        expect(res.statusCode).toBe(404);
    });

    /* =========================
       Event status
    ========================= */

    it('should return upcoming status for future event', async () => {
        const token = await registerAndGetToken(
            'Status Reader',
            `status${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event).toHaveProperty('status', 'upcoming');
    });

    it('should return past status for past event', async () => {
        const token = await registerAndGetToken(
            'Past Status Reader',
            `past${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload({
                startDateTime: '2020-01-01T10:00:00.000Z',
                endDateTime: '2020-01-01T12:00:00.000Z'
            }));

        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.event).toHaveProperty('status', 'past');
    });

    /* =========================
       Pagination
    ========================= */

    it('should paginate events', async () => {
        const token = await registerAndGetToken(
            'Pagination User',
            `pagination${Date.now()}@test.com`
        );

        await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload({ title: 'Event A' }));

        await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload({ title: 'Event B' }));

        await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload({ title: 'Event C' }));

        const res = await request(app)
            .get('/api/events')
            .query({ page: 1, pageSize: 2 });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty('events');
        expect(res.body.events.length).toBe(2);
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('pageSize');
    });

    /* =========================
       Status in list
    ========================= */

    it('should include status for each event', async () => {
        const token = await registerAndGetToken(
            'List Status User',
            `liststatus${Date.now()}@test.com`
        );

        await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const res = await request(app).get('/api/events');

        expect(res.statusCode).toBe(200);

        expect(res.body.events[0]).toHaveProperty('status');
        expect(['upcoming', 'past']).toContain(res.body.events[0].status);
    });
});