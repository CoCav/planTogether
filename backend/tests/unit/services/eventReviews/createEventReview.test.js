/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindEventByIdOrFail = jest.fn();
const mockFindActiveMembership = jest.fn();
const mockIsEventPast = jest.fn();
const mockNormalizeString = jest.fn();
const mockBuildPublicUserInclude = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    name: "EventUserRole"
}));

jest.mock("../../../../src/models/associations/eventReviewModel", () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    isEventPast: mockIsEventPast
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: mockFindActiveMembership
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: mockNormalizeString
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildPublicUserInclude: mockBuildPublicUserInclude
}));

jest.mock("../../../../src/utils/eventReviews/eventReviewsQueries", () => ({
    findReviewByIdOrFail: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");
const EventReview = require("../../../../src/models/associations/eventReviewModel");

const { createEventReview } = require("../../../../src/services/eventReviewService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

/* ==========================================================================
   Create Event Review Service Unit Tests

   Tests event review creation business logic.

   Responsibilities
   - Test completed event validation
   - Test active participant validation
   - Test duplicate review protection
   - Test review comment normalization
   - Test review creation and user data reload
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Event, membership and review query utilities are mocked.
   - Created reviews are reloaded inside the creation transaction.
=========================================================================== */

describe("create event review service", () => {
    let transaction;
    let publicUserInclude;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        publicUserInclude = {
            model: User,
            as: "user",
            attributes: [
                "id",
                "name",
                "avatar"
            ]
        };

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindEventByIdOrFail.mockResolvedValue({
            id: 1,
            endDateTime: "2026-04-25T11:00:00.000Z"
        });

        mockIsEventPast.mockReturnValue(true);

        mockFindActiveMembership.mockResolvedValue({
            eventId: 1,
            userId: 10,
            role: "participant"
        });

        EventReview.findOne.mockResolvedValue(null);

        EventReview.create.mockResolvedValue({
            id: 5,
            eventId: 1,
            userId: 10
        });

        mockNormalizeString.mockReturnValue("Great event!");

        mockBuildPublicUserInclude.mockReturnValue(publicUserInclude);

        EventReview.findByPk.mockResolvedValue({
            id: 5,
            eventId: 1,
            userId: 10,
            rating: 5,
            comment: "Great event!",
            user: {
                id: 10,
                name: "John Doe",
                avatar: null
            }
        });
    });

    /* =============================
       REVIEW CREATION
    ============================= */

    describe("createEventReview", () => {
        it("creates and reloads a review inside a transaction", async () => {
            const result = await createEventReview({
                eventId: 1,
                userId: 10,
                rating: 5,
                comment: "  Great event!  "
            });

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(Event, 1, {
                transaction
            });

            expect(mockIsEventPast).toHaveBeenCalledTimes(1);

            expect(mockIsEventPast).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1
                })
            );

            expect(mockFindActiveMembership).toHaveBeenCalledWith(EventUserRole, {
                eventId: 1,
                userId: 10,
                transaction
            });

            expect(EventReview.findOne).toHaveBeenCalledWith({
                where: {
                    eventId: 1,
                    userId: 10
                },
                transaction
            });

            expect(mockNormalizeString).toHaveBeenCalledWith("  Great event!  ");

            expect(EventReview.create).toHaveBeenCalledWith({
                eventId: 1,
                userId: 10,
                rating: 5,
                comment: "Great event!"
            }, {
                transaction
            });

            expect(mockBuildPublicUserInclude).toHaveBeenCalledWith(User);

            expect(EventReview.findByPk).toHaveBeenCalledWith(5, {
                transaction,
                include: [
                    publicUserInclude
                ]
            });

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(EventReview.findByPk.mock.invocationCallOrder[0]).toBeLessThan(
                transaction.commit.mock.invocationCallOrder[0]
            );

            expect(result).toEqual({
                id: 5,
                eventId: 1,
                userId: 10,
                rating: 5,
                comment: "Great event!",
                user: {
                    id: 10,
                    name: "John Doe",
                    avatar: null
                }
            });
        });
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("rolls back when the event does not exist", async () => {
            const error = Object.assign(new Error("Event not found"), {
                statusCode: 404
            });

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(
                createEventReview({
                    eventId: 999,
                    userId: 10,
                    rating: 5,
                    comment: "Great event!"
                })
            ).rejects.toBe(error);

            expect(mockIsEventPast).not.toHaveBeenCalled();

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(EventReview.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("throws a 403 error when the event is not completed", async () => {
            mockIsEventPast.mockReturnValue(false);

            await expect(
                createEventReview({
                    eventId: 1,
                    userId: 10,
                    rating: 5,
                    comment: "Great event!"
                })
            ).rejects.toMatchObject({
                message: "Only completed events can be reviewed",
                statusCode: 403
            });

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(EventReview.findOne).not.toHaveBeenCalled();

            expect(EventReview.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       REVIEW PERMISSIONS
    ============================= */

    describe("Review permissions", () => {
        it("throws a 403 error when the user is not an active participant", async () => {
            mockFindActiveMembership.mockResolvedValue(null);

            await expect(
                createEventReview({
                    eventId: 1,
                    userId: 10,
                    rating: 5,
                    comment: "Great event!"
                })
            ).rejects.toMatchObject({
                message: "Only event participants can leave a review",
                statusCode: 403
            });

            expect(EventReview.findOne).not.toHaveBeenCalled();

            expect(EventReview.create).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       DUPLICATE REVIEW PROTECTION
    ============================= */

    describe("Duplicate review protection", () => {
        it("throws a 409 error when the user already reviewed the event", async () => {
            EventReview.findOne.mockResolvedValue({
                id: 2,
                eventId: 1,
                userId: 10
            });

            await expect(
                createEventReview({
                    eventId: 1,
                    userId: 10,
                    rating: 5,
                    comment: "Great event!"
                })
            ).rejects.toMatchObject({
                message: "You have already reviewed this event",
                statusCode: 409
            });

            expect(EventReview.create).not.toHaveBeenCalled();

            expect(EventReview.findByPk).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it.each([[
            "membership lookup", () => {
                mockFindActiveMembership.mockRejectedValue(
                    new Error("Membership lookup failed")
                );
            }], [
            "duplicate review lookup", () => {
                EventReview.findOne.mockRejectedValue(
                    new Error("Review lookup failed")
                );
            }], [
            "review creation", () => {
                EventReview.create.mockRejectedValue(
                    new Error("Review creation failed")
                );
            }], [
            "created review reload", () => {
                EventReview.findByPk.mockRejectedValue(
                    new Error("Review reload failed")
                );
            }]])(
                "rolls back and propagates %s errors", async (_, configureError) => {
                    configureError();

                    await expect(
                        createEventReview({
                            eventId: 1,
                            userId: 10,
                            rating: 5,
                            comment: "Great event!"
                        })
                    ).rejects.toBeInstanceOf(Error);

                    expect(transaction.commit).not.toHaveBeenCalled();

                    expect(transaction.rollback).toHaveBeenCalledTimes(1);
                }
            );
    });
});
