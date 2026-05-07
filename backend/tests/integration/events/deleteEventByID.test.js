/* ==================================================
   EVENTS INTEGRATION - DELETE EVENT BY ID

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

const { registerAndGetToken } = require('../../helpers/authHelper');
const { createEvent } = require('../../helpers/eventHelper');
const { getUserIdByEmail } = require('../../helpers/userHelper');

describe('Delete Event By ID API', () => {

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
       EVENT DELETION
    ============================= */

    it('should allow an organizer to delete an event', async () => {
        const auth = await registerAndGetToken({
            name: 'Event Deleter',
            email: `eventdeleter${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(auth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty(
            'message',
            'Event deleted successfully'
        );

        const getRes = await request(app)
            .get(`/api/events/${event.id}`);

        expect(getRes.statusCode).toBe(404);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it('should reject event deletion without token', async () => {
        const auth = await registerAndGetToken({
            name: 'Unauthorized Deleter',
            email: `unauthdelete${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers);
        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       AUTHORIZATION
    ============================= */

    it('should prevent participant from deleting an event', async () => {
        const organizerAuth = await registerAndGetToken({
            name: 'Org',
            email: `orgd${Date.now()}@test.com`
        });

        const participantAuth = await registerAndGetToken({
            name: 'Part',
            email: `partd${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(participantAuth.headers);

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(participantAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    it('should prevent co_organizer from deleting an event', async () => {
        const organizerAuth = await registerAndGetToken({
            name: 'Org',
            email: `orgd${Date.now()}@test.com`
        });

        const coOrganizerAuth = await registerAndGetToken({
            name: 'Co',
            email: `cod${Date.now()}@test.com`
        });

        const eventRes = await createEvent(organizerAuth.headers);
        const event = eventRes.body.event;

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set(coOrganizerAuth.headers);

        const coId = await getUserIdByEmail(
            coOrganizerAuth.email
        );

        await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set(organizerAuth.headers)
            .send({
                newRole: 'co_organizer'
            });

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(coOrganizerAuth.headers);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it('should reject deleting a nonexistent event', async () => {
        const auth = await registerAndGetToken({
            name: 'Missing Event Deleter',
            email: `missingdelete${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete('/api/events/999999')
            .set(auth.headers);

        expect(res.statusCode).toBe(403);
    });

    it('should not allow deleting a past event', async () => {
        const auth = await registerAndGetToken({
            name: 'Past Event Deleter',
            email: `pastdelete${Date.now()}@test.com`
        });

        const eventRes = await createEvent(auth.headers, {
            title: 'Past Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const event = eventRes.body.event;

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set(auth.headers);

        expect(res.statusCode).toBe(403);
    });
});
