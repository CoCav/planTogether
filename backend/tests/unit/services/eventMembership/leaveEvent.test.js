/* ==================================================
   EVENT MEMBERSHIP SERVICE - LEAVE EVENT TESTS

   Tests:
   - successful event leave
   - past event rejection
   - organizer self-leave protection
   - missing event rejection
   - missing participation rejection
   - database error propagation

   Ensures:
   - users can leave joined events
   - organizers cannot leave their own event
   - past event rules are respected
   - missing memberships are rejected correctly
   - shared event role constants are used for valid role scenarios
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

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { assertEventNotPast } = require("../../../../src/utils/events/eventStatus");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createMockMembership } = require("../../../factories/membershipFactory");

describe("eventMembershipService - leaveEvent", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
      LEAVE SUCCESS
    ============================= */

    it("should leave event", async () => {
        const membership = createMockMembership({
            role: EVENT_ROLES.PARTICIPANT,
            destroy: jest.fn().mockResolvedValue()
        });

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        await eventMembershipService.leaveEvent({
            eventId: 1,
            userId: 10
        });

        expect(assertEventNotPast).toHaveBeenCalledWith({ id: 1 });

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: { eventId: 1, userId: 10 }
        });

        expect(membership.destroy).toHaveBeenCalled();
    });

    /* =============================
      BUSINESS RULES
    ============================= */

    it("should block leaving a past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(eventMembershipService.leaveEvent({ eventId: 1, userId: 10 })).rejects.toMatchObject({
            statusCode: 403
        });
    });

    it("should prevent organizer from leaving their own event", async () => {
        const membership = createMockMembership({
            role: EVENT_ROLES.ORGANIZER,
            destroy: jest.fn()
        });

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        await expect(eventMembershipService.leaveEvent({ eventId: 1, userId: 10 })).rejects.toMatchObject({
            message: "Organizers cannot leave their own event",
            statusCode: 403
        });

        expect(membership.destroy).not.toHaveBeenCalled();
    });

    /* =============================
      EDGE CASES
    ============================= */

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventMembershipService.leaveEvent({ eventId: 1, userId: 10 })).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should throw 404 if participation is not found", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(null);

        await expect(eventMembershipService.leaveEvent({ eventId: 1, userId: 10 })).rejects.toMatchObject({
            message: "Participation not found",
            statusCode: 404
        });
    });

    /* =============================
      DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventMembershipService.leaveEvent({ eventId: 1, userId: 10 })).rejects.toThrow("DB error");
    });
});
