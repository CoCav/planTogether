const { EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    createEventReview,
    createCompletedEventWithParticipant
} = require("../../helpers/http/eventReviewTestHelper");

const { createReviewPayload } = require("../../factories/eventReviewFactory");

/* ==========================================================================
   Event Reviews Integration Tests - Create Review

   Tests event review creation behavior.

   Responsibilities
   - Test successful review creation
   - Test review permissions
   - Test authentication errors
   - Test validation errors
   - Test review business rules
   - Test missing event handling

   Notes
   - Only active participants can review completed events.
   - Users can leave only one review per event.
   - Review comments are trimmed before persistence.
=========================================================================== */

describe("Create Event Review API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       REVIEW SUCCESS
    ============================= */

    describe("Review success", () => {
        it("creates a review for a completed event joined by the user", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant({
                participant: {
                    name: "Review Participant"
                }
            });

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "Great event!"
                })
            );

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty(
                "message",
                "Event review created successfully"
            );
            expect(response.body).toHaveProperty("review");

            expect(response.body.review).toMatchObject({
                eventId: event.id,
                userId: participantAuth.user.userId,
                rating: 5,
                comment: "Great event!"
            });

            expect(response.body.review).toHaveProperty("user");
            expect(response.body.review.user).toMatchObject({
                id: participantAuth.user.userId,
                name: "Review Participant"
            });
        });

        it("allows different users to review the same event", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "Second Reviewer",
                email: `secondreviewer${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: secondParticipantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            const firstResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "Great event!"
                })
            );

            const secondResponse = await createEventReview(
                event.id,
                secondParticipantAuth.headers,
                createReviewPayload({
                    comment: "Amazing event!"
                })
            );

            expect(firstResponse.statusCode).toBe(201);
            expect(secondResponse.statusCode).toBe(201);
        });

        it("trims review comment before persistence", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "   Really nice event!   "
                })
            );

            expect(response.statusCode).toBe(201);
            expect(response.body.review.comment).toBe("Really nice event!");
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects review creation without token", async () => {
            const { event } = await createCompletedEventWithParticipant();

            const response = await createEventReview(
                event.id,
                undefined,
                createReviewPayload()
            );

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid event identifiers", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Invalid Review User",
                email: `invalidreviewuser${Date.now()}@test.com`
            });

            const response = await createEventReview(
                "abc",
                userAuth.headers,
                createReviewPayload()
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects missing comment", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                {
                    rating: 5
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects too short comment", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "Hey"
                })
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects missing rating", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                {
                    comment: "Great event!"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects rating lower than 1", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    rating: 0
                })
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects rating higher than 5", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    rating: 6
                })
            );

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects review from inactive member", async () => {
            const { event } = await createOrganizerAndEvent({
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

            const participantAuth = await registerAndAuthenticateUser({
                name: "Inactive Reviewer",
                email: `inactivereviewer${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: participantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT,
                deletedAt: new Date()
            });

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("Only event participants can leave a review");
        });

        it("rejects review from non-participant", async () => {
            const { event } = await createOrganizerAndEvent({
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

            const userAuth = await registerAndAuthenticateUser({
                name: "Non Participant Review User",
                email: `nonparticipantreviewuser${Date.now()}@test.com`
            });

            const response = await createEventReview(
                event.id,
                userAuth.headers,
                createReviewPayload()
            );

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("Only event participants can leave a review");
        });

        it("rejects review for upcoming event", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Upcoming Review Organizer",
                    email: `upcomingrevieworganizer${Date.now()}@test.com`
                },
                event: {
                    title: "Upcoming Review Event",
                    startDateTime: "2030-01-01T10:00:00.000Z",
                    endDateTime: "2030-01-01T12:00:00.000Z"
                }
            });

            const participantAuth = await registerAndAuthenticateUser({
                name: "Upcoming Review Participant",
                email: `upcomingreviewparticipant${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: participantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("Only completed events can be reviewed");
        });

        it("rejects duplicate review from same user for same event", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "First review"
                })
            );

            const response = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "Second review"
                })
            );

            expect(response.statusCode).toBe(409);
            expect(response.body.message).toBe("You have already reviewed this event");
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Missing Event Reviewer",
                email: `missingeventreviewer${Date.now()}@test.com`
            });

            const response = await createEventReview(
                999999,
                userAuth.headers,
                createReviewPayload()
            );

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Event not found");
        });
    });
});
