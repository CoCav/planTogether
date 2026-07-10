const { EventReview, EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const { createOrganizerAndEvent } = require("../../helpers/http/eventTestHelper");
const {
    getEventReviews,
    createCompletedEventWithParticipant
} = require("../../helpers/http/eventReviewTestHelper");

/* ==========================================================================
   Event Reviews Integration Tests - Get Reviews

   Tests event review retrieval behavior.

   Responsibilities
   - Test public review retrieval
   - Test review metadata
   - Test pagination
   - Test validation errors
   - Test missing event handling

   Notes
   - Event reviews can be retrieved publicly.
   - Review responses include pagination metadata.
   - Reviews include ratings and public reviewer data.
   - Reviews are ordered from newest to oldest by default.
=========================================================================== */

const createReviewForEvent = async ({
    event,
    participantAuth,
    rating = 5,
    comment = "This was a great event.",
    createdAt,
    updatedAt
}) => {
    return EventReview.create({
        eventId: event.id,
        userId: participantAuth.user.userId,
        rating,
        comment,
        createdAt,
        updatedAt
    });
};

describe("Get Event Reviews API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       REVIEW RETRIEVAL SUCCESS
    ============================= */

    describe("Review retrieval success", () => {
        it("retrieves reviews for an event", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            await createReviewForEvent({
                event,
                participantAuth,
                rating: 5,
                comment: "Great event!"
            });

            const response = await getEventReviews(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event reviews retrieved successfully");
            expect(Array.isArray(response.body.reviews)).toBe(true);

            expect(response.body).toMatchObject({
                page: 1,
                pageSize: 10,
                totalReviews: 1,
                totalPages: 1,
                averageRating: 5
            });

            expect(response.body.reviews).toHaveLength(1);

            expect(response.body.reviews[0]).toMatchObject({
                eventId: event.id,
                userId: participantAuth.user.userId,
                comment: "Great event!"
            });
        });

        it("returns an empty review list when event has no reviews", async () => {
            const { event } = await createOrganizerAndEvent({
                organizer: {
                    name: "Empty Reviews Organizer",
                    email: `emptyreviewsorganizer${Date.now()}@test.com`
                },
                event: {
                    title: "Community Meetup"
                }
            });

            const response = await getEventReviews(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.reviews).toEqual([]);

            expect(response.body).toMatchObject({
                page: 1,
                pageSize: 10,
                totalReviews: 0,
                totalPages: 0,
                averageRating: null
            });
        });
    });

    /* =============================
       REVIEW METADATA
    ============================= */

    describe("Review metadata", () => {
        it("includes public user data for each review", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant({
                participant: {
                    name: "Visible Reviewer",
                    email: `visiblereviewer${Date.now()}@test.com`
                }
            });

            await createReviewForEvent({
                event,
                participantAuth,
                comment: "Nice event!"
            });

            const response = await getEventReviews(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.reviews[0]).toHaveProperty("user");

            expect(response.body.reviews[0].user).toMatchObject({
                id: participantAuth.user.userId,
                name: "Visible Reviewer"
            });

            expect(response.body.reviews[0].user).not.toHaveProperty("email");
            expect(response.body.reviews[0].user).not.toHaveProperty("password");
        });

        it("orders reviews from newest to oldest", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant({
                participant: {
                    name: "First Reviewer",
                    email: `firstreviewer${Date.now()}@test.com`
                }
            });

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "Second Reviewer",
                email: `secondreviewer${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: secondParticipantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            await createReviewForEvent({
                event,
                participantAuth,
                rating: 4,
                comment: "Older review",
                createdAt: new Date("2026-01-01T10:00:00.000Z"),
                updatedAt: new Date("2026-01-01T10:00:00.000Z")
            });

            await createReviewForEvent({
                event,
                participantAuth: secondParticipantAuth,
                rating: 5,
                comment: "Newer review",
                createdAt: new Date("2026-01-01T11:00:00.000Z"),
                updatedAt: new Date("2026-01-01T11:00:00.000Z")
            });

            const response = await getEventReviews(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.reviews).toHaveLength(2);

            expect(response.body.reviews[0].comment).toBe("Newer review");
            expect(response.body.reviews[1].comment).toBe("Older review");
        });

        it("includes review rating", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            await createReviewForEvent({
                event,
                participantAuth,
                rating: 4,
                comment: "Nice event!"
            });

            const response = await getEventReviews(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.reviews[0].rating).toBe(4);
        });

        it("includes global average rating for all event reviews", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            await createReviewForEvent({
                event,
                participantAuth,
                rating: 5,
                comment: "First rating review"
            });

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "Average Rating Reviewer",
                email: `averageratingreviewer${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: secondParticipantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            await createReviewForEvent({
                event,
                participantAuth: secondParticipantAuth,
                rating: 4,
                comment: "Second rating review"
            });

            const response = await getEventReviews(event.id);

            expect(response.statusCode).toBe(200);
            expect(response.body.averageRating).toBe(4.5);
        });
    });

    /* =============================
       PAGINATION
    ============================= */

    describe("Pagination", () => {
        it("returns paginated review metadata", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            await createReviewForEvent({
                event,
                participantAuth,
                rating: 5,
                comment: "First review"
            });

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "Second Pagination Reviewer",
                email: `secondpaginationreviewer${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: secondParticipantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            await createReviewForEvent({
                event,
                participantAuth: secondParticipantAuth,
                rating: 4,
                comment: "Second review"
            });

            const response = await getEventReviews(
                event.id,
                "?page=1&pageSize=1"
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toMatchObject({
                page: 1,
                pageSize: 1,
                totalReviews: 2,
                totalPages: 2
            });

            expect(response.body.reviews).toHaveLength(1);
        });

        it("retrieves the requested review page", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            await createReviewForEvent({
                event,
                participantAuth,
                rating: 5,
                comment: "First page review"
            });

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "Second Page Reviewer",
                email: `secondpagereviewer${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: secondParticipantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            await createReviewForEvent({
                event,
                participantAuth: secondParticipantAuth,
                rating: 4,
                comment: "Second page review"
            });

            const response = await getEventReviews(
                event.id,
                "?page=2&pageSize=1"
            );

            expect(response.statusCode).toBe(200);

            expect(response.body).toMatchObject({
                page: 2,
                pageSize: 1,
                totalReviews: 2,
                totalPages: 2
            });

            expect(response.body.reviews).toHaveLength(1);
        });

        it("keeps average rating global when reviews are paginated", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            await createReviewForEvent({
                event,
                participantAuth,
                rating: 5,
                comment: "First paginated rating review"
            });

            const secondParticipantAuth = await registerAndAuthenticateUser({
                name: "Paginated Average Reviewer",
                email: `paginatedaveragereviewer${Date.now()}@test.com`
            });

            await EventUserRole.create({
                eventId: event.id,
                userId: secondParticipantAuth.user.userId,
                role: EVENT_ROLES.PARTICIPANT
            });

            await createReviewForEvent({
                event,
                participantAuth: secondParticipantAuth,
                rating: 1,
                comment: "Second paginated rating review"
            });

            const response = await getEventReviews(
                event.id,
                "?page=1&pageSize=1"
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.reviews).toHaveLength(1);
            expect(response.body.totalReviews).toBe(2);
            expect(response.body.averageRating).toBe(3);
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid pagination query params", async () => {
            const { event } = await createCompletedEventWithParticipant();

            const response = await getEventReviews(event.id, "?page=0");

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid event identifiers", async () => {
            const response = await getEventReviews("abc");

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the event does not exist", async () => {
            const response = await getEventReviews(999999);

            expect(response.statusCode).toBe(404);
        });
    });
});
