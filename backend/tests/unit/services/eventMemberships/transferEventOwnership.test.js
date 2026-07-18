/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindEventByIdOrFail = jest.fn();
const mockAssertEventNotPast = jest.fn();

const mockFindActiveMembership = jest.fn();
const mockFindMembership = jest.fn();
const mockCountActiveParticipants = jest.fn();
const mockBuildPublicUserInclude = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("sequelize", () => ({
    Op: {
        in: Symbol("in")
    }
}));

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

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: mockAssertEventNotPast
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: mockFindActiveMembership,
    findMembership: mockFindMembership
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    countActiveParticipants: mockCountActiveParticipants
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildPublicUserInclude: mockBuildPublicUserInclude
}));

/* =============================
   TEST IMPORTS
============================= */

const sequelize = require("../../../../src/config/database");

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { transferEventOwnership } = require("../../../../src/services/eventMembershipService");

const { createTransactionMock } = require("../../../helpers/database/modelTestHelper");

const { createMockMembership } = require("../../../factories/eventMembershipFactory");

/* ==========================================================================
   Transfer Event Ownership Service Unit Tests

   Tests event ownership transfer business logic.

   Responsibilities
   - Test event existence and lifecycle validation
   - Test self-transfer protection
   - Test current organizer membership validation
   - Test organizer role authorization
   - Test target membership validation
   - Test atomic role changes
   - Test transaction commit and rollback
   - Test unexpected error propagation

   Notes
   - Event and membership query utilities are mocked.
   - Only active event members can receive ownership.
   - Previous organizers become co-organizers after transfer.
=========================================================================== */

