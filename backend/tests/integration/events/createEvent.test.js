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

const { registerAndGetToken } = require('../../helpers/authHelper');
const { getValidEventPayload } = require('../../helpers/eventHelper');


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
       EVENT CREATION
    ============================= */

    it('should create an event for an authenticated user', async () => {
        const auth = await registerAndGetToken({
            name: 'Event Creator',
            email: `event${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
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
        const auth = await registerAndGetToken({
            name: 'Online Event Creator',
            email: `onlineevent${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
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
        const auth = await registerAndGetToken({
            name: 'Limited Event Creator',
            email: `limitedevent${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
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
        const auth = await registerAndGetToken({
            name: 'User',
            email: `title${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
            .send(getValidEventPayload({ title: '' }));

        expect(res.statusCode).toBe(400);
    });

    it('should reject invalid date order', async () => {
        const auth = await registerAndGetToken({
            name: 'User',
            email: `date${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
            .send(getValidEventPayload({
                startDateTime: '2026-12-31T12:00:00.000Z',
                endDateTime: '2026-12-31T10:00:00.000Z'
            }));

        expect(res.statusCode).toBe(400);
    });

    it('should reject invalid mode', async () => {
        const auth = await registerAndGetToken({
            name: 'User',
            email: `mode${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
            .send(getValidEventPayload({ mode: 'hybrid' }));

        expect(res.statusCode).toBe(400);
    });

    it('should reject in-person event without location', async () => {
        const auth = await registerAndGetToken({
            name: 'User',
            email: `loc${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
            .send(getValidEventPayload({
                mode: 'in_person',
                location: ''
            }));

        expect(res.statusCode).toBe(400);
    });

    it('should reject event creation when registration deadline is after event start', async () => {
        const auth = await registerAndGetToken({
            name: 'Invalid Deadline Creator',
            email: `invaliddeadline${Date.now()}@test.com`
        });

        const res = await request(app)
            .post('/api/events')
            .set(auth.headers)
            .send(
                getValidEventPayload({
                    registrationDeadline: '2026-12-31T11:00:00.000Z'
                })
            );

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});
