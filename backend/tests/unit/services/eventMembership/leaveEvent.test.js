/* ==================================================
   EVENT MEMBERSHIP SERVICE - LEAVE EVENT TESTS

   Tests:
   - successful event leave
   - missing event rejection
   - past event rejection
   - missing participation rejection
   - organizer self-leave protection
   - database error forwarding

   Ensures:
   - users can leave joined events
   - organizers cannot leave their own event
   - past event rules are respected
================================================== */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");
const { assertEventNotPast } = require("../../../../src/utils/eventStatus");

const service = require("../../../../src/services/eventMembershipService");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventMembershipService - leaveEvent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should leave event", async () => {
        const membership = {
            role: "participant",
            destroy: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        await service.leaveEvent({
            eventId: 1,
            userId: 10
        });

        expect(assertEventNotPast).toHaveBeenCalledWith({ id: 1 });

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: { eventId: 1, userId: 10 }
        });

        expect(membership.destroy).toHaveBeenCalled();
    });

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            service.leaveEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should block leaving a past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(
            service.leaveEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            statusCode: 403
        });
    });

    it("should throw 404 if participation is not found", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(null);

        await expect(
            service.leaveEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            message: "Participation not found",
            statusCode: 404
        });
    });

    it("should prevent organizer from leaving their own event", async () => {
        const membership = {
            role: "organizer",
            destroy: jest.fn()
        };

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        await expect(
            service.leaveEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            message: "Organizers cannot leave their own event",
            statusCode: 403
        });

        expect(membership.destroy).not.toHaveBeenCalled();
    });

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(service.leaveEvent({ eventId: 1, userId: 10 })).rejects.toThrow("DB error");
    });
});
