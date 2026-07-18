/* =============================
   MOCK FUNCTIONS
============================= */

const mockFindEventByIdOrFail = jest.fn();
const mockBuildAuthenticatedUserInclude = jest.fn();

const mockOpIn = Symbol("in");

/* =============================
   TEST MOCKS
============================= */

jest.mock("sequelize", () => ({
    Op: {
        in: mockOpIn
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

/* =============================
   TEST IMPORTS
============================= */

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const {
    EVENT_ROLES,
    STAFF_EVENT_ROLES
} = require("../../../../src/constants/eventRoles");

const { getEventStaff } = require("../../../../src/services/eventMembershipService");

/* ==========================================================================
   Get Event Staff Service Unit Tests

   Tests active event staff retrieval.

   Responsibilities
   - Test event existence validation
   - Test active staff membership filtering
   - Test organizer and co-organizer role filtering
   - Test public user data inclusion
   - Test staff ordering
   - Test result forwarding
   - Test unexpected error propagation

   Notes
   - Event query and user include utilities are mocked.
   - Inactive memberships and participant roles are excluded by the query.
=========================================================================== */

describe("get event staff service", () => {
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
       EVENT STAFF RETRIEVAL
    ============================= */

    describe("getEventStaff", () => {
        it("returns active organizers and co-organizers with authenticated user data", async () => {
            const eventStaff = [{
                id: 1,
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.ORGANIZER,
                deletedAt: null
            }, {
                id: 2,
                eventId: 1,
                userId: 20,
                role: EVENT_ROLES.CO_ORGANIZER,
                deletedAt: null
            }];

            EventUserRole.findAll.mockResolvedValue(eventStaff);

            const result = await getEventStaff(1);

            expect(mockFindEventByIdOrFail).toHaveBeenCalledTimes(1);
            expect(mockFindEventByIdOrFail).toHaveBeenCalledWith(Event, 1);

            expect(mockBuildAuthenticatedUserInclude).toHaveBeenCalledTimes(1);
            expect(mockBuildAuthenticatedUserInclude).toHaveBeenCalledWith(User);

            expect(EventUserRole.findAll).toHaveBeenCalledTimes(1);
            expect(EventUserRole.findAll).toHaveBeenCalledWith({
                where: {
                    eventId: 1,
                    deletedAt: null,
                    role: {
                        [mockOpIn]: STAFF_EVENT_ROLES
                    }
                },
                include: [
                    AuthenticatedUserInclude
                ],
                order: [
                    ["role", "ASC"],
                    ["createdAt", "ASC"]
                ]
            });

            expect(result).toBe(eventStaff);
        });

        it("returns an empty array when the event has no active staff", async () => {
            EventUserRole.findAll.mockResolvedValue([]);

            const result = await getEventStaff(1);

            expect(result).toEqual([]);
        });
    });

    /* =============================
       EVENT VALIDATION
    ============================= */

    describe("Event validation", () => {
        it("stops staff retrieval when the event does not exist", async () => {
            const error = Object.assign(new Error("Event not found"), {
                statusCode: 404
            });

            mockFindEventByIdOrFail.mockRejectedValue(error);

            await expect(getEventStaff(999)).rejects.toBe(error);

            expect(mockBuildAuthenticatedUserInclude).not.toHaveBeenCalled();

            expect(EventUserRole.findAll).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates staff retrieval errors", async () => {
            const error = new Error("Staff retrieval failed");

            EventUserRole.findAll.mockRejectedValue(error);

            await expect(getEventStaff(1)).rejects.toBe(error);
        });
    });
});
