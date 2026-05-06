/* ==================================================
   EVENTS INTEGRATION - CREATE EVENT

   Tests:
   - authenticated event creation
   - online event creation without location
   - participant limit and registration deadline
   - invalid registration deadline rejection

   Ensures:
   - protected event creation requires authentication
   - validators, controller, service and database work together
   - event creation rules are correctly enforced
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Create Event API', () => {

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
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return registerRes.body.token;
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

    /* =============================
       EVENT CREATION
    ============================= */

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

        expect(res.body).toHaveProperty('message', 'Event created successfully');
        expect(res.body).toHaveProperty('event');

        expect(res.body.event).toMatchObject({
            title: 'Test Event',
            description: 'This is a test event',
            mode: 'in_person',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });
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
        expect(res.body).toHaveProperty('event');

        expect(res.body.event).toMatchObject({
            mode: 'online',
            location: null
        });
    });

    it('should create an event with a participant limit and registration deadline', async () => {
        const token = await registerAndGetToken(
            'Limited Event Creator',
            `limitedevent${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(
                getValidEventPayload({
                    maxParticipants: 25,
                    registrationDeadline: '2026-12-29T10:00:00.000Z'
                })
            );

        expect(res.statusCode).toBe(201);

        expect(res.body.event).toMatchObject({
            maxParticipants: 25
        });

        expect(new Date(res.body.event.registrationDeadline).toISOString())
            .toBe('2026-12-29T10:00:00.000Z');
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

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

    it('should reject event creation when registration deadline is after event start', async () => {
        const token = await registerAndGetToken(
            'Invalid Deadline Creator',
            `invaliddeadline${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(
                getValidEventPayload({
                    registrationDeadline: '2026-12-31T11:00:00.000Z'
                })
            );

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
