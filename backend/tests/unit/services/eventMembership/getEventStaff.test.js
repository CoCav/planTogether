/* ==================================================
   EVENT MEMBERSHIP SERVICE - GET EVENT STAFF TESTS

   Tests:
   - organizer and co-organizer listing
   - missing event rejection
   - database error forwarding

   Ensures:
   - role-based organizer filtering is applied
   - organizer data is returned with user information
   - missing events are rejected before membership query
   - shared event role constants are used for valid role scenarios
   - database errors are forwarded correctly
================================================== */

const { Op } = require("sequelize");

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventMembershipService = require("../../../../src/services/eventMembershipService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findAll: jest.fn()
}));

describe("eventMembershipService - GetEventStaff", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
      STAFF RETRIEVAL
    ============================= */

    it("should get event organizers and co-organizers", async () => {
        const eventStaff = [{
            id: 1,
            role: EVENT_ROLES.ORGANIZER
        }];

        Event.findByPk.mockResolvedValue({ id: 1 });
        EventUserRole.findAll.mockResolvedValue(eventStaff);

        const result = await eventMembershipService.getEventStaff(1);

        expect(Event.findByPk).toHaveBeenCalledWith(1);

        expect(EventUserRole.findAll).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                role: {
                    [Op.in]: [EVENT_ROLES.ORGANIZER, EVENT_ROLES.CO_ORGANIZER]
                }
            },
            include: [{
                model: User,
                attributes: ["id", "name", "email"]
            }],
            order: [["role", "ASC"], ["createdAt", "ASC"]]
        });

        expect(result).toBe(eventStaff);
    });

    /* =============================
      EDGE CASES
    ============================= */

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventMembershipService.getEventStaff(999)).rejects.toMatchObject({
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

        await expect(eventMembershipService.getEventStaff(1)).rejects.toThrow("DB error");
    });
});
