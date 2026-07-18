/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindEventByIdOrFail = jest.fn();
const mockAssertEventNotPast = jest.fn();
const mockFindActiveMembership = jest.fn();

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

/* =============================
   TEST IMPORTS
============================= */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { updateEventMemberRole } = require("../../../../src/services/eventMembershipService");

const { createMockMembership } = require("../../../factories/eventMembershipFactory");

/* ==========================================================================
   Update Event Member Role Service Unit Tests

   Tests event membership role updates.

   Responsibilities
   - Test event existence and lifecycle validation
   - Test supported role validation
   - Test organizer assignment protection
   - Test active membership validation
   - Test duplicate role protection
   - Test membership role persistence
   - Test unexpected error propagation

   Notes
   - Event and membership query utilities are mocked.
   - Ownership transfer is the only valid way to assign organizer.
=========================================================================== */

describe("update event member role service", () => {
    let membership;

    beforeEach(() => {
        jest.clearAllMocks();

        membership = createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.PARTICIPANT,
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
       MEMBER ROLE UPDATE
    ============================= */

    describe("updateEventMemberRole", () => {
        it("updates and returns the active membership", async () => {
            const result = await updateEventMemberRole({
                eventId: 1,
                userId: 10,
                newRole: EVENT_ROLES.CO_ORGANIZER
            });

            expect(mockFindEventByIdOrFail).toHaveBeenCalledTimes(1);
            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(Event, 1);

            expect(mockAssertEventNotPast).toHaveBeenCalledTimes(1);
            expect(mockAssertEventNotPast).toHaveBeenCalledWith({
                id: 1
            });

            expect(mockFindActiveMembership).toHaveBeenCalledTimes(1);
            expect(mockFindActiveMembership).toHaveBeenCalledWith(EventUserRole, {
                eventId: 1,
                userId: 10,
                transaction: undefined
            });

            expect(membership.role).toBe(EVENT_ROLES.CO_ORGANIZER);

            expect(membership.save).toHaveBeenCalledTimes(1);
            expect(membership.save).toHaveBeenCalledWith();

            expect(result).toBe(membership);
        });
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("stops when the event does not exist", async () => {
            const error = Object.assign(new Error("Event not found"), {
                statusCode: 404
            });

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(
                updateEventMemberRole({
                    eventId: 999,
                    userId: 10,
                    newRole: EVENT_ROLES.CO_ORGANIZER
                })
            ).rejects.toBe(error);

            expect(mockAssertEventNotPast).not.toHaveBeenCalled();

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(membership.save).not.toHaveBeenCalled();
        });

        it("stops when the event is past", async () => {
            const error = Object.assign(new Error("No action is allowed on a past event"), {
                statusCode: 403
            });

            mockAssertEventNotPast.mockImplementation(() => {
                throw error;
            });

            await expect(
                updateEventMemberRole({
                    eventId: 1,
                    userId: 10,
                    newRole: EVENT_ROLES.CO_ORGANIZER
                })
            ).rejects.toBe(error);

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(membership.save).not.toHaveBeenCalled();
        });
    });

    /* =============================
       ROLE VALIDATION
    ============================= */

    describe("Role validation", () => {
        it("throws a 400 error for an unsupported role", async () => {
            await expect(
                updateEventMemberRole({
                    eventId: 1,
                    userId: 10,
                    newRole: "invalid-role"
                })
            ).rejects.toMatchObject({
                message: "Invalid role provided",
                statusCode: 400
            });

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(membership.save).not.toHaveBeenCalled();
        });

        it("throws a 403 error when assigning organizer directly", async () => {
            await expect(
                updateEventMemberRole({
                    eventId: 1,
                    userId: 10,
                    newRole: EVENT_ROLES.ORGANIZER
                })
            ).rejects.toMatchObject({
                message: "Only one organizer is allowed per event",
                statusCode: 403
            });

            expect(mockFindActiveMembership).not.toHaveBeenCalled();

            expect(membership.save).not.toHaveBeenCalled();
        });

        it("throws a 400 error when the role is already assigned", async () => {
            await expect(
                updateEventMemberRole({
                    eventId: 1,
                    userId: 10,
                    newRole: EVENT_ROLES.PARTICIPANT
                })
            ).rejects.toMatchObject({
                message: "User already has this role",
                statusCode: 400
            });

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
                updateEventMemberRole({
                    eventId: 1,
                    userId: 10,
                    newRole: EVENT_ROLES.CO_ORGANIZER
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
                updateEventMemberRole({
                    eventId: 1,
                    userId: 10,
                    newRole: EVENT_ROLES.CO_ORGANIZER
                })
            ).rejects.toBe(error);

            expect(membership.save).not.toHaveBeenCalled();
        });

        it("propagates membership persistence errors", async () => {
            const error = new Error("Membership save failed");

            membership.save.mockRejectedValue(error);

            await expect(
                updateEventMemberRole({
                    eventId: 1,
                    userId: 10,
                    newRole: EVENT_ROLES.CO_ORGANIZER
                })
            ).rejects.toBe(error);
        });
    });
});
