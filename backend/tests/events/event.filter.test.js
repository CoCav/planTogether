const request = require('supertest');
const app = require('../../src/app');
const { initDB, sequelize, User, Event, EventUserRole } = require('../../src/models');

/* ==================================================
   EVENT FILTER TESTS
   Covers:
   - filtering events by type
   - filtering events by theme
   - filtering events by search
   - filtering events by exact date
   - filtering events by date range
   - filtering events with combined query params
   - filtering with no matching results
   - pagination
   - sorting
================================================== */

describe('Event Filter API', () => {
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

    // Register a new user and return its auth token
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

    // Return a valid event payload matching the current backend validator
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

    // Create an event with authentication
    const createEvent = async (token, overrides = {}) => {
        return request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(getValidEventPayload(overrides));
    };
    
    /* =========================
       Filtering
    ========================= */

    // Filter events successfully by type
    it('should filter events by type', async () => {
        const token = await registerAndGetToken(
            'Filter User',
            `filteruser${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Meetup Event',
            description: 'This event should match the filter',
            type: 'Meetup',
            theme: 'Technology',
            location: 'Montreal'
        });

        await createEvent(token, {
            title: 'Conference Event',
            description: 'This event should not match the filter',
            type: 'Conference',
            theme: 'Business',
            location: 'Quebec City'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ type: 'Meetup' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('events');
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Filter events successfully by theme
    it('should filter events by theme', async () => {
        const token = await registerAndGetToken(
            'Theme Filter User',
            `themefilter${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Tech Event',
            theme: 'Technology'
        });

        await createEvent(token, {
            title: 'Business Event',
            theme: 'Business'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ theme: 'Technology' });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Filter events successfully by search term
    it('should filter events by search term', async () => {
        const token = await registerAndGetToken(
            'Search Filter User',
            `searchfilter${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'JavaScript Meetup',
            description: 'Frontend and backend topics'
        });

        await createEvent(token, {
            title: 'Cooking Workshop',
            description: 'Food and recipes'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ search: 'JavaScript' });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Filter events successfully by exact date
    it('should filter events by exact date', async () => {
        const token = await registerAndGetToken(
            'Date Filter User',
            `datefilter${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Exact Date Event',
            startDateTime: '2026-12-31T10:00:00.000Z',
            endDateTime: '2026-12-31T12:00:00.000Z'
        });

        await createEvent(token, {
            title: 'Other Date Event',
            startDateTime: '2027-01-02T10:00:00.000Z',
            endDateTime: '2027-01-02T12:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ date: '2026-12-31' });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Filter events successfully by date range
    it('should filter events by date range', async () => {
        const token = await registerAndGetToken(
            'Range Filter User',
            `rangefilter${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Range Match Event',
            startDateTime: '2026-12-20T10:00:00.000Z',
            endDateTime: '2026-12-20T12:00:00.000Z'
        });

        await createEvent(token, {
            title: 'Range Outside Event',
            startDateTime: '2027-01-15T10:00:00.000Z',
            endDateTime: '2027-01-15T12:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                startDate: '2026-12-01',
                endDate: '2026-12-31'
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Filter events successfully with combined query params
    it('should filter events with combined query params', async () => {
        const token = await registerAndGetToken(
            'Combined Filter User',
            `combinedfilter${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Tech Meetup Montreal',
            description: 'Technology meetup in Montreal',
            type: 'Meetup',
            theme: 'Technology',
            location: 'Montreal'
        });

        await createEvent(token, {
            title: 'Business Meetup Quebec',
            description: 'Business meetup in Quebec City',
            type: 'Meetup',
            theme: 'Business',
            location: 'Quebec City'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                type: 'Meetup',
                theme: 'Technology',
                location: 'Montreal'
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBeGreaterThan(0);
    });

    // Return an empty array when no event matches the filters
    it('should return no events when filters do not match any event', async () => {
        const token = await registerAndGetToken(
            'No Result Filter User',
            `noresultfilter${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Existing Event',
            type: 'Meetup',
            theme: 'Technology'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ type: 'NonExistingType' });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(0);
    });

    // Filter events by status: upcoming
    it('should filter events by status upcoming', async () => {
        const token = await registerAndGetToken(
            'Upcoming Status User',
            `upcomingstatus${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Future Event',
            startDateTime: '2026-12-31T10:00:00.000Z',
            endDateTime: '2026-12-31T12:00:00.000Z'
        });

        await createEvent(token, {
            title: 'Past Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ status: 'upcoming' });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(1);
        expect(res.body.events[0].status).toBe('upcoming');
    });

    // Filter events by status: past
    it('should filter events by status past', async () => {
        const token = await registerAndGetToken(
            'Past Status User',
            `paststatus${Date.now()}@test.com`
        );

        await createEvent(token, {
            title: 'Future Event',
            startDateTime: '2026-12-31T10:00:00.000Z',
            endDateTime: '2026-12-31T12:00:00.000Z'
        });

        await createEvent(token, {
            title: 'Past Event',
            startDateTime: '2020-01-01T10:00:00.000Z',
            endDateTime: '2020-01-01T12:00:00.000Z'
        });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({ status: 'past' });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(1);
        expect(res.body.events[0].status).toBe('past');
    });

    /* =========================
       Pagination
    ========================= */

    // Paginate filtered events correctly
    it('should paginate filtered events correctly', async () => {
        const token = await registerAndGetToken(
            'Pagination User',
            `pagination${Date.now()}@test.com`
        );

        await createEvent(token, { title: 'Event A' });
        await createEvent(token, { title: 'Event B' });
        await createEvent(token, { title: 'Event C' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                page: 1,
                pageSize: 2
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(2);
        expect(res.body.page).toBe(1);
        expect(res.body.pageSize).toBe(2);
    });

    // Return the second page of filtered events
    it('should return the second page of filtered events', async () => {
        const token = await registerAndGetToken(
            'Second Page User',
            `secondpage${Date.now()}@test.com`
        );

        await createEvent(token, { title: 'Event A' });
        await createEvent(token, { title: 'Event B' });
        await createEvent(token, { title: 'Event C' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                page: 2,
                pageSize: 2
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events.length).toBe(1);
        expect(res.body.page).toBe(2);
        expect(res.body.pageSize).toBe(2);
    });

    /* =========================
       Sorting
    ========================= */

    // Sort filtered events by title in ascending order
    it('should sort filtered events by title in ascending order', async () => {
        const token = await registerAndGetToken(
            'Sort User',
            `sort${Date.now()}@test.com`
        );

        await createEvent(token, { title: 'Zulu Event' });
        await createEvent(token, { title: 'Alpha Event' });
        await createEvent(token, { title: 'Mike Event' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                sortBy: 'title',
                order: 'asc'
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body.events[0].title).toBe('Alpha Event');
    });

    // Fall back to default sorting when sortBy is invalid
    it('should fall back to default sorting when sortBy is invalid', async () => {
        const token = await registerAndGetToken(
            'Invalid Sort User',
            `invalidsort${Date.now()}@test.com`
        );

        await createEvent(token, { title: 'First Created' });
        await createEvent(token, { title: 'Second Created' });

        const res = await request(app)
            .get('/api/events/filtered')
            .query({
                sortBy: 'invalidField',
                order: 'asc'
            });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.events)).toBe(true);
        expect(res.body).toHaveProperty('page');
        expect(res.body).toHaveProperty('pageSize');
    });
});