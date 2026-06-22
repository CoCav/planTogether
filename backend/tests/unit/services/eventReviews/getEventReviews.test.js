/* ==================================================
   GET EVENT REVIEWS SERVICE TESTS

   Tests:
   - paginated event review retrieval
   - pagination metadata generation
   - event existence validation
   - review ordering query configuration
   - review rating retrieval
   - public user data inclusion

   Ensures:
   - reviews are retrieved only for existing events
   - paginated responses include page metadata
   - reviews include ratings and public user data
   - reviews are ordered according to pagination settings
   - missing events are rejected before review lookup
================================================== */

jest.mock("../../../../src/models/eventModel");
jest.mock("../../../../src/models/userModel");
jest.mock("../../../../src/models/relations/eventReviewModel");

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventReview = require("../../../../src/models/relations/eventReviewModel");

const eventReviewService = require("../../../../src/services/eventReviewService");

describe("eventReviewService getEventReviews", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       SUCCESS CASES
    ============================= */

    it("should get paginated reviews for an event", async () => {
        const reviews = [
            {
                id: 1,
                eventId: 1,
                userId: 10,
                rating: 5,
                comment: "Great event!"
            }
        ];

        Event.findByPk.mockResolvedValue({ id: 1 });

        EventReview.findAndCountAll.mockResolvedValue({
            count: 1,
            rows: reviews
        });

        const result = await eventReviewService.getEventReviews(1);

        expect(Event.findByPk).toHaveBeenCalledWith(1, {});

        expect(EventReview.findAndCountAll).toHaveBeenCalledWith({
            where: {
                eventId: 1
            },
            include: [{
                model: User,
                as: "user",
                attributes: ["id", "name", "avatar"]
            }],
            order: [["createdAt", "DESC"]],
            limit: 10,
            offset: 0
        });

        expect(result).toMatchObject({
            page: 1,
            pageSize: 10,
            totalReviews: 1,
            totalPages: 1,
            reviews
        });

        expect(result.reviews[0]).toMatchObject({
            rating: 5,
            comment: "Great event!"
        });
    });

    it("should apply custom pagination params", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        EventReview.findAndCountAll.mockResolvedValue({
            count: 25,
            rows: []
        });

        await eventReviewService.getEventReviews(1, {
            page: 2,
            pageSize: 5
        });

        expect(EventReview.findAndCountAll).toHaveBeenCalledWith(
            expect.objectContaining({
                limit: 5,
                offset: 5
            })
        );
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    it("should throw 404 when event does not exist", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventReviewService.getEventReviews(999, {}))
            .rejects
            .toMatchObject({
                statusCode: 404,
                message: "Event not found"
            });

        expect(EventReview.findAndCountAll).not.toHaveBeenCalled();
    });
});
