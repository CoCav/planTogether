/* ==================================================
   EVENTS INTEGRATION - UPDATE EVENT

   Tests:
   - organizer event update
   - image replacement
   - authentication requirement
   - nonexistent event update rejection
   - past event update rejection
   - participant limit and registration deadline updates

   Ensures:
   - only authorized users can update events
   - old uploaded images are deleted correctly
   - business rules prevent invalid updates
   - event update flow works end-to-end
================================================== */

const fs = require('fs');
const path = require('path');
const request = require('supertest');

const app = require('../../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../../src/models');

describe('Update Event API', () => {

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
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name,
                email,
                password: 'Password123'
            });

        return res.body.token;
    };

    // Generate a valid event payload
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

    // Create a test event
    const createEvent = async (token, overrides = {}) => {
        const res = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));

        return res.body.event;
    };

    /* =============================
       EVENT UPDATE
    ============================= */

    it('should allow organizer to update an event', async () => {
        const token = await registerAndGetToken(
            'Event Organizer',
            `organizer${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Event',
                description: 'Updated description',
                type: 'Conference',
                theme: 'Business',
                mode: 'online',
                startDateTime: '2026-12-31T14:00:00.000Z',
                endDateTime: '2026-12-31T16:00:00.000Z'
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.event).toMatchObject({
            title: 'Updated Event',
            description: 'Updated description',
            type: 'Conference',
            theme: 'Business',
            mode: 'online'
        });
    });

    it('should update event image and delete old image', async () => {
        const token = await registerAndGetToken(
            'Image Organizer',
            `image${Date.now()}@test.com`
        );

        const createRes = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Image Event')
            .field('description', 'Image description')
            .field('type', 'Meetup')
            .field('theme', 'Technology')
            .field('mode', 'online')
            .field('startDateTime', '2026-12-31T10:00:00.000Z')
            .field('endDateTime', '2026-12-31T12:00:00.000Z')
            .attach('image', Buffer.from('old image'), {
                filename: 'old.png',
                contentType: 'image/png'
            });

        const event = createRes.body.event;

        const oldImagePath = path.join(__dirname, '../../../', event.image);

        // Old image should exist before replacement
        expect(fs.existsSync(oldImagePath)).toBe(true);

        const updateRes = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Updated Image Event')
            .field('description', 'Updated')
            .field('type', 'Meetup')
            .field('theme', 'Technology')
            .field('mode', 'online')
            .field('startDateTime', '2026-12-31T10:00:00.000Z')
            .field('endDateTime', '2026-12-31T12:00:00.000Z')
            .attach('image', Buffer.from('new image'), {
                filename: 'new.png',
                contentType: 'image/png'
            });

        expect(updateRes.statusCode).toBe(200);

        // Old image file should be deleted after replacement
        expect(fs.existsSync(oldImagePath)).toBe(false);
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it('should reject update without token', async () => {
        const token = await registerAndGetToken(
            'Unauthorized User',
            `unauthorized${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .send({
                title: 'Unauthorized Update'
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it('should reject update for nonexistent event', async () => {
        const token = await registerAndGetToken(
            'Missing Event User',
            `missing${Date.now()}@test.com`
        );

        const res = await request(app)
            .put('/api/events/999999')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Missing Event',
                description: 'Missing description',
                type: 'Meetup',
                theme: 'Technology',
                mode: 'online',
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z'
            });

        expect(res.statusCode).toBe(403);
    });

    it('should reject update for past event', async () => {
        const token = await registerAndGetToken(
            'Past Event User',
            `pastupdate${Date.now()}@test.com`
        );

        const event = await createEvent(token, {
            title: 'Past Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Past Event',
                description: 'Updated past description',
                type: 'Meetup',
                theme: 'Technology',
                mode: 'online',
                startDateTime: '2020-01-01T10:00:00.000Z',
                endDateTime: '2020-01-01T12:00:00.000Z'
            });
        expect(res.statusCode).toBe(403);
    });

    it('should update participant limit and registration deadline', async () => {
        const token = await registerAndGetToken(
            'Advanced Update User',
            `advanced${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Event',
                description: 'Updated',
                type: 'Meetup',
                theme: 'Technology',
                mode: 'online',
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z',
                maxParticipants: 50,
                registrationDeadline: '2026-12-30T10:00:00.000Z'
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.event.maxParticipants).toBe(50);

        expect(new Date(res.body.event.registrationDeadline).toISOString()).toBe('2026-12-30T10:00:00.000Z');
    });

    it('should reject invalid registration deadline update', async () => {
        const token = await registerAndGetToken(
            'Deadline User',
            `deadline${Date.now()}@test.com`
        );

        const event = await createEvent(token);

        const res = await request(app)
            .put(`/api/events/${event.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Invalid Deadline Event',
                description: 'Invalid',
                type: 'Meetup',
                theme: 'Technology',
                mode: 'online',
                startDateTime: '2026-12-31T10:00:00.000Z',
                endDateTime: '2026-12-31T12:00:00.000Z',
                registrationDeadline: '2027-01-01T10:00:00.000Z'
            });

        // Registration deadline must be before event start
        expect(res.statusCode).toBe(400);
    });
});