describe("transfer event ownership service", () => {
    let transaction;
    let currentOrganizerMembership;
    let targetMembership;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = createTransactionMock();

        currentOrganizerMembership = createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER,
            deletedAt: null,
            save: jest.fn().mockResolvedValue()
        });

        targetMembership = createMockMembership({
            eventId: 1,
            userId: 20,
            role: EVENT_ROLES.PARTICIPANT,
            deletedAt: null,
            save: jest.fn().mockResolvedValue()
        });

        sequelize.transaction.mockResolvedValue(transaction);

        mockFindEventByIdOrFail.mockResolvedValue({
            id: 1
        });

        mockAssertEventNotPast.mockImplementation(() => { });

        mockFindActiveMembership
            .mockResolvedValueOnce(currentOrganizerMembership)
            .mockResolvedValueOnce(targetMembership);
    });

    /* =============================
       OWNERSHIP TRANSFER
    ============================= */

    describe("transferEventOwnership", () => {
        it.each([[
            "participant",
            EVENT_ROLES.PARTICIPANT
        ], [
            "co-organizer",
            EVENT_ROLES.CO_ORGANIZER
        ]])(
            "transfers ownership to an active %s", async (_, targetRole) => {
                targetMembership.role = targetRole;

                const result = await transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                });

                expect(sequelize.transaction).toHaveBeenCalledTimes(1);

                expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(Event, 1, {
                    transaction
                });

                expect(mockAssertEventNotPast).toHaveBeenCalledWith({
                    id: 1
                });

                expect(mockFindActiveMembership).toHaveBeenNthCalledWith(1, EventUserRole, {
                    eventId: 1,
                    userId: 10,
                    transaction
                });

                expect(mockFindActiveMembership).toHaveBeenNthCalledWith(2, EventUserRole, {
                    eventId: 1,
                    userId: 20,
                    transaction
                });

                expect(currentOrganizerMembership.role).toBe(EVENT_ROLES.CO_ORGANIZER);

                expect(targetMembership.role).toBe(EVENT_ROLES.ORGANIZER);

                expect(currentOrganizerMembership.save).toHaveBeenCalledWith({
                    transaction
                });

                expect(targetMembership.save).toHaveBeenCalledWith({
                    transaction
                });

                expect(currentOrganizerMembership.save.mock.invocationCallOrder[0]).toBeLessThan(
                    targetMembership.save.mock.invocationCallOrder[0]
                );

                expect(transaction.commit).toHaveBeenCalledTimes(1);

                expect(transaction.rollback).not.toHaveBeenCalled();

                expect(result).toEqual({
                    previousOrganizer: currentOrganizerMembership,
                    newOrganizer: targetMembership
                });
            }
        );
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
                transferEventOwnership({
                    eventId: 999,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toBe(error);

            expect(mockAssertEventNotPast).not.toHaveBeenCalled();

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when the event is past", async () => {
            const error = Object.assign(new Error("No action is allowed on a past event"), {
                statusCode: 403
            });

            mockAssertEventNotPast.mockImplementation(() => {
                throw error;
            });

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toBe(error);

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       SELF-TRANSFER PROTECTION
    ============================= */

    describe("Self-transfer protection", () => {
        it("throws a 400 error when transferring ownership to self", async () => {
            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 10
                })
            ).rejects.toMatchObject({
                message: "You cannot transfer ownership to yourself",
                statusCode: 400
            });

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(currentOrganizerMembership.save).not.toHaveBeenCalled();

            expect(targetMembership.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       CURRENT ORGANIZER VALIDATION
    ============================= */

    describe("Current organizer validation", () => {
        it("throws a 404 error when the current organizer membership is missing", async () => {
            mockFindActiveMembership
                .mockReset()
                .mockResolvedValue(null);

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toMatchObject({
                message: "Current organizer membership not found",
                statusCode: 404
            });

            expect(mockFindActiveMembership).toHaveBeenCalledTimes(1);

            expect(currentOrganizerMembership.save).not.toHaveBeenCalled();

            expect(targetMembership.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("throws a 403 error when the current user is not the organizer", async () => {
            currentOrganizerMembership.role = EVENT_ROLES.CO_ORGANIZER;

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toMatchObject({
                message: "Only the organizer can transfer event ownership",
                statusCode: 403
            });

            expect(mockFindActiveMembership).toHaveBeenCalledTimes(1);

            expect(currentOrganizerMembership.save).not.toHaveBeenCalled();

            expect(targetMembership.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       TARGET MEMBER VALIDATION
    ============================= */

    describe("Target member validation", () => {
        it("throws a 404 error when the target has no active membership", async () => {
            mockFindActiveMembership
                .mockReset()
                .mockResolvedValueOnce(currentOrganizerMembership)
                .mockResolvedValueOnce(null);

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toMatchObject({
                message: "Target member is not part of this event",
                statusCode: 404
            });

            expect(mockFindActiveMembership).toHaveBeenCalledTimes(2);

            expect(currentOrganizerMembership.save).not.toHaveBeenCalled();

            expect(targetMembership.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("rolls back when the organizer membership lookup fails", async () => {
            const error = new Error("Organizer lookup failed");

            mockFindActiveMembership
                .mockReset()
                .mockRejectedValue(error);

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toBe(error);

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when the target membership lookup fails", async () => {
            const error = new Error("Target lookup failed");

            mockFindActiveMembership
                .mockReset()
                .mockResolvedValueOnce(currentOrganizerMembership)
                .mockRejectedValueOnce(error);

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toBe(error);

            expect(currentOrganizerMembership.save).not.toHaveBeenCalled();

            expect(targetMembership.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when the previous organizer cannot be saved", async () => {
            const error = new Error("Previous organizer save failed");

            currentOrganizerMembership.save.mockRejectedValue(error);

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toBe(error);

            expect(targetMembership.save).not.toHaveBeenCalled();

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when the new organizer cannot be saved", async () => {
            const error = new Error("New organizer save failed");

            targetMembership.save.mockRejectedValue(error);

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toBe(error);

            expect(currentOrganizerMembership.save).toHaveBeenCalledWith({
                transaction
            });

            expect(transaction.commit).not.toHaveBeenCalled();

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });

        it("rolls back when the transaction commit fails", async () => {
            const error = new Error("Transaction commit failed");

            transaction.commit.mockRejectedValue(error);

            await expect(
                transferEventOwnership({
                    eventId: 1,
                    currentUserId: 10,
                    targetUserId: 20
                })
            ).rejects.toBe(error);

            expect(currentOrganizerMembership.save).toHaveBeenCalledTimes(1);

            expect(targetMembership.save).toHaveBeenCalledTimes(1);

            expect(transaction.rollback).toHaveBeenCalledTimes(1);
        });
    });
});
