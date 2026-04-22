const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   EVENT MEMBERSHIP TESTS
   Covers:
   - join event
   - leave event
   - get current user's events
   - get event members
   - get event organizers
   - automatic organizer assignment
   - protected membership routes
================================================== */

describe('Event Membership API', () => {
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

    // Register a user and return both token and email
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

    // Return a valid event payload aligned with the current backend validator
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

    // Create an event and return its response
    const createEvent = async (token, overrides = {}) => {
        return request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));
    };

    /* =========================
       Join / Leave event
    ========================= */

    it('should allow an authenticated user to join an event', async () => {
        const creator = await registerUser(
            'Event Creator',
            `creator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Joinable Event',
            description: 'An event to test joining'
        });

        const eventId = eventRes.body.event.id;

        const participant = await registerUser(
            'Participant User',
            `participant${Date.now()}@test.com`
        );

        const res = await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
    });

    it('should reject joining an event without token', async () => {
        const creator = await registerUser(
            'Join No Token Creator',
            `jointokencreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Protected Join Event'
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .post(`/api/events/${eventId}/members/join`);

        expect(res.statusCode).toBe(401);
    });

    it('should allow an authenticated user to leave an event', async () => {
        const creator = await registerUser(
            'Leave Event Creator',
            `leavecreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Event To Leave',
            description: 'An event to test leaving'
        });

        const eventId = eventRes.body.event.id;

        const participant = await registerUser(
            'Leaving Participant',
            `leaveparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/leave`)
            .set('Authorization', `Bearer ${participant.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toBeDefined();
    });

    it('should reject leaving an event without token', async () => {
        const creator = await registerUser(
            'Leave No Token Creator',
            `leavetokencreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Protected Leave Event'
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .delete(`/api/events/${eventId}/members/leave`);

        expect(res.statusCode).toBe(401);
    });

    /* =========================
       Current user's memberships
    ========================= */

    it('should get events for the authenticated user', async () => {
        const creator = await registerUser(
            'Creator',
            `creator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'User Events Test',
            description: 'Testing get my events'
        });

        const eventId = eventRes.body.event.id;

        const participant = await registerUser(
            'Participant',
            `participant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .get('/api/events/my-events')
            .set('Authorization', `Bearer ${participant.token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    it('should reject getting current user events without token', async () => {
        const res = await request(app)
            .get('/api/events/my-events');

        expect(res.statusCode).toBe(401);
    });

    /* =========================
       Event members / organizers
    ========================= */

    it('should get members of an event', async () => {
        const creator = await registerUser(
            'Members Creator',
            `memberscreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Members Event',
            description: 'Testing event members'
        });

        const eventId = eventRes.body.event.id;

        const participant = await registerUser(
            'Members Participant',
            `membersparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app)
            .get(`/api/events/${eventId}/members`)
            .set('Authorization', `Bearer ${participant.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('members');
        expect(Array.isArray(res.body.members)).toBe(true);
        expect(res.body.members.length).toBeGreaterThan(0);
    });

    it('should allow getting event members without token', async () => {
        const creator = await registerUser(
            'Members Protected Creator',
            `membersprotected${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Protected Members Event'
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .get(`/api/events/${eventId}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('members');
    });

    it('should get organizers of an event', async () => {
        const creator = await registerUser(
            'Organizer User',
            `organizer${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Organizer Event',
            description: 'Testing organizers'
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .get(`/api/events/${eventId}/organizers`)
            .set('Authorization', `Bearer ${creator.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('organizers');
        expect(Array.isArray(res.body.organizers)).toBe(true);
        expect(res.body.organizers.length).toBeGreaterThan(0);
    });

    it('should allow getting event organizers without token', async () => {
        const creator = await registerUser(
            'Organizer Protected Creator',
            `organizerprotected${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Protected Organizers Event'
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .get(`/api/events/${eventId}/organizers`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('organizers');
    });

    /* =========================
       Organizer assignment
    ========================= */

    it('should assign organizer role to the event creator', async () => {
        const creatorEmail = `mainorganizer${Date.now()}@test.com`;

        const creator = await registerUser(
            'Main Organizer',
            creatorEmail
        );

        const eventRes = await createEvent(creator.token, {
            title: 'Organizer Role Event',
            description: 'Testing automatic organizer assignment'
        });

        const eventId = eventRes.body.event.id;

        const res = await request(app)
            .get(`/api/events/${eventId}/organizers`)
            .set('Authorization', `Bearer ${creator.token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('organizers');
        expect(Array.isArray(res.body.organizers)).toBe(true);
        expect(res.body.organizers.length).toBeGreaterThan(0);

        const organizerEmails = res.body.organizers.map((organizer) =>
            organizer.email || organizer.User?.email
        );

        expect(organizerEmails).toContain(creatorEmail);
    });
});