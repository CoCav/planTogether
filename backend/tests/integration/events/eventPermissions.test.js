/* ==================================================
   EVENTS INTEGRATION - PERMISSIONS

   Tests:
   - participant update restriction
   - participant delete restriction
   - co-organizer update permission
   - co-organizer delete restriction

   Ensures:
   - event actions are restricted by role
   - participants cannot manage events
   - co-organizers can update but cannot delete events
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Event Permissions API', () => {

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

    // Retrieve user ID from database using email
    const getUserIdByEmail = async (email) => {
        const user = await User.findOne({ where: { email } });
        return user.id;
    };

    // Create a test event
    const createEvent = async (token) => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Protected Event',
                description: 'Test',
                type: 'Meetup',
                theme: 'Tech',
                mode: 'in_person',
                location: 'Montreal',
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z'
            });

        return res.body.event;
    };

    /* =============================
       PARTICIPANT RESTRICTIONS
    ============================= */

    it('should prevent participant from updating an event', async () => {
        const organizerToken = await registerAndGetToken('Org', `org${Date.now()}@test.com`);
        const participantToken = await registerAndGetToken('Part', `part${Date.now()}@test.com`);

        const event = await createEvent(organizerToken);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set('Authorization', `Bearer ${participantToken}`);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${participantToken}`)
            .send({
                title: 'Hacked',
                description: 'Hacked',
                type: 'Meetup',
                theme: 'Tech',
                mode: 'in_person',
                startDateTime: '2026-12-31T14:00:00.000Z',
                endDateTime: '2026-12-31T16:00:00.000Z'
            });

        expect(res.statusCode).toBe(403);
    });

    it('should prevent participant from deleting an event', async () => {
        const organizerToken = await registerAndGetToken('Org', `orgd${Date.now()}@test.com`);
        const participantToken = await registerAndGetToken('Part', `partd${Date.now()}@test.com`);

        const event = await createEvent(organizerToken);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set('Authorization', `Bearer ${participantToken}`);

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${participantToken}`);

        expect(res.statusCode).toBe(403);
    });

    /* =============================
       CO-ORGANIZER PERMISSIONS
    ============================= */

    it('should allow co_organizer to update an event', async () => {
        const organizerEmail = `orgu${Date.now()}@test.com`;
        const coEmail = `cou${Date.now()}@test.com`;

        const organizerToken = await registerAndGetToken('Org', organizerEmail);
        const coToken = await registerAndGetToken('Co', coEmail);

        const event = await createEvent(organizerToken);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set('Authorization', `Bearer ${coToken}`);

        const coId = await getUserIdByEmail(coEmail);

        await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({ newRole: 'co_organizer' });

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${coToken}`)
            .send({
                title: 'Updated by Co',
                description: 'Updated by Co',
                type: 'Meetup',
                theme: 'Tech',
                mode: 'in_person',
                startDateTime: '2026-12-31T14:00:00.000Z',
                endDateTime: '2026-12-31T16:00:00.000Z'
            });

        expect(res.statusCode).toBe(200);
    });

    it('should prevent co_organizer from deleting an event', async () => {
        const organizerEmail = `orgd${Date.now()}@test.com`;
        const coEmail = `cod${Date.now()}@test.com`;

        const organizerToken = await registerAndGetToken('Org', organizerEmail);
        const coToken = await registerAndGetToken('Co', coEmail);

        const event = await createEvent(organizerToken);

        await request(app)
            .post(`/api/events/${event.id}/members/join`)
            .set('Authorization', `Bearer ${coToken}`);

        const coId = await getUserIdByEmail(coEmail);

        await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({ newRole: 'co_organizer' });

        const res = await request(app)
            .delete(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${coToken}`);

        expect(res.statusCode).toBe(403);
    });
});
