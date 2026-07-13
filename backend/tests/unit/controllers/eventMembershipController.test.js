const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const eventMembershipService = require("../../../src/services/eventMembershipService");

const eventMembershipController = require("../../../src/controllers/eventMembershipController");

const {
    createEventControllerMocks,
    expectNoResponseSent,
    expectJsonResponse
} = require("../../helpers/express/expressTestHelper");

/* ==========================================================================
   Event Membership Controller Unit Tests

   Tests event membership request handling and responses.

   Responsibilities
   - Test joining and leaving events
   - Test event member and staff retrieval
   - Test member role updates
   - Test member removal
   - Test event ownership transfer
   - Test service error forwarding

   Notes
   - Event membership services are mocked.
   - Authorization and business rules are tested separately.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock(
    "../../../src/services/eventMembershipService"
);

describe("event membership controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       JOIN EVENT
    ============================= */

    describe("joinEvent", () => {
        it("joins the authenticated user to an event", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            const membership = {
                eventId: 42,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT
            };

            eventMembershipService.joinEvent.mockResolvedValue(membership);

            await eventMembershipController.joinEvent(req, res, next);

            expect(eventMembershipService.joinEvent).toHaveBeenCalledTimes(1);

            expect(eventMembershipService.joinEvent).toHaveBeenCalledWith({
                eventId: "42",
                userId: 10
            });

            expectJsonResponse(res, 200, {
                success: true,
                message: "User successfully joined the event",
                membership
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Join failed");

            eventMembershipService.joinEvent.mockRejectedValue(error);

            await eventMembershipController.joinEvent(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       LEAVE EVENT
    ============================= */

    describe("leaveEvent", () => {
        it("removes the authenticated user from an event", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            eventMembershipService.leaveEvent.mockResolvedValue();

            await eventMembershipController.leaveEvent(req, res, next);

            expect(eventMembershipService.leaveEvent).toHaveBeenCalledTimes(1);

            expect(eventMembershipService.leaveEvent).toHaveBeenCalledWith({
                eventId: "42",
                userId: 10
            });

            expectJsonResponse(res, 200, {
                success: true,
                message: "User successfully left the event"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Leave failed");

            eventMembershipService.leaveEvent.mockRejectedValue(error);

            await eventMembershipController.leaveEvent(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       EVENT MEMBERS
    ============================= */

    describe("getEventMembers", () => {
        it("retrieves event members", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                }
            });

            const members = [{
                id: 1,
                role: EVENT_ROLES.PARTICIPANT
            }];

            eventMembershipService.getEventMembers.mockResolvedValue(members);

            await eventMembershipController.getEventMembers(req, res, next);

            expect(eventMembershipService.getEventMembers).toHaveBeenCalledTimes(1);

            expect(eventMembershipService.getEventMembers).toHaveBeenCalledWith("42");

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event members retrieved successfully",
                members
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Member retrieval failed");

            eventMembershipService.getEventMembers.mockRejectedValue(error);

            await eventMembershipController.getEventMembers(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       EVENT STAFF
    ============================= */

    describe("getEventStaff", () => {
        it("retrieves event staff", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                }
            });

            const eventStaff = [{
                id: 1,
                role: EVENT_ROLES.ORGANIZER
            }, {
                id: 2,
                role: EVENT_ROLES.CO_ORGANIZER
            }];

            eventMembershipService.getEventStaff.mockResolvedValue(eventStaff);

            await eventMembershipController.getEventStaff(req, res, next);

            expect(eventMembershipService.getEventStaff).toHaveBeenCalledTimes(1);

            expect(eventMembershipService.getEventStaff).toHaveBeenCalledWith("42");

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event staff retrieved successfully",
                eventStaff
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Staff retrieval failed");

            eventMembershipService.getEventStaff.mockRejectedValue(error);

            await eventMembershipController.getEventStaff(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       MEMBER ROLE UPDATE
    ============================= */

    describe("updateEventMemberRole", () => {
        it("updates an event member role", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42",
                    userId: "20"
                },
                body: {
                    newRole:
                        EVENT_ROLES.CO_ORGANIZER
                }
            });

            const membership = {
                eventId: 42,
                userId: 20,
                role: EVENT_ROLES.CO_ORGANIZER
            };

            eventMembershipService
                .updateEventMemberRole
                .mockResolvedValue(membership);

            await eventMembershipController.updateEventMemberRole(req, res, next);

            expect(eventMembershipService.updateEventMemberRole).toHaveBeenCalledTimes(1);

            expect(eventMembershipService.updateEventMemberRole).toHaveBeenCalledWith({
                eventId: "42",
                userId: "20",
                newRole: EVENT_ROLES.CO_ORGANIZER
            });

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event member role updated successfully",
                membership
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Role update failed");

            eventMembershipService
                .updateEventMemberRole
                .mockRejectedValue(error);

            await eventMembershipController.updateEventMemberRole(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       MEMBER REMOVAL
    ============================= */

    describe("removeEventMember", () => {
        it("removes a member from an event", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42",
                    userId: "20"
                }
            });

            eventMembershipService.removeEventMember.mockResolvedValue();

            await eventMembershipController.removeEventMember(req, res, next);

            expect(eventMembershipService.removeEventMember).toHaveBeenCalledTimes(1);

            expect(eventMembershipService.removeEventMember).toHaveBeenCalledWith({
                eventId: "42",
                userId: "20"
            });

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event member removed successfully"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Member removal failed");

            eventMembershipService.removeEventMember.mockRejectedValue(error);

            await eventMembershipController.removeEventMember(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       OWNERSHIP TRANSFER
    ============================= */

    describe("transferEventOwnership", () => {
        it("transfers event ownership", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                },
                body: {
                    targetUserId: 20
                }
            });

            const result = {
                previousOrganizer: {
                    userId: 10,
                    role: EVENT_ROLES.CO_ORGANIZER
                },
                newOrganizer: {
                    userId: 20,
                    role: EVENT_ROLES.ORGANIZER
                }
            };

            eventMembershipService
                .transferEventOwnership
                .mockResolvedValue(result);

            await eventMembershipController.transferEventOwnership(req, res, next);

            expect(eventMembershipService.transferEventOwnership).toHaveBeenCalledTimes(1);

            expect(eventMembershipService.transferEventOwnership).toHaveBeenCalledWith({
                eventId: "42",
                currentUserId: 10,
                targetUserId: 20
            });

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event ownership transferred successfully",
                data: result
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Ownership transfer failed");

            eventMembershipService
                .transferEventOwnership
                .mockRejectedValue(error);

            await eventMembershipController.transferEventOwnership(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });
});
