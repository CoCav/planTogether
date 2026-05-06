/* ==================================================
   EVENT MEMBERSHIP SERVICE - GET EVENT STAFF TESTS

   Tests:
   - organizer and co-organizer listing
   - missing event rejection

   Ensures:
   - role-based organizer filtering is applied
   - organizer data is returned with user information
   - missing events are rejected before membership query
================================================== */

const Event = require("../../../../src/models/eventModel");
const User = require("../../../../src/models/userModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const { Op } = require("sequelize");

const service = require("../../../../src/services/eventMembershipService");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findAll: jest.fn()
}));

describe("eventMembershipService - GetEventStaff", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should get event organizers and co-organizers", async () => {
        const organizers = [
            { id: 1, role: "organizer" }
        ];

        Event.findByPk.mockResolvedValue({ id: 1 });
        EventUserRole.findAll.mockResolvedValue(organizers);

        const result = await service.getEventStaff(1);

        expect(Event.findByPk).toHaveBeenCalledWith(1);

        expect(EventUserRole.findAll).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                role: {
                    [Op.in]: ["organizer", "co_organizer"]
                }
            },
            include: [{
                model: User,
                attributes: ["id", "name", "email"]
            }],
            order: [["role", "ASC"], ["createdAt", "ASC"]]
        });

        expect(result).toBe(organizers);
    });

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            service.getEventStaff(999)
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(EventUserRole.findAll).not.toHaveBeenCalled();
    });
});
