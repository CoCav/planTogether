const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Events Integration - Permissions 
 *
 * These tests validate role-based access control for events.
 *
 * What is tested:
 * - Participant cannot update or delete an event
 * - Co-organizer can update but cannot delete
 * - Organizer permissions enforced correctly
 *
 * Integration scope:
 * → Auth middleware + Role middleware + Controller + Database
 *
 * Goal:
 * Ensure event actions are restricted based on user roles.
*/

describe('Event Permissions API', () => {

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
        const res = await request(app).post('/api/auth/register').send({
            name,
            email,
            password: 'Password123'
        });
        return res.body.token;
    };

    const getUserIdByEmail = async (email) => {
        const user = await User.findOne({ where: { email } });
        return user.id;
    };

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

    /* =========================
       Participant restrictions
    ========================= */

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

    /* =========================
       Co-organizer permissions
    ========================= */

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