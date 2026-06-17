/* ==================================================
   EVENT REVIEWS INTEGRATION - DELETE REVIEW TESTS

   Tests:
   - authenticated review deletion
   - ownership enforcement
   - authentication protection
   - nonexistent review handling
   - invalid review ID validation

   Ensures:
   - users can delete their own rated reviews
   - users cannot delete reviews owned by others
   - protected routes require authentication
   - invalid review requests are rejected correctly
================================================== */

const request = require("supertest");
const app = require("../../../src/app");

const { EventReview, EventUserRole } = require("../../../src/models");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { initDB, resetDB, closeDB } = require("../../helpers/database/dbTestHelper");

const { registerAndGetToken } = require("../../helpers/api/authHelper");

const { createEventWithOrganizer } = require("../../helpers/api/eventHelper");

describe("Delete Event Review API", () => {

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
       REVIEW DELETION SUCCESS
    ============================= */

    it("should delete a review owned by the authenticated user", async () => {
        const { review, reviewerAuth } = await createReviewScenario();

        const res = await request(app)
            .delete(`/api/events/reviews/${review.id}`)
            .set(reviewerAuth.headers);

        expect(res.statusCode).toBe(200);

        expect(res.body).toHaveProperty("message", "Event review deleted successfully");

        const deletedReview = await EventReview.findByPk(review.id);

        expect(deletedReview).toBeNull();
    });

    /* =============================
       AUTHENTICATION ERRORS
    ============================= */

    it("should reject deleting a review without token", async () => {
        const { review } = await createReviewScenario();

        const res = await request(app).delete(`/api/events/reviews/${review.id}`);

        expect(res.statusCode).toBe(401);
    });

    /* =============================
       REVIEW OWNERSHIP
    ============================= */

    it("should reject deleting another user's review", async () => {
        const { review } = await createReviewScenario();

        const otherUserAuth = await registerAndGetToken({
            name: "Other User",
            email: `otheruser${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete(`/api/events/reviews/${review.id}`)
            .set(otherUserAuth.headers);

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe("You can only delete your own review");
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 404 when review does not exist", async () => {
        const userAuth = await registerAndGetToken({
            name: "Delete User",
            email: `deleteuser${Date.now()}@test.com`
        });

        const res = await request(app)
            .delete("/api/events/reviews/999999")
            .set(userAuth.headers);

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
            .delete("/api/events/reviews/abc")
            .set(userAuth.headers);

        expect(res.statusCode).toBe(400);
    });
});
