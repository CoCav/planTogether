const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   EVENT VALIDATION TESTS
   Covers:
   - event creation validation
   - event update validation
================================================== */

describe('Event Validation API', () => {
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
       CREATE VALIDATION
    ========================= */

    it('should reject event creation with missing title', async () => {
        const token = await registerAndGetToken(
            'Missing Title User',
            `missingtitle${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                title: ''
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject event creation when end date is before start date', async () => {
        const token = await registerAndGetToken(
            'Invalid Date User',
            `invaliddate${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                startDateTime: '2026-12-31T12:00:00.000Z',
                endDateTime: '2026-12-31T10:00:00.000Z'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject event creation with invalid mode', async () => {
        const token = await registerAndGetToken(
            'Invalid Mode User',
            `invalidmode${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                mode: 'hybrid'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject in-person event creation without location', async () => {
        const token = await registerAndGetToken(
            'Missing Location User',
            `missinglocation${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                mode: 'in_person',
                location: ''
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    /* =========================
       UPDATE VALIDATION
    ========================= */

    it('should reject event update with non-integer eventId', async () => {
        const token = await registerAndGetToken(
            'Update Validator User',
            `updatevalidator${Date.now()}@test.com`
        );

        const res = await request(app)
            .put('/api/events/abc')
            .set('Authorization', `Bearer ${token}`)
            .send({
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z',
                mode: 'online'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject event update with invalid startDateTime', async () => {
        const token = await registerAndGetToken(
            'Invalid Start Date User',
            `invalidstart${Date.now()}@test.com`
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
                startDateTime: 'invalid-date',
                endDateTime: '2026-12-31T12:00:00.000Z',
                mode: 'online'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject event update with invalid endDateTime', async () => {
        const token = await registerAndGetToken(
            'Invalid End Date User',
            `invalidend${Date.now()}@test.com`
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
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: 'invalid-date',
                mode: 'online'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject event update when end date is before start date', async () => {
        const token = await registerAndGetToken(
            'Invalid Date Order User',
            `invalidorder${Date.now()}@test.com`
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
                startDateTime: '2026-12-31T12:00:00.000Z',
                endDateTime: '2026-12-31T10:00:00.000Z',
                mode: 'online'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject event update with invalid mode', async () => {
        const token = await registerAndGetToken(
            'Invalid Mode Update User',
            `invalidmodeupdate${Date.now()}@test.com`
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
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z',
                mode: 'hybrid'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject in-person event update without location', async () => {
        const token = await registerAndGetToken(
            'Missing Location Update User',
            `missinglocationupdate${Date.now()}@test.com`
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
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z',
                mode: 'in_person',
                location: ''
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });
});