const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Events Integration - Create Event
 *
 * These tests validate event creation via HTTP.
 *
 * What is tested:
 * - JWT authentication for protected event creation
 * - Event creation through the real Express route
 * - Controller and service execution
 * - Database persistence
 * - Online event behavior without location
 *
 * Integration scope:
 * → Auth middleware + Validators + Controller + Service + Database
 *
 * Goal:
 * Ensure authenticated users can create valid events correctly.
*/

describe('Create Event API', () => {

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
       Event creation
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