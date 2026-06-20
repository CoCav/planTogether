/* ==================================================
   CREATE EVENT REVIEW SERVICE TESTS

   Tests:
   - event review creation
   - rating and comment persistence
   - completed event requirement
   - active participant requirement
   - duplicate review prevention
   - transaction rollback on creation errors

   Ensures:
   - users can review only completed events they joined
   - users can leave only one review per event
   - review ratings are persisted
   - review comments are trimmed before persistence
   - created reviews are returned with public user data
   - failed review creation rolls back the transaction
================================================== */

jest.mock("../../../../src/models/eventModel");
jest.mock("../../../../src/models/userModel");
jest.mock("../../../../src/models/relations/eventUserRoleModel");
jest.mock("../../../../src/models/relations/eventReviewModel");

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    isEventPast: jest.fn()
}));

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");
const EventReview = require("../../../../src/models/relations/eventReviewModel");

const { isEventPast } = require("../../../../src/utils/events/eventStatus");

const eventReviewService = require("../../../../src/services/eventReviewService");

describe("eventReviewService - createEventReview", () => {

    /* =============================
       TEST SETUP
    ============================= */

    let transaction;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn(),
            rollback: jest.fn()
        };

        jest.spyOn(sequelize, "transaction").mockResolvedValue(transaction);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    /* =============================
       SUCCESS CASES
    ============================= */

    it("should create a review for a completed event joined by the user", async () => {
        const event = { id: 1 };
        const membership = { eventId: 1, userId: 10 };
        const createdReview = { id: 5 };
        const reviewWithUser = {
            id: 5,
            eventId: 1,
            userId: 10,
            rating: 5,
            comment: "Great event!",
            user: {
                id: 10,
                name: "John",
                avatar: null
            }
        };

        Event.findByPk.mockResolvedValue(event);
        isEventPast.mockReturnValue(true);
        EventUserRole.findOne.mockResolvedValue(membership);
        EventReview.findOne.mockResolvedValue(null);
        EventReview.create.mockResolvedValue(createdReview);
        EventReview.findByPk.mockResolvedValue(reviewWithUser);

        const result = await eventReviewService.createEventReview({
            eventId: 1,
            userId: 10,
            rating: 5,
            comment: "  Great event!  "
        });

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10,
                deletedAt: null
            },
            transaction
        });

        expect(EventReview.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10
            },
            transaction
        });

        expect(EventReview.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            rating: 5,
            comment: "Great event!"
        }, {
            transaction
        });

        expect(transaction.commit).toHaveBeenCalledTimes(1);
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(EventReview.findByPk).toHaveBeenCalledWith(5, {
            include: [{
                model: User,
                as: "user",
                attributes: ["id", "name", "avatar"]
            }]
        });

        expect(result).toBe(reviewWithUser);
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    it("should throw 404 when event does not exist", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventReviewService.createEventReview({
            eventId: 999,
            userId: 10,
            rating: 5,
            comment: "Great event!"
        })).rejects.toMatchObject({
            statusCode: 404,
            message: "Event not found"
        });

        expect(transaction.rollback).toHaveBeenCalledTimes(1);
    });

    it("should throw 403 when event is not completed", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        isEventPast.mockReturnValue(false);

        await expect(eventReviewService.createEventReview({
            eventId: 1,
            userId: 10,
            rating: 5,
            comment: "Great event!"
        })).rejects.toMatchObject({
            statusCode: 403,
            message: "Only completed events can be reviewed"
        });

        expect(transaction.rollback).toHaveBeenCalledTimes(1);
    });

    /* =============================
       REVIEW PERMISSIONS
    ============================= */

    it("should throw 403 when user is not an active participant", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        isEventPast.mockReturnValue(true);
        EventUserRole.findOne.mockResolvedValue(null);

        await expect(eventReviewService.createEventReview({
            eventId: 1,
            userId: 10,
            rating: 5,
            comment: "Great event!"
        })).rejects.toMatchObject({
            statusCode: 403,
            message: "Only event participants can leave a review"
        });

        expect(transaction.rollback).toHaveBeenCalledTimes(1);
    });

    /* =============================
       DUPLICATE REVIEW
    ============================= */

    it("should throw 409 when user already reviewed this event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        isEventPast.mockReturnValue(true);
        EventUserRole.findOne.mockResolvedValue({ eventId: 1, userId: 10 });
        EventReview.findOne.mockResolvedValue({ id: 2 });

        await expect(eventReviewService.createEventReview({
            eventId: 1,
            userId: 10,
            rating: 5,
            comment: "Great event!"
        })).rejects.toMatchObject({
            statusCode: 409,
            message: "You have already reviewed this event"
        });

        expect(transaction.rollback).toHaveBeenCalledTimes(1);
    });
});
