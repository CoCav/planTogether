/* ==================================================
   EVENT MEMBERSHIP INTEGRATION - MEMBERS & ORGANIZERS

   Tests:
   - event members retrieval
   - event organizers retrieval
   - public access to membership endpoints
   - organizer assignment to event creator

   Ensures:
   - membership endpoints return structured data
   - public endpoints work without authentication
   - creator is automatically assigned organizer role
================================================== */

const request = require('supertest');
const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Event Members & Organizers API', () => {

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

    // Register a test user
    const registerUser = async (name, email) => {
        const res = await request(app).post('/api/auth/register').send({
            name,
            email,
            password: 'Password123'
        });

        return {
            token: res.body.token,
            email
        };
    };

    // Create a test event
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

    /* =============================
       MEMBERS
    ============================= */

    it('should get members of an event', async () => {
        const creator = await registerUser(
            'Members Creator',
            `memberscreator${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const participant = await registerUser(
            'Members Participant',
            `membersparticipant${Date.now()}@test.com`
        );

        await request(app)
            .post(`/api/events/${eventId}/members/join`)
            .set('Authorization', `Bearer ${participant.token}`);

        const res = await request(app).get(`/api/events/${eventId}/members`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty('members');
        expect(Array.isArray(res.body.members)).toBe(true);
        expect(res.body.members.length).toBeGreaterThan(0);
    });

    it('should allow getting event members without authentication', async () => {
        const creator = await registerUser(
            'Public Members Creator',
            `publicmembers${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);

        const res = await request(app).get(`/api/events/${eventRes.body.event.id}/members`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('members');
    });

    /* =============================
       ORGANIZER
    ============================= */

    it('should get organizers of an event', async () => {
        const creator = await registerUser(
            'Organizer User',
            `organizer${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}/organizers`);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty('organizers');
        expect(Array.isArray(res.body.organizers)).toBe(true);
        expect(res.body.organizers.length).toBeGreaterThan(0);
    });

    it('should allow getting event organizers without authentication', async () => {
        const creator = await registerUser(
            'Public Organizer Creator',
            `publicorganizer${Date.now()}@test.com`
        );

        const eventRes = await createEvent(creator.token);

        const res = await request(app).get(`/api/events/${eventRes.body.event.id}/organizers`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('organizers');
    });

    /* =============================
       ORGANIZER ASSIGNMENT
    ============================= */

    it('should assign organizer role to the event creator', async () => {
        const creatorEmail = `mainorganizer${Date.now()}@test.com`;

        const creator = await registerUser(
            'Main Organizer',
            creatorEmail
        );

        const eventRes = await createEvent(creator.token);
        const eventId = eventRes.body.event.id;

        const res = await request(app).get(`/api/events/${eventId}/organizers`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.organizers)).toBe(true);

        const organizerEmails = res.body.organizers.map(
            (org) => org.email || org.User?.email
        );

        expect(organizerEmails).toContain(creatorEmail);
    });
});
