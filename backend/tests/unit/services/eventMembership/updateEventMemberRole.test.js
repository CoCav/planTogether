/* ===========================================================
   EVENT MEMBERSHIP SERVICE - UPDATE EVENT MEMBER ROLE TESTS

   Tests:
   - successful role update
   - past event rejection
   - invalid role rejection
   - same role rejection
   - missing event rejection
   - missing membership rejection
   - database error forwarding

   Ensures:
   - member roles are updated correctly
   - invalid role changes are rejected
   - same-role updates are rejected
   - past event rules are respected
   - missing events and memberships are rejected correctly
   - shared event role constants are used for valid role scenarios
   - database errors are forwarded correctly
=========================================================== */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventMembershipService = require("../../../../src/services/eventMembershipService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { assertEventNotPast } = require("../../../../src/utils/events/eventStatus");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createMockMembership } = require("../../../factories/membershipFactory");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventMembershipService - updateEventMemberRole", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
      ROLE UPDATE
    ============================= */

    it("should update event member role", async () => {
        const membership = createMockMembership({
            role: EVENT_ROLES.PARTICIPANT,
            save: jest.fn().mockResolvedValue()
        });

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        const result = await eventMembershipService.updateEventMemberRole({
            eventId: 1,
            userId: 10,
            newRole: EVENT_ROLES.CO_ORGANIZER
        });

        expect(membership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
        expect(membership.save).toHaveBeenCalled();
        expect(result).toBe(membership);
    });

    /* =============================
      BUSINESS RULES
    ============================= */

    it("should block role update on past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(eventMembershipService.updateEventMemberRole({
            eventId: 1,
            userId: 10,
            newRole: EVENT_ROLES.PARTICIPANT
        })).rejects.toMatchObject({
            statusCode: 403
        });
    });

    it("should throw 400 if role is invalid", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });

        await expect(eventMembershipService.updateEventMemberRole({
            eventId: 1,
            userId: 10,
            newRole: "invalid"
        })).rejects.toMatchObject({
            message: "Invalid role provided",
            statusCode: 400
        });
    });

    it("should throw 400 if user already has this role", async () => {
        const membership = createMockMembership({
            role: EVENT_ROLES.PARTICIPANT
        });

        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(membership);

        await expect(eventMembershipService.updateEventMemberRole({
            eventId: 1,
            userId: 10,
            newRole: EVENT_ROLES.PARTICIPANT
        })).rejects.toMatchObject({
            message: "User already has this role",
            statusCode: 400
        });
    });

    /* =============================
      EDGE CASES
    ============================= */

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventMembershipService.updateEventMemberRole({
            eventId: 1,
            userId: 10,
            newRole: EVENT_ROLES.PARTICIPANT
        })).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should throw 404 if membership is not found", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });
        assertEventNotPast.mockImplementation(() => { });
        EventUserRole.findOne.mockResolvedValue(null);

        await expect(eventMembershipService.updateEventMemberRole({
            eventId: 1,
            userId: 10,
            newRole: EVENT_ROLES.PARTICIPANT
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

        await expect(eventMembershipService.updateEventMemberRole({
            eventId: 1,
            userId: 10,
            newRole: EVENT_ROLES.PARTICIPANT
        })).rejects.toThrow("DB error");
    });
});
