/* ==================================================
   EVENT MEMBERSHIP SERVICE - LIST MEMBERS TESTS

   Tests:
   - successful member listing
   - missing event rejection
   - database error forwarding

   Ensures:
   - event members are retrieved with user data
   - missing events are rejected before membership query
   - database errors are not swallowed
================================================== */

const Event = require("../../../src/models/eventModel");
const User = require("../../../src/models/userModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");

const service = require("../../../src/services/eventMembershipService");

jest.mock("../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/models/userModel", () => ({}));

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findAll: jest.fn()
}));

describe("eventMembershipService - listMembers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should list event members", async () => {
        const memberships = [
            { id: 1, role: "participant" }
        ];

        Event.findByPk.mockResolvedValue({ id: 1 });
        EventUserRole.findAll.mockResolvedValue(memberships);

        const result = await service.listMembers(1);

        expect(Event.findByPk).toHaveBeenCalledWith(1);

        expect(EventUserRole.findAll).toHaveBeenCalledWith({
            where: { eventId: 1 },
            include: [{
                model: User,
                attributes: ["id", "name", "email"]
            }],
            order: [["createdAt", "ASC"]]
        });

        expect(result).toBe(memberships);
    });

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            service.listMembers(999)
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(EventUserRole.findAll).not.toHaveBeenCalled();
    });

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(service.listMembers(1)).rejects.toThrow("DB error");
    });
});
