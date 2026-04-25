const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

/**
 * Events Membership Integration - Permissions
 *
 * These tests validate role-based permissions for event membership.
 *
 * What is tested:
 * - Organizer role management (promote, demote, remove)
 * - Co-organizer permissions and restrictions
 * - Participant restrictions
 *
 * Integration scope:
 * → Auth middleware + Role middleware + Controller + Database
 *
 * Goal:
 * Ensure role hierarchy is enforced correctly.
*/

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
        const res = await request(app).post('/api/auth/register').send({
            name,
            email,
            password: 'Password123'
        });
        return { token: res.body.token, email };
    };

    const createEvent = async (token) => {
        const res = await request(app)
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
                theme: 'Tech'
            });

        return res.body.event;
    };

    const getUserId = async (email) => {
        const user = await User.findOne({ where: { email } });
        return user.id;
    };

    /* =========================
       Organizer permissions
    ========================= */

    it('should allow organizer to promote participant to co_organizer', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const participantEmail = `p${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const participant = await registerUser('P', participantEmail);
        const participantId = await getUserId(participantEmail);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${participantId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        expect(res.statusCode).toBe(200);
    });

    it('should allow organizer to demote co_organizer to participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const coEmail = `co${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const co = await registerUser('Co', coEmail);
        const coId = await getUserId(coEmail);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${co.token}`);

        await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'participant' });

        expect(res.statusCode).toBe(200);
    });

    it('should allow organizer to remove a participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const pEmail = `p${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const participant = await registerUser('P', pEmail);
        const pId = await getUserId(pEmail);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${pId}`)
            .set('Authorization', `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject promoting to organizer role', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const userEmail = `u${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const user = await registerUser('U', userEmail);
        const userId = await getUserId(userEmail);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${user.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${userId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'organizer' });

        expect(res.statusCode).toBe(403);
    });

    it('should reject organizer removing themselves', async () => {
        const email = `org${Date.now()}@test.com`;
        const organizer = await registerUser('Org', email);

        const event = await createEvent(organizer.token);
        const orgId = await getUserId(email);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${orgId}`)
            .set('Authorization', `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Co-organizer permissions
    ========================= */

    it('should allow co_organizer to remove a participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const coEmail = `co${Date.now()}@test.com`;
        const pEmail = `p${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const co = await registerUser('Co', coEmail);
        const p = await registerUser('P', pEmail);

        const coId = await getUserId(coEmail);
        const pId = await getUserId(pEmail);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${co.token}`);
        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${p.token}`);

        await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${pId}`)
            .set('Authorization', `Bearer ${co.token}`);

        expect(res.statusCode).toBe(200);
    });

    it('should reject role update by co_organizer', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const coEmail = `co${Date.now()}@test.com`;
        const targetEmail = `t${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const co = await registerUser('Co', coEmail);
        const target = await registerUser('Target', targetEmail);

        const coId = await getUserId(coEmail);
        const targetId = await getUserId(targetEmail);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${co.token}`);
        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${target.token}`);

        await request(app)
            .put(`/api/events/${event.id}/members/${coId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({ newRole: 'co_organizer' });

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${targetId}/role`)
            .set('Authorization', `Bearer ${co.token}`)
            .send({ newRole: 'co_organizer' });

        expect(res.statusCode).toBe(403);
    });

    it('should reject removing another co_organizer', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const co1Email = `co1${Date.now()}@test.com`;
        const co2Email = `co2${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const co1 = await registerUser('Co1', co1Email);
        const co2 = await registerUser('Co2', co2Email);

        const co1Id = await getUserId(co1Email);
        const co2Id = await getUserId(co2Email);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${co1.token}`);
        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${co2.token}`);

        await request(app).put(`/api/events/${event.id}/members/${co1Id}/role`).set('Authorization', `Bearer ${organizer.token}`).send({ newRole: 'co_organizer' });
        await request(app).put(`/api/events/${event.id}/members/${co2Id}/role`).set('Authorization', `Bearer ${organizer.token}`).send({ newRole: 'co_organizer' });

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${co2Id}`)
            .set('Authorization', `Bearer ${co1.token}`);

        expect(res.statusCode).toBe(403);
    });

    /* =========================
       Participant restrictions
    ========================= */

    it('should reject role update by participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const p1Email = `p1${Date.now()}@test.com`;
        const p2Email = `p2${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const p1 = await registerUser('P1', p1Email);
        const p2 = await registerUser('P2', p2Email);

        const p2Id = await getUserId(p2Email);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${p1.token}`);
        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${p2.token}`);

        const res = await request(app)
            .put(`/api/events/${event.id}/members/${p2Id}/role`)
            .set('Authorization', `Bearer ${p1.token}`)
            .send({ newRole: 'co_organizer' });

        expect(res.statusCode).toBe(403);
    });

    it('should reject member removal by participant', async () => {
        const organizer = await registerUser('Org', `org${Date.now()}@test.com`);
        const p1Email = `p1${Date.now()}@test.com`;
        const p2Email = `p2${Date.now()}@test.com`;

        const event = await createEvent(organizer.token);

        const p1 = await registerUser('P1', p1Email);
        const p2 = await registerUser('P2', p2Email);

        const p2Id = await getUserId(p2Email);

        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${p1.token}`);
        await request(app).post(`/api/events/${event.id}/members/join`).set('Authorization', `Bearer ${p2.token}`);

        const res = await request(app)
            .delete(`/api/events/${event.id}/members/${p2Id}`)
            .set('Authorization', `Bearer ${p1.token}`);

        expect(res.statusCode).toBe(403);
    });
});