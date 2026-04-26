const Event = require("../../../src/models/eventModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");
const { assertEventNotPast } = require("../../../src/utils/eventTime");

const service = require("../../../src/services/eventMembershipService");

/**
 * Event Membership - Update Member Role
 *
 * Tests role update logic for event members.
 *
 * Ensures roles are validated and updated correctly.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../src/utils/eventTime", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventMembershipService - updateMemberRole", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should update member role", async () => {
        const membership = {
            role: "participant",
            save: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => {});
        EventUserRole.findOne.mockResolvedValue(membership);

        const result = await service.updateMemberRole({
            eventId: 1,
            userId: 10,
            newRole: "co_organizer"
        });

        expect(membership.role).toBe("co_organizer");
        expect(membership.save).toHaveBeenCalled();
        expect(result).toBe(membership);
    });

    it("should throw 404 if event not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            service.updateMemberRole({ eventId: 1, userId: 10, newRole: "participant" })
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should block past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("past");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(
            service.updateMemberRole({ eventId: 1, userId: 10, newRole: "participant" })
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("should throw 400 if role is invalid", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => {});

        await expect(
            service.updateMemberRole({ eventId: 1, userId: 10, newRole: "invalid" })
        ).rejects.toMatchObject({
            message: "Invalid role provided",
            statusCode: 400
        });
    });

    it("should throw 404 if membership not found", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => {});
        EventUserRole.findOne.mockResolvedValue(null);

        await expect(
            service.updateMemberRole({ eventId: 1, userId: 10, newRole: "participant" })
        ).rejects.toMatchObject({
            message: "User is not a member of this event",
            statusCode: 404
        });
    });

    it("should throw 400 if same role", async () => {
        const membership = {
            role: "participant"
        };

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => {});
        EventUserRole.findOne.mockResolvedValue(membership);

        await expect(
            service.updateMemberRole({ eventId: 1, userId: 10, newRole: "participant" })
        ).rejects.toMatchObject({
            message: "User already has this role",
            statusCode: 400
        });
    });

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(
            service.updateMemberRole({ eventId: 1, userId: 10, newRole: "participant" })
        ).rejects.toThrow("DB error");
    });
});