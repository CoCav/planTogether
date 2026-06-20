/* ==================================================
   EVENT REVIEWS INTEGRATION - UPDATE REVIEW TESTS

   Tests:
   - authenticated review update
   - rating and comment persistence
   - ownership enforcement
   - authentication protection
   - nonexistent review handling
   - invalid review ID validation
   - update payload validation

   Ensures:
   - users can update their own rated reviews
   - users cannot update reviews owned by others
   - protected routes require authentication
   - updated reviews keep public reviewer data
   - invalid review update requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventReview, EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");
const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");

describe("Update Event Review API", () => {

    beforeAll(initDB);
    afterEach(resetDB);
    afterAll(closeDB);

    /* =============================
       TEST HELPERS
    ============================= */

    const createReviewScenario = async () => {
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

        const reviewerAuth = await registerAndGetToken({
            name: "Reviewer",
            email: `reviewer${Date.now()}@test.com`
        });

        await EventUserRole.create({
            eventId: event.id,
            userId: reviewerAuth.user.userId,
            role: EVENT_ROLES.PARTICIPANT
        });

        const review = await EventReview.create({
            eventId: event.id,
            userId: reviewerAuth.user.userId,
            rating: 5,
            comment: "Great event!"
        });

        return {
            event,
            review,
            reviewerAuth
        };
    };

    /* =============================
       REVIEW UPDATE SUCCESS
    ============================= */

    it("should update a review owned by the authenticated user", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                rating: 4,
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("message", "Event review updated successfully");

        expect(res.body.review).toMatchObject({
            id: review.id,
            userId: reviewerAuth.user.userId,
            rating: 4,
            comment: "Updated review comment"
        });

        const updatedReview = await EventReview.findByPk(review.id);

        expect(updatedReview.rating).toBe(4);
        expect(updatedReview.comment).toBe("Updated review comment");
    });

    it("should trim updated review comment before persistence", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                rating: 3,
                comment: "   Updated with spaces   "
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.review.comment).toBe("Updated with spaces");

        const updatedReview = await EventReview.findByPk(review.id);

        expect(updatedReview.comment).toBe("Updated with spaces");
    });

    it("should include public user data on updated review", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                rating: 4,
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(200);

        expect(res.body.review).toHaveProperty("user");

        expect(res.body.review.user).toMatchObject({
            id: reviewerAuth.user.userId,
            name: "Reviewer"
        });

        expect(res.body.review.user).not.toHaveProperty("email");
        expect(res.body.review.user).not.toHaveProperty("password");
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject updating a review without token", async () => {
        const { review } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .send({
                rating: 4,
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       REVIEW OWNERSHIP
    ============================= */

    it("should reject updating another user's review", async () => {
        const { review } = await createReviewScenario();

        const otherUserAuth = await registerAndGetToken({
            name: "Other User",
            email: `otheruser${Date.now()}@test.com`
        });

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(otherUserAuth.headers)
            .send({
                rating: 4,
                comment: "Trying to update another user's review"
            });

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe("You can only manage your own review");
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 when review does not exist", async () => {
        const userAuth = await registerAndGetToken({
            name: "Update User",
            email: `updateuser${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/reviews/999999")
            .set(userAuth.headers)
            .send({
                rating: 4,
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(404);

        expect(res.body.message).toBe("Review not found");
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should reject invalid reviewId", async () => {
        const userAuth = await registerAndGetToken({
            name: "Validation User",
            email: `validation${Date.now()}@test.com`
        });

        const res = await request(app)
            .put("/api/events/reviews/abc")
            .set(userAuth.headers)
            .send({
                rating: 4,
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject missing rating", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject invalid rating", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                rating: 6,
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(400);
    });

    it("should keep the original review unchanged when update validation fails", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                rating: 6,
                comment: "Updated review comment"
            });

        expect(res.statusCode).toBe(400);

        const unchangedReview = await EventReview.findByPk(review.id);

        expect(unchangedReview.rating).toBe(5);
        expect(unchangedReview.comment).toBe("Great event!");
    });

    it("should reject missing comment", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                rating: 4
            });

        expect(res.statusCode).toBe(400);
    });

    it("should reject too short comment", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .put(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers)
            .send({
                rating: 4,
                comment: "Bad"
            });

        expect(res.statusCode).toBe(400);
    });
});
