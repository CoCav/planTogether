const request = require('supertest');
const app = require('../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../src/models');

// Test suite for event membership routes
describe('Event Membership API', () => {

    // Initialize the test database before running the test suite
    beforeAll(async () => {
        await initDB();
    });

    // Clean database after each test
    afterEach(async () => {
        await EventUserRole.destroy({ where: {} });
        await Event.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    // Close the database connection after all tests are finished
    afterAll(async () => {
        await sequelize.close();
    });


    // ---------------- TESTS ----------------

    // ----------- NORMAL CASES ----------

    // Test to verify that an authenticated user can join an event
    it('should allow an authenticated user to join an event', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Event Creator',
            email: `creator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Joinable Event',
            description: 'An event to test joining',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register another user who will join the event
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Participant User',
            email: `participant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event
        const res = await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that joining is successful
        expect(res.statusCode).toBe(200);

        // Check that the response contains a success message or membership data
        expect(res.body).toBeDefined();
    });

    // Test to verify that an authenticated user can leave an event after joining it
    it('should allow an authenticated user to leave an event', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Leave Event Creator',
            email: `leavecreator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Event To Leave',
            description: 'An event to test leaving',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Leaving Participant',
            email: `leaveparticipant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event before leaving it
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Leave the event
        const res = await request(app)
        .delete(`/api/events/${eventId}/members/leave`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that leaving is successful
        expect(res.statusCode).toBe(200);

        // Check that the response exists
        expect(res.body).toBeDefined();
    });

    // Test to verify that an authenticated user can retrieve their joined events
    it('should get events for the authenticated user', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Creator',
            email: `creator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'User Events Test',
            description: 'Testing get my events',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Participant',
            email: `participant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Get events for the participant
        const res = await request(app)
        .get('/api/events/memberships/me')
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that at least one event is returned
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Test to verify that an authenticated user can get the members of an event
    it('should get members of an event', async () => {
        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Members Creator',
            email: `memberscreator${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
    const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Members Event',
            description: 'Testing event members',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Members Participant',
            email: `membersparticipant${Date.now()}@test.com`,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Join the event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Get the event members
        const res = await request(app)
        .get(`/api/events/${eventId}/members`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Check that the request is successful
        expect(res.statusCode).toBe(200);

        // Check that the response contains a members array
        expect(res.body).toHaveProperty('members');
        expect(Array.isArray(res.body.members)).toBe(true);
        expect(res.body.members.length).toBeGreaterThan(0);
    });

    // Test to verify that an authenticated user can get organizers of an event
    it('should get organizers of an event', async () => {
        // Step 1: Register the event creator (organizer)
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Organizer User',
            email: `organizer${Date.now()}@test.com`,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event (creator should be organizer)
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Organizer Event',
            description: 'Testing organizers',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Get organizers
        const res = await request(app)
        .get(`/api/events/${eventId}/organizers`)
        .set('Authorization', `Bearer ${creatorToken}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that organizers are returned
        expect(res.body).toHaveProperty('organizers');
        expect(Array.isArray(res.body.organizers)).toBe(true);
        expect(res.body.organizers.length).toBeGreaterThan(0);
    });

    // Test to verify that the event creator is automatically assigned the organizer role
    it('should assign organizer role to the event creator', async () => {

        const creatorEmail = `mainorganizer${Date.now()}@test.com`;

        // Step 1: Register the event creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Main Organizer',
            email: creatorEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Organizer Role Event',
            description: 'Testing automatic organizer assignment',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Get organizers of the event
        const res = await request(app)
        .get(`/api/events/${eventId}/organizers`)
        .set('Authorization', `Bearer ${creatorToken}`);

        // Check that request is successful
        expect(res.statusCode).toBe(200);

        // Check that organizers are returned
        expect(res.body).toHaveProperty('organizers');
        expect(Array.isArray(res.body.organizers)).toBe(true);
        expect(res.body.organizers.length).toBeGreaterThan(0);

        // Try common response shapes
        const organizerEmails = res.body.organizers.map((organizer) =>
            organizer.email || organizer.User?.email
        );

        expect(organizerEmails).toContain(creatorEmail);
    });

    // Test to verify that an organizer can update a member's role
    it('should allow an organizer to update a member role to co_organizer', async () => {

        const organizerEmail = `roleorganizer${Date.now()}@test.com`;
        const participantEmail = `roleparticipant${Date.now()}@test.com`;

        // Step 1: Register the event creator (organizer)
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Role Organizer',
            email: organizerEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create an event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Role Test Event',
            description: 'Testing role updates',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Role Participant',
            email: participantEmail,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        const participant = await User.findOne({
            where: { email: participantEmail }
        });

        const participantId = participant.id;

        // Step 4: Participant joins the event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 5: Organizer updates role
        const res = await request(app)
        .put(`/api/events/${eventId}/members/${participantId}/role`)
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            newRole: 'co_organizer'
        });

        // Check that role update is successful
        expect(res.statusCode).toBe(200);

        // Check that response exists
        expect(res.body).toBeDefined();
    });

    // Test to verify that an organizer can remove a member from an event
    it('should allow an organizer to remove a member from an event', async () => {
        const organizerEmail = `removeorganizer${Date.now()}@test.com`;
        const participantEmail = `removeparticipant${Date.now()}@test.com`;

        // Step 1: Register organizer
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Remove Organizer',
            email: organizerEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Remove Member Event',
            description: 'Testing member removal',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register participant
        const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Remove Participant',
            email: participantEmail,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: Retrieve participant id from DB
        const participant = await User.findOne({
            where: { email: participantEmail }
        });

        const participantId = participant.id;

        // Step 5: Participant joins event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        // Step 6: Organizer removes participant
        const res = await request(app)
        .delete(`/api/events/${eventId}/members/${participantId}`)
        .set('Authorization', `Bearer ${creatorToken}`);

        // Check that removal is successful
        expect(res.statusCode).toBe(200);
    });


    // ----------- PERMISIONS -----------

    // Test to verify that a participant cannot update another member's role
    it('should reject role update when requested by a participant', async () => {
        const organizerEmail = `forbiddenorganizer${Date.now()}@test.com`;
        const participantOneEmail = `participantone${Date.now()}@test.com`;
        const participantTwoEmail = `participanttwo${Date.now()}@test.com`;

        // Step 1: Register organizer
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Forbidden Organizer',
            email: organizerEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Forbidden Role Update Event',
            description: 'Testing forbidden role updates',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register participant one
        const participantOneRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Participant One',
            email: participantOneEmail,
            password: 'Password123'
        });

        const participantOneToken = participantOneRes.body.token;

        // Step 4: Register participant two
        const participantTwoRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Participant Two',
            email: participantTwoEmail,
            password: 'Password123'
        });

        // Step 5: Retrieve participant two id from database
        const participantTwo = await User.findOne({
            where: { email: participantTwoEmail }
        });

        const participantTwoId = participantTwo.id;

        // Step 6: Both participants join the event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantOneToken}`);

        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantTwoRes.body.token}`);

        // Step 7: Participant one tries to update participant two role
        const res = await request(app)
        .put(`/api/events/${eventId}/members/${participantTwoId}/role`)
        .set('Authorization', `Bearer ${participantOneToken}`)
        .send({
            newRole: 'co_organizer'
        });

        // Check that access is denied
        expect(res.statusCode).toBe(403);
    });

    // Test to verify that a participant cannot remove another member from an event
    it('should reject member removal when requested by a participant', async () => {

        const organizerEmail = `forbiddenremoveorganizer${Date.now()}@test.com`;
        const participantOneEmail = `removeparticipantone${Date.now()}@test.com`;
        const participantTwoEmail = `removeparticipanttwo${Date.now()}@test.com`;

        // Step 1: Register organizer
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Forbidden Remove Organizer',
            email: organizerEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Forbidden Remove Event',
            description: 'Testing forbidden member removal',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register participant one
        const participantOneRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Remove Participant One',
            email: participantOneEmail,
            password: 'Password123'
        });

        const participantOneToken = participantOneRes.body.token;

        // Step 4: Register participant two
        const participantTwoRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Remove Participant Two',
            email: participantTwoEmail,
            password: 'Password123'
        });

        const participantTwoToken = participantTwoRes.body.token;

        // Step 5: Retrieve participant two id from DB
        const participantTwo = await User.findOne({
            where: { email: participantTwoEmail }
        });

        const participantTwoId = participantTwo.id;

        // Step 6: Both participants join the event
        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantOneToken}`);

        await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantTwoToken}`);

        // Step 7: Participant one tries to remove participant two
        const res = await request(app)
        .delete(`/api/events/${eventId}/members/${participantTwoId}`)
        .set('Authorization', `Bearer ${participantOneToken}`);

        // Check that access is denied
        expect(res.statusCode).toBe(403);
    });


    // ----------- EDGE CASES ----------

    // Test to verify that a user cannot join the same event twice
    it('should reject joining the same event twice', async () => {
        const creatorEmail = `doublejoincreator${Date.now()}@test.com`;
        const participantEmail = `doublejoinparticipant${Date.now()}@test.com`;

        // Step 1: Register user
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Double Join Creator',
            email : creatorEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Double Join Event',
            description: 'Testing double join',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Technology'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register a separate participant
       const participantRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Double Join Participant',
            email: participantEmail,
            password: 'Password123'
        });

        const participantToken = participantRes.body.token;

        // Step 4: First join should succeed
        const firstJoin = await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        expect(firstJoin.statusCode).toBe(200);

        // Step 5: Second join should fail
        const secondJoin = await request(app)
        .post(`/api/events/${eventId}/members/join`)
        .set('Authorization', `Bearer ${participantToken}`);

        expect([400, 409]).toContain(secondJoin.statusCode);
    });


    it('should reject leaving an event if user is not a member', async () => {
        const creatorEmail = `leavecreator${Date.now()}@test.com`;
        const userEmail = `leavenotmember${Date.now()}@test.com`;

        // Step 1: Register creator
        const creatorRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Leave Creator',
            email: creatorEmail,
            password: 'Password123'
        });

        const creatorToken = creatorRes.body.token;

        // Step 2: Create event
        const eventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({
            title: 'Leave Edge Case Event',
            description: 'Testing leave without membership',
            date: '2026-12-31',
            location: 'Montreal',
            type: 'Meetup',
            theme: 'Tech'
        });

        const eventId = eventRes.body.event.id;

        // Step 3: Register another user (who will NOT join)
        const userRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Not Member User',
            email: userEmail,
            password: 'Password123'
        });

        const token = userRes.body.token;

        // Step 4: Try to leave event without joining
        const res = await request(app)
        .delete(`/api/events/${eventId}/members/leave`)
        .set('Authorization', `Bearer ${token}`);

        // Check that request is rejected
        expect([400, 404]).toContain(res.statusCode);
    });
});