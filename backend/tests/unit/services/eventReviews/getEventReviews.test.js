/* ==================================================
   GET EVENT REVIEWS SERVICE TESTS

   Tests:
   - event review retrieval
   - event existence validation
   - review ordering
   - review rating retrieval
   - public user data inclusion

   Ensures:
   - reviews are retrieved only for existing events
   - reviews include ratings and public user data
   - reviews are ordered from newest to oldest
   - missing events are rejected before review lookup
================================================== */

jest.mock("../../../../src/models/eventModel");
jest.mock("../../../../src/models/userModel");
jest.mock("../../../../src/models/relations/eventReviewModel");

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventReview = require("../../../../src/models/relations/eventReviewModel");

const eventReviewService = require("../../../../src/services/eventReviewService");

describe("eventReviewService.getEventReviews", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       SUCCESS CASES
    ============================= */

    it("should get all reviews for an event", async () => {
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
        EventReview.findAll.mockResolvedValue(reviews);

        const result = await eventReviewService.getEventReviews(1);

        expect(Event.findByPk).toHaveBeenCalledWith(1, {});

        expect(EventReview.findAll).toHaveBeenCalledWith({
            where: {
                eventId: 1
            },
            include: [{
                model: User,
                as: "user",
                attributes: ["id", "name", "avatar"]
            }],
            order: [["createdAt", "DESC"]]
        });

        expect(result).toBe(reviews);

        expect(result[0]).toMatchObject({
            rating: 5,
            comment: "Great event!"
        })
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

        expect(EventReview.findAll).not.toHaveBeenCalled();
    });
});
