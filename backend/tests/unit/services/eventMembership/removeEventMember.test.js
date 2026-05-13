/* ==================================================
   EVENT MEMBERSHIP SERVICE - REMOVE EVENT MEMBER TESTS

   Tests:
   - successful member removal
   - membership soft deletion on removal
   - past event rejection
   - missing event rejection
   - missing membership rejection
   - database error propagation

   Ensures:
   - members can be removed from valid events
   - removing a member soft-deletes the membership instead of destroying it
   - past event rules are respected
   - missing events and memberships are rejected correctly

   Notes:
   - role-based removal authorization is tested in eventMemberAuthorization middleware tests
================================================== */

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventMembershipService = require("../../../../src/services/eventMembershipService");

const { assertEventNotPast } = require("../../../../src/utils/events/eventStatus");

const { createMockMembership } = require("../../../factories/eventMembershipFactory");

describe("eventMembershipService - removeEventMember", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
      MEMBER REMOVAL
    ============================= */

    it("should remove event member", async () => {
        const membership = createMockMembership({
            deletedAt: null,
            save: jest.fn().mockResolvedValue()
        });

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        await eventMembershipService.removeEventMember({
            eventId: 1,
            userId: 10
        });

        expect(assertEventNotPast).toHaveBeenCalledWith({ id: 1 });

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10,
                deletedAt: null
            }
        });

        expect(membership.deletedAt).toBeInstanceOf(Date);
        expect(membership.save).toHaveBeenCalled();
    });

    /* =============================
      BUSINESS RULES
    ============================= */

    it("should block removing member from past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(eventMembershipService.removeEventMember({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            statusCode: 403
        });
    });

    /* =============================
      EDGE CASES
    ============================= */

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventMembershipService.removeEventMember({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should throw 404 if membership is not found", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(null);

        await expect(eventMembershipService.removeEventMember({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            message: "User is not a member of this event",
            statusCode: 404
        });
    });

    /* =============================
      DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventMembershipService.removeEventMember({
            eventId: 1,
            userId: 10
        })).rejects.toThrow("DB error");
    });
});
