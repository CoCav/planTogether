const mockFindEventByIdOrFail = jest.fn();
const mockAssertEventNotPast = jest.fn();
const mockFindActiveMembership = jest.fn();

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
    findMembership: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    countActiveParticipants: jest.fn()
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildPublicUserInclude: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { removeEventMember } = require("../../../../src/services/eventMembershipService");

const { createMockMembership } = require("../../../factories/eventMembershipFactory");

const { mockSystemTime } = require("../../../helpers/mocks/systemTimeTestHelper");

/* ==========================================================================
   Remove Event Member Service Unit Tests

   Tests event member removal behavior.

   Responsibilities
   - Test event existence and lifecycle validation
   - Test active membership validation
   - Test membership soft deletion
   - Test membership persistence
   - Test unexpected error propagation

   Notes
   - Event and membership query utilities are mocked.
   - Role-based removal authorization is tested in middleware unit tests.
=========================================================================== */

describe("remove event member service", () => {
    mockSystemTime("2026-04-25T12:00:00.000Z");

    let membership;

    beforeEach(() => {
        jest.clearAllMocks();

        membership = createMockMembership({
            eventId: 1,
            userId: 20,
            deletedAt: null,
            save: jest.fn().mockResolvedValue()
        });

        mockFindEventByIdOrFail.mockResolvedValue({
            id: 1
        });

        mockAssertEventNotPast.mockImplementation(() => { });

        mockFindActiveMembership.mockResolvedValue(membership);
    });

    /* =============================
       MEMBER REMOVAL
    ============================= */

    describe("removeEventMember", () => {
        it("soft-deletes the active membership", async () => {
            const result = await removeEventMember({
                eventId: 1,
                userId: 20
            });

            expect(mockFindEventByIdOrFail).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(
                Event,
                1
            );

            expect(mockAssertEventNotPast).toHaveBeenCalledTimes(1);

            expect(mockAssertEventNotPast).toHaveBeenCalledWith({
                id: 1
            });

            expect(mockFindActiveMembership).toHaveBeenCalledTimes(1);

            expect(mockFindActiveMembership).toHaveBeenCalledWith(
                EventUserRole,
                {
                    eventId: 1,
                    userId: 20,
                    transaction: undefined
                }
            );

            expect(membership.deletedAt).toEqual(
                new Date("2026-04-25T12:00:00.000Z")
            );

            expect(membership.save).toHaveBeenCalledTimes(1);

            expect(membership.save).toHaveBeenCalledWith();

            expect(result).toBeUndefined();
        });
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("stops when the event does not exist", async () => {
            const error = Object.assign(
                new Error("Event not found"),
                {
                    statusCode: 404
                }
            );

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(
                removeEventMember({
                    eventId: 999,
                    userId: 20
                })
            ).rejects.toBe(error);

            expect(mockAssertEventNotPast).not.toHaveBeenCalled();

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(membership.save).not.toHaveBeenCalled();
        });

        it("stops when the event is past", async () => {
            const error = Object.assign(
                new Error("No action is allowed on a past event"),
                {
                    statusCode: 403
                }
            );

            mockAssertEventNotPast.mockImplementation(() => {
                throw error;
            });

            await expect(
                removeEventMember({
                    eventId: 1,
                    userId: 20
                })
            ).rejects.toBe(error);

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(membership.save).not.toHaveBeenCalled();
        });
    });

    /* =============================
       MEMBERSHIP VALIDATION
    ============================= */

    describe("Membership validation", () => {
        it("throws a 404 error when the active membership is missing", async () => {
            mockFindActiveMembership.mockResolvedValue(null);

            await expect(
                removeEventMember({
                    eventId: 1,
                    userId: 20
                })
            ).rejects.toMatchObject({
                message: "User is not a member of this event",
                statusCode: 404
            });

            expect(membership.save).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates active membership lookup errors", async () => {
            const error = new Error("Membership lookup failed");

            mockFindActiveMembership.mockRejectedValue(error);

            await expect(
                removeEventMember({
                    eventId: 1,
                    userId: 20
                })
            ).rejects.toBe(error);

            expect(membership.save).not.toHaveBeenCalled();
        });

        it("propagates membership persistence errors", async () => {
            const error = new Error("Membership save failed");

            membership.save.mockRejectedValue(error);

            await expect(
                removeEventMember({
                    eventId: 1,
                    userId: 20
                })
            ).rejects.toBe(error);
        });
    });
});
