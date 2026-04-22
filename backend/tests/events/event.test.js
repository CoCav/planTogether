const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   EVENT CRUD TESTS
   Covers:
   - create event
   - get all events
   - get one event by ID
   - update event
   - delete event
   - basic pagination on get all events
================================================== */

describe('Event CRUD API', () => {
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
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return registerRes.body.token;
    };

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

    /* =========================
       Create
    ========================= */

    it('should create an event for an authenticated user', async () => {
        const token = await registerAndGetToken(
            'Event Creator',
            `event${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('event');
    });

    it('should create an online event without location', async () => {
        const token = await registerAndGetToken(
            'Online Event Creator',
            `onlineevent${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(
                getValidEventPayload({
                    mode: 'online',
                    location: ''
                })
            );

        expect(res.statusCode).toBe(201);
    });

    /* =========================
       Read
    ========================= */

    it('should get all events', async () => {
        const token = await registerAndGetToken(
            'Events Reader',
            `eventsreader${Date.now()}@test.com`
        );

        await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const res = await request(app).get('/api/events');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('events');
    });

    it('should get one event by ID', async () => {
        const token = await registerAndGetToken(
            'Single Event Reader',
            `singleevent${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject getting one event with nonexistent id', async () => {
        const res = await request(app).get('/api/events/999999');

        expect(res.statusCode).toBe(404);
    });

    /* =========================
       Update
    ========================= */

    it('should allow an organizer to update an event', async () => {
        const token = await registerAndGetToken(
            'Event Updater',
            `eventupdater${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .put(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                title: 'Updated Title'
            });

        expect(res.statusCode).toBe(200);
    });

    it('should reject event update without token', async () => {
        const token = await registerAndGetToken(
            'Unauthorized Updater',
            `unauthupdate${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .put(`/api/events/${eventId}`)
            .send(getValidEventPayload());

        expect(res.statusCode).toBe(401);
    });

    it('should reject updating a nonexistent event', async () => {
        const token = await registerAndGetToken(
            'Missing Event Updater',
            `missingupdate${Date.now()}@test.com`
        );

        const res = await request(app)
            .put('/api/events/999999')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Delete
    ========================= */

    it('should allow an organizer to delete an event', async () => {
        const token = await registerAndGetToken(
            'Event Deleter',
            `eventdeleter${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .delete(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject event deletion without token', async () => {
        const token = await registerAndGetToken(
            'Unauthorized Deleter',
            `unauthdelete${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .delete(`/api/events/${eventId}`);

        expect(res.statusCode).toBe(401);
    });

    it('should reject deleting a nonexistent event', async () => {
        const token = await registerAndGetToken(
            'Missing Event Deleter',
            `missingdelete${Date.now()}@test.com`
        );

        const res = await request(app)
            .delete('/api/events/999999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Pagination (basic)
    ========================= */

    it('should paginate events when retrieving all events', async () => {
        const token = await registerAndGetToken(
            'Pagination Events User',
            `paginationevents${Date.now()}@test.com`
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
            .query({
                page: 1,
                pageSize: 2
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('events');
        expect(res.body.events.length).toBe(2);
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('pageSize');
    });
});