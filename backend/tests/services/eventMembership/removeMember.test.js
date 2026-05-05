/* ==================================================
   EVENT MEMBERSHIP SERVICE - REMOVE MEMBER TESTS

   Tests:
   - successful member removal
   - missing event rejection
   - past event rejection
   - missing membership rejection
   - database error forwarding

   Ensures:
   - members can be removed from valid events
   - past event rules are respected
   - missing memberships are rejected
================================================== */

const Event = require("../../../src/models/eventModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");
const { assertEventNotPast } = require("../../../src/utils/eventTime");

const service = require("../../../src/services/eventMembershipService");

jest.mock("../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../src/utils/eventTime", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventMembershipService - removeMember", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should remove member", async () => {
        const membership = {
            destroy: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        await service.removeMember({
            eventId: 1,
            userId: 10
        });

        expect(assertEventNotPast).toHaveBeenCalledWith({ id: 1 });

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10
            }
        });

        expect(membership.destroy).toHaveBeenCalled();
    });

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            service.removeMember({
                eventId: 1,
                userId: 10
            })
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should block removing member from past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(
            service.removeMember({
                eventId: 1,
                userId: 10
            })
        ).rejects.toMatchObject({
            statusCode: 403
        });
    });

    it("should throw 404 if membership is not found", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(null);

        await expect(
            service.removeMember({
                eventId: 1,
                userId: 10
            })
        ).rejects.toMatchObject({
            message: "User is not a member of this event",
            statusCode: 404
        });
    });

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(
            service.removeMember({
                eventId: 1,
                userId: 10
            })
        ).rejects.toThrow("DB error");
    });
});
