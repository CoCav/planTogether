const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   EVENT MEMBERSHIP PERMISSIONS TESTS
   Covers:
   - organizer role management
   - co_organizer permissions
   - participant restrictions
================================================== */

describe('Event Membership Permissions API', () => {
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
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return { token: res.body.token, email };
    };

    const getValidEventPayload = (overrides = {}) => ({
        title: 'Test Event',
        description: 'Test description',
        startDateTime: '2026-12-31T10:00:00.000Z',
        endDateTime: '2026-12-31T12:00:00.000Z',
        mode: 'in_person',
        location: 'Montreal',
        type: 'Meetup',
        theme: 'Technology',
        ...overrides
    });

    const createEvent = async (token) => {
        return request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload());
    };

    const getUserIdByEmail = async (email) => {
        const user = await User.findOne({ where: { email } });
        return user.id;
    };

    /* =========================
       Organizer permissions
    ========================= */

    it('should allow an organizer to promote a participant to co_organizer', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const participantEmail = `participant${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const participant = await registerUser('Participant', participantEmail);
        const participantId = await getUserIdByEmail(participantEmail);

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .put(`/api/events/${eventId}/members/${participantId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        expect(res.statusCode).toBe(200);
    });

    it('should allow an organizer to demote a co_organizer to participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const coOrgEmail = `coorg${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const coOrg = await registerUser('CoOrg', coOrgEmail);
        const coOrgId = await getUserIdByEmail(coOrgEmail);

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${coOrg.token}`);

        // Promote
        await request(app)
            .put(`/api/events/${eventId}/members/${coOrgId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        // Demote
        const res = await request(app)
            .put(`/api/events/${eventId}/members/${coOrgId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'participant' });

        expect(res.statusCode).toBe(200);
    });

    it('should allow an organizer to remove a participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const participantEmail = `participant${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const participant = await registerUser('Participant', participantEmail);
        const participantId = await getUserIdByEmail(participantEmail);

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/${participantId}`)
            .set('Authorization', `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject promoting a member to organizer', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const userEmail = `user${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const user = await registerUser('User', userEmail);
        const userId = await getUserIdByEmail(userEmail);

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${user.token}`);

        const res = await request(app)
            .put(`/api/events/${eventId}/members/${userId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'organizer' });

        expect(res.statusCode).toBe(403);
    });

    it('should reject organizer removing themselves', async () => {
        const organizerEmail = `org${Date.now()}@test.com`;
        const organizer = await registerUser('Org', organizerEmail);

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const organizerId = await getUserIdByEmail(organizerEmail);

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/${organizerId}`)
            .set('Authorization', `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Co-organizer permissions
    ========================= */

    it('should allow a co_organizer to remove a participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const coOrgEmail = `coorg${Date.now()}@test.com`;
        const participantEmail = `participant${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const coOrg = await registerUser('CoOrg', coOrgEmail);
        const participant = await registerUser('Participant', participantEmail);

        const coOrgId = await getUserIdByEmail(coOrgEmail);
        const participantId = await getUserIdByEmail(participantEmail);

        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${coOrg.token}`);
        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${participant.token}`);

        await request(app)
            .put(`/api/events/${eventId}/members/${coOrgId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/${participantId}`)
            .set('Authorization', `Bearer ${coOrg.token}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject role update when requested by a co_organizer', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const coOrgEmail = `coorg${Date.now()}@test.com`;
        const targetEmail = `target${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const coOrg = await registerUser('CoOrg', coOrgEmail);
        const target = await registerUser('Target', targetEmail);

        const coOrgId = await getUserIdByEmail(coOrgEmail);
        const targetId = await getUserIdByEmail(targetEmail);

        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${coOrg.token}`);
        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${target.token}`);

        await request(app)
            .put(`/api/events/${eventId}/members/${coOrgId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        const res = await request(app)
            .put(`/api/events/${eventId}/members/${targetId}/role`)
            .set('Authorization', `Bearer ${coOrg.token}`)
            .send({ newRole: 'co_organizer' });

        expect(res.statusCode).toBe(403);
    });

    it('should reject removing another co_organizer', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const coOrg1Email = `coorg1${Date.now()}@test.com`;
        const coOrg2Email = `coorg2${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const coOrg1 = await registerUser('CoOrg1', coOrg1Email);
        const coOrg2 = await registerUser('CoOrg2', coOrg2Email);

        const coOrg1Id = await getUserIdByEmail(coOrg1Email);
        const coOrg2Id = await getUserIdByEmail(coOrg2Email);

        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${coOrg1.token}`);
        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${coOrg2.token}`);

        await request(app).put(`/api/events/${eventId}/members/${coOrg1Id}/role`).set('Authorization', `Bearer ${organizer.token}`).send({ newRole: 'co_organizer' });
        await request(app).put(`/api/events/${eventId}/members/${coOrg2Id}/role`).set('Authorization', `Bearer ${organizer.token}`).send({ newRole: 'co_organizer' });

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/${coOrg2Id}`)
            .set('Authorization', `Bearer ${coOrg1.token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Participant restrictions
    ========================= */

    it('should reject role update when requested by a participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const p1Email = `p1${Date.now()}@test.com`;
        const p2Email = `p2${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const p1 = await registerUser('P1', p1Email);
        const p2 = await registerUser('P2', p2Email);

        const p2Id = await getUserIdByEmail(p2Email);

        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${p1.token}`);
        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${p2.token}`);

        const res = await request(app)
            .put(`/api/events/${eventId}/members/${p2Id}/role`)
            .set('Authorization', `Bearer ${p1.token}`)
            .send({ newRole: 'co_organizer' });

        expect(res.statusCode).toBe(403);
    });

    it('should reject member removal when requested by a participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const p1Email = `p1${Date.now()}@test.com`;
        const p2Email = `p2${Date.now()}@test.com`;

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const p1 = await registerUser('P1', p1Email);
        const p2 = await registerUser('P2', p2Email);

        const p2Id = await getUserIdByEmail(p2Email);

        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${p1.token}`);
        await request(app).post(`/api/events/${eventId}/members/join`).set('Authorization', `Bearer ${p2.token}`);

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/${p2Id}`)
            .set('Authorization', `Bearer ${p1.token}`);

        expect(res.statusCode).toBe(403);
    });
});