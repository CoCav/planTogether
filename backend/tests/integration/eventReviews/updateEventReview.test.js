const { EventReview } = require("../../../src/models");

const {
    initializeTestDatabase,
    resetTestDatabase,
    closeTestDatabase
} = require("../../helpers/database/dbTestHelper");

const { registerAndAuthenticateUser } = require("../../helpers/http/authTestHelper");
const {
    createEventReview,
    updateEventReview,
    createCompletedEventWithParticipant
} = require("../../helpers/http/eventReviewTestHelper");

const { createReviewPayload } = require("../../factories/eventReviewFactory");

/* ==========================================================================
   Event Reviews Integration Tests - Update Review

   Tests event review update behavior.

   Responsibilities
   - Test successful review updates
   - Test authentication errors
   - Test ownership rules
   - Test validation errors
   - Test missing review handling

   Notes
   - Users can only update their own reviews.
   - Updated reviews keep public reviewer data.
   - Invalid updates must not modify the persisted review.
=========================================================================== */

describe("Update Event Review API", () => {
    beforeAll(initializeTestDatabase);
    afterEach(resetTestDatabase);
    afterAll(closeTestDatabase);

    /* =============================
       REVIEW UPDATE SUCCESS
    ============================= */

    describe("Review update success", () => {
        it("updates a review owned by the authenticated user", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant({
                participant: {
                    name: "Reviewer"
                }
            });

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "Great event!"
                })
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                createReviewPayload({
                    rating: 4,
                    comment: "Updated review comment"
                })
            );

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("message", "Event review updated successfully");

            expect(response.body.review).toMatchObject({
                id: reviewId,
                userId: participantAuth.user.userId,
                rating: 4,
                comment: "Updated review comment"
            });

            const updatedReview = await EventReview.findByPk(reviewId);

            expect(updatedReview.rating).toBe(4);
            expect(updatedReview.comment).toBe("Updated review comment");
        });

        it("trims updated review comment before persistence", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "Great event!"
                })
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                createReviewPayload({
                    rating: 3,
                    comment: "   Updated with spaces   "
                })
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.review.comment).toBe("Updated with spaces");

            const updatedReview = await EventReview.findByPk(reviewId);

            expect(updatedReview.comment).toBe("Updated with spaces");
        });

        it("includes public user data on updated review", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant({
                participant: {
                    name: "Reviewer"
                }
            });

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    comment: "Great event!"
                })
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                createReviewPayload({
                    rating: 4,
                    comment: "Updated review comment"
                })
            );

            expect(response.statusCode).toBe(200);
            expect(response.body.review).toHaveProperty("user");

            expect(response.body.review.user).toMatchObject({
                id: participantAuth.user.userId,
                name: "Reviewer"
            });

            expect(response.body.review.user).not.toHaveProperty("email");
            expect(response.body.review.user).not.toHaveProperty("password");
        });
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    describe("Authentication errors", () => {
        it("rejects updating a review without token", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                undefined,
                createReviewPayload({
                    rating: 4,
                    comment: "Updated review comment"
                })
            );

            expect(response.statusCode).toBe(401);
        });
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    describe("Business rules", () => {
        it("rejects updating another user's review", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

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

            const response = await updateEventReview(
                reviewId,
                otherUserAuth.headers,
                createReviewPayload({
                    rating: 4,
                    comment: "Trying to update another user's review"
                })
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

            const response = await updateEventReview(
                "abc",
                userAuth.headers,
                createReviewPayload({
                    rating: 4,
                    comment: "Updated review comment"
                })
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects missing rating", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                {
                    comment: "Updated review comment"
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects invalid rating", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                createReviewPayload({
                    rating: 6,
                    comment: "Updated review comment"
                })
            );

            expect(response.statusCode).toBe(400);
        });

        it("keeps the original review unchanged when update validation fails", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload({
                    rating: 5,
                    comment: "Great event!"
                })
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                createReviewPayload({
                    rating: 6,
                    comment: "Updated review comment"
                })
            );

            expect(response.statusCode).toBe(400);

            const unchangedReview = await EventReview.findByPk(reviewId);

            expect(unchangedReview.rating).toBe(5);
            expect(unchangedReview.comment).toBe("Great event!");
        });

        it("rejects missing comment", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                {
                    rating: 4
                }
            );

            expect(response.statusCode).toBe(400);
        });

        it("rejects too short comment", async () => {
            const { event, participantAuth } = await createCompletedEventWithParticipant();

            const createResponse = await createEventReview(
                event.id,
                participantAuth.headers,
                createReviewPayload()
            );

            const reviewId = createResponse.body.review.id;

            const response = await updateEventReview(
                reviewId,
                participantAuth.headers,
                createReviewPayload({
                    rating: 4,
                    comment: "Bad"
                })
            );

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
                email: `missingreviewuser${Date.now()}@test.com`
            });

            const response = await updateEventReview(
                999999,
                userAuth.headers,
                createReviewPayload({
                    rating: 4,
                    comment: "Updated review comment"
                })
            );

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe("Review not found");
        });
    });
});
