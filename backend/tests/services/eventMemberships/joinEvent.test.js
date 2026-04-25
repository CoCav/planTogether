const Event = require("../../../src/models/eventModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");
const { assertEventNotPast } = require("../../../src/utils/eventTime");

const service = require("../../../src/services/eventMembershipService");

/**
 * Event Membership - Join Event
 *
 * Tests joining an event.
 *
 * Ensures users can join only valid and available events.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));

jest.mock("../../../src/utils/eventTime", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventMembershipService - joinEvent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should join event as participant", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findOne.mockResolvedValue(null);

        EventUserRole.create.mockResolvedValue({
            eventId: 1,
            userId: 10,
            role: "participant"
        });

        const result = await service.joinEvent({
            eventId: 1,
            userId: 10
        });

        expect(assertEventNotPast).toHaveBeenCalled();
        expect(EventUserRole.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            role: "participant"
        });

        expect(result.role).toBe("participant");
    });

    it("should throw 404 if event not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            service.joinEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should throw 409 if already joined", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findOne.mockResolvedValue({ id: 1 });

        await expect(
            service.joinEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            statusCode: 409
        });

        expect(EventUserRole.create).not.toHaveBeenCalled();
    });

    it("should block past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("past");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(service.joinEvent({ eventId: 1, userId: 10 })).rejects.toMatchObject({ statusCode: 403 });
    });
});