const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   EVENT MEMBERSHIP VALIDATION TESTS
   Covers:
   - cannot join the same event twice
   - cannot leave an event without being a member
   - cannot join a nonexistent event
   - cannot leave a nonexistent event
   - role update validator
   - member removal validator
================================================== */

describe('Event Membership Validation API', () => {
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
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return {
            token: registerRes.body.token,
            email
        };
    };

    const getUserIdByEmail = async (email) => {
        const user = await User.findOne({ where: { email } });
        return user.id;
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
        return request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));
    };

    /* =========================
       Membership validation
    ========================= */

    it('should reject joining the same event twice', async () => {
        const creator = await registerUser(
            'Edge Creator',
            `edgecreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const participant = await registerUser(
            'Edge Participant',
            `edgeparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        expect(res.statusCode).toBe(409);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject leaving an event without being a member', async () => {
        const creator = await registerUser(
            'Leave Edge Creator',
            `leaveedgecreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const user = await registerUser(
            'Non Member User',
            `nonmember${Date.now()}@test.com`
        );

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/leave`)
            .set('Authorization', `Bearer ${user.token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject joining a nonexistent event', async () => {
        const user = await registerUser(
            'Missing Event Join User',
            `missingjoin${Date.now()}@test.com`
        );

        const res = await request(app)
            .post('/api/events/999999/members/join')
            .set('Authorization', `Bearer ${user.token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject leaving a nonexistent event', async () => {
        const user = await registerUser(
            'Missing Event Leave User',
            `missingleave${Date.now()}@test.com`
        );

        const res = await request(app)
            .delete('/api/events/999999/members/leave')
            .set('Authorization', `Bearer ${user.token}`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('message');
    });

    /* =========================
       Role update validator
    ========================= */

    it('should reject role update without newRole', async () => {
        const organizerEmail = `validatororg${Date.now()}@test.com`;
        const participantEmail = `validatorparticipant${Date.now()}@test.com`;

        const organizer = await registerUser('Validator Organizer', organizerEmail);
        const participant = await registerUser('Validator Participant', participantEmail);

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;
        const participantId = await getUserIdByEmail(participantEmail);

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .put(`/api/events/${eventId}/members/${participantId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject role update with invalid newRole', async () => {
        const organizerEmail = `invalidroleorg${Date.now()}@test.com`;
        const participantEmail = `invalidroleparticipant${Date.now()}@test.com`;

        const organizer = await registerUser('Invalid Role Organizer', organizerEmail);
        const participant = await registerUser('Invalid Role Participant', participantEmail);

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;
        const participantId = await getUserIdByEmail(participantEmail);

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .put(`/api/events/${eventId}/members/${participantId}/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({
                newRole: 'admin'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject role update with non-integer eventId', async () => {
        const organizer = await registerUser(
            'Non Integer EventId Organizer',
            `noteventidorg${Date.now()}@test.com`
        );

        const res = await request(app)
            .put('/api/events/abc/members/1/role')
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({
                newRole: 'participant'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject role update with non-integer userId', async () => {
        const organizer = await registerUser(
            'Non Integer UserId Organizer',
            `notuseridorg${Date.now()}@test.com`
        );

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .put(`/api/events/${eventId}/members/abc/role`)
            .set('Authorization', `Bearer ${organizer.token}`)
            .send({
                newRole: 'participant'
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    /* =========================
       Member removal validator
    ========================= */

    it('should reject member removal with non-integer eventId', async () => {
        const organizer = await registerUser(
            'Remove Invalid EventId Organizer',
            `removeinvalideventid${Date.now()}@test.com`
        );

        const res = await request(app)
            .delete('/api/events/abc/members/1')
            .set('Authorization', `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should reject member removal with non-integer userId', async () => {
        const organizer = await registerUser(
            'Remove Invalid UserId Organizer',
            `removeinvaliduserid${Date.now()}@test.com`
        );

        const eventRes = await createEvent(organizer.token);
        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/abc`)
            .set('Authorization', `Bearer ${organizer.token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });
});