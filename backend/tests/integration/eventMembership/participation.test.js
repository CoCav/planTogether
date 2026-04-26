
const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Events Membership Integration - Participation
 *
 * These tests validate joining and leaving events.
 *
 * What is tested:
 * - Joining an event
 * - Leaving an event
 * - Authentication requirements
 * - Business rules (past events)
 *
 * Integration scope:
 * → Auth middleware + Controller + Service + Database
 *
 * Goal:
 * Ensure users can correctly join and leave events.
*/

describe('Event Participation API', () => {

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

    const registerUser = async (name, email) => {
        const res = await request(app).post('/api/auth/register').send({
            name,
            email,
            password: 'Password123'
        });

        return res.body.token;
    };

    const createEvent = async (token, overrides = {}) => {
        return request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Event',
                description: 'Test',
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z',
                mode: 'in_person',
                location: 'Montreal',
                type: 'Meetup',
                theme: 'Tech',
                ...overrides
            });
    };

    /* =========================
       Join event
    ========================= */

    it('should allow an authenticated user to join an event', async () => {
        const creatorToken = await registerUser('Creator', `c${Date.now()}@test.com`);
        const eventRes = await createEvent(creatorToken);
        const eventId = eventRes.body.event.id;

        const userToken = await registerUser('User', `u${Date.now()}@test.com`);

        const res = await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject joining without token', async () => {
        const creatorToken = await registerUser('Creator', `c${Date.now()}@test.com`);
        const eventRes = await createEvent(creatorToken);

        const res = await request(app).post(`/api/events/${eventRes.body.event.id}/members/join`);

        expect(res.statusCode).toBe(401);
    });

    it('should NOT allow joining a past event', async () => {
        const creatorToken = await registerUser('Creator', `c${Date.now()}@test.com`);

        const eventRes = await createEvent(creatorToken, {
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const userToken = await registerUser('User', `u${Date.now()}@test.com`);

        const res = await request(app)
            .post(`/api/events/${eventRes.body.event.id}/members/join`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Leave event
    ========================= */

    it('should allow a user to leave an event', async () => {
        const creatorToken = await registerUser('Creator', `c${Date.now()}@test.com`);
        const eventRes = await createEvent(creatorToken);
        const eventId = eventRes.body.event.id;

        const userToken = await registerUser('User', `u${Date.now()}@test.com`);

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${userToken}`);

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/leave`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject leaving without token', async () => {
        const creatorToken = await registerUser('Creator', `c${Date.now()}@test.com`);
        const eventRes = await createEvent(creatorToken);

        const res = await request(app).delete(`/api/events/${eventRes.body.event.id}/members/leave`);

        expect(res.statusCode).toBe(401);
    });

    it('should NOT allow leaving a past event', async () => {
        const creatorToken = await registerUser('Creator', `c${Date.now()}@test.com`);

        const eventRes = await createEvent(creatorToken, {
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const userToken = await registerUser('User', `u${Date.now()}@test.com`);

        const res = await request(app)
            .delete(`/api/events/${eventRes.body.event.id}/members/leave`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(403);
    });
});