/* ==================================================
   EVENT REVIEWS INTEGRATION - CREATE REVIEW TESTS

   Tests:
   - authenticated review creation
   - rating persistence and validation
   - comment trimming and validation
   - completed event requirement
   - active participant requirement
   - duplicate review prevention
   - authentication protection
   - event ID validation

   Ensures:
   - authenticated participants can rate and review completed events
   - users cannot review upcoming or unjoined events
   - users can leave only one review per event
   - validators protect review creation payloads
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");

describe("Create Event Review API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       TEST HELPERS
    ============================= */

    const createPastEventWithParticipant = async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Review Organizer",
                email: `revieworganizer${Date.now()}@test.com`
            },
            event: {
                title: "Past Review Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Review Participant",
            email: `reviewparticipant${Date.now()}@test.com`
        });

        await EventUserRole.create({
            eventId: event.id,
            userId: participantAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT
        });

        return {
            event,
            participantAuth
        };
    };

    /* =============================
       REVIEW CREATION SUCCESS
    ============================= */

    it("should create a review for a completed event joined by the user", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Event review created successfully");
        expect(res.body).toHaveProperty("review");

        expect(res.body.review).toMatchObject({
            eventId: event.id,
            userId: participantAuth.user.userId,
            rating: 5,
            comment: "Great event!"
        });

        expect(res.body.review).toHaveProperty("user");
        expect(res.body.review.user).toMatchObject({
            id: participantAuth.user.userId,
            name: "Review Participant"
        });
    });

    it("should allow different users to review the same event", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const secondParticipantAuth = await registerAndGetToken({
            name: "Second Reviewer",
            email: `secondreviewer${Date.now()}@test.com`
        });

        await EventUserRole.create({
            eventId: event.id,
            userId: secondParticipantAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT
        });

        const reviewA = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        const reviewB = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(secondParticipantAuth.headers)
            .send({
                rating: 5,
                comment: "Amazing event!"
            });

        expect(reviewA.statusCode).toBe(201);
        expect(reviewB.statusCode).toBe(201);
    });

    it("should trim review comment before persistence", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "   Really nice event!   "
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.review.comment).toBe("Really nice event!");
    });

    /* =============================
       REVIEW PERMISSIONS
    ============================= */

    it("should reject review from inactive member", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Inactive Review Organizer",
                email: `inactiverevieworganizer${Date.now()}@test.com`
            },
            event: {
                title: "Inactive Review Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Inactive Reviewer",
            email: `inactivereviewer${Date.now()}@test.com`
        });

        await EventUserRole.create({
            eventId: event.id,
            userId: participantAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT,
            deletedAt: new Date()
        });

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Only event participants can leave a review");
    });

    it("should reject review from non-participant", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "No Participant Organizer",
                email: `noparticipantorganizer${Date.now()}@test.com`
            },
            event: {
                title: "No Participant Review Event",
                startDateTime: "2020-01-01T10:00:00.000Z",
                endDateTime: "2020-01-01T12:00:00.000Z"
            }
        });

        const userAuth = await registerAndGetToken({
            name: "Non Participant Review User",
            email: `nonparticipant${Date.now()}@test.com`
        });

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(userAuth.headers)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Only event participants can leave a review");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject review creation without token", async () => {
        const { event } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid eventId", async () => {
        const userAuth = await registerAndGetToken({
            name: "Invalid Review User",
            email: `invalidreview${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events/abc/reviews")
            .set(userAuth.headers)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject missing comment", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject too short comment", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "Hey"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject missing rating", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject rating lower than 1", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 0,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject rating higher than 5", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 6,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(400);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should reject review for nonexistent event", async () => {
        const userAuth = await registerAndGetToken({
            name: "Missing Event Reviewer",
            email: `missingevent${Date.now()}@test.com`
        });

        const res = await request(app)
            .post("/api/events/999999/reviews")
            .set(userAuth.headers)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Event not found");
    });

    it("should reject review for upcoming event", async () => {
        const { event } = await createEventWithOrganizer({
            organizer: {
                name: "Upcoming Review Organizer",
                email: `upcomingreview${Date.now()}@test.com`
            },
            event: {
                title: "Upcoming Review Event",
                startDateTime: "2030-01-01T10:00:00.000Z",
                endDateTime: "2030-01-01T12:00:00.000Z"
            }
        });

        const participantAuth = await registerAndGetToken({
            name: "Upcoming Review Participant",
            email: `upcomingparticipant${Date.now()}@test.com`
        });

        await EventUserRole.create({
            eventId: event.id,
            userId: participantAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT
        });

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "Great event!"
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Only completed events can be reviewed");
    });

    it("should reject duplicate review from same user for same event", async () => {
        const { event, participantAuth } = await createPastEventWithParticipant();

        await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "First review"
            });

        const res = await request(app)
            .post(`/api/events/${event.id}/reviews`)
            .set(participantAuth.headers)
            .send({
                rating: 5,
                comment: "Second review"
            });

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toBe("You have already reviewed this event");
    });
});
