/* ==================================================
   EVENT MEMBERSHIP SERVICE - GET EVENT MEMBERS TESTS

   Tests:
   - successful active member listing
   - inactive membership exclusion
   - missing event rejection
   - database error propagation

   Ensures:
   - only active event memberships are retrieved
   - inactive memberships are excluded from member listings
   - event members are retrieved with user data
   - missing events are rejected before membership query
   - shared event role constants are used for valid role scenarios
================================================== */

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findAll: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventMembershipService = require("../../../../src/services/eventMembershipService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

describe("eventMembershipService - getEventMembers", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       MEMBERS RETRIEVAL
    ============================= */

    it("should get event members", async () => {
        const eventMembers = [{
            id: 1,
            role: EVENT_ROLES.PARTICIPANT
        }];

        Event.findByPk.mockResolvedValue({ id: 1 });
        EventUserRole.findAll.mockResolvedValue(eventMembers);

        const result = await eventMembershipService.getEventMembers(1);

        expect(Event.findByPk).toHaveBeenCalledWith(1);

        expect(EventUserRole.findAll).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                deletedAt: null
            },
            include: [{
                model: User,
                attributes: ["id", "name", "email"]
            }],
            order: [["createdAt", "ASC"]]
        });

        expect(result).toBe(eventMembers);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventMembershipService.getEventMembers(999)).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(EventUserRole.findAll).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventMembershipService.getEventMembers(1)).rejects.toThrow("DB error");
    });
});
