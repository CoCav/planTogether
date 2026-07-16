const mockFindEventByIdOrFail = jest.fn();
const mockBuildAuthenticatedUserInclude = jest.fn();

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
    findAll: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventQueries", () => ({
    findEventByIdOrFail: mockFindEventByIdOrFail
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventMembershipQueries", () => ({
    findActiveMembership: jest.fn(),
    findMembership: jest.fn()
}));

jest.mock("../../../../src/utils/eventMemberships/eventParticipants", () => ({
    countActiveParticipants: jest.fn()
}));

jest.mock("../../../../src/utils/users/userInclude", () => ({
    buildAuthenticatedUserInclude: mockBuildAuthenticatedUserInclude
}));

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const { getEventMembers } = require("../../../../src/services/eventMembershipService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

/* ==========================================================================
   Get Event Members Service Unit Tests

   Tests active event member retrieval.

   Responsibilities
   - Test event existence validation
   - Test active membership filtering
   - Test public user data inclusion
   - Test member ordering
   - Test result forwarding
   - Test unexpected error propagation

   Notes
   - Event query and user include utilities are mocked.
   - Inactive memberships are excluded by the service query.
=========================================================================== */

describe("get event members service", () => {
    let AuthenticatedUserInclude;

    beforeEach(() => {
        jest.clearAllMocks();

        AuthenticatedUserInclude = {
            model: User,
            attributes: [
                "id",
                "name",
                "avatar"
            ]
        };

        mockFindEventByIdOrFail.mockResolvedValue({
            id: 1
        });

        mockBuildAuthenticatedUserInclude.mockReturnValue(AuthenticatedUserInclude);
    });

    /* =============================
       EVENT MEMBER RETRIEVAL
    ============================= */

    describe("getEventMembers", () => {
        it("returns active event members with authenticated user data", async () => {
            const eventMembers = [{
                id: 1,
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT,
                deletedAt: null
            }, {
                id: 2,
                eventId: 1,
                userId: 20,
                role: EVENT_ROLES.CO_ORGANIZER,
                deletedAt: null
            }];

            EventUserRole.findAll.mockResolvedValue(eventMembers);

            const result = await getEventMembers(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledTimes(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(
                Event,
                1
            );

            expect(mockBuildAuthenticatedUserInclude).toHaveBeenCalledTimes(1);

            expect(mockBuildAuthenticatedUserInclude).toHaveBeenCalledWith(User);

            expect(EventUserRole.findAll).toHaveBeenCalledTimes(1);

            expect(EventUserRole.findAll).toHaveBeenCalledWith({
                where: {
                    eventId: 1,
                    deletedAt: null
                },
                include: [
                    AuthenticatedUserInclude
                ],
                order: [
                    ["createdAt", "ASC"]
                ]
            });

            expect(result).toBe(eventMembers);
        });

        it("returns an empty array when the event has no active members", async () => {
            EventUserRole.findAll.mockResolvedValue([]);

            const result = await getEventMembers(1);

            expect(result).toEqual([]);
        });
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("stops member retrieval when the event does not exist", async () => {
            const error = Object.assign(
                new Error("Event not found"),
                {
                    statusCode: 404
                }
            );

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(getEventMembers(999)).rejects.toBe(error);

            expect(mockBuildAuthenticatedUserInclude).not.toHaveBeenCalled();

            expect(EventUserRole.findAll).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates member retrieval errors", async () => {
            const error = new Error("Member retrieval failed");

            EventUserRole.findAll.mockRejectedValue(error);

            await expect(getEventMembers(1)).rejects.toBe(error);
        });
    });
});
