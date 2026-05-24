/* ==================================================
   EVENT SERVICE - GET CURRENT USER EVENT ACCESS TESTS

   Tests:
   - organizer access resolution
   - co-organizer access resolution
   - participant access resolution
   - non-member access resolution
   - past event access restrictions
   - missing event rejection
   - database error propagation

   Ensures:
   - current user event role is resolved from active membership
   - edit/delete access follows event role rules
   - past events disable edit/delete access
   - missing events return a 404 error
   - shared event status constants are used for expected statuses
================================================== */

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventService = require("../../../../src/services/eventService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");
const { getEventStatus } = require("../../../../src/utils/events/eventStatus");

const { createMockEventModel } = require("../../../factories/eventFactory");
const { createMockMembership } = require("../../../factories/eventMembershipFactory");

describe("eventService - getCurrentUserEventAccess", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        Event.findByPk.mockResolvedValue(createMockEventModel({
            id: 1
        }));

        getEventStatus.mockReturnValue(EVENT_STATUS.UPCOMING);
    });

    /* =============================
       ORGANIZER ACCESS
    ============================= */

    it("should return edit and delete access for organizer", async () => {
        EventUserRole.findOne.mockResolvedValue(createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER
        }));

        const result = await eventService.getCurrentUserEventAccess(1, 10);

        expect(Event.findByPk).toHaveBeenCalledWith(1);

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10,
                deletedAt: null
            }
        });

        expect(result).toEqual({
            role: EVENT_ROLES.ORGANIZER,
            status: EVENT_STATUS.UPCOMING,
            canEdit: true,
            canDelete: true
        });
    });

    /* =============================
       CO-ORGANIZER ACCESS
    ============================= */

    it("should return edit access without delete access for co-organizer", async () => {
        EventUserRole.findOne.mockResolvedValue(createMockMembership({
            eventId: 1,
            userId: 20,
            role: EVENT_ROLES.CO_ORGANIZER
        }));

        const result = await eventService.getCurrentUserEventAccess(1, 20);

        expect(result).toEqual({
            role: EVENT_ROLES.CO_ORGANIZER,
            status: EVENT_STATUS.UPCOMING,
            canEdit: true,
            canDelete: false
        });
    });

    /* =============================
       PARTICIPANT ACCESS
    ============================= */

    it("should return no edit or delete access for participant", async () => {
        EventUserRole.findOne.mockResolvedValue(createMockMembership({
            eventId: 1,
            userId: 30,
            role: EVENT_ROLES.PARTICIPANT
        }));

        const result = await eventService.getCurrentUserEventAccess(1, 30);

        expect(result).toEqual({
            role: EVENT_ROLES.PARTICIPANT,
            status: EVENT_STATUS.UPCOMING,
            canEdit: false,
            canDelete: false
        });
    });

    /* =============================
       NON-MEMBER ACCESS
    ============================= */

    it("should return null role and no access for non-member", async () => {
        EventUserRole.findOne.mockResolvedValue(null);

        const result = await eventService.getCurrentUserEventAccess(1, 40);

        expect(result).toEqual({
            role: null,
            status: EVENT_STATUS.UPCOMING,
            canEdit: false,
            canDelete: false
        });
    });

    /* =============================
       PAST EVENT ACCESS
    ============================= */

    it("should disable edit and delete access for past events", async () => {
        EventUserRole.findOne.mockResolvedValue(createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER
        }));

        getEventStatus.mockReturnValue(EVENT_STATUS.PAST);

        const result = await eventService.getCurrentUserEventAccess(1, 10);

        expect(getEventStatus).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 1
            })
        );

        expect(result).toEqual({
            role: EVENT_ROLES.ORGANIZER,
            status: EVENT_STATUS.PAST,
            canEdit: false,
            canDelete: false
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            eventService.getCurrentUserEventAccess(999, 10)
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(EventUserRole.findOne).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward event lookup database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("Event DB error"));

        await expect(eventService.getCurrentUserEventAccess(1, 10)).rejects.toThrow("Event DB error");
    });

    it("should forward membership lookup database errors", async () => {
        EventUserRole.findOne.mockRejectedValue(new Error("Membership DB error"));

        await expect(eventService.getCurrentUserEventAccess(1, 10)).rejects.toThrow("Membership DB error");
    });
});
