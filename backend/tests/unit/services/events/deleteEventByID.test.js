/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindEventByIdOrFail = jest.fn();
const mockAssertEventNotStarted = jest.fn();
const mockDeleteUploadedFile = jest.fn();

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
    destroy: jest.fn()
}));

jest.mock("../../../../src/models/associations/eventReviewModel", () => ({
    name: "EventReview"
}));

jest.mock("../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../src/services/geocodingService", () => ({
    resolveEventLocation: jest.fn()
}));

jest.mock("../../../../src/utils/stringNormalizer", () => ({
    normalizeString: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn(),
    assertEventNotStarted: mockAssertEventNotStarted,
    hasEventStarted: jest.fn(),
    getEventStatus: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventPayloadBuilder", () => ({
    buildCreateEventPayload: jest.fn(),
    buildUpdateEventPayload: jest.fn()
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: mockDeleteUploadedFile
}));

jest.mock("../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    buildActiveParticipantInclude: jest.fn(),
    buildEventParticipantCountAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventReviews/eventReviews", () => ({
    buildEventReviewInclude: jest.fn(),
    buildEventReviewCountAttribute: jest.fn(),
    buildEventAverageRatingAttribute: jest.fn()
}));

jest.mock("../../../../src/utils/eventLikes/eventLikes", () => ({
    buildEventLikeInclude: jest.fn(),
    buildEventLikeCountAttribute: jest.fn(),
    findLikedEventIdsByUser: jest.fn(),
    findEventLike: jest.fn()
}));

jest.mock("../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

/* =============================
   TEST IMPORTS
============================= */

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { deleteEventById } = require("../../../../src/services/eventService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

const { createMockEventModel } = require("../../../factories/eventFactory");

/* ==========================================================================
   Delete Event Service Unit Tests

   Tests event deletion business logic.

   Responsibilities
   - Test event existence validation
   - Test started event deletion protection
   - Test membership cleanup
   - Test event deletion
   - Test post-commit image cleanup
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Database deletion runs inside a transaction.
   - Uploaded event images are removed only after the transaction commits.
   - File cleanup failures cannot roll back committed database changes.
=========================================================================== */

describe("delete event service", () => {
    let transaction;
    let event;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        event = createMockEventModel({
            id: 1,
            image: null,
            destroy: jest.fn().mockResolvedValue()
        });

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindEventByIdOrFail.mockResolvedValue(event);

        mockAssertEventNotStarted.mockImplementation(() => { });

        EventUserRole.destroy.mockResolvedValue(1);

        mockDeleteUploadedFile.mockResolvedValue();
    });

    /* =============================
       EVENT DELETION
    ============================= */

    describe("deleteEventById", () => {
        it("deletes event memberships and the event inside a transaction", async () => {
            const result = await deleteEventById(1);

            expect(sequelize.transaction).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledTimes(1);
            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(Event, 1, {
                transaction
            });

            expect(mockAssertEventNotStarted).toHaveBeenCalledTimes(1);
            expect(mockAssertEventNotStarted).toHaveBeenCalledWith(event);

            expect(EventUserRole.destroy).toHaveBeenCalledTimes(1);
            expect(EventUserRole.destroy).toHaveBeenCalledWith({
                where: {
                    eventId: 1
                },
                transaction
            });

            expect(event.destroy).toHaveBeenCalledTimes(1);
            expect(event.destroy).toHaveBeenCalledWith({
                transaction
            });

            expect(EventUserRole.destroy.mock.invocationCallOrder[0]).toBeLessThan(event.destroy.mock.invocationCallOrder[0]);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).not.toHaveBeenCalled();

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();

            expect(result).toBeUndefined();
        });
    });

    /* =============================
       IMAGE CLEANUP
    ============================= */

    describe("Image cleanup", () => {
        beforeEach(() => {
            event.image = "/uploads/events/event-image.png";
        });

        it("deletes the event image after the transaction commits", async () => {
            await deleteEventById(1);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).toHaveBeenCalledTimes(1);
            expect(mockDeleteUploadedFile).toHaveBeenCalledWith("/uploads/events/event-image.png");

            expect(transaction.commit.mock.invocationCallOrder[0]).toBeLessThan(mockDeleteUploadedFile.mock.invocationCallOrder[0]);

            expect(transaction.rollback).not.toHaveBeenCalled();
        });

        it("propagates post-commit image cleanup errors without rolling back", async () => {
            const error = new Error("File cleanup failed");

            mockDeleteUploadedFile.mockRejectedValue(error);

            await expect(deleteEventById(1)).rejects.toBe(error);

            expect(EventUserRole.destroy).toHaveBeenCalledTimes(1);
            expect(event.destroy).toHaveBeenCalledTimes(1);

            expect(transaction.commit).toHaveBeenCalledTimes(1);

            // Database deletion is already committed.
            expect(transaction.rollback).not.toHaveBeenCalled();
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

            await expect(deleteEventById(999)).rejects.toBe(error);

            expect(mockAssertEventNotStarted).not.toHaveBeenCalled();

            expect(EventUserRole.destroy).not.toHaveBeenCalled();
            expect(event.destroy).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("rolls back when the event has already started", async () => {
            const error = Object.assign(new Error("An event that has already started cannot be deleted"), {
                statusCode: 403
            });

            mockAssertEventNotStarted.mockImplementation(() => {
                throw error;
            });

            await expect(deleteEventById(1)).rejects.toBe(error);

            expect(EventUserRole.destroy).not.toHaveBeenCalled();
            expect(event.destroy).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });

    /* =============================
       TRANSACTION ERRORS
    ============================= */

    describe("Transaction errors", () => {
        it("propagates transaction creation errors", async () => {
            const error = new Error("Transaction creation failed");

            sequelize.transaction.mockRejectedValue(error);

            await expect(deleteEventById(1)).rejects.toBe(error);

            expect(mockFindEventByIdOrFail).not.toHaveBeenCalled();

            expect(EventUserRole.destroy).not.toHaveBeenCalled();
            expect(event.destroy).not.toHaveBeenCalled();

            expect(transaction.rollback).not.toHaveBeenCalled();
        });

        it("rolls back when membership cleanup fails", async () => {
            const error = new Error("Membership cleanup failed");

            EventUserRole.destroy.mockRejectedValue(error);

            await expect(deleteEventById(1)).rejects.toBe(error);

            expect(event.destroy).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("rolls back when event deletion fails", async () => {
            const error = new Error("Event deletion failed");

            event.destroy.mockRejectedValue(error);

            await expect(deleteEventById(1)).rejects.toBe(error);

            expect(EventUserRole.destroy).toHaveBeenCalledTimes(1);

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });

        it("rolls back when transaction commit fails", async () => {
            const error = new Error("Transaction commit failed");

            transaction.commit.mockRejectedValue(error);

            await expect(deleteEventById(1)).rejects.toBe(error);

            expect(EventUserRole.destroy).toHaveBeenCalledTimes(1);
            expect(event.destroy).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).toHaveBeenCalledTimes(1);

            expect(mockDeleteUploadedFile).not.toHaveBeenCalled();
        });
    });
});
