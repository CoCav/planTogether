const { EventReview } = require("../../../src/models");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const {
    createEventReview,
    deleteEventReview,
    createCompletedEventWithParticipant
} = require("../../helpers/http/eventReviewTestHelper");

const { createReviewPayload } = require("../../factories/eventReviewFactory");

/* ==========================================================================
   Event Reviews Integration Tests - Delete Review

   Tests event review deletion behavior.

   Responsibilities
   - Test successful review deletion
   - Test authentication errors
   - Test ownership rules
   - Test validation errors
   - Test missing review handling

   Notes
   - Users can only delete their own reviews.
=========================================================================== */

describe("Delete Event Review API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       REVIEW DELETION SUCCESS
    ============================= */

    describe("Review deletion success", () => {
        it("deletes a review owned by the authenticated user", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const response = await deleteEventReview(reviewId, participantAuth.headers);

            expect(response.statusCode).toBe(200);

            expect(response.body).toHaveProperty("message", "Event review deleted successfully");

            const deletedReview = await EventReview.findByPk(reviewId);

            expect(deletedReview).toBeNull();
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects review deletion without token", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const response = await deleteEventReview(reviewId);

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects deleting another user's review", async () => {
            const {
                event,
                participantAuth
            } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const otherUserAuth = await registerAndAuthenticateUser({
                name: "Other Reviewer",
                email: `otherreviewer${Date.now()}@test.com`
            });

            const response = await deleteEventReview(
                reviewId,
                otherUserAuth.headers
            );

            expect(response.statusCode).toBe(403);
            expect(response.body.message).toBe("You can only manage your own review");
        });
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    describe("Validation errors", () => {
        it("rejects invalid review identifiers", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Validation User",
                email: `validationreview${Date.now()}@test.com`
            });

            const response = await deleteEventReview("abc", userAuth.headers);

            expect(response.statusCode).toBe(400);
        });
    });

    /* =============================
       NOT FOUND
    ============================= */

    describe("Not found", () => {
        it("returns 404 when the review does not exist", async () => {
            const userAuth = await registerAndAuthenticateUser({
                name: "Missing Review User",
                email: `missingreview${Date.now()}@test.com`
            });

            const response = await deleteEventReview(999999, userAuth.headers);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Review not found");
        });
    });
});
