/* ==================================================
   EVENTS INTEGRATION - DELETE EVENT

   Tests:
   - organizer event deletion
   - authentication requirement
   - nonexistent event deletion rejection
   - past event deletion rejection

   Ensures:
   - only authorized users can delete events
   - role middleware protects delete route
   - business rules prevent deleting past events
   - deleted events are no longer retrievable
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Delete Event API', () => {

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
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return res.body.token;
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

    // Create a test event
    const createEvent = async (token, overrides = {}) => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));

        return res.body.event;
    };

    /* =============================
       EVENT DELETION
    ============================= */

    it('should allow an organizer to delete an event', async () => {
        const token = await registerAndGetToken(
            'Event Deleter',
            `eventdeleter${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Event deleted successfully');

        const getRes = await request(app).get(`/api/events/${event.id}`);

        expect(getRes.statusCode).toBe(404);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it('should reject event deletion without token', async () => {
        const token = await registerAndGetToken(
            'Unauthorized Deleter',
            `unauthdelete${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app).delete(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

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

    it('should not allow deleting a past event', async () => {
        const token = await registerAndGetToken(
            'Past Event Deleter',
            `pastdelete${Date.now()}@test.com`
        );

        const event = await createEvent(token, {
            title: 'Past Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(403);
    });
});
