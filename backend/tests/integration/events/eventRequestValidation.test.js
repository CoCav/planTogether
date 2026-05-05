/* ==================================================
   EVENTS INTEGRATION - REQUEST VALIDATION

   Tests:
   - event creation validation
   - event update validation
   - invalid params and invalid body values
   - business validation rules

   Ensures:
   - invalid event payloads are rejected
   - validators properly protect event routes
   - invalid dates, modes and locations are blocked
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Event Request Validation API', () => {

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

    /* =============================
       CREATE VALIDATION
    ============================= */

    describe('Create validation', () => {

        it('should reject missing title', async () => {
            const token = await registerAndGetToken('User', `title${Date.now()}@test.com`);

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload({ title: '' }));

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid date order', async () => {
            const token = await registerAndGetToken('User', `date${Date.now()}@test.com`);

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload({
                    startDateTime: '2026-12-31T12:00:00.000Z',
                    endDateTime: '2026-12-31T10:00:00.000Z'
                }));

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid mode', async () => {
            const token = await registerAndGetToken('User', `mode${Date.now()}@test.com`);

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload({ mode: 'hybrid' }));

            expect(res.statusCode).toBe(400);
        });

        it('should reject in-person event without location', async () => {
            const token = await registerAndGetToken('User', `loc${Date.now()}@test.com`);

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload({
                    mode: 'in_person',
                    location: ''
                }));

            expect(res.statusCode).toBe(400);
        });
    });

    /* =============================
       UPDATE VALIDATION
    ============================= */

    describe('Update validation', () => {

        it('should reject non-integer eventId', async () => {
            const token = await registerAndGetToken('User', `id${Date.now()}@test.com`);

            const res = await request(app)
                .put('/api/events/abc')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    startDateTime: '2026-12-31T10:00:00.000Z',
                    endDateTime: '2026-12-31T12:00:00.000Z',
                    mode: 'online'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid startDateTime', async () => {
            const token = await registerAndGetToken('User', `start${Date.now()}@test.com`);

            const eventRes = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload());

            const id = eventRes.body.event.id;

            const res = await request(app)
                .put(`/api/events/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    startDateTime: 'invalid',
                    endDateTime: '2026-12-31T12:00:00.000Z',
                    mode: 'online'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid endDateTime', async () => {
            const token = await registerAndGetToken('User', `end${Date.now()}@test.com`);

            const eventRes = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload());

            const id = eventRes.body.event.id;

            const res = await request(app)
                .put(`/api/events/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    startDateTime: '2026-12-31T10:00:00.000Z',
                    endDateTime: 'invalid',
                    mode: 'online'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid date order', async () => {
            const token = await registerAndGetToken('User', `order${Date.now()}@test.com`);

            const eventRes = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload());

            const id = eventRes.body.event.id;

            const res = await request(app)
                .put(`/api/events/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    startDateTime: '2026-12-31T12:00:00.000Z',
                    endDateTime: '2026-12-31T10:00:00.000Z',
                    mode: 'online'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid mode', async () => {
            const token = await registerAndGetToken('User', `mode2${Date.now()}@test.com`);

            const eventRes = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload());

            const id = eventRes.body.event.id;

            const res = await request(app)
                .put(`/api/events/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    startDateTime: '2026-12-31T10:00:00.000Z',
                    endDateTime: '2026-12-31T12:00:00.000Z',
                    mode: 'hybrid'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject in-person event without location', async () => {
            const token = await registerAndGetToken('User', `loc2${Date.now()}@test.com`);

            const eventRes = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${token}`)
                .send(getValidEventPayload());

            const id = eventRes.body.event.id;

            const res = await request(app)
                .put(`/api/events/${id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    startDateTime: '2026-12-31T10:00:00.000Z',
                    endDateTime: '2026-12-31T12:00:00.000Z',
                    mode: 'in_person',
                    location: ''
                });

            expect(res.statusCode).toBe(400);
        });
    });
});
