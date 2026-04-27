const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Events Integration - Update Event
 *
 * These tests validate event update behavior via HTTP.
 *
 * What is tested:
 * - JWT authentication for protected update routes
 * - Organizer permission through event role middleware
 * - Event update response structure
 * - Rejection of unauthenticated requests
 * - Rejection of updates on nonexistent or past events
 *
 * Integration scope:
 * → Auth middleware + Role middleware + Validators + Controller + Service + Database
 *
 * Goal:
 * Ensure events can only be updated by authorized users
 * and only when business rules allow it.
*/

describe('Update Event API', () => {

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

    const createEvent = async (token, overrides = {}) => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));

        return res.body.event;
    };

    /* =========================
       Event update
    ========================= */

    it('should allow an organizer to update an event', async () => {
        const token = await registerAndGetToken(
            'Event Updater',
            `eventupdater${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                title: 'Updated Title'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Event updated successfully');
        expect(res.body).toHaveProperty('event');

        expect(res.body.event).toMatchObject({
            id: event.id,
            title: 'Updated Title'
        });
    });

    /* =========================
       Authentication errors
    ========================= */

    it('should reject event update without token', async () => {
        const token = await registerAndGetToken(
            'Unauthorized Updater',
            `unauthupdate${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .send(getValidEventPayload());

        expect(res.statusCode).toBe(401);
    });

    /* =========================
       Authorization and business rules
    ========================= */

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

    it('should NOT allow updating a past event', async () => {
        const token = await registerAndGetToken(
            'Past Event Updater',
            `pastupdate${Date.now()}@test.com`
        );

        const event = await createEvent(token, {
            title: 'Past Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                title: 'Updated Title'
            });

        expect(res.statusCode).toBe(403);
    });

    it('should allow an organizer to update participant limit and registration deadline', async () => {
        const token = await registerAndGetToken(
            'Limit Updater',
            `limitupdater${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                maxParticipants: 50,
                registrationDeadline: '2026-12-29T10:00:00.000Z'
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toMatchObject({
            id: event.id,
            maxParticipants: 50
        });

        expect(new Date(res.body.event.registrationDeadline).toISOString())
            .toBe('2026-12-29T10:00:00.000Z');
    });

    it('should reject update when registration deadline is after event start', async () => {
        const token = await registerAndGetToken(
            'Invalid Deadline Updater',
            `invaliddeadlineupdate${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                ...getValidEventPayload(),
                registrationDeadline: '2026-12-31T11:00:00.000Z'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});