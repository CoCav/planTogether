const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   EVENT PERMISSIONS TESTS
   Covers:
   - participant cannot update an event
   - participant cannot delete an event
   - co_organizer can update an event
   - co_organizer cannot delete an event
================================================== */

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
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return registerRes.body.token;
    };

    const getUserIdByEmail = async (email) => {
        const user = await User.findOne({ where: { email } });
        return user.id;
    };

    const getValidEventPayload = () => ({
        title: 'Test Event',
        description: 'This is a test event',
        startDateTime: '2026-12-31T10:00:00.000Z',
        endDateTime: '2026-12-31T12:00:00.000Z',
        mode: 'in_person',
        location: 'Montreal',
        type: 'Meetup',
        theme: 'Technology'
    });

    /* =========================
       Participant restrictions
    ========================= */

    it('should reject event update when requested by a participant', async () => {
        const organizerToken = await registerAndGetToken(
            'Update Organizer',
            `updateorganizer${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({
                ...getValidEventPayload(),
                title: 'Protected Event'
            });

        const eventId = eventRes.body.event.id;

        const participantToken = await registerAndGetToken(
            'Update Participant',
            `updateparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participantToken}`);

        const res = await request(app)
            .put(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${participantToken}`)
            .send({
                title: 'Hacked Title',
                description: 'Should not work',
                startDateTime: '2026-12-31T14:00:00.000Z',
                endDateTime: '2026-12-31T16:00:00.000Z',
                mode: 'in_person',
                location: 'Fake City',
                type: 'Hack',
                theme: 'Hack'
            });

        expect(res.statusCode).toBe(403);
    });

    it('should reject event deletion when requested by a participant', async () => {
        const organizerToken = await registerAndGetToken(
            'Delete Organizer',
            `deleteorganizer${Date.now()}@test.com`
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({
                ...getValidEventPayload(),
                title: 'Protected Delete Event'
            });

        const eventId = eventRes.body.event.id;

        const participantToken = await registerAndGetToken(
            'Delete Participant',
            `deleteparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participantToken}`);

        const res = await request(app)
            .delete(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${participantToken}`);

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Co-organizer permissions
    ========================= */

    it('should allow a co_organizer to update an event', async () => {
        const organizerEmail = `coorgupdateorganizer${Date.now()}@test.com`;
        const coOrganizerEmail = `coorgupdate${Date.now()}@test.com`;

        const organizerToken = await registerAndGetToken(
            'Co Organizer Update Organizer',
            organizerEmail
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({
                ...getValidEventPayload(),
                title: 'Co Organizer Update Event'
            });

        const eventId = eventRes.body.event.id;

        const coOrganizerToken = await registerAndGetToken(
            'Co Organizer User',
            coOrganizerEmail
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${coOrganizerToken}`);

        const coOrganizerId = await getUserIdByEmail(coOrganizerEmail);

        await request(app)
            .put(`/api/events/${eventId}/members/${coOrganizerId}/role`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({
                newRole: 'co_organizer'
            });

        const res = await request(app)
            .put(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${coOrganizerToken}`)
            .send({
                title: 'Updated By Co Organizer',
                description: 'Updated description',
                startDateTime: '2026-12-31T14:00:00.000Z',
                endDateTime: '2026-12-31T16:00:00.000Z',
                mode: 'in_person',
                location: 'Quebec City',
                type: 'Conference',
                theme: 'Business'
            });

        expect(res.statusCode).toBe(200);
    });

    it('should reject event deletion when requested by a co_organizer', async () => {
        const organizerEmail = `coorgdeleteorganizer${Date.now()}@test.com`;
        const coOrganizerEmail = `coorgdelete${Date.now()}@test.com`;

        const organizerToken = await registerAndGetToken(
            'Co Organizer Delete Organizer',
            organizerEmail
        );

        const eventRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({
                ...getValidEventPayload(),
                title: 'Co Organizer Delete Event'
            });

        const eventId = eventRes.body.event.id;

        const coOrganizerToken = await registerAndGetToken(
            'Co Organizer Delete User',
            coOrganizerEmail
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${coOrganizerToken}`);

        const coOrganizerId = await getUserIdByEmail(coOrganizerEmail);

        await request(app)
            .put(`/api/events/${eventId}/members/${coOrganizerId}/role`)
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({
                newRole: 'co_organizer'
            });

        const res = await request(app)
            .delete(`/api/events/${eventId}`)
            .set('Authorization', `Bearer ${coOrganizerToken}`);

        expect(res.statusCode).toBe(403);
    });
});