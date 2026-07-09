/* ==================================================
   EVENT MEMBERSHIP CONTROLLER TESTS

   Tests:
   - joining events
   - leaving events
   - retrieving event members
   - retrieving event staff
   - updating member roles
   - removing members
   - transferring event ownership

   Ensures:
   - controller calls service correctly
   - shared event role constants are used for valid role scenarios
   - ownership transfer payload is passed correctly
   - HTTP responses are properly formatted
   - route params and authenticated user payload are passed correctly
   - errors are forwarded to next()
================================================== */

jest.mock("../../../src/services/eventMembershipService");

const eventMembershipController = require("../../../src/controllers/eventMembershipController");

const eventMembershipService = require("../../../src/services/eventMembershipService");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { createEventControllerMocks } = require("../../helpers/express/expressTestHelper");

describe("eventMembershipController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       JOIN EVENTS
    ============================= */

    describe("joinEvent", () => {
        it("should join an event", async () => {
            const { req, res, next } = createEventControllerMocks();

            const membership = {
                eventId: "1",
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT
            };

            eventMembershipService.joinEvent.mockResolvedValue(membership);

            await eventMembershipController.joinEvent(req, res, next);

            expect(eventMembershipService.joinEvent).toHaveBeenCalledWith({
                eventId: "1",
                userId: 10
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User successfully joined the event",
                membership
            });
        });

        it("should forward join errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Join failed");
            eventMembershipService.joinEvent.mockRejectedValue(error);

            await eventMembershipController.joinEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       LEAVE EVENTS
    ============================= */

    describe("leaveEvent", () => {
        it("should leave an event", async () => {
            const { req, res, next } = createEventControllerMocks();

            eventMembershipService.leaveEvent.mockResolvedValue();

            await eventMembershipController.leaveEvent(req, res, next);

            expect(eventMembershipService.leaveEvent).toHaveBeenCalledWith({
                eventId: "1",
                userId: 10
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "User successfully left the event"
            });
        });

        it("should forward leave errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Leave failed");
            eventMembershipService.leaveEvent.mockRejectedValue(error);

            await eventMembershipController.leaveEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       GET EVENT MEMBERS
    ============================= */

    describe("getEventMembers", () => {
        it("should get event members", async () => {
            const { req, res, next } = createEventControllerMocks();

            const members = [{
                id: 1,
                role: EVENT_ROLES.PARTICIPANT
            }];

            eventMembershipService.getEventMembers.mockResolvedValue(members);

            await eventMembershipController.getEventMembers(req, res, next);

            expect(eventMembershipService.getEventMembers).toHaveBeenCalledWith("1");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event members retrieved successfully",
                members
            });
        });

        it("should forward get members errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Members failed");
            eventMembershipService.getEventMembers.mockRejectedValue(error);

            await eventMembershipController.getEventMembers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       GET EVENT STAFF
    ============================= */

    describe("getEventStaff", () => {
        it("should get event staff with organizer and co-organizer roles", async () => {
            const { req, res, next } = createEventControllerMocks();

            const eventStaff = [{
                id: 1,
                role: EVENT_ROLES.ORGANIZER
            }, {
                id: 2,
                role: EVENT_ROLES.CO_ORGANIZER
            }];

            eventMembershipService.getEventStaff.mockResolvedValue(eventStaff);

            await eventMembershipController.getEventStaff(req, res, next);

            expect(eventMembershipService.getEventStaff).toHaveBeenCalledWith("1");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event staff retrieved successfully",
                eventStaff
            });
        });

        it("should forward get event staff errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Event staff failed");
            eventMembershipService.getEventStaff.mockRejectedValue(error);

            await eventMembershipController.getEventStaff(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    describe("updateEventMemberRole", () => {
        it("should update event member role", async () => {
            const { req, res, next } =
                createEventControllerMocks({
                    params: {
                        eventId: "1",
                        userId: "2"
                    },
                    body: {
                        newRole: EVENT_ROLES.CO_ORGANIZER
                    }
                });

            const membership = {
                eventId: "1",
                userId: "2",
                role: EVENT_ROLES.CO_ORGANIZER
            };

            eventMembershipService.updateEventMemberRole.mockResolvedValue(membership);

            await eventMembershipController.updateEventMemberRole(req, res, next);

            expect(eventMembershipService.updateEventMemberRole).toHaveBeenCalledWith({
                eventId: "1",
                userId: "2",
                newRole: EVENT_ROLES.CO_ORGANIZER
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event member role updated successfully",
                membership
            });
        });

        it("should forward update role errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Update role failed");
            eventMembershipService.updateEventMemberRole.mockRejectedValue(error);

            await eventMembershipController.updateEventMemberRole(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("removeEventMember", () => {
        it("should remove event member", async () => {
            const { req, res, next } =
                createEventControllerMocks({
                    params: {
                        eventId: "1",
                        userId: "2"
                    }
                });

            eventMembershipService.removeEventMember.mockResolvedValue();

            await eventMembershipController.removeEventMember(req, res, next);

            expect(eventMembershipService.removeEventMember).toHaveBeenCalledWith({
                eventId: "1",
                userId: "2"
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event member removed successfully"
            });
        });

        it("should forward remove member errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Remove failed");
            eventMembershipService.removeEventMember.mockRejectedValue(error);

            await eventMembershipController.removeEventMember(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("transferEventOwnership", () => {

        it("should transfer event ownership", async () => {
            const { req, res, next } =
                createEventControllerMocks({
                    params: {
                        eventId: "1"
                    },
                    body: {
                        targetUserId: 2
                    }
                });

            const result = {
                previousOrganizer: {
                    userId: 10,
                    role: EVENT_ROLES.CO_ORGANIZER
                },
                newOrganizer: {
                    userId: 2,
                    role: EVENT_ROLES.ORGANIZER
                }
            };

            eventMembershipService.transferEventOwnership.mockResolvedValue(result);

            await eventMembershipController.transferEventOwnership(req, res, next);

            expect(eventMembershipService.transferEventOwnership).toHaveBeenCalledWith({
                eventId: "1",
                currentUserId: 10,
                targetUserId: 2
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event ownership transferred successfully",
                data: result
            });
        });

        it("should forward ownership transfer errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Ownership transfer failed");

            eventMembershipService.transferEventOwnership.mockRejectedValue(error);

            await eventMembershipController.transferEventOwnership(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
